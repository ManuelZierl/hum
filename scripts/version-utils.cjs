/* eslint-env node */

const { execSync } = require('child_process');
const fs = require('fs');

function run(cmd) {
  return execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'] })
    .toString()
    .trim();
}

function getLatestTag() {
  try {
    return run('git describe --tags --abbrev=0');
  } catch {
    return null;
  }
}

function parseTagVersion(tag) {
  if (!tag) return null;
  const m = /^v(\d+\.\d+\.\d+)$/.exec(tag);
  return m ? m[1] : null;
}

function getTagCommitDate(tag) {
  try {
    return run(`git log -1 --format=%cs ${tag}`);
  } catch {
    return null;
  }
}

function readPkg(pkgPath) {
  return JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
}

function writePkg(pkgPath, version) {
  const pkg = readPkg(pkgPath);
  pkg.version = version;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

function formatDisplayDate(iso) {
  return iso.replace(/-/g, '.');
}

module.exports = {
  getLatestTag,
  parseTagVersion,
  getTagCommitDate,
  readPkg,
  writePkg,
  formatDisplayDate,
};
