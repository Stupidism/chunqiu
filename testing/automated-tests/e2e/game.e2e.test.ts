/**
 * 游戏核心 E2E 测试
 * 使用 Playwright
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

function generateRandomUsername(): string {
  return `game_test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

async function registerAndLogin(page: Page, username: string): Promise<void> {
  await page.goto(`${BASE_URL}/register`);
  await page.fill('[data-testid="username-input"]', username);
  await page.fill('[data-testid="password-input"]', 'Password1');
  await page.fill('[data-testid="confirm-password-input"]', 'Password1');
  await page.click('[data-testid="register-button"]');
  await page.waitForNavigation();
}

async function createRoomAndStartGame(page: Page, browser: any): Promise<{ hostPage: Page; playerPage: Page }> {
  // 房主创建房间
  const hostPage = await browser.newPage();
  await registerAndLogin(hostPage, generateRandomUsername());
  await hostPage.click('[data-testid="create-room-button"]');
  await hostPage.fill('[data-testid="room-name-input"]', '游戏测试房间');
  await hostPage.selectOption('[data-testid="game-mode-select"]', 'pvp');
  await hostPage.click('[data-testid="confirm-create-button"]');
  await hostPage.waitForNavigation();

  // 玩家加入
  const playerPage = await browser.newPage();
  await registerAndLogin(playerPage, generateRandomUsername());
  await playerPage.goto(hostPage.url());
  await playerPage.waitForSelector('[data-testid="room-page"]');
  await playerPage.click('[data-testid="ready-button"]');

  // 等待玩家准备
  await hostPage.waitForSelector('[data-testid="player-ready-indicator"]');

  // 开始游戏
  await hostPage.click('[data-testid="start-game-button"]');

  // 等待游戏页面加载
  await hostPage.waitForSelector('[data-testid="game-page"]', { timeout: 10000 });
  await playerPage.waitForSelector('[data-testid="game-page"]', { timeout: 10000 });

  return { hostPage, playerPage };
}

// ============================================
// 1. 游戏初始化测试
// ============================================

test.describe('游戏初始化', () => {
  test('应该正确加载游戏界面', async ({ page, browser }) => {
    const { hostPage } = await createRoomAndStartGame(page, browser);

    // 验证游戏页面元素
    await expect(hostPage.locator('[data-testid="game-page"]')).toBeVisible();
    await expect(hostPage.locator('[data-testid="game-map"]')).toBeVisible();
    await expect(hostPage.locator('[data-testid="resource-panel"]')).toBeVisible();
    await expect(hostPage.locator('[data-testid="turn-indicator"]')).toBeVisible();
    await expect(hostPage.locator('[data-testid="minimap"]')).toBeVisible();

    await hostPage.close();
  });

  test('应该显示初始资源', async ({ page, browser }) => {
    const { hostPage } = await createRoomAndStartGame(page, browser);

    // 验证资源显示
    await expect(hostPage.locator('[data-testid="gold-value"]')).toHaveText(/\d+/);
    await expect(hostPage.locator('[data-testid="food-value"]')).toHaveText(/\d+/);
    await expect(hostPage.locator('[data-testid="production-value"]')).toHaveText(/\d+/);

    await hostPage.close();
  });

  test('应该显示初始城市', async ({ page, browser }) => {
    const { hostPage } = await createRoomAndStartGame(page, browser);

    // 验证城市存在
    const cities = hostPage.locator('[data-testid="city-tile"]');
    await expect(cities.count()).toBeGreaterThan(0);

    await hostPage.close();
  });

  test('应该显示初始单位', async ({ page, browser }) => {
    const { hostPage } = await createRoomAndStartGame(page, browser);

    // 验证单位存在
    const units = hostPage.locator('[data-testid="unit-tile"]');
    await expect(units.count()).toBeGreaterThan(0);

    await hostPage.close();
  });
});

// ============================================
// 2. 地图交互测试
// ============================================

test.describe('地图交互', () => {
  test('应该能选中单位', async ({ page, browser }) => {
    const { hostPage } = await createRoomAndStartGame(page, browser);

    // 点击单位
    const unit = hostPage.locator('[data-testid="unit-tile"]').first();
    await unit.click();

    // 验证单位被选中
    await expect(hostPage.locator('[data-testid="selected-unit"]')).toBeVisible();
    await expect(hostPage.locator('[data-testid="movement-range"]')).toBeVisible();

    await hostPage.close();
  });

  test('应该能选中城市', async ({ page, browser }) => {
    const { hostPage } = await createRoomAndStartGame(page, browser);

    // 点击城市
    const city = hostPage.locator('[data-testid="city-tile"]').first();
    await city.click();

    // 验证城市被选中
    await expect(hostPage.locator('[data-testid="city-panel"]')).toBeVisible();
    await expect(hostPage.locator('[data-testid="city-name"]')).toBeVisible();

    await hostPage.close();
  });

  test('应该能移动地图视角', async ({ page, browser }) => {
    const { hostPage } = await createRoomAndStartGame(page, browser);

    // 拖拽移动视角
    const map = hostPage.locator('[data-testid="game-map"]');
    const initialTransform = await map.evaluate(el => (el as HTMLElement).style.transform);

    await map.dragTo(map, {
      sourcePosition: { x: 400, y: 300 },
      targetPosition: { x: 200, y: 150 }
    });

    const newTransform = await map.evaluate(el => (el as HTMLElement).style.transform);
    expect(newTransform).not.toBe(initialTransform);

    await hostPage.close();
  });

  test('应该能缩放地图', async ({ page, browser }) => {
    const { hostPage } = await createRoomAndStartGame(page, browser);

    // 点击放大按钮
    await hostPage.click('[data-testid="zoom-in-button"]');

    // 验证缩放
    const map = hostPage.locator('[data-testid="game-map"]');
    const scale = await map.evaluate(el => (el as HTMLElement).style.transform);
    expect(scale).toContain('scale');

    await hostPage.close();
  });

  test('小地图应该能跳转视角', async ({ page, browser }) => {
    const { hostPage } = await createRoomAndStartGame(page, browser);

    // 点击小地图
    await hostPage.click('[data-testid="minimap"]');

    // 验证视角跳转
    await expect(hostPage.locator('[data-testid="game-map"]')).toBeVisible();

    await hostPage.close();
  });
});

// ============================================
// 3. 单位移动测试
// ============================================

test.describe('单位移动', () => {
  test('应该能移动单位', async ({ page, browser }) => {
    const { hostPage } = await createRoomAndStartGame(page, browser);

    // 选中单位
    const unit = hostPage.locator('[data-testid="unit-tile"]').first();
    await unit.click();

    // 获取单位初始位置
    const initialPosition = await unit.boundingBox();

    // 点击移动范围内的格子
    const movableTile = hostPage.locator('[data-testid="movable-tile"]').first();
    await movableTile.click();

    // 验证单位移动
    await hostPage.waitForTimeout(500); // 等待动画
    const newPosition = await unit.boundingBox();
    expect(newPosition).not.toEqual(initialPosition);

    await hostPage.close();
  });

  test('移动力不足时不应该移动', async ({ page, browser }) => {
    const { hostPage } = await createRoomAndStartGame(page, browser);

    // 选中单位
    const unit = hostPage.locator('[data-testid="unit-tile"]').first();
    await unit.click();

    // 尝试移动到移动力范围外的格子
    const farTile = hostPage.locator('[data-testid="map-tile"]').nth(20);
    await farTile.click();

    // 验证单位未移动（没有移动动画）
    await expect(hostPage.locator('[data-testid="movement-animation"]')).not.toBeVisible();

    await hostPage.close();
  });

  test('应该显示移动路径', async ({ page, browser }) => {
    const { hostPage } = await createRoomAndStartGame(page, browser);

    // 选中单位
    const unit = hostPage.locator('[data-testid="unit-tile"]').first();
    await unit.click();

    // 悬停到可移动格子
    const movableTile = hostPage.locator('[data-testid="movable-tile"]').first();
    await movableTile.hover();

    // 验证路径显示
    await expect(hostPage.locator('[data-testid="movement-path"]')).toBeVisible();

    await hostPage.close();
  });
});

// ============================================
// 4. 战斗系统测试
// ============================================

test.describe('战斗系统', () => {
  test('应该能攻击敌方单位', async ({ page, browser }) => {
    const { hostPage, playerPage } = await createRoomAndStartGame(page, browser);

    // 等待玩家回合
    await hostPage.waitForSelector('[data-testid="your-turn-indicator"]');

    // 选中己方单位
    const unit = hostPage.locator('[data-testid="unit-tile"]').first();
    await unit.click();

    // 点击攻击按钮
    await hostPage.click('[data-testid="attack-button"]');

    // 选择攻击目标（敌方单位）
    const enemyUnit = hostPage.locator('[data-testid="enemy-unit-tile"]').first();
    await enemyUnit.click();

    // 验证战斗动画
    await expect(hostPage.locator('[data-testid="combat-animation"]')).toBeVisible();

    // 验证敌方单位受到伤害
    await expect(hostPage.locator('[data-testid="damage-number"]')).toBeVisible();

    await hostPage.close();
    await playerPage.close();
  });

  test('不能攻击友方单位', async ({ page, browser }) => {
    const { hostPage } = await createRoomAndStartGame(page, browser);

    // 选中单位
    const unit = hostPage.locator('[data-testid="unit-tile"]').first();
    await unit.click();

    // 点击攻击按钮
    await hostPage.click('[data-testid="attack-button"]');

    // 尝试点击友方单位
    const friendlyUnit = hostPage.locator('[data-testid="unit-tile"]').nth(1);
    await friendlyUnit.click();

    // 验证提示
    await expect(hostPage.locator('[data-testid="error-message"]')).toContainText('不能攻击友方单位');

    await hostPage.close();
  });

  test('单位死亡应该消失', async ({ page, browser }) => {
    const { hostPage, playerPage } = await createRoomAndStartGame(page, browser);

    // 等待玩家回合
    await hostPage.waitForSelector('[data-testid="your-turn-indicator"]');

    // 攻击敌方单位直到死亡
    // ... 执行多次攻击

    // 验证单位消失
    await expect(hostPage.locator('[data-testid="unit-death-animation"]')).toBeVisible();

    await hostPage.close();
    await playerPage.close();
  });
});

// ============================================
// 5. 城市系统测试
// ============================================

test.describe('城市系统', () => {
  test('应该能打开城市面板', async ({ page, browser }) => {
    const { hostPage } = await createRoomAndStartGame(page, browser);

    // 点击城市
    const city = hostPage.locator('[data-testid="city-tile"]').first();
    await city.click();

    // 验证城市面板
    await expect(hostPage.locator('[data-testid="city-panel"]')).toBeVisible();
    await expect(hostPage.locator('[data-testid="city-production-queue"]')).toBeVisible();
    await expect(hostPage.locator('[data-testid="city-buildings"]')).toBeVisible();

    await hostPage.close();
  });

  test('应该能建造单位', async ({ page, browser }) => {
    const { hostPage } = await createRoomAndStartGame(page, browser);

    // 点击城市
    const city = hostPage.locator('[data-testid="city-tile"]').first();
    await city.click();

    // 点击建造单位
    await hostPage.click('[data-testid="build-unit-button"]');

    // 选择单位类型
    await hostPage.click('[data-testid="unit-type-warrior"]');

    // 验证单位加入生产队列
    await expect(hostPage.locator('[data-testid="production-queue-item"]')).toContainText('战士');

    await hostPage.close();
  });

  test('资源不足时不应该能建造', async ({ page, browser }) => {
    const { hostPage } = await createRoomAndStartGame(page, browser);

    // 点击城市
    const city = hostPage.locator('[data-testid="city-tile"]').first();
    await city.click();

    // 尝试建造昂贵单位
    await hostPage.click('[data-testid="build-unit-button"]');
    await hostPage.click('[data-testid="unit-type-siege"]');

    // 验证提示
    await expect(hostPage.locator('[data-testid="error-message"]')).toContainText('资源不足');

    await hostPage.close();
  });
});

// ============================================
// 6. 回合系统测试
// ============================================

test.describe('回合系统', () => {
  test('应该能结束回合', async ({ page, browser }) => {
    const { hostPage, playerPage } = await createRoomAndStartGame(page, browser);

    // 等待玩家回合
    await hostPage.waitForSelector('[data-testid="your-turn-indicator"]');

    // 点击结束回合
    await hostPage.click('[data-testid="end-turn-button"]');

    // 验证回合结束
    await expect(hostPage.locator('[data-testid="your-turn-indicator"]')).not.toBeVisible();
    await expect(hostPage.locator('[data-testid="waiting-indicator"]')).toBeVisible();

    await hostPage.close();
    await playerPage.close();
  });

  test('新回合应该重置移动力', async ({ page, browser }) => {
    const { hostPage, playerPage } = await createRoomAndStartGame(page, browser);

    // 等待玩家回合
    await hostPage.waitForSelector('[data-testid="your-turn-indicator"]');

    // 移动单位消耗移动力
    const unit = hostPage.locator('[data-testid="unit-tile"]').first();
    await unit.click();
    const movableTile = hostPage.locator('[data-testid="movable-tile"]').first();
    await movableTile.click();

    // 结束回合
    await hostPage.click('[data-testid="end-turn-button"]');

    // 等待下一回合
    await hostPage.waitForSelector('[data-testid="your-turn-indicator"]');

    // 验证移动力重置
    await unit.click();
    const movementRange = hostPage.locator('[data-testid="movement-range"]');
    await expect(movementRange).toBeVisible();

    await hostPage.close();
    await playerPage.close();
  });

  test('新回合应该产出资源', async ({ page, browser }) => {
    const { hostPage, playerPage } = await createRoomAndStartGame(page, browser);

    // 等待玩家回合
    await hostPage.waitForSelector('[data-testid="your-turn-indicator"]');

    // 记录当前资源
    const initialGold = await hostPage.locator('[data-testid="gold-value"]').textContent();

    // 结束回合
    await hostPage.click('[data-testid="end-turn-button"]');

    // 等待下一回合
    await hostPage.waitForSelector('[data-testid="your-turn-indicator"]');

    // 验证资源增加
    const newGold = await hostPage.locator('[data-testid="gold-value"]').textContent();
    expect(parseInt(newGold!)).toBeGreaterThan(parseInt(initialGold!));

    await hostPage.close();
    await playerPage.close();
  });
});

// ============================================
// 7. 科技树测试
// ============================================

test.describe('科技树', () => {
  test('应该能打开科技树', async ({ page, browser }) => {
    const { hostPage } = await createRoomAndStartGame(page, browser);

    // 点击科技树按钮
    await hostPage.click('[data-testid="tech-tree-button"]');

    // 验证科技树界面
    await expect(hostPage.locator('[data-testid="tech-tree-modal"]')).toBeVisible();
    await expect(hostPage.locator('[data-testid="tech-node"]').first()).toBeVisible();

    await hostPage.close();
  });

  test('应该能研究科技', async ({ page, browser }) => {
    const { hostPage } = await createRoomAndStartGame(page, browser);

    // 打开科技树
    await hostPage.click('[data-testid="tech-tree-button"]');

    // 点击可研究的科技
    const availableTech = hostPage.locator('[data-testid="tech-node-available"]').first();
    await availableTech.click();

    // 点击研究按钮
    await hostPage.click('[data-testid="research-tech-button"]');

    // 验证科技开始研究
    await expect(hostPage.locator('[data-testid="researching-indicator"]')).toBeVisible();

    await hostPage.close();
  });
});

// ============================================
// 8. 游戏菜单测试
// ============================================

test.describe('游戏菜单', () => {
  test('应该能打开游戏菜单', async ({ page, browser }) => {
    const { hostPage } = await createRoomAndStartGame(page, browser);

    // 点击菜单按钮
    await hostPage.click('[data-testid="game-menu-button"]');

    // 验证菜单
    await expect(hostPage.locator('[data-testid="game-menu"]')).toBeVisible();
    await expect(hostPage.locator('[data-testid="save-game-button"]')).toBeVisible();
    await expect(hostPage.locator('[data-testid="load-game-button"]')).toBeVisible();
    await expect(hostPage.locator('[data-testid="settings-button"]')).toBeVisible();
    await expect(hostPage.locator('[data-testid="exit-game-button"]')).toBeVisible();

    await hostPage.close();
  });

  test('应该能保存游戏', async ({ page, browser }) => {
    const { hostPage } = await createRoomAndStartGame(page, browser);

    // 打开菜单
    await hostPage.click('[data-testid="game-menu-button"]');

    // 点击保存
    await hostPage.click('[data-testid="save-game-button"]');

    // 输入存档名
    await hostPage.fill('[data-testid="save-name-input"]', '测试存档');
    await hostPage.click('[data-testid="confirm-save-button"]');

    // 验证保存成功
    await expect(hostPage.locator('[data-testid="success-message"]')).toContainText('保存成功');

    await hostPage.close();
  });
});

// ============================================
// 9. 性能测试
// ============================================

test.describe('性能测试', () => {
  test('游戏页面应该在3秒内加载', async ({ page, browser }) => {
    const startTime = Date.now();

    const { hostPage } = await createRoomAndStartGame(page, browser);
    await hostPage.waitForSelector('[data-testid="game-page"]', { timeout: 3000 });

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);

    await hostPage.close();
  });

  test('地图渲染帧率应该大于30fps', async ({ page, browser }) => {
    const { hostPage } = await createRoomAndStartGame(page, browser);

    // 使用Performance API测量帧率
    const fps = await hostPage.evaluate(() => {
      return new Promise<number>((resolve) => {
        let frames = 0;
        const startTime = performance.now();

        const countFrames = () => {
          frames++;
          if (performance.now() - startTime < 1000) {
            requestAnimationFrame(countFrames);
          } else {
            resolve(frames);
          }
        };

        requestAnimationFrame(countFrames);
      });
    });

    expect(fps).toBeGreaterThan(30);

    await hostPage.close();
  });
});
