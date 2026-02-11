/**
 * Playwright 配置文件
 * 用于 E2E 测试
 */

import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright 配置
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // 测试目录
  testDir: './e2e',

  // 每个测试的超时时间
  timeout: 60 * 1000, // 60秒

  // 全局设置超时
  globalTimeout: 60 * 60 * 1000, // 1小时

  // 期望超时
  expect: {
    timeout: 5000 // 5秒
  },

  // 并发工作线程数
  workers: process.env.CI ? 1 : undefined,

  // 重试次数
  retries: process.env.CI ? 2 : 0,

  // 测试报告器
  reporter: [
    // 默认列表报告器
    ['list'],
    // HTML报告器
    ['html', { open: 'never', outputFolder: '../reports/playwright-report' }],
    // JUnit报告器（用于CI集成）
    ['junit', { outputFile: '../reports/playwright-junit.xml' }],
    // JSON报告器
    ['json', { outputFile: '../reports/playwright-results.json' }]
  ],

  // 共享配置
  use: {
    // 基础URL
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',

    // 跟踪配置
    trace: 'on-first-retry',

    // 截图配置
    screenshot: 'only-on-failure',

    // 视频配置
    video: 'on-first-retry',

    // 动作超时
    actionTimeout: 15000,

    // 导航超时
    navigationTimeout: 30000,

    // 视口大小
    viewport: { width: 1280, height: 720 },

    // 忽略HTTPS错误
    ignoreHTTPSErrors: true,

    // 存储状态
    storageState: undefined,

    // 额外的HTTP头
    extraHTTPHeaders: {
      'X-Test-Header': 'playwright-test'
    },

    // 浏览器上下文选项
    contextOptions: {
      // 录制视频大小
      recordVideo: {
        dir: '../reports/videos/',
        size: { width: 1280, height: 720 }
      }
    }
  },

  // 项目配置（多浏览器测试）
  projects: [
    // Chrome 桌面
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome'
      }
    },

    // Firefox 桌面
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox']
      }
    },

    // Safari 桌面
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari']
      }
    },

    // Chrome 平板
    {
      name: 'tablet-chrome',
      use: {
        ...devices['iPad (gen 7) landscape']
      }
    },

    // Chrome 手机
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5']
      }
    },

    // Safari 手机
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 13']
      }
    }
  ],

  // Web服务器配置
  webServer: [
    // 游戏大厅服务
    {
      command: 'cd ../lobby && npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000
    },
    // 游戏服务
    {
      command: 'cd ../game && npm run dev',
      url: 'http://localhost:3001',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000
    },
    // 后端服务
    {
      command: 'cd ../server && npm run dev',
      url: 'http://localhost:3002/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000
    }
  ],

  // 全局设置
  globalSetup: require.resolve('./global-setup'),

  // 全局清理
  globalTeardown: require.resolve('./global-teardown'),

  // 输出目录
  outputDir: '../reports/test-results/',

  // 快照目录
  snapshotDir: './snapshots/',

  // 保留失败测试产物
  preserveOutput: 'failures-only',

  // 完全并行
  fullyParallel: true,

  // 禁止测试文件并行
  forbidOnly: !!process.env.CI,

  // 测试匹配模式
  testMatch: /.*\.e2e\.test\.(ts|js)/,

  // 测试忽略模式
  testIgnore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**'
  ],

  // 依赖配置
  dependencies: [],

  // 元数据
  metadata: {
    platform: process.platform,
    nodeVersion: process.version,
    testEnvironment: 'development'
  }
});
