/**
 * 认证模块 E2E 测试
 * 使用 Playwright
 */

import { test, expect, Page } from '@playwright/test';

// 测试配置
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

// 辅助函数：生成随机用户名
function generateRandomUsername(): string {
  return `test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

// ============================================
// 1. 注册流程测试
// ============================================

test.describe('用户注册', () => {
  test('应该成功注册新用户', async ({ page }) => {
    const username = generateRandomUsername();
    const password = 'Password1';

    // 访问注册页面
    await page.goto(`${BASE_URL}/register`);

    // 验证页面标题
    await expect(page).toHaveTitle(/注册|Register/);

    // 填写注册表单
    await page.fill('[data-testid="username-input"]', username);
    await page.fill('[data-testid="password-input"]', password);
    await page.fill('[data-testid="confirm-password-input"]', password);

    // 点击注册按钮
    await page.click('[data-testid="register-button"]');

    // 验证注册成功
    await expect(page).toHaveURL(/login|大厅/);
    await expect(page.locator('[data-testid="success-message"]')).toContainText('注册成功');
  });

  test('应该显示用户名已存在错误', async ({ page }) => {
    const username = 'existing_user';
    const password = 'Password1';

    // 先注册一个用户
    await page.goto(`${BASE_URL}/register`);
    await page.fill('[data-testid="username-input"]', username);
    await page.fill('[data-testid="password-input"]', password);
    await page.fill('[data-testid="confirm-password-input"]', password);
    await page.click('[data-testid="register-button"]');

    // 再次尝试注册相同用户名
    await page.goto(`${BASE_URL}/register`);
    await page.fill('[data-testid="username-input"]', username);
    await page.fill('[data-testid="password-input"]', password);
    await page.fill('[data-testid="confirm-password-input"]', password);
    await page.click('[data-testid="register-button"]');

    // 验证错误提示
    await expect(page.locator('[data-testid="error-message"]')).toContainText('用户名已存在');
  });

  test('应该验证密码强度', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    await page.fill('[data-testid="username-input"]', generateRandomUsername());
    await page.fill('[data-testid="password-input"]', 'weak');
    await page.fill('[data-testid="confirm-password-input"]', 'weak');
    await page.click('[data-testid="register-button"]');

    // 验证密码强度错误
    await expect(page.locator('[data-testid="password-error"]')).toContainText('密码');
  });

  test('应该验证密码和确认密码一致', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    await page.fill('[data-testid="username-input"]', generateRandomUsername());
    await page.fill('[data-testid="password-input"]', 'Password1');
    await page.fill('[data-testid="confirm-password-input"]', 'Password2');
    await page.click('[data-testid="register-button"]');

    // 验证密码不一致错误
    await expect(page.locator('[data-testid="confirm-password-error"]')).toContainText('不一致');
  });

  test('应该验证必填字段', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    await page.click('[data-testid="register-button"]');

    // 验证必填字段错误
    await expect(page.locator('[data-testid="username-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
  });

  test('应该防止XSS攻击', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    await page.fill('[data-testid="username-input"]', '<script>alert("xss")</script>');
    await page.fill('[data-testid="password-input"]', 'Password1');
    await page.fill('[data-testid="confirm-password-input"]', 'Password1');
    await page.click('[data-testid="register-button"]');

    // 验证XSS被阻止
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });
});

// ============================================
// 2. 登录流程测试
// ============================================

test.describe('用户登录', () => {
  const testUser = {
    username: `login_test_${Date.now()}`,
    password: 'Password1'
  };

  test.beforeAll(async ({ browser }) => {
    // 创建测试用户
    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/register`);
    await page.fill('[data-testid="username-input"]', testUser.username);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.fill('[data-testid="confirm-password-input"]', testUser.password);
    await page.click('[data-testid="register-button"]');
    await page.waitForNavigation();
    await page.close();
  });

  test('应该成功登录', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // 填写登录表单
    await page.fill('[data-testid="username-input"]', testUser.username);
    await page.fill('[data-testid="password-input"]', testUser.password);

    // 点击登录按钮
    await page.click('[data-testid="login-button"]');

    // 验证登录成功
    await expect(page).toHaveURL(/lobby|大厅/);
    await expect(page.locator('[data-testid="user-menu"]')).toContainText(testUser.username);
  });

  test('应该显示密码错误', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.fill('[data-testid="username-input"]', testUser.username);
    await page.fill('[data-testid="password-input"]', 'WrongPassword1');
    await page.click('[data-testid="login-button"]');

    // 验证错误提示
    await expect(page.locator('[data-testid="error-message"]')).toContainText('用户名或密码错误');
  });

  test('应该显示用户不存在错误', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.fill('[data-testid="username-input"]', 'nonexistent_user_12345');
    await page.fill('[data-testid="password-input"]', 'Password1');
    await page.click('[data-testid="login-button"]');

    // 验证错误提示（不应该暴露用户不存在）
    await expect(page.locator('[data-testid="error-message"]')).toContainText('用户名或密码错误');
  });

  test('应该实现登录速率限制', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // 连续5次错误登录
    for (let i = 0; i < 5; i++) {
      await page.fill('[data-testid="username-input"]', testUser.username);
      await page.fill('[data-testid="password-input"]', 'wrong_password');
      await page.click('[data-testid="login-button"]');
      await page.waitForTimeout(500);
    }

    // 第6次尝试
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.click('[data-testid="login-button"]');

    // 验证速率限制
    await expect(page.locator('[data-testid="error-message"]')).toContainText('尝试过多');
  });

  test('应该记住登录状态', async ({ page, context }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="username-input"]', testUser.username);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForNavigation();

    // 关闭并重新打开页面
    await page.close();
    const newPage = await context.newPage();
    await newPage.goto(`${BASE_URL}/lobby`);

    // 验证仍然登录
    await expect(newPage.locator('[data-testid="user-menu"]')).toContainText(testUser.username);
  });
});

