// 春秋 (Chunqiu) - 用户认证 API
// 提供用户注册、登录和获取当前用户信息功能

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// JWT 密钥
const JWT_SECRET = process.env.JWT_SECRET || 'chunqiu-secret-key';
const JWT_EXPIRES_IN = '7d';

// ============ 验证 Schema ============

const registerSchema = z.object({
  email: z.string().email('无效的邮箱地址'),
  name: z.string().min(2, '用户名至少需要2个字符').max(20, '用户名最多20个字符'),
  password: z.string().min(6, '密码至少需要6个字符'),
});

const loginSchema = z.object({
  email: z.string().email('无效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
});

// ============ 工具函数 ============

// 生成 JWT Token
function generateToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// 验证 JWT Token
function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
  } catch {
    return null;
  }
}

// 从请求头获取当前用户
async function getCurrentUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  
  const payload = verifyToken(token);
  if (!payload) return null;
  
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true, avatar: true, createdAt: true },
  });
  
  return user;
}

// ============ API 路由 ============

// POST /api/auth/register - 用户注册
export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  
  try {
    // 处理注册
    if (action === 'register') {
      const body = await request.json();
      const result = registerSchema.safeParse(body);
      
      if (!result.success) {
        return NextResponse.json(
          { error: '验证失败', details: result.error.flatten() },
          { status: 400 }
        );
      }
      
      const { email, name, password } = result.data;
      
      // 检查邮箱是否已存在
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      
      if (existingUser) {
        return NextResponse.json(
          { error: '该邮箱已被注册' },
          { status: 409 }
        );
      }
      
      // 检查用户名是否已存在
      const existingName = await prisma.user.findFirst({
        where: { name },
      });
      
      if (existingName) {
        return NextResponse.json(
          { error: '该用户名已被使用' },
          { status: 409 }
        );
      }
      
      // 加密密码
      const passwordHash = await bcrypt.hash(password, 10);
      
      // 创建用户
      const user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
        },
        select: { id: true, email: true, name: true, avatar: true, createdAt: true },
      });
      
      // 生成 Token
      const token = generateToken(user.id, user.email);
      
      return NextResponse.json(
        {
          message: '注册成功',
          user,
          token,
        },
        { status: 201 }
      );
    }
    
    // 处理登录
    if (action === 'login') {
      const body = await request.json();
      const result = loginSchema.safeParse(body);
      
      if (!result.success) {
        return NextResponse.json(
          { error: '验证失败', details: result.error.flatten() },
          { status: 400 }
        );
      }
      
      const { email, password } = result.data;
      
      // 查找用户
      const user = await prisma.user.findUnique({
        where: { email },
      });
      
      if (!user) {
        return NextResponse.json(
          { error: '邮箱或密码错误' },
          { status: 401 }
        );
      }
      
      // 验证密码
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      
      if (!isValidPassword) {
        return NextResponse.json(
          { error: '邮箱或密码错误' },
          { status: 401 }
        );
      }
      
      // 更新最后登录时间
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
      
      // 生成 Token
      const token = generateToken(user.id, user.email);
      
      return NextResponse.json({
        message: '登录成功',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          createdAt: user.createdAt,
        },
        token,
      });
    }
    
    return NextResponse.json(
      { error: '无效的操作' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// GET /api/auth/me - 获取当前用户信息
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: '未登录或登录已过期' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// 导出工具函数供其他模块使用
export { getCurrentUser, generateToken, verifyToken };
