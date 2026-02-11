# 春秋 (Chunqiu) 游戏测试框架

## 概述

本文档描述了春秋游戏的完整测试框架，包括测试计划、测试用例和自动化测试代码。

## 目录结构

```
testing/
├── README.md                    # 本文档
├── test-plan.md                 # 测试计划
├── bug-report-template.md       # Bug报告模板
├── test-cases/                  # 测试用例
│   ├── auth.test-cases.md       # 认证模块测试用例
│   ├── lobby.test-cases.md      # 大厅模块测试用例
│   ├── game.test-cases.md       # 游戏核心测试用例
│   └── websocket.test-cases.md  # WebSocket测试用例
└── automated-tests/             # 自动化测试
    ├── jest.config.js           # Jest配置
    ├── playwright.config.ts     # Playwright配置
    ├── unit/                    # 单元测试
    │   ├── auth.test.ts
    │   └── game-core.test.ts
    ├── api/                     # API测试
    │   ├── auth.api.test.ts
    │   ├── lobby.api.test.ts
    │   └── test-utils.ts
    └── e2e/                     # E2E测试
        ├── global-setup.ts
        ├── global-teardown.ts
        ├── auth.e2e.test.ts
        ├── lobby.e2e.test.ts
        └── game.e2e.test.ts
```

## 测试覆盖范围

### 功能测试用例统计

| 模块 | 功能测试 | 性能测试 | 安全测试 | WebSocket测试 | 总计 |
|------|----------|----------|----------|---------------|------|
| 认证 | 15 | 2 | 2 | - | 19 |
| 大厅 | 20 | 2 | - | 2 | 24 |
| 游戏核心 | 25 | 3 | - | - | 28 |
| WebSocket | 15 | 4 | 3 | - | 22 |
| **总计** | **75** | **11** | **5** | **2** | **93** |

### 自动化测试覆盖

| 类型 | 文件数 | 测试用例数 |
|------|--------|------------|
| 单元测试 | 2 | 50+ |
| API测试 | 2 | 40+ |
| E2E测试 | 3 | 30+ |
| **总计** | **7** | **120+** |

## 快速开始

### 环境准备

```bash
# 安装依赖
npm install

# 安装 Playwright 浏览器
npx playwright install
```

### 运行单元测试

```bash
# 运行所有单元测试
npm run test:unit

# 运行特定文件
npm run test:unit auth.test.ts

# 带覆盖率
npm run test:unit -- --coverage

# 监视模式
npm run test:unit -- --watch
```

### 运行API测试

```bash
# 运行所有API测试
npm run test:api

# 运行特定模块
npm run test:api -- auth.api.test.ts

# 带覆盖率
npm run test:api -- --coverage
```

### 运行E2E测试

```bash
# 运行所有E2E测试
npm run test:e2e

# 运行特定文件
npm run test:e2e -- auth.e2e.test.ts

# 运行特定浏览器
npm run test:e2e -- --project=chromium

# 带UI模式（调试）
npm run test:e2e -- --ui

# 生成报告
npm run test:e2e -- --reporter=html
```

### 运行所有测试

```bash
# 运行完整测试套件
npm run test:all

# CI模式
npm run test:ci
```

## 测试策略

### 测试金字塔

```
        /\
       /  \     E2E测试 (10%)
      /    \    - 用户流程验证
     /------\   - 跨模块集成
    /        \
   /----------\  集成/API测试 (30%)
  /            \ - API接口验证
 /              \- WebSocket通信
/________________\- 数据库操作

██████████████████ 单元测试 (60%)
                   - 业务逻辑验证
                   - 工具函数测试
                   - 组件测试
```

### 测试阶段

| 阶段 | 时间 | 活动 |
|------|------|------|
| 单元测试 | 持续 | 开发人员编写并执行 |
| 集成测试 | Sprint中期 | API和WebSocket测试 |
| 系统测试 | Sprint后期 | E2E测试、功能验证 |
| 验收测试 | 发布前 | 用户场景验证 |
| 回归测试 | 每次发布 | 全量自动化测试 |

## 测试环境

### 支持的浏览器

- Chrome (最新2个版本) - P0
- Firefox (最新2个版本) - P0
- Safari (最新2个版本) - P1
- Edge (最新2个版本) - P1
- Mobile Chrome - P1
- Mobile Safari - P2

### 分辨率测试

- 1920x1080 (桌面)
- 1366x768 (笔记本)
- 768x1024 (平板)
- 375x667 (手机)

## CI/CD集成

### GitHub Actions 示例

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run unit tests
        run: npm run test:unit -- --coverage
        
      - name: Run API tests
        run: npm run test:api
        
      - name: Run E2E tests
        run: npm run test:e2e
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## 测试数据管理

### 测试用户

| 用户名 | 密码 | 用途 |
|--------|------|------|
| test_player_1 | Password1 | 通用测试 |
| test_player_2 | Password1 | 多人测试 |
| test_player_3 | Password1 | 多人测试 |

### 测试数据清理

测试完成后会自动清理：
- 测试用户
- 测试房间
- 测试游戏数据

## 报告

### 测试报告位置

```
reports/
├── coverage/           # 覆盖率报告
├── playwright-report/  # E2E测试报告
├── junit.xml          # JUnit格式报告
└── test-summary.json  # 测试摘要
```

### 查看报告

```bash
# 覆盖率报告
open reports/coverage/index.html

# Playwright报告
npx playwright show-report reports/playwright-report
```

## 常见问题

### Q: 测试超时怎么办？

A: 可以增加超时时间：
```bash
npm run test:e2e -- --timeout=120000
```

### Q: 如何调试失败的测试？

A: 使用UI模式：
```bash
npm run test:e2e -- --ui
```

### Q: 如何只运行特定测试？

A: 使用grep：
```bash
npm run test:unit -- --grep="should login"
```

## 贡献指南

1. 编写测试前先阅读测试计划
2. 遵循测试用例模板
3. 保持测试独立性
4. 添加必要的注释
5. 确保测试可重复执行

## 联系方式

- 测试负责人：QA团队
- 问题反馈：创建GitHub Issue

---

*最后更新：2024年*
