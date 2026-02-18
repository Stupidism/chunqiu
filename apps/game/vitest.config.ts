import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@chunqiu/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@chunqiu/types': path.resolve(__dirname, '../../packages/types/src'),
      '@chunqiu/game-core': path.resolve(__dirname, '../../packages/game-core/src'),
    },
  },
});
