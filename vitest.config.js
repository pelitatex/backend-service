import {defineConfig} from 'vitest/config';

export default defineConfig({
    setupFiles: ['./tests/setup.js'],
    test: {
        environment: 'node',
        globals: true,
        watch: false,
        testTimeout: 10000
    }
});