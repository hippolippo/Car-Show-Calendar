// T009: Vitest configuration for frontend
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.jsx',
        '**/*.spec.jsx',
        'dist/',
        'playwright-tests/'
      ]
    },
    include: ['tests/unit/**/*.test.{js,jsx}']
  }
});
