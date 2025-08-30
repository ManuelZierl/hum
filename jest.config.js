/* eslint-env node */
/* eslint-disable no-undef */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/packages', '<rootDir>/tests'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      { tsconfig: '<rootDir>/tsconfig.jest.json' },
    ],
  },
  moduleNameMapper: {
    '^react-native$': 'react-native-web',
    '^@hum/ui-components(.*)$': '<rootDir>/packages/ui-components/src$1',
    '^@hum/ui-screens(.*)$': '<rootDir>/packages/ui-screens/src$1',
  },
};
