import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    pool: 'vmForks',
    setupFiles: './__tests__/globalSetup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: [
        'node_modules/**',
        '__tests__/**',
        'scripts/**',
        'configs/**',
      ],
    },
  },
});
