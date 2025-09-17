#!/usr/bin/env node
/* eslint-env node */

const path = require('path');
const fs = require('fs');
const {
  getLatestTag,
  parseTagVersion,
  getTagCommitDate,
  formatDisplayDate,
} = require('./version-utils.cjs');

function writeFile(target, content) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function main() {
  const tag = getLatestTag();
  if (!tag) {
    console.error('No git tag found.');
    process.exit(1);
  }
  const version = parseTagVersion(tag);
  if (!version) {
    console.error(`Invalid tag: ${tag}`);
    process.exit(1);
  }
  const iso = getTagCommitDate(tag);
  const display = formatDisplayDate(iso);
  const year = new Date().getFullYear();
  const content =
    `// AUTO-GENERATED. Do not edit by hand.\n` +
    `export const AppVersion = '${version}';\n` +
    `export const BuildDateISO = '${iso}';\n` +
    `export const BuildDateDisplay = '${display}';\n` +
    `export const CopyrightYear = ${year};\n`;

  const uiTarget = path.resolve(
    __dirname,
    '..',
    'packages',
    'ui-screens',
    'build-info.ts',
  );
  writeFile(uiTarget, content);

  const sbTarget = path.resolve(
    __dirname,
    '..',
    'apps',
    'storybook',
    'src',
    'build-info.ts',
  );
  writeFile(sbTarget, content);

  console.log('Generated build info');
}

main();
