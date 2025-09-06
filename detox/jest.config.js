/* eslint-env node */
/* eslint-disable no-undef */
module.exports = {
  testTimeout: 240000,
  testRunner: 'jest-circus/runner',
  setupFilesAfterEnv: ['detox/runners/jest/adapter'],
  reporters: ['detox/runners/jest/reporter'],
  testMatch: ['**/detox/**/*.spec.js'],
};
