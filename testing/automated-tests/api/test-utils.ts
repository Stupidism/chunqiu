/**
 * API测试工具函数
 */

import request from 'supertest';

// ============================================
// 测试服务器管理
// ============================================

let testApp: any = null;
let testServer: any = null;

/**
 * 创建测试服务器
 */
export async function createTestServer() {
  if (testApp) {
    return { app: testApp, server: testServer };
  }

  // 这里应该导入实际的应用创建函数
  // const { createApp } = require('../../server/app');
  // testApp = createApp({ test: true });

  // 模拟实现
  const express = require('express');
  testApp = express();
  testApp.use(express.json());

  // 添加基本路由
  setupRoutes(testApp);

  testServer = testApp.listen(0);

  return { app: testApp, server: testServer };
}

/**
 * 关闭测试服务器
 */
export async function closeTestServer(server: any) {
  if (server) {
    return new Promise<void>((resolve, reject) => {
      server.close((err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

// ============================================
// 数据库管理
// ============================================

/**
 * 清理数据库
 */
export async function clearDatabase() {
  // 这里应该使用Prisma或其他ORM清理数据库
  // await prisma.$transaction([
  //   prisma.gameSession.deleteMany(),
  //   prisma.room.deleteMany(),
  //   prisma.user.deleteMany()
  // ]);

  // 模拟实现
  console.log('Database cleared');
}

/**
 * 重置数据库
 */
export async function resetDatabase() {
  await clearDatabase();
  // 可以在这里添加种子数据
}

// ============================================
// 用户管理
// ============================================

/**
 * 创建测试用户
 */
export async function createTestUser(
  app: any,
  username: string,
  password: string = 'Password1'
): Promise<{ id: string; username: string; token: string }> {
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      username,
      password,
      confirmPassword: password
    });

  if (response.status !== 201) {
    throw new Error(`Failed to create test user: ${response.body.message}`);
  }

  return {
    id: response.body.user.id,
    username: response.body.user.username,
    token: response.body.accessToken
  };
}

/**
 * 登录测试用户
 */
export async function loginTestUser(
  app: any,
  username: string,
  password: string = 'Password1'
): Promise<{ id: string; username: string; token: string }> {
  const response = await request(app)
    .post('/api/auth/login')
    .send({
      username,
      password
    });

  if (response.status !== 200) {
    throw new Error(`Failed to login test user: ${response.body.message}`);
  }

  return {
    id: response.body.user.id,
    username: response.body.user.username,
    token: response.body.accessToken
  };
}

// ============================================
// 房间管理
// ============================================

/**
 * 创建测试房间
 */
export async function createTestRoom(
  app: any,
  token: string,
  name: string,
  options: Partial<{
    gameMode: string;
    mapId: string;
    maxPlayers: number;
    password: string;
  }> = {}
): Promise<{ id: string; name: string }> {
  const response = await request(app)
    .post('/api/rooms')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name,
      gameMode: options.gameMode || 'pvp',
      mapId: options.mapId || 'map_1',
      maxPlayers: options.maxPlayers || 2,
      password: options.password
    });

  if (response.status !== 201) {
    throw new Error(`Failed to create test room: ${response.body.message}`);
  }

  return {
    id: response.body.id,
    name: response.body.name
  };
}

/**
 * 加入测试房间
 */
export async function joinTestRoom(
  app: any,
  token: string,
  roomId: string,
  password?: string
): Promise<void> {
  const response = await request(app)
    .post(`/api/rooms/${roomId}/join`)
    .set('Authorization', `Bearer ${token}`)
    .send(password ? { password } : {});

  if (response.status !== 200) {
    throw new Error(`Failed to join test room: ${response.body.message}`);
  }
}

// ============================================
// 游戏管理
// ============================================

/**
 * 创建并启动测试游戏
 */
export async function createTestGame(
  app: any,
  hostToken: string,
  playerTokens: string[]
): Promise<{ gameId: string; roomId: string }> {
  // 创建房间
  const room = await createTestRoom(app, hostToken, 'Test Game');

  // 玩家加入
  for (const token of playerTokens) {
    await joinTestRoom(app, token, room.id);
    // 准备
    await request(app)
      .post(`/api/rooms/${room.id}/ready`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ready: true });
  }

  // 开始游戏
  const response = await request(app)
    .post(`/api/rooms/${room.id}/start`)
    .set('Authorization', `Bearer ${hostToken}`);

  if (response.status !== 200) {
    throw new Error(`Failed to start test game: ${response.body.message}`);
  }

  return {
    gameId: response.body.gameId,
    roomId: room.id
  };
}

// ============================================
// 断言辅助函数
// ============================================

/**
 * 验证响应结构
 */
export function expectResponseStructure(
  response: any,
  expectedStructure: Record<string, string>
): void {
  for (const [key, type] of Object.entries(expectedStructure)) {
    expect(response.body).toHaveProperty(key);
    expect(typeof response.body[key]).toBe(type);
  }
}

/**
 * 验证错误响应
 */
export function expectErrorResponse(
  response: any,
  expectedStatus: number,
  expectedMessage?: string
): void {
  expect(response.status).toBe(expectedStatus);
  expect(response.body).toHaveProperty('message');
  if (expectedMessage) {
    expect(response.body.message).toContain(expectedMessage);
  }
}

/**
 * 验证成功响应
 */
export function expectSuccessResponse(
  response: any,
  expectedStatus: number = 200
): void {
  expect(response.status).toBe(expectedStatus);
  expect(response.body).not.toHaveProperty('error');
}

// ============================================
// 模拟数据生成
// ============================================

/**
 * 生成随机用户名
 */
export function generateRandomUsername(): string {
  return `test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * 生成随机房间名
 */
export function generateRandomRoomName(): string {
  return `Room_${Date.now()}`;
}

/**
 * 生成测试用户数据
 */
export function generateTestUserData() {
  return {
    username: generateRandomUsername(),
    password: 'Password1',
    confirmPassword: 'Password1'
  };
}

/**
 * 生成测试房间数据
 */
export function generateTestRoomData() {
  return {
    name: generateRandomRoomName(),
    gameMode: 'pvp',
    mapId: 'map_1',
    maxPlayers: 2
  };
}

// ============================================
// 时间控制
// ============================================

/**
 * 等待指定时间
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 等待条件满足
 */
export async function waitForCondition(
  condition: () => boolean | Promise<boolean>,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await wait(interval);
  }
  throw new Error('Condition not met within timeout');
}

// ============================================
// 路由设置（模拟）
// ============================================

function setupRoutes(app: any) {
  // 健康检查
  app.get('/health', (req: any, res: any) => {
    res.json({ status: 'ok' });
  });

  // 这里可以添加更多测试路由
}

// ============================================
// 导出类型
// ============================================

export interface TestUser {
  id: string;
  username: string;
  token: string;
}

export interface TestRoom {
  id: string;
  name: string;
}

export interface TestGame {
  gameId: string;
  roomId: string;
}
