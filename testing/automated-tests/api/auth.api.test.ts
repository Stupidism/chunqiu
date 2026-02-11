/**
 * 认证API测试
 * 使用 Jest + Supertest
 */

import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { createTestServer, closeTestServer, clearDatabase } from './test-utils';

let app: any;
let server: any;

describe('Auth API', () => {
  beforeAll(async () => {
    const testServer = await createTestServer();
    app = testServer.app;
    server = testServer.server;
  });

  afterAll(async () => {
    await closeTestServer(server);
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  // ============================================
  // 1. 注册接口测试
  // ============================================

  describe('POST /api/auth/register', () => {
    it('应该成功注册新用户', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          password: 'Password1',
          confirmPassword: 'Password1'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe('testuser');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('应该拒绝已存在的用户名', async () => {
      // 先注册一个用户
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'existinguser',
          password: 'Password1',
          confirmPassword: 'Password1'
        });

      // 尝试用相同用户名注册
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'existinguser',
          password: 'Password1',
          confirmPassword: 'Password1'
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('用户名已存在');
    });

    it('应该验证密码强度', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          password: 'weak',
          confirmPassword: 'weak'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('密码');
    });

    it('应该验证密码和确认密码一致', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          password: 'Password1',
          confirmPassword: 'Password2'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('密码不一致');
    });

    it('应该验证必填字段', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('应该防止SQL注入', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: "' OR '1'='1",
          password: 'Password1',
          confirmPassword: 'Password1'
        });

      expect(response.status).toBe(400);
    });

    it('应该防止XSS攻击', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: '<script>alert(1)</script>',
          password: 'Password1',
          confirmPassword: 'Password1'
        });

      expect(response.status).toBe(400);
    });
  });

  // ============================================
  // 2. 登录接口测试
  // ============================================

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // 创建测试用户
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'logintest',
          password: 'Password1',
          confirmPassword: 'Password1'
        });
    });

    it('应该成功登录', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'logintest',
          password: 'Password1'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('应该拒绝错误的密码', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'logintest',
          password: 'WrongPassword1'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('用户名或密码错误');
    });

    it('应该拒绝不存在的用户', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistentuser',
          password: 'Password1'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('用户名或密码错误');
    });

    it('不应该暴露用户名是否存在', async () => {
      const wrongPasswordResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'logintest',
          password: 'wrong'
        });

      const nonexistentResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'wrong'
        });

      // 错误消息应该相同
      expect(wrongPasswordResponse.body.message)
        .toBe(nonexistentResponse.body.message);
    });

    it('应该实现速率限制', async () => {
      // 连续5次错误登录
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            username: 'logintest',
            password: 'wrong'
          });
      }

      // 第6次应该被限制
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'logintest',
          password: 'Password1' // 正确的密码
        });

      expect(response.status).toBe(429);
      expect(response.body.message).toContain('尝试过多');
    });
  });

  // ============================================
  // 3. Token刷新接口测试
  // ============================================

  describe('POST /api/auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'refreshtest',
          password: 'Password1',
          confirmPassword: 'Password1'
        });

      refreshToken = registerResponse.body.refreshToken;
    });

    it('应该成功刷新token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.accessToken).not.toBe(refreshToken);
    });

    it('应该拒绝无效的refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid_token' });

      expect(response.status).toBe(401);
    });

    it('应该拒绝过期的refresh token', async () => {
      // 等待token过期或使用已过期token
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'expired.token.here' });

      expect(response.status).toBe(401);
    });
  });

  // ============================================
  // 4. 登出接口测试
  // ============================================

  describe('POST /api/auth/logout', () => {
    let accessToken: string;

    beforeEach(async () => {
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'logouttest',
          password: 'Password1',
          confirmPassword: 'Password1'
        });

      accessToken = registerResponse.body.accessToken;
    });

    it('应该成功登出', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);

      // 登出后token应该失效
      const protectedResponse = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(protectedResponse.status).toBe(401);
    });

    it('应该拒绝未认证的请求', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(401);
    });
  });

  // ============================================
  // 5. 获取当前用户信息测试
  // ============================================

  describe('GET /api/auth/me', () => {
    let accessToken: string;
    let userId: string;

    beforeEach(async () => {
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'metest',
          password: 'Password1',
          confirmPassword: 'Password1'
        });

      accessToken = registerResponse.body.accessToken;
      userId = registerResponse.body.user.id;
    });

    it('应该返回当前用户信息', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(userId);
      expect(response.body.username).toBe('metest');
    });

    it('应该拒绝无效token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
    });

    it('应该拒绝过期token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer expired.token.here');

      expect(response.status).toBe(401);
    });

    it('应该拒绝无token请求', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
    });
  });
});

