module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/packages'],
  testMatch: ['**/*.test.ts?(x)'],
  globals: {
    'ts-jest': { tsconfig: 'tsconfig.base.json', diagnostics: false }
  },
};
