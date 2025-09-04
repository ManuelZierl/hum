/*
 * Flattens dist/src/* into dist/* so compiled files live at dist/<paths under src>.
 * This keeps relative imports to repo-level assets working from both src and dist.
 */
const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '..', 'dist');
const srcDir = path.join(distDir, 'src');

if (fs.existsSync(srcDir)) {
  const entries = fs.readdirSync(srcDir);
  for (const entry of entries) {
    const from = path.join(srcDir, entry);
    const to = path.join(distDir, entry);
    // If target exists, remove first to allow rename
    if (fs.existsSync(to)) {
      fs.rmSync(to, { recursive: true, force: true });
    }
    fs.renameSync(from, to);
  }
  fs.rmSync(srcDir, { recursive: true, force: true });
}

// Rewrite imports in index files from './src/...' to './...'
function rewriteSrcSegments(file) {
  if (!fs.existsSync(file)) return;
  const txt = fs.readFileSync(file, 'utf8');
  const updated = txt
    // ESM style: from './src/...'
    .replace(/from\s+(['"])\.\/src\//g, (m, q) => `from ${q}./`)
    // CJS style: require('./src/...') preserve quote type
    .replace(/require\(\s*(['"])\.\/src\//g, (m, q) => `require(${q}./`)
    // Fallback: any stray './src/' segments
    .replace(/\.\/src\//g, './');
  if (updated !== txt) {
    fs.writeFileSync(file, updated, 'utf8');
  }
}

rewriteSrcSegments(path.join(distDir, 'index.js'));
rewriteSrcSegments(path.join(distDir, 'index.d.ts'));