// ============================================
// 测试工具函数
// ============================================

export async function createTestServer() {
  // 这里应该导入实际的应用创建函数
  // const { createApp } = require('../../server/app');
  // const app = createApp({ test: true });
  
  // 模拟实现
  const express = require('express');
  const app = express();
  app.use(express.json());
  
  // 添加路由
  setupAuthRoutes(app);
  
  const server = app.listen(0);
  return { app, server };
}

export async function closeTestServer(server: any) {
  return new Promise((resolve) => {
    server.close(resolve);
  });
}

export async function clearDatabase() {
  // 清理测试数据库
  // await prisma.user.deleteMany();
}

function setupAuthRoutes(app: any) {
  const users: any[] = [];
  const tokens: Set<string> = new Set();
  const loginAttempts: Map<string, number> = new Map();

  // 注册
  app.post('/api/auth/register', (req: any, res: any) => {
    const { username, password, confirmPassword } = req.body;

    // 验证
    if (!username || !password) {
      return res.status(400).json({ errors: ['缺少必填字段'] });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: '密码不一致' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: '密码长度至少8位' });
    }

    // 检查用户名
    if (users.find(u => u.username === username)) {
      return res.status(409).json({ message: '用户名已存在' });
    }

    // 创建用户
    const user = {
      id: `user_${users.length + 1}`,
      username,
      password: `hashed_${password}` // 模拟哈希
    };
    users.push(user);

    const accessToken = `access_${user.id}`;
    const refreshToken = `refresh_${user.id}`;
    tokens.add(accessToken);

    res.status(201).json({
      user: { id: user.id, username: user.username },
      accessToken,
      refreshToken
    });
  });

  // 登录
  app.post('/api/auth/login', (req: any, res: any) => {
    const { username, password } = req.body;
    const attempts = loginAttempts.get(username) || 0;

    // 速率限制
    if (attempts >= 5) {
      return res.status(429).json({ message: '登录尝试过多，请15分钟后重试' });
    }

    const user = users.find(u => u.username === username);

    if (!user || user.password !== `hashed_${password}`) {
      loginAttempts.set(username, attempts + 1);
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    loginAttempts.delete(username);

    const accessToken = `access_${user.id}`;
    const refreshToken = `refresh_${user.id}`;
    tokens.add(accessToken);

    res.json({
      user: { id: user.id, username: user.username },
      accessToken,
      refreshToken
    });
  });

  // 刷新token
  app.post('/api/auth/refresh', (req: any, res: any) => {
    const { refreshToken } = req.body;

    if (!refreshToken || !refreshToken.startsWith('refresh_')) {
      return res.status(401).json({ message: '无效的token' });
    }

    const userId = refreshToken.replace('refresh_', '');
    const newAccessToken = `access_${userId}_new`;
    const newRefreshToken = `refresh_${userId}_new`;

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  });

  // 登出
  app.post('/api/auth/logout', authenticate, (req: any, res: any) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    tokens.delete(token);
    res.json({ message: '登出成功' });
  });

  // 获取当前用户
  app.get('/api/auth/me', authenticate, (req: any, res: any) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const userId = token?.replace('access_', '').replace('_new', '');
    const user = users.find(u => u.id === userId);
    res.json(user);
  });

  // 认证中间件
  function authenticate(req: any, res: any, next: any) {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token || !tokens.has(token)) {
      return res.status(401).json({ message: '未授权' });
    }

    next();
  }
}
