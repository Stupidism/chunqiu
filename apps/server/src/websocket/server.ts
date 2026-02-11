// 春秋 (Chunqiu) - WebSocket 服务器
// 提供实时游戏通信功能

import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// ============ 类型定义 ============

interface ClientInfo {
  ws: WebSocket;
  userId: string;
  email: string;
  gameId: string | null;
  playerIndex: number | null;
}

interface GameMessage {
  type: string;
  payload: any;
  timestamp?: number;
}

interface GameRoom {
  id: string;
  clients: Map<string, ClientInfo>; // userId -> ClientInfo
  hostId: string;
  status: 'waiting' | 'playing' | 'ended';
  currentTurn: number;
  turnEndTime: number | null;
}

// ============ 配置 ============

const PORT = parseInt(process.env.WS_PORT || '5005');
const JWT_SECRET = process.env.JWT_SECRET || 'chunqiu-secret-key';
const TURN_TIMEOUT = 120000; // 每回合2分钟超时

// ============ 全局状态 ============

const clients = new Map<WebSocket, ClientInfo>();
const gameRooms = new Map<string, GameRoom>();

// ============ 工具函数 ============

// 验证 JWT Token
function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
  } catch {
    return null;
  }
}

// 发送消息给客户端
function sendMessage(ws: WebSocket, type: string, payload: any) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, payload, timestamp: Date.now() }));
  }
}

// 广播消息给房间内所有客户端
function broadcastToRoom(gameId: string, type: string, payload: any, excludeUserId?: string) {
  const room = gameRooms.get(gameId);
  if (!room) return;
  
  room.clients.forEach((client, userId) => {
    if (excludeUserId && userId === excludeUserId) return;
    sendMessage(client.ws, type, payload);
  });
}

// 发送消息给指定用户
function sendToUser(userId: string, type: string, payload: any) {
  clients.forEach((client) => {
    if (client.userId === userId) {
      sendMessage(client.ws, type, payload);
    }
  });
}

// ============ 消息处理器 ============

