/* eslint-env node */
/* eslint-disable no-undef */
module.exports = {
  rootDir: '.',
  testEnvironment: 'node',
  testTimeout: 240000,
  setupFilesAfterEnv: ['<rootDir>/detox/setup.js'],
  // Only pick up Detox E2E specs under the detox/ folder
  testMatch: ['<rootDir>/detox/**/*.spec.js'],
};
