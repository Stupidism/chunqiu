/**
 * Jest 配置文件
 * 用于 API 测试和单元测试
 */

module.exports = {
  // 测试环境
  testEnvironment: 'node',

  // 测试文件匹配模式
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],

  // 模块文件扩展名
  moduleFileExtensions: [
    'js',
    'jsx',
    'ts',
    'tsx',
    'json',
    'node'
  ],

  // 转换器配置
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest'
  },

  // 模块名称映射
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@lobby/(.*)$': '<rootDir>/../lobby/src/$1',
    '^@game/(.*)$': '<rootDir>/../game/src/$1',
    '^@server/(.*)$': '<rootDir>/../server/src/$1'
  },

  // 设置文件
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js'
  ],

  // 覆盖率配置
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.{js,ts}',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/*.test.{js,jsx,ts,tsx}'
  ],

  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60
    }
  },

  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html'
  ],

  // 测试超时
  testTimeout: 30000,

  // 并发配置
  maxWorkers: '50%',

  // 缓存配置
  cacheDirectory: '<rootDir>/.jest-cache',

  // 清理模拟
  clearMocks: true,
  restoreMocks: true,
  resetMocks: false,

  // 错误处理
  bail: 0,
  forceExit: true,
  detectOpenHandles: true,

  // 报告器配置
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: '<rootDir>/reports',
        outputName: 'junit.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true
      }
    ],
    [
      '<rootDir>/reporters/custom-reporter.js',
      {
        outputPath: '<rootDir>/reports/test-report.html'
      }
    ]
  ],

  // 全局变量
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.test.json',
      diagnostics: {
        ignoreCodes: [151001]
      }
    }
  },

  // 忽略路径
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/.next/',
    '/coverage/'
  ],

  // 模块路径
  modulePaths: [
    '<rootDir>/src',
    '<rootDir>/node_modules'
  ],

  // 根目录
  roots: [
    '<rootDir>/src',
    '<rootDir>/api',
    '<rootDir>/unit'
  ],

  // 预设
  preset: 'ts-jest'
};
