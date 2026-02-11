/**
 * 游戏大厅API测试
 * 使用 Jest + Supertest
 */

import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { createTestServer, closeTestServer, clearDatabase, createTestUser } from './test-utils';

let app: any;
let server: any;
let authToken: string;
let userId: string;

describe('Lobby API', () => {
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
    const user = await createTestUser(app, 'testuser', 'Password1');
    authToken = user.token;
    userId = user.id;
  });

  // ============================================
  // 1. 获取房间列表
  // ============================================

  describe('GET /api/rooms', () => {
    it('应该返回房间列表', async () => {
      // 先创建几个房间
      await createTestRoom(app, authToken, '房间1');
      await createTestRoom(app, authToken, '房间2');

      const response = await request(app)
        .get('/api/rooms')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('rooms');
      expect(Array.isArray(response.body.rooms)).toBe(true);
      expect(response.body.rooms.length).toBeGreaterThanOrEqual(2);
    });

    it('应该支持分页', async () => {
      // 创建多个房间
      for (let i = 0; i < 15; i++) {
        await createTestRoom(app, authToken, `房间${i}`);
      }

      const response = await request(app)
        .get('/api/rooms?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.rooms.length).toBe(10);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
    });

    it('应该支持按状态筛选', async () => {
      await createTestRoom(app, authToken, '等待中房间');
      
      const response = await request(app)
        .get('/api/rooms?status=waiting')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.rooms.every((r: any) => r.status === 'waiting')).toBe(true);
    });

    it('应该拒绝未认证请求', async () => {
      const response = await request(app)
        .get('/api/rooms');

      expect(response.status).toBe(401);
    });
  });

  // ============================================
  // 2. 创建房间
  // ============================================

  describe('POST /api/rooms', () => {
    it('应该成功创建房间', async () => {
      const response = await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '测试房间',
          gameMode: 'pvp',
          mapId: 'map_1',
          maxPlayers: 2
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('测试房间');
      expect(response.body.hostId).toBe(userId);
      expect(response.body.status).toBe('waiting');
    });

    it('应该验证房间名', async () => {
      const response = await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '',
          gameMode: 'pvp',
          mapId: 'map_1',
          maxPlayers: 2
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('房间名');
    });

    it('应该限制房间名长度', async () => {
      const response = await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'a'.repeat(51),
          gameMode: 'pvp',
          mapId: 'map_1',
          maxPlayers: 2
        });

      expect(response.status).toBe(400);
    });

    it('应该限制每个用户创建房间数量', async () => {
      // 创建5个房间
      for (let i = 0; i < 5; i++) {
        await createTestRoom(app, authToken, `房间${i}`);
      }

      // 尝试创建第6个
      const response = await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '第6个房间',
          gameMode: 'pvp',
          mapId: 'map_1',
          maxPlayers: 2
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('上限');
    });

    it('应该验证游戏模式', async () => {
      const response = await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '测试房间',
          gameMode: 'invalid_mode',
          mapId: 'map_1',
          maxPlayers: 2
        });

      expect(response.status).toBe(400);
    });

    it('应该验证最大玩家数', async () => {
      const response = await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '测试房间',
          gameMode: 'pvp',
          mapId: 'map_1',
          maxPlayers: 10 // 超过限制
        });

      expect(response.status).toBe(400);
    });
  });

  // ============================================
  // 3. 加入房间
  // ============================================

  describe('POST /api/rooms/:id/join', () => {
    let roomId: string;

    beforeEach(async () => {
      const room = await createTestRoom(app, authToken, '测试房间');
      roomId = room.id;
    });

    it('应该成功加入房间', async () => {
      // 创建另一个用户
      const user2 = await createTestUser(app, 'user2', 'Password1');

      const response = await request(app)
        .post(`/api/rooms/${roomId}/join`)
        .set('Authorization', `Bearer ${user2.token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('加入成功');
    });

    it('房主不应该能加入自己的房间', async () => {
      const response = await request(app)
        .post(`/api/rooms/${roomId}/join`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('已在房间中');
    });

    it('应该拒绝加入已满的房间', async () => {
      // 创建2人房间并加入一个玩家
      const user2 = await createTestUser(app, 'user2', 'Password1');
      await request(app)
        .post(`/api/rooms/${roomId}/join`)
        .set('Authorization', `Bearer ${user2.token}`);

      // 尝试加入第三个玩家
      const user3 = await createTestUser(app, 'user3', 'Password1');
      const response = await request(app)
        .post(`/api/rooms/${roomId}/join`)
        .set('Authorization', `Bearer ${user3.token}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('已满');
    });

    it('应该拒绝加入已开始游戏的房间', async () => {
      // 开始游戏
      await request(app)
        .post(`/api/rooms/${roomId}/start`)
        .set('Authorization', `Bearer ${authToken}`);

      const user2 = await createTestUser(app, 'user2', 'Password1');
      const response = await request(app)
        .post(`/api/rooms/${roomId}/join`)
        .set('Authorization', `Bearer ${user2.token}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('已开始');
    });

    it('应该支持密码房间', async () => {
      // 创建带密码的房间
      const passwordRoom = await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '密码房间',
          gameMode: 'pvp',
          mapId: 'map_1',
          maxPlayers: 2,
          password: 'secret123'
        });

      const user2 = await createTestUser(app, 'user2', 'Password1');

      // 不输入密码
      const noPasswordResponse = await request(app)
        .post(`/api/rooms/${passwordRoom.body.id}/join`)
        .set('Authorization', `Bearer ${user2.token}`);

      expect(noPasswordResponse.status).toBe(403);

      // 错误密码
      const wrongPasswordResponse = await request(app)
        .post(`/api/rooms/${passwordRoom.body.id}/join`)
        .set('Authorization', `Bearer ${user2.token}`)
        .send({ password: 'wrong' });

      expect(wrongPasswordResponse.status).toBe(403);

      // 正确密码
      const correctPasswordResponse = await request(app)
        .post(`/api/rooms/${passwordRoom.body.id}/join`)
        .set('Authorization', `Bearer ${user2.token}`)
        .send({ password: 'secret123' });

      expect(correctPasswordResponse.status).toBe(200);
    });
  });

  // ============================================
  // 4. 离开房间
  // ============================================

  describe('POST /api/rooms/:id/leave', () => {
    let roomId: string;

    beforeEach(async () => {
      const room = await createTestRoom(app, authToken, '测试房间');
      roomId = room.id;
    });

    it('应该成功离开房间', async () => {
      const user2 = await createTestUser(app, 'user2', 'Password1');
      await request(app)
        .post(`/api/rooms/${roomId}/join`)
        .set('Authorization', `Bearer ${user2.token}`);

      const response = await request(app)
        .post(`/api/rooms/${roomId}/leave`)
        .set('Authorization', `Bearer ${user2.token}`);

      expect(response.status).toBe(200);
    });

    it('房主离开应该转移房主', async () => {
      const user2 = await createTestUser(app, 'user2', 'Password1');
      await request(app)
        .post(`/api/rooms/${roomId}/join`)
        .set('Authorization', `Bearer ${user2.token}`);

      const response = await request(app)
        .post(`/api/rooms/${roomId}/leave`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      // 验证房主已转移
      const roomResponse = await request(app)
        .get(`/api/rooms/${roomId}`)
        .set('Authorization', `Bearer ${user2.token}`);

      expect(roomResponse.body.hostId).toBe(user2.id);
    });

    it('房主离开且无其他玩家应该解散房间', async () => {
      const response = await request(app)
        .post(`/api/rooms/${roomId}/leave`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      // 验证房间已解散
      const roomResponse = await request(app)
        .get(`/api/rooms/${roomId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(roomResponse.status).toBe(404);
    });
  });

  // ============================================
  // 5. 准备/取消准备
  // ============================================

  describe('POST /api/rooms/:id/ready', () => {
    let roomId: string;
    let user2Token: string;

    beforeEach(async () => {
      const room = await createTestRoom(app, authToken, '测试房间');
      roomId = room.id;

      const user2 = await createTestUser(app, 'user2', 'Password1');
      user2Token = user2.token;
      await request(app)
        .post(`/api/rooms/${roomId}/join`)
        .set('Authorization', `Bearer ${user2Token}`);
    });

    it('应该能设置准备状态', async () => {
      const response = await request(app)
        .post(`/api/rooms/${roomId}/ready`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ ready: true });

      expect(response.status).toBe(200);

      // 验证状态
      const roomResponse = await request(app)
        .get(`/api/rooms/${roomId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const player = roomResponse.body.players.find((p: any) => p.id === user2.id);
      expect(player.isReady).toBe(true);
    });

    it('应该能取消准备', async () => {
      // 先准备
      await request(app)
        .post(`/api/rooms/${roomId}/ready`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ ready: true });

      // 取消准备
      const response = await request(app)
        .post(`/api/rooms/${roomId}/ready`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ ready: false });

      expect(response.status).toBe(200);
    });

    it('房主不应该需要准备', async () => {
      const response = await request(app)
        .post(`/api/rooms/${roomId}/ready`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ready: true });

      expect(response.status).toBe(400);
    });
  });

  // ============================================
  // 6. 开始游戏
  // ============================================

  describe('POST /api/rooms/:id/start', () => {
    let roomId: string;
    let user2Token: string;

    beforeEach(async () => {
      const room = await createTestRoom(app, authToken, '测试房间');
      roomId = room.id;

      const user2 = await createTestUser(app, 'user2', 'Password1');
      user2Token = user2.token;
      await request(app)
        .post(`/api/rooms/${roomId}/join`)
        .set('Authorization', `Bearer ${user2Token}`);
    });

    it('房主应该能在所有玩家准备后开始游戏', async () => {
      // 玩家2准备
      await request(app)
        .post(`/api/rooms/${roomId}/ready`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ ready: true });

      const response = await request(app)
        .post(`/api/rooms/${roomId}/start`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('gameId');

      // 验证房间状态
      const roomResponse = await request(app)
        .get(`/api/rooms/${roomId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(roomResponse.body.status).toBe('playing');
    });

    it('非房主不应该能开始游戏', async () => {
      const response = await request(app)
        .post(`/api/rooms/${roomId}/start`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(response.status).toBe(403);
    });

    it('有玩家未准备时不应该能开始', async () => {
      const response = await request(app)
        .post(`/api/rooms/${roomId}/start`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('未准备');
    });

    it('人数不足时不应该能开始', async () => {
      // 创建3人房间但只有2人
      const room3 = await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '3人房间',
          gameMode: 'pvp',
          mapId: 'map_1',
          maxPlayers: 3
        });

      const response = await request(app)
        .post(`/api/rooms/${room3.body.id}/start`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('人数不足');
    });
  });

  // ============================================
  // 7. 踢出玩家
  // ============================================

  describe('POST /api/rooms/:id/kick', () => {
    let roomId: string;
    let user2Id: string;
    let user2Token: string;

    beforeEach(async () => {
      const room = await createTestRoom(app, authToken, '测试房间');
      roomId = room.id;

      const user2 = await createTestUser(app, 'user2', 'Password1');
      user2Id = user2.id;
      user2Token = user2.token;
      await request(app)
        .post(`/api/rooms/${roomId}/join`)
        .set('Authorization', `Bearer ${user2Token}`);
    });

    it('房主应该能踢出其他玩家', async () => {
      const response = await request(app)
        .post(`/api/rooms/${roomId}/kick`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ playerId: user2Id });

      expect(response.status).toBe(200);

      // 验证玩家已被踢出
      const roomResponse = await request(app)
        .get(`/api/rooms/${roomId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(roomResponse.body.players.length).toBe(1);
    });

    it('非房主不应该能踢人', async () => {
      const response = await request(app)
        .post(`/api/rooms/${roomId}/kick`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ playerId: userId });

      expect(response.status).toBe(403);
    });

    it('不应该能踢出房主', async () => {
      const user3 = await createTestUser(app, 'user3', 'Password1');
      await request(app)
        .post(`/api/rooms/${roomId}/join`)
        .set('Authorization', `Bearer ${user3.token}`);

      const response = await request(app)
        .post(`/api/rooms/${roomId}/kick`)
        .set('Authorization', `Bearer ${user3.token}`)
        .send({ playerId: userId });

      expect(response.status).toBe(403);
    });
  });

  // ============================================
  // 8. 房间聊天
  // ============================================

  describe('POST /api/rooms/:id/chat', () => {
    let roomId: string;

    beforeEach(async () => {
      const room = await createTestRoom(app, authToken, '测试房间');
      roomId = room.id;
    });

    it('应该能发送聊天消息', async () => {
      const response = await request(app)
        .post(`/api/rooms/${roomId}/chat`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ message: '大家好！' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.message).toBe('大家好！');
      expect(response.body.senderId).toBe(userId);
    });

    it('应该过滤XSS', async () => {
      const response = await request(app)
        .post(`/api/rooms/${roomId}/chat`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ message: '<script>alert(1)</script>' });

      expect(response.status).toBe(200);
      expect(response.body.message).not.toContain('<script>');
    });

    it('应该限制消息长度', async () => {
      const response = await request(app)
        .post(`/api/rooms/${roomId}/chat`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ message: 'a'.repeat(501) });

      expect(response.status).toBe(400);
    });

    it('非房间成员不应该能发送消息', async () => {
      const user3 = await createTestUser(app, 'user3', 'Password1');
      const response = await request(app)
        .post(`/api/rooms/${roomId}/chat`)
        .set('Authorization', `Bearer ${user3.token}`)
        .send({ message: '你好' });

      expect(response.status).toBe(403);
    });
  });
});

// ============================================
// 辅助函数
// ============================================

async function createTestRoom(app: any, token: string, name: string): Promise<{ id: string }> {
  const response = await request(app)
    .post('/api/rooms')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name,
      gameMode: 'pvp',
      mapId: 'map_1',
      maxPlayers: 2
    });

  return response.body;
}
