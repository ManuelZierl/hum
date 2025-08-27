module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/packages'],
  testMatch: ['**/*.test.ts'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.base.json',
    },
  },
};
