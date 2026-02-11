/**
 * Playwright 全局设置
 * 在所有测试之前执行
 */

import { FullConfig } from '@playwright/test';
import { request } from '@playwright/test';

/**
 * 全局设置函数
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup...');

  // 获取基础URL
  const { baseURL } = config.projects[0].use;

  // 1. 检查测试环境
  await checkTestEnvironment(baseURL);

  // 2. 清理测试数据
  await cleanupTestData(baseURL);

  // 3. 创建测试用户
  await createTestUsers(baseURL);

  // 4. 保存认证状态
  await saveAuthState(config);

  console.log('✅ Global setup completed');
}

/**
 * 检查测试环境
 */
async function checkTestEnvironment(baseURL: string | undefined) {
  console.log('📡 Checking test environment...');

  if (!baseURL) {
    throw new Error('Base URL is not defined');
  }

  const context = await request.newContext();

  try {
    const response = await context.get(`${baseURL}/health`, {
      timeout: 10000
    });

    if (response.status() !== 200) {
      throw new Error(`Test environment is not ready: ${response.status()}`);
    }

    console.log('✅ Test environment is ready');
  } catch (error) {
    console.error('❌ Test environment check failed:', error);
    throw error;
  } finally {
    await context.dispose();
  }
}

/**
 * 清理测试数据
 */
async function cleanupTestData(baseURL: string | undefined) {
  console.log('🧹 Cleaning up test data...');

  const context = await request.newContext();

  try {
    // 调用清理API
    const response = await context.post(`${baseURL}/api/test/cleanup`, {
      headers: {
        'X-Test-Key': process.env.TEST_API_KEY || 'test-key'
      }
    });

    if (response.ok()) {
      console.log('✅ Test data cleaned up');
    } else {
      console.warn('⚠️ Failed to cleanup test data:', await response.text());
    }
  } catch (error) {
    console.warn('⚠️ Cleanup API not available, skipping...');
  } finally {
    await context.dispose();
  }
}

/**
 * 创建测试用户
 */
async function createTestUsers(baseURL: string | undefined) {
  console.log('👤 Creating test users...');

  const context = await request.newContext();
  const testUsers = [
    { username: 'test_player_1', password: 'Password1' },
    { username: 'test_player_2', password: 'Password1' },
    { username: 'test_player_3', password: 'Password1' }
  ];

  for (const user of testUsers) {
    try {
      const response = await context.post(`${baseURL}/api/auth/register`, {
        data: {
          username: user.username,
          password: user.password,
          confirmPassword: user.password
        }
      });

      if (response.ok() || response.status() === 409) {
        console.log(`✅ Test user ${user.username} ready`);
      } else {
        console.warn(`⚠️ Failed to create test user ${user.username}:`, await response.text());
      }
    } catch (error) {
      console.warn(`⚠️ Error creating test user ${user.username}:`, error);
    }
  }

  await context.dispose();
}

/**
 * 保存认证状态
 */
async function saveAuthState(config: FullConfig) {
  console.log('🔐 Saving authentication state...');

  const { baseURL, storageState } = config.projects[0].use;

  if (!storageState) {
    console.log('ℹ️ No storage state path configured, skipping...');
    return;
  }

  const context = await request.newContext();

  try {
    // 登录并保存状态
    const loginResponse = await context.post(`${baseURL}/api/auth/login`, {
      data: {
        username: 'test_player_1',
        password: 'Password1'
      }
    });

    if (loginResponse.ok()) {
      // 保存存储状态
      await context.storageState({ path: storageState as string });
      console.log('✅ Authentication state saved');
    } else {
      console.warn('⚠️ Failed to login test user');
    }
  } catch (error) {
    console.warn('⚠️ Error saving auth state:', error);
  } finally {
    await context.dispose();
  }
}

export default globalSetup;
