// 春秋 (Chunqiu) - 游戏房间 API
// 提供游戏房间的创建、加入、准备、开始等功能

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient, GameStatus, PlayerStatus } from '@prisma/client';
import { generateMap } from '@/game/mapGenerator';

const prisma = new PrismaClient();

// ============ 验证 Schema ============

const createGameSchema = z.object({
  name: z.string().min(1, '房间名称不能为空').max(50, '房间名称最多50个字符'),
  maxPlayers: z.number().int().min(2).max(7).default(4),
  mapWidth: z.number().int().min(10).max(50).default(20),
  mapHeight: z.number().int().min(10).max(50).default(20),
  settings: z.record(z.any()).optional(),
});

const joinGameSchema = z.object({
  civilization: z.string().optional(),
});

// ============ 工具函数 ============

// 从请求头获取当前用户ID
function getUserIdFromToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  
  const token = authHeader.replace('Bearer ', '');
  try {
    const jwt = require('jsonwebtoken');
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'chunqiu-secret-key');
    return (payload as any).userId;
  } catch {
    return null;
  }
}

// 获取房间列表（支持分页和筛选）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // 获取单个房间详情
    if (id) {
      const game = await prisma.game.findUnique({
        where: { id },
        include: {
          players: {
            include: {
              user: {
                select: { id: true, name: true, avatar: true },
              },
            },
            orderBy: { joinOrder: 'asc' },
          },
        },
      });
      
      if (!game) {
        return NextResponse.json(
          { error: '房间不存在' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ game });
    }
    
    // 获取房间列表
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') as GameStatus | null;
    
    const where = status ? { status } : { status: { in: [GameStatus.WAITING, GameStatus.READY] } };
    
    const [games, total] = await Promise.all([
      prisma.game.findMany({
        where,
        include: {
          players: {
            include: {
              user: {
                select: { id: true, name: true, avatar: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.game.count({ where }),
    ]);
    
    return NextResponse.json({
      games,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get games error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// POST /api/games - 创建房间
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const result = createGameSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: '验证失败', details: result.error.flatten() },
        { status: 400 }
      );
    }
    
    const { name, maxPlayers, mapWidth, mapHeight, settings } = result.data;
    
    // 创建游戏房间
    const game = await prisma.$transaction(async (tx) => {
      // 创建游戏
      const newGame = await tx.game.create({
        data: {
          name,
          status: GameStatus.WAITING,
          maxPlayers,
          mapWidth,
          mapHeight,
          settings: settings || {},
        },
      });
      
      // 创建房主玩家记录
      await tx.gamePlayer.create({
        data: {
          gameId: newGame.id,
          userId,
          isHost: true,
          isReady: false,
          joinOrder: 0,
        },
      });
      
      return newGame;
    });
    
    // 返回完整的游戏信息
    const gameWithPlayers = await prisma.game.findUnique({
      where: { id: game.id },
      include: {
        players: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
      },
    });
    
    return NextResponse.json(
      { message: '房间创建成功', game: gameWithPlayers },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create game error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// PATCH /api/games - 处理房间操作（加入、准备、开始等）
export async function PATCH(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('id');
    const action = searchParams.get('action');
    
    if (!gameId || !action) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }
    
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { players: true },
    });
    
    if (!game) {
      return NextResponse.json(
        { error: '房间不存在' },
        { status: 404 }
      );
    }
    
    const currentPlayer = game.players.find(p => p.userId === userId);
    
    switch (action) {
      case 'join': {
        // 检查是否已在房间中
        if (currentPlayer) {
          return NextResponse.json(
            { error: '您已在该房间中' },
            { status: 409 }
          );
        }
        
        // 检查房间是否已满
        if (game.players.length >= game.maxPlayers) {
          return NextResponse.json(
            { error: '房间已满' },
            { status: 409 }
          );
        }
        
        // 检查游戏状态
        if (game.status !== GameStatus.WAITING && game.status !== GameStatus.READY) {
          return NextResponse.json(
            { error: '游戏已开始或已结束' },
            { status: 409 }
          );
        }
        
        const body = await request.json().catch(() => ({}));
        const { civilization } = joinGameSchema.parse(body);
        
        // 检查文明是否已被选择
        if (civilization) {
          const existingCiv = game.players.find(p => p.civilization === civilization);
          if (existingCiv) {
            return NextResponse.json(
              { error: '该文明已被选择' },
              { status: 409 }
            );
          }
        }
        
        // 加入房间
        await prisma.gamePlayer.create({
          data: {
            gameId,
            userId,
            civilization,
            joinOrder: game.players.length,
          },
        });
        
        break;
      }
      
      case 'leave': {
        if (!currentPlayer) {
          return NextResponse.json(
            { error: '您不在该房间中' },
            { status: 409 }
          );
        }
        
        // 如果游戏已开始，不允许离开
        if (game.status === GameStatus.PLAYING) {
          return NextResponse.json(
            { error: '游戏进行中，无法离开' },
            { status: 409 }
          );
        }
        
        // 删除玩家记录
        await prisma.gamePlayer.delete({
          where: { id: currentPlayer.id },
        });
        
        // 如果是房主且还有其他人，转移房主
        if (currentPlayer.isHost && game.players.length > 1) {
          const nextHost = game.players.find(p => p.id !== currentPlayer.id);
          if (nextHost) {
            await prisma.gamePlayer.update({
              where: { id: nextHost.id },
              data: { isHost: true },
            });
          }
        }
        
        // 如果房间空了，删除房间
        if (game.players.length <= 1) {
          await prisma.game.delete({
            where: { id: gameId },
          });
          return NextResponse.json({ message: '已离开房间，房间已删除' });
        }
        
        break;
      }
      
      case 'ready': {
        if (!currentPlayer) {
          return NextResponse.json(
            { error: '您不在该房间中' },
            { status: 409 }
          );
        }
        
        if (game.status !== GameStatus.WAITING && game.status !== GameStatus.READY) {
          return NextResponse.json(
            { error: '游戏已开始或已结束' },
            { status: 409 }
          );
        }
        
        // 切换准备状态
        await prisma.gamePlayer.update({
          where: { id: currentPlayer.id },
          data: { isReady: !currentPlayer.isReady },
        });
        
        // 检查是否所有玩家都准备好了
        const updatedGame = await prisma.game.findUnique({
          where: { id: gameId },
          include: { players: true },
        });
        
        if (updatedGame) {
          const allReady = updatedGame.players.every(p => p.isReady);
          const minPlayers = 2; // 最少需要2人
          
          if (allReady && updatedGame.players.length >= minPlayers) {
            await prisma.game.update({
              where: { id: gameId },
              data: { status: GameStatus.READY },
            });
          } else if (updatedGame.status === GameStatus.READY) {
            await prisma.game.update({
              where: { id: gameId },
              data: { status: GameStatus.WAITING },
            });
          }
        }
        
        break;
      }
      
      case 'start': {
        if (!currentPlayer?.isHost) {
          return NextResponse.json(
            { error: '只有房主可以开始游戏' },
            { status: 403 }
          );
        }
        
        if (game.status !== GameStatus.READY) {
          return NextResponse.json(
            { error: '玩家未全部准备就绪' },
            { status: 409 }
          );
        }
        
        // 检查是否所有玩家都选择了文明
        const playersWithoutCiv = game.players.filter(p => !p.civilization);
        if (playersWithoutCiv.length > 0) {
          return NextResponse.json(
            { error: '有玩家未选择文明' },
            { status: 409 }
          );
        }
        
        // 生成地图
        const mapData = generateMap(game.mapWidth, game.mapHeight, game.players.length);
        
        // 开始游戏
        await prisma.game.update({
          where: { id: gameId },
          data: {
            status: GameStatus.PLAYING,
            currentTurn: 1,
            startedAt: new Date(),
            mapData,
          },
        });
        
        // 初始化玩家数据
        for (const player of game.players) {
          await prisma.gamePlayer.update({
            where: { id: player.id },
            data: {
              data: {
                gold: 100,
                food: 100,
                production: 50,
                science: 0,
                culture: 0,
                cities: [],
                units: [],
              },
            },
          });
        }
        
        break;
      }
      
      default:
        return NextResponse.json(
          { error: '无效的操作' },
          { status: 400 }
        );
    }
    
    // 返回更新后的游戏信息
    const updatedGame = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        players: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { joinOrder: 'asc' },
        },
      },
    });
    
    return NextResponse.json({
      message: '操作成功',
      game: updatedGame,
    });
  } catch (error) {
    console.error('Game action error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
