const { pathsToModuleNameMapper } = require('ts-jest/utils');
const { compilerOptions } = require('./tsconfig.ext.test.json');

// Set environments from env.yml
const { setEnvironments } = require('./lib/env-loader');
setEnvironments('test');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '(/tests/.*(test|spec))\\.[jt]sx?$',
  coverageThreshold: {
    // Following will fail if there is less than 80% branch, line and function coverage,
    // or if there are more than 10 uncovered statements
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 40
    }
  },
  // This is set per test (and before/after functions)
  testTimeout: 1 * 60 * 1000, // 1 min per (default is 5 seconds)
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' })
};
