// Mock the native module to a pure JS implementation for tests
jest.mock('@hum/hum-matrix-native', () =>
  require('../packages/hum-matrix-native/__mocks__/index.ts'),
);
