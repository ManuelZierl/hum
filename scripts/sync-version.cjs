#!/usr/bin/env node
/* eslint-env node */

/* eslint-disable no-undef */
const path = require('path');
const {
  getLatestTag,
  parseTagVersion,
  writePkg,
} = require('./version-utils.cjs');

function getArgVersion() {
  const idx = process.argv.indexOf('--version');
  if (idx !== -1 && process.argv[idx + 1]) {
    return process.argv[idx + 1];
  }
  return null;
}

function main() {
  let version = getArgVersion();
  if (!version) {
    const tag = getLatestTag();
    if (!tag) {
      console.error('No git tag found and no --version provided.');
      process.exit(1);
    }
    version = parseTagVersion(tag);
    if (!version) {
      console.error(`Invalid tag format: ${tag}`);
      process.exit(1);
    }
  }

  const roots = [
    path.resolve(__dirname, '..', 'package.json'),
    path.resolve(__dirname, '..', 'apps', 'storybook', 'package.json'),
    path.resolve(__dirname, '..', 'apps', 'mobile', 'package.json'),
  ];
  roots.forEach((p) => writePkg(p, version));
  console.log(`Synced version ${version}`);
}

main();