// ============================================
// 3. 登出流程测试
// ============================================

test.describe('用户登出', () => {
  test('应该成功登出', async ({ page }) => {
    // 先登录
    const username = generateRandomUsername();
    await page.goto(`${BASE_URL}/register`);
    await page.fill('[data-testid="username-input"]', username);
    await page.fill('[data-testid="password-input"]', 'Password1');
    await page.fill('[data-testid="confirm-password-input"]', 'Password1');
    await page.click('[data-testid="register-button"]');
    await page.waitForNavigation();

    // 点击登出
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');

    // 验证登出成功
    await expect(page).toHaveURL(/login/);
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();

    // 验证Token已清除
    const token = await page.evaluate(() => localStorage.getItem('access_token'));
    expect(token).toBeNull();
  });
});

// ============================================
// 4. Token刷新测试
// ============================================

test.describe('Token刷新', () => {
  test('应该自动刷新过期token', async ({ page }) => {
    // 登录并模拟token过期
    const username = generateRandomUsername();
    await page.goto(`${BASE_URL}/register`);
    await page.fill('[data-testid="username-input"]', username);
    await page.fill('[data-testid="password-input"]', 'Password1');
    await page.fill('[data-testid="confirm-password-input"]', 'Password1');
    await page.click('[data-testid="register-button"]');
    await page.waitForNavigation();

    // 模拟token过期（通过localStorage）
    await page.evaluate(() => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MDAwMDAwMDB9.test';
      localStorage.setItem('access_token', expiredToken);
    });

    // 刷新页面，应该自动刷新token
    await page.reload();

    // 验证仍然登录
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });
});

// ============================================
// 5. 跨浏览器兼容性测试
// ============================================

test.describe('跨浏览器兼容性', () => {
  test('应该在不同分辨率下正常显示', async ({ page }) => {
    // 桌面分辨率
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(`${BASE_URL}/login`);
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();

    // 笔记本分辨率
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.reload();
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();

    // 平板分辨率
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();

    // 手机分辨率
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
  });
});

// ============================================
// 6. 无障碍测试
// ============================================

test.describe('无障碍测试', () => {
  test('登录表单应该支持键盘导航', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // 使用Tab键导航
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="username-input"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="password-input"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="login-button"]')).toBeFocused();

    // 使用Enter提交
    await page.fill('[data-testid="username-input"]', generateRandomUsername());
    await page.fill('[data-testid="password-input"]', 'Password1');
    await page.keyboard.press('Enter');
  });

  test('应该有正确的ARIA标签', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // 检查ARIA标签
    const usernameInput = page.locator('[data-testid="username-input"]');
    await expect(usernameInput).toHaveAttribute('aria-label', /用户名|Username/);

    const passwordInput = page.locator('[data-testid="password-input"]');
    await expect(passwordInput).toHaveAttribute('aria-label', /密码|Password/);
  });
});

// ============================================
// 7. 性能测试
// ============================================

test.describe('性能测试', () => {
  test('登录页面应该在3秒内加载完成', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000);
  });

  test('登录API响应时间应该小于1秒', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // 监听网络请求
    const responsePromise = page.waitForResponse(response =>
      response.url().includes('/api/auth/login')
    );

    await page.fill('[data-testid="username-input"]', generateRandomUsername());
    await page.fill('[data-testid="password-input"]', 'Password1');
    await page.click('[data-testid="login-button"]');

    const response = await responsePromise;
    const timing = await response.request().timing();

    expect(timing.responseEnd - timing.startTime).toBeLessThan(1000);
  });
});
