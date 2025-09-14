const fs = require('fs');
const path = require('path');

function loadNative() {
  // 1) Most common output from @napi-rs/cli is a plain index.node
  const direct = path.join(__dirname, 'index.node');
  if (fs.existsSync(direct)) return require(direct);

  // 2) Otherwise try common platform-arch variants
  const triplesTried = [];
  const variants = [
    `${process.platform}-${process.arch}-gnu`,
    `${process.platform}-${process.arch}-musl`,
    `${process.platform}-${process.arch}`,
  ];
  for (const v of variants) {
    const filename = `hum_core_native_node.${v}.node`;
    const full = path.join(__dirname, filename);
    triplesTried.push(filename);
    if (fs.existsSync(full)) return require(full);
  }

  // 3) Last resort: scan directory
  const files = fs.readdirSync(__dirname);
  const candidate = files.find((f) => f.endsWith('.node'));
  if (candidate) return require(path.join(__dirname, candidate));

  throw new Error(
    `Could not find native addon (.node). Tried: index.node, ${triplesTried.join(
      ', ',
    )}. Present files: ${files.join(', ')}`,
  );
}

module.exports = loadNative();