const messageHandlers: Record<string, (client: ClientInfo, payload: any) => void> = {
  // 加入游戏房间
  'GAME:JOIN': (client, payload) => {
    const { gameId } = payload;
    if (!gameId) {
      sendMessage(client.ws, 'ERROR', { message: '缺少游戏ID' });
      return;
    }
    
    // 离开之前的房间
    if (client.gameId) {
      leaveGameRoom(client);
    }
    
    // 获取或创建房间
    let room = gameRooms.get(gameId);
    if (!room) {
      room = {
        id: gameId,
        clients: new Map(),
        hostId: client.userId,
        status: 'waiting',
        currentTurn: 0,
        turnEndTime: null,
      };
      gameRooms.set(gameId, room);
    }
    
    // 加入房间
    client.gameId = gameId;
    client.playerIndex = room.clients.size;
    room.clients.set(client.userId, client);
    
    // 通知客户端加入成功
    sendMessage(client.ws, 'GAME:JOINED', {
      gameId,
      playerIndex: client.playerIndex,
      players: Array.from(room.clients.values()).map(c => ({
        userId: c.userId,
        playerIndex: c.playerIndex,
      })),
    });
    
    // 通知其他玩家
    broadcastToRoom(gameId, 'GAME:PLAYER_JOINED', {
      userId: client.userId,
      playerIndex: client.playerIndex,
    }, client.userId);
    
    console.log(`[WS] User ${client.userId} joined game ${gameId}`);
  },
  
  // 离开游戏房间
  'GAME:LEAVE': (client) => {
    if (client.gameId) {
      leaveGameRoom(client);
      sendMessage(client.ws, 'GAME:LEFT', { success: true });
    }
  },
  
  // 玩家准备
  'GAME:READY': (client, payload) => {
    if (!client.gameId) {
      sendMessage(client.ws, 'ERROR', { message: '不在游戏房间中' });
      return;
    }
    
    const { isReady } = payload;
    
    broadcastToRoom(client.gameId, 'GAME:PLAYER_READY', {
      userId: client.userId,
      isReady,
    });
  },
  
  // 选择文明
  'GAME:SELECT_CIV': (client, payload) => {
    if (!client.gameId) {
      sendMessage(client.ws, 'ERROR', { message: '不在游戏房间中' });
      return;
    }
    
    const { civilization } = payload;
    
    broadcastToRoom(client.gameId, 'GAME:CIV_SELECTED', {
      userId: client.userId,
      civilization,
    });
  },
  
  // 开始游戏
  'GAME:START': (client) => {
    if (!client.gameId) {
      sendMessage(client.ws, 'ERROR', { message: '不在游戏房间中' });
      return;
    }
    
    const room = gameRooms.get(client.gameId);
    if (!room) return;
    
    if (room.hostId !== client.userId) {
      sendMessage(client.ws, 'ERROR', { message: '只有房主可以开始游戏' });
      return;
    }
    
    room.status = 'playing';
    room.currentTurn = 1;
    room.turnEndTime = Date.now() + TURN_TIMEOUT;
    
    broadcastToRoom(client.gameId, 'GAME:STARTED', {
      currentTurn: room.currentTurn,
      turnEndTime: room.turnEndTime,
    });
    
    // 启动回合计时器
    startTurnTimer(client.gameId);
    
    console.log(`[WS] Game ${client.gameId} started`);
  },
  
  // 执行操作
  'GAME:ACTION': (client, payload) => {
    if (!client.gameId) {
      sendMessage(client.ws, 'ERROR', { message: '不在游戏房间中' });
      return;
    }
    
    const room = gameRooms.get(client.gameId);
    if (!room || room.status !== 'playing') {
      sendMessage(client.ws, 'ERROR', { message: '游戏未开始' });
      return;
    }
    
    const { actionType, data } = payload;
    
    // 验证操作
    if (!validateAction(client, actionType, data)) {
      sendMessage(client.ws, 'ERROR', { message: '无效的操作' });
      return;
    }
    
    // 广播操作给所有玩家
    broadcastToRoom(client.gameId, 'GAME:ACTION_EXECUTED', {
      userId: client.userId,
      playerIndex: client.playerIndex,
      actionType,
      data,
    });
  },
  
  // 结束回合
  'GAME:END_TURN': (client) => {
    if (!client.gameId) {
      sendMessage(client.ws, 'ERROR', { message: '不在游戏房间中' });
      return;
    }
    
    const room = gameRooms.get(client.gameId);
    if (!room || room.status !== 'playing') {
      sendMessage(client.ws, 'ERROR', { message: '游戏未开始' });
      return;
    }
    
    // 通知其他玩家该玩家已结束回合
    broadcastToRoom(client.gameId, 'GAME:PLAYER_ENDED_TURN', {
      userId: client.userId,
      playerIndex: client.playerIndex,
    });
    
    // 检查是否所有玩家都结束了回合
    checkAllPlayersEndedTurn(client.gameId);
  },
  
  // 聊天消息
  'CHAT:SEND': (client, payload) => {
    if (!client.gameId) {
      sendMessage(client.ws, 'ERROR', { message: '不在游戏房间中' });
      return;
    }
    
    const { message } = payload;
    
    broadcastToRoom(client.gameId, 'CHAT:MESSAGE', {
      userId: client.userId,
      message,
      timestamp: Date.now(),
    });
  },
  
  // 心跳
  'PING': (client) => {
    sendMessage(client.ws, 'PONG', { timestamp: Date.now() });
  },
};

// ============ 辅助函数 ============

// 离开游戏房间
function leaveGameRoom(client: ClientInfo) {
  if (!client.gameId) return;
  
  const room = gameRooms.get(client.gameId);
  if (room) {
    room.clients.delete(client.userId);
    
    // 通知其他玩家
    broadcastToRoom(client.gameId, 'GAME:PLAYER_LEFT', {
      userId: client.userId,
      playerIndex: client.playerIndex,
    });
    
    // 如果房间空了，删除房间
    if (room.clients.size === 0) {
      gameRooms.delete(client.gameId);
      console.log(`[WS] Game room ${client.gameId} deleted (empty)`);
    }
    // 如果房主离开，转移房主
    else if (room.hostId === client.userId) {
      const nextHost = room.clients.values().next().value;
      if (nextHost) {
        room.hostId = nextHost.userId;
        broadcastToRoom(client.gameId, 'GAME:HOST_CHANGED', {
          newHostId: nextHost.userId,
        });
      }
    }
  }
  
  console.log(`[WS] User ${client.userId} left game ${client.gameId}`);
  client.gameId = null;
  client.playerIndex = null;
}

