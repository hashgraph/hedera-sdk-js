module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    setupFiles: [],
    // only test Typescript files
    testMatch: ['**/__test__/e2e/**/*.test.ts']
};
