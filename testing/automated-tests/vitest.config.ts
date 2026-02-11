/**
 * Vitest 配置文件
 * 用于单元测试
 */

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // 测试环境
    environment: 'jsdom',

    // 全局变量
    globals: true,

    // 设置文件
    setupFiles: ['./vitest.setup.ts'],

    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov', 'html'],
      reportsDirectory: '../reports/coverage',
      thresholds: {
        branches: 60,
        functions: 60,
        lines: 60,
        statements: 60
      },
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.config.ts'
      ]
    },

    // 测试超时
    testTimeout: 10000,

    // 钩子超时
    hookTimeout: 10000,

    // 并发配置
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false
      }
    },

    // 报告器
    reporters: [
      'default',
      'verbose',
      ['junit', { outputFile: '../reports/vitest-junit.xml' }],
      ['json', { outputFile: '../reports/vitest-results.json' }]
    ],

    // 输出格式
    outputFile: '../reports/vitest-output.txt',

    // 缓存
    cache: {
      dir: '../.vitest-cache'
    },

    // 清理
    clearMocks: true,
    restoreMocks: true,

    // 失败时停止
    bail: 0,

    // 重试
    retry: 0,

    // 隔离
    isolate: true,

    // 文件匹配
    include: [
      'unit/**/*.test.ts',
      'unit/**/*.test.tsx'
    ],

    // 排除
    exclude: [
      'node_modules/',
      'dist/',
      '**/*.d.ts'
    ],

    // 类型检查
    typecheck: {
      enabled: false
    },

    // 快照
    snapshotFormat: {
      escapeString: true,
      printBasicPrototype: true
    },

    // 差异
    diff: {
      expand: false,
      contextLines: 3
    }
  },

  // 解析配置
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@lobby': path.resolve(__dirname, '../lobby/src'),
      '@game': path.resolve(__dirname, '../game/src'),
      '@server': path.resolve(__dirname, '../server/src')
    }
  },

  // 插件
  plugins: [],

  // 构建配置
  build: {
    target: 'es2020',
    sourcemap: true
  },

  // ESBuild配置
  esbuild: {
    target: 'es2020',
    jsx: 'transform'
  }
});
