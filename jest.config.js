export default{
    testEnvironment: 'jest-environment-node',
    testMatch: ['**/__tests__/**/*.js?(x)', '**/?(*.)+(spec|test).js?(x)'],
    transform: {},
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    collectCoverage: true,
    coverageReporters: ['html', 'text'],
};