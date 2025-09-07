/* eslint-env node */
/* eslint-disable no-undef */
module.exports = {
  rootDir: '.',
  testEnvironment: 'detox/runners/jest/testEnvironment',
  testRunner: 'jest-circus/runner',
  // Allow more time on CI where emulators and builds are slower
  testTimeout: process.env.CI ? 600000 : 240000,
  // Optional: keep a lightweight setup file for test tweaks.
  // If you don't need it, you can remove this line.
  setupFilesAfterEnv: ['<rootDir>/setup.js'],
  // Only pick up Detox E2E specs under the detox/ folder
  testMatch: ['<rootDir>/**/*.spec.js'],
};
