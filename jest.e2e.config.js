module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    setupFiles: [],
    // only test Typescript files
    testMatch: ['**/__tests__/e2e/**/*.test.ts']
};
