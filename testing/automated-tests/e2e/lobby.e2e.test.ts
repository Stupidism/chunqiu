/**
 * 游戏大厅 E2E 测试
 * 使用 Playwright
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

// 辅助函数
function generateRandomUsername(): string {
  return `lobby_test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

async function registerAndLogin(page: Page, username: string): Promise<void> {
  await page.goto(`${BASE_URL}/register`);
  await page.fill('[data-testid="username-input"]', username);
  await page.fill('[data-testid="password-input"]', 'Password1');
  await page.fill('[data-testid="confirm-password-input"]', 'Password1');
  await page.click('[data-testid="register-button"]');
  await page.waitForNavigation();
}

// ============================================
// 1. 大厅页面测试
// ============================================

test.describe('游戏大厅', () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page, generateRandomUsername());
  });

  test('应该显示大厅页面', async ({ page }) => {
    await expect(page).toHaveURL(/lobby/);
    await expect(page.locator('[data-testid="lobby-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="room-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="create-room-button"]')).toBeVisible();
  });

  test('应该显示房间列表', async ({ page }) => {
    // 等待房间列表加载
    await page.waitForSelector('[data-testid="room-item"]', { timeout: 5000 });

    // 验证房间列表项结构
    const roomItems = page.locator('[data-testid="room-item"]');
    const count = await roomItems.count();

    if (count > 0) {
      // 验证房间信息显示
      await expect(roomItems.first().locator('[data-testid="room-name"]')).toBeVisible();
      await expect(roomItems.first().locator('[data-testid="room-host"]')).toBeVisible();
      await expect(roomItems.first().locator('[data-testid="room-players"]')).toBeVisible();
      await expect(roomItems.first().locator('[data-testid="room-status"]')).toBeVisible();
    }
  });

  test('应该能刷新房间列表', async ({ page }) => {
    await page.click('[data-testid="refresh-rooms-button"]');

    // 验证加载状态
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible();

    // 验证列表刷新
    await page.waitForSelector('[data-testid="room-list"]', { timeout: 5000 });
  });
});

// ============================================
// 2. 创建房间测试
// ============================================

test.describe('创建房间', () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page, generateRandomUsername());
  });

  test('应该成功创建房间', async ({ page }) => {
    // 点击创建房间按钮
    await page.click('[data-testid="create-room-button"]');

    // 等待弹窗
    await expect(page.locator('[data-testid="create-room-modal"]')).toBeVisible();

    // 填写房间信息
    await page.fill('[data-testid="room-name-input"]', '测试房间');
    await page.selectOption('[data-testid="game-mode-select"]', 'pvp');
    await page.selectOption('[data-testid="map-select"]', 'map_1');
    await page.selectOption('[data-testid="max-players-select"]', '2');

    // 确认创建
    await page.click('[data-testid="confirm-create-button"]');

    // 验证进入房间
    await expect(page).toHaveURL(/room/);
    await expect(page.locator('[data-testid="room-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="room-name"]')).toContainText('测试房间');
  });

  test('应该验证房间名', async ({ page }) => {
    await page.click('[data-testid="create-room-button"]');
    await expect(page.locator('[data-testid="create-room-modal"]')).toBeVisible();

    // 空房间名
    await page.fill('[data-testid="room-name-input"]', '');
    await page.click('[data-testid="confirm-create-button"]');
    await expect(page.locator('[data-testid="room-name-error"]')).toContainText('必填');

    // 太短的房间名
    await page.fill('[data-testid="room-name-input"]', 'ab');
    await page.click('[data-testid="confirm-create-button"]');
    await expect(page.locator('[data-testid="room-name-error"]')).toContainText('太短');

    // 太长的房间名
    await page.fill('[data-testid="room-name-input"]', 'a'.repeat(51));
    await page.click('[data-testid="confirm-create-button"]');
    await expect(page.locator('[data-testid="room-name-error"]')).toContainText('太长');
  });

  test('应该能创建带密码的房间', async ({ page }) => {
    await page.click('[data-testid="create-room-button"]');
    await expect(page.locator('[data-testid="create-room-modal"]')).toBeVisible();

    await page.fill('[data-testid="room-name-input"]', '密码房间');
    await page.check('[data-testid="password-checkbox"]');
    await page.fill('[data-testid="room-password-input"]', 'secret123');
    await page.click('[data-testid="confirm-create-button"]');

    // 验证房间创建成功
    await expect(page).toHaveURL(/room/);
    await expect(page.locator('[data-testid="room-password-indicator"]')).toBeVisible();
  });
});

// ============================================
// 3. 加入房间测试
// ============================================

test.describe('加入房间', () => {
  let roomId: string;
  let hostUsername: string;

  test.beforeAll(async ({ browser }) => {
    // 创建房间
    const hostPage = await browser.newPage();
    hostUsername = generateRandomUsername();
    await registerAndLogin(hostPage, hostUsername);

    await hostPage.click('[data-testid="create-room-button"]');
    await hostPage.fill('[data-testid="room-name-input"]', '测试房间');
    await hostPage.click('[data-testid="confirm-create-button"]');
    await hostPage.waitForNavigation();

    // 获取房间ID
    const url = hostPage.url();
    roomId = url.split('/room/')[1];
    await hostPage.close();
  });

  test('应该能加入房间', async ({ page }) => {
    await registerAndLogin(page, generateRandomUsername());

    // 找到并加入房间
    await page.goto(`${BASE_URL}/lobby`);
    const roomItem = page.locator(`[data-testid="room-item"]:has-text("测试房间")`);
    await roomItem.locator('[data-testid="join-room-button"]').click();

    // 验证进入房间
    await expect(page).toHaveURL(new RegExp(`room/${roomId}`));
    await expect(page.locator('[data-testid="room-page"]')).toBeVisible();
  });

  test('应该能直接通过URL加入房间', async ({ page }) => {
    await registerAndLogin(page, generateRandomUsername());

    await page.goto(`${BASE_URL}/room/${roomId}`);

    // 验证加入成功
    await expect(page.locator('[data-testid="room-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="player-list"]')).toContainText(hostUsername);
  });

  test('应该显示房间已满', async ({ page, browser }) => {
    // 先让另一个用户加入
    const user2Page = await browser.newPage();
    await registerAndLogin(user2Page, generateRandomUsername());
    await user2Page.goto(`${BASE_URL}/room/${roomId}`);
    await user2Page.waitForSelector('[data-testid="room-page"]');

    // 尝试让第三个用户加入
    await registerAndLogin(page, generateRandomUsername());
    await page.goto(`${BASE_URL}/room/${roomId}`);

    // 验证房间已满提示
    await expect(page.locator('[data-testid="error-message"]')).toContainText('已满');

    await user2Page.close();
  });
});

// ============================================
// 4. 房间内操作测试
// ============================================

test.describe('房间内操作', () => {
  test('房主应该能踢出其他玩家', async ({ page, browser }) => {
    // 房主创建房间
    const hostUsername = generateRandomUsername();
    await registerAndLogin(page, hostUsername);
    await page.click('[data-testid="create-room-button"]');
    await page.fill('[data-testid="room-name-input"]', '踢人测试房间');
    await page.click('[data-testid="confirm-create-button"]');
    await page.waitForNavigation();

    // 另一个用户加入
    const playerPage = await browser.newPage();
    const playerUsername = generateRandomUsername();
    await registerAndLogin(playerPage, playerUsername);
    const roomUrl = page.url();
    await playerPage.goto(roomUrl);
    await playerPage.waitForSelector('[data-testid="room-page"]');

    // 房主踢出玩家
    await page.click(`[data-testid="kick-player-button"]:has-text("${playerUsername}")`);
    await page.click('[data-testid="confirm-kick-button"]');

    // 验证玩家被踢出
    await expect(playerPage.locator('[data-testid="kicked-message"]')).toContainText('被踢出');
    await expect(playerPage).toHaveURL(/lobby/);

    await playerPage.close();
  });

  test('玩家应该能准备和取消准备', async ({ page, browser }) => {
    // 房主创建房间
    const hostPage = await browser.newPage();
    await registerAndLogin(hostPage, generateRandomUsername());
    await hostPage.click('[data-testid="create-room-button"]');
    await hostPage.fill('[data-testid="room-name-input"]', '准备测试房间');
    await hostPage.click('[data-testid="confirm-create-button"]');
    await hostPage.waitForNavigation();

    // 玩家加入
    const playerUsername = generateRandomUsername();
    await registerAndLogin(page, playerUsername);
    await page.goto(hostPage.url());
    await page.waitForSelector('[data-testid="room-page"]');

    // 点击准备
    await page.click('[data-testid="ready-button"]');
    await expect(page.locator('[data-testid="ready-button"]')).toContainText('取消准备');

    // 房主看到玩家已准备
    await expect(hostPage.locator(`[data-testid="player-status"]:has-text("${playerUsername}")`))
      .toContainText('已准备');

    // 取消准备
    await page.click('[data-testid="ready-button"]');
    await expect(page.locator('[data-testid="ready-button"]')).toContainText('准备');

    await hostPage.close();
  });

  test('应该能发送聊天消息', async ({ page, browser }) => {
    // 房主创建房间
    const hostPage = await browser.newPage();
    await registerAndLogin(hostPage, generateRandomUsername());
    await hostPage.click('[data-testid="create-room-button"]');
    await hostPage.fill('[data-testid="room-name-input"]', '聊天测试房间');
    await hostPage.click('[data-testid="confirm-create-button"]');
    await hostPage.waitForNavigation();

    // 玩家加入
    const playerUsername = generateRandomUsername();
    await registerAndLogin(page, playerUsername);
    await page.goto(hostPage.url());
    await page.waitForSelector('[data-testid="room-page"]');

    // 发送消息
    await page.fill('[data-testid="chat-input"]', '大家好！');
    await page.click('[data-testid="send-chat-button"]');

    // 验证消息显示
    await expect(page.locator('[data-testid="chat-message"]:has-text("大家好！")')).toBeVisible();
    await expect(hostPage.locator('[data-testid="chat-message"]:has-text("大家好！")')).toBeVisible();

    await hostPage.close();
  });
});

// ============================================
// 5. 开始游戏测试
// ============================================

test.describe('开始游戏', () => {
  test('房主应该能在所有玩家准备后开始游戏', async ({ page, browser }) => {
    // 房主创建房间
    await page.click('[data-testid="create-room-button"]');
    await page.fill('[data-testid="room-name-input"]', '开始游戏测试');
    await page.click('[data-testid="confirm-create-button"]');
    await page.waitForNavigation();

    // 另一个用户加入并准备
    const playerPage = await browser.newPage();
    await registerAndLogin(playerPage, generateRandomUsername());
    await playerPage.goto(page.url());
    await playerPage.waitForSelector('[data-testid="room-page"]');
    await playerPage.click('[data-testid="ready-button"]');

    // 等待玩家准备状态同步
    await page.waitForSelector('[data-testid="player-ready-indicator"]');

    // 房主开始游戏
    await page.click('[data-testid="start-game-button"]');

    // 验证游戏开始
    await expect(page).toHaveURL(/game/);
    await expect(page.locator('[data-testid="game-page"]')).toBeVisible();
    await expect(playerPage).toHaveURL(/game/);

    await playerPage.close();
  });

  test('有玩家未准备时不应该能开始', async ({ page, browser }) => {
    // 房主创建房间
    await page.click('[data-testid="create-room-button"]');
    await page.fill('[data-testid="room-name-input"]', '未准备测试');
    await page.click('[data-testid="confirm-create-button"]');
    await page.waitForNavigation();

    // 另一个用户加入但不准备
    const playerPage = await browser.newPage();
    await registerAndLogin(playerPage, generateRandomUsername());
    await playerPage.goto(page.url());
    await playerPage.waitForSelector('[data-testid="room-page"]');

    // 房主尝试开始游戏
    await page.click('[data-testid="start-game-button"]');

    // 验证提示
    await expect(page.locator('[data-testid="error-message"]')).toContainText('未准备');

    await playerPage.close();
  });
});

// ============================================
// 6. 快速匹配测试
// ============================================

test.describe('快速匹配', () => {
  test('应该能进行快速匹配', async ({ page }) => {
    await page.click('[data-testid="quick-match-button"]');

    // 验证匹配界面
    await expect(page.locator('[data-testid="matchmaking-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="matching-status"]')).toContainText('匹配中');

    // 取消匹配
    await page.click('[data-testid="cancel-match-button"]');
    await expect(page.locator('[data-testid="matchmaking-modal"]')).not.toBeVisible();
  });
});

// ============================================
// 7. 断线重连测试
// ============================================

test.describe('断线重连', () => {
  test('断线后应该能自动重连', async ({ page }) => {
    // 创建房间
    await page.click('[data-testid="create-room-button"]');
    await page.fill('[data-testid="room-name-input"]', '重连测试');
    await page.click('[data-testid="confirm-create-button"]');
    await page.waitForNavigation();

    // 模拟断线（关闭网络）
    await page.context().setOffline(true);

    // 验证离线状态
    await expect(page.locator('[data-testid="connection-status"]')).toContainText('离线');

    // 恢复网络
    await page.context().setOffline(false);

    // 验证自动重连
    await expect(page.locator('[data-testid="connection-status"]')).toContainText('在线');
    await expect(page.locator('[data-testid="room-page"]')).toBeVisible();
  });
});

// ============================================
// 8. 响应式布局测试
// ============================================

test.describe('响应式布局', () => {
  test('应该适配不同屏幕尺寸', async ({ page }) => {
    // 桌面
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('[data-testid="lobby-page"]')).toBeVisible();

    // 平板
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await expect(page.locator('[data-testid="lobby-page"]')).toBeVisible();

    // 手机
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await expect(page.locator('[data-testid="lobby-page"]')).toBeVisible();
  });
});