// 验证操作
function validateAction(client: ClientInfo, actionType: string, data: any): boolean {
  // TODO: 实现具体的操作验证逻辑
  // 例如：检查单位移动是否合法、资源是否足够等
  
  const validActions = [
    'MOVE_UNIT',
    'ATTACK',
    'BUILD_CITY',
    'BUILD_UNIT',
    'RESEARCH_TECH',
    'END_TURN',
  ];
  
  if (!validActions.includes(actionType)) {
    return false;
  }
  
  return true;
}

// 检查是否所有玩家都结束了回合
function checkAllPlayersEndedTurn(gameId: string) {
  // TODO: 实现检查逻辑，当所有玩家都结束回合时，开始下一回合
  // 这里简化处理，实际应该维护每个玩家的回合状态
}

// 启动回合计时器
function startTurnTimer(gameId: string) {
  const room = gameRooms.get(gameId);
  if (!room) return;
  
  const checkTurnEnd = () => {
    const currentRoom = gameRooms.get(gameId);
    if (!currentRoom || currentRoom.status !== 'playing') return;
    
    if (Date.now() >= (currentRoom.turnEndTime || 0)) {
      // 回合超时，强制结束回合
      broadcastToRoom(gameId, 'GAME:TURN_TIMEOUT', {
        turn: currentRoom.currentTurn,
      });
      
      // 开始下一回合
      currentRoom.currentTurn++;
      currentRoom.turnEndTime = Date.now() + TURN_TIMEOUT;
      
      broadcastToRoom(gameId, 'GAME:TURN_STARTED', {
        turn: currentRoom.currentTurn,
        turnEndTime: currentRoom.turnEndTime,
      });
    }
    
    // 继续检查
    setTimeout(checkTurnEnd, 1000);
  };
  
  setTimeout(checkTurnEnd, 1000);
}

// ============ WebSocket 服务器 ============

const wss = new WebSocketServer({ port: PORT });

console.log(`[WS] WebSocket server started on port ${PORT}`);

wss.on('connection', (ws: WebSocket, req) => {
  console.log(`[WS] New connection from ${req.socket.remoteAddress}`);
  
  // 等待认证消息
  let authenticated = false;
  
  ws.on('message', (data: string) => {
    try {
      const message: GameMessage = JSON.parse(data);
      const { type, payload } = message;
      
      // 处理认证
      if (type === 'AUTH') {
        const { token } = payload;
        const userData = verifyToken(token);
        
        if (!userData) {
          sendMessage(ws, 'AUTH:FAILED', { message: '无效的Token' });
          ws.close();
          return;
        }
        
        // 创建客户端信息
        const clientInfo: ClientInfo = {
          ws,
          userId: userData.userId,
          email: userData.email,
          gameId: null,
          playerIndex: null,
        };
        
        clients.set(ws, clientInfo);
        authenticated = true;
        
        sendMessage(ws, 'AUTH:SUCCESS', { userId: userData.userId });
        console.log(`[WS] User ${userData.userId} authenticated`);
        return;
      }
      
      // 需要认证的消息
      if (!authenticated) {
        sendMessage(ws, 'ERROR', { message: '请先认证' });
        return;
      }
      
      // 获取客户端信息
      const client = clients.get(ws);
      if (!client) return;
      
      // 处理消息
      const handler = messageHandlers[type];
      if (handler) {
        handler(client, payload);
      } else {
        sendMessage(ws, 'ERROR', { message: `未知的消息类型: ${type}` });
      }
    } catch (error) {
      console.error('[WS] Message handling error:', error);
      sendMessage(ws, 'ERROR', { message: '消息格式错误' });
    }
  });
  
  ws.on('close', () => {
    const client = clients.get(ws);
    if (client) {
      // 离开游戏房间
      if (client.gameId) {
        leaveGameRoom(client);
      }
      
      clients.delete(ws);
      console.log(`[WS] User ${client.userId} disconnected`);
    }
  });
  
  ws.on('error', (error) => {
    console.error('[WS] WebSocket error:', error);
  });
  
  // 发送连接成功消息
  sendMessage(ws, 'CONNECTED', { message: '请发送认证消息' });
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('[WS] SIGTERM received, closing server...');
  wss.close(() => {
    console.log('[WS] Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[WS] SIGINT received, closing server...');
  wss.close(() => {
    console.log('[WS] Server closed');
    process.exit(0);
  });
});

export { wss, gameRooms, broadcastToRoom, sendToUser };
