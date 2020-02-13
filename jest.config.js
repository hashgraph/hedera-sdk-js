module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  setupFiles: ["./__tests__/unit/MockClient.ts"],
  // only test Typescript files
  testMatch: ['**/__tests__/unit/**/*.test.ts']
};
