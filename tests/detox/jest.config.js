/* eslint-env node */
/* eslint-disable no-undef */
module.exports = {
  rootDir: '../..',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/detox/**/*.spec.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/detox/setup.js'],
  testTimeout: 240000,
};
