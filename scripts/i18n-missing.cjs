#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const enPath = path.join(
  __dirname,
  '..',
  'packages',
  'i18n',
  'src',
  'locales',
  'en',
  'common.json',
);
const dePath = path.join(
  __dirname,
  '..',
  'packages',
  'i18n',
  'src',
  'locales',
  'de',
  'common.json',
);

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));

function collect(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    return typeof v === 'object' && !Array.isArray(v) ? collect(v, key) : key;
  });
}

const enKeys = collect(en);
const deKeys = collect(de);

const missingInDe = enKeys.filter((k) => !deKeys.includes(k));
const missingInEn = deKeys.filter((k) => !enKeys.includes(k));

if (missingInDe.length || missingInEn.length) {
  console.log('Missing translations:');
  if (missingInDe.length) console.log('  de missing:', missingInDe.join(', '));
  if (missingInEn.length) console.log('  en missing:', missingInEn.join(', '));
  process.exit(1);
} else {
  console.log('All locales in sync');
}
