/* eslint-env node */
/* eslint-disable no-undef */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-fixed-jsdom',
  roots: ['<rootDir>/packages', '<rootDir>/tests'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      { tsconfig: '<rootDir>/tsconfig.jest.json' },
    ],
  },
  moduleNameMapper: {
    '^react-native$': 'react-native-web',
    '^@hum/ui-components$': '<rootDir>/packages/ui-components/index.ts',
    '^@hum/ui-components/(.*)$': '<rootDir>/packages/ui-components/src/$1',
    '^@hum/ui-screens(.*)$': '<rootDir>/packages/ui-screens$1',
    '^@hum/hum-matrix-native$':
      '<rootDir>/packages/hum-matrix-native/src/index.ts',
    '^@hum/i18n$': '<rootDir>/packages/i18n/src/index.ts',
    '^@hum/payment-client$': '<rootDir>/packages/payment-client/index.ts',
    '^@hum/payment-client/(.*)$': '<rootDir>/packages/payment-client/src/$1',
    '^@hum/breeze-payment-client$':
      '<rootDir>/packages/breeze-payment-client/index.ts',
    '^@hum/breeze-payment-client/(.*)$':
      '<rootDir>/packages/breeze-payment-client/src/$1',
    '\\.svg$': '<rootDir>/tests/__mocks__/svgMock.tsx',
  },
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov'],
};
