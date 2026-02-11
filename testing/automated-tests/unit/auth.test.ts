/**
 * 认证模块单元测试
 * 使用 Vitest + @vue/test-utils (或 React Testing Library)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ============================================
// 1. 工具函数测试
// ============================================

describe('Auth Utils', () => {
  describe('validateUsername', () => {
    it('应该接受有效的用户名', () => {
      const validUsernames = [
        'testuser',
        'TestUser123',
        'user_123',
        '用户名123',
        'abc123def'
      ];
      
      validUsernames.forEach(username => {
        expect(validateUsername(username)).toBe(true);
      });
    });

    it('应该拒绝太短的用户名', () => {
      expect(validateUsername('ab')).toBe(false);
      expect(validateUsername('a')).toBe(false);
    });

    it('应该拒绝太长的用户名', () => {
      expect(validateUsername('a'.repeat(51))).toBe(false);
    });

    it('应该拒绝包含特殊字符的用户名', () => {
      expect(validateUsername('user@name')).toBe(false);
      expect(validateUsername('user name')).toBe(false);
      expect(validateUsername('user<name>')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('应该接受有效的密码', () => {
      expect(validatePassword('Password1')).toBe(true);
      expect(validatePassword('MyP@ssw0rd!')).toBe(true);
      expect(validatePassword('Abc12345')).toBe(true);
    });

    it('应该拒绝太短的密码', () => {
      expect(validatePassword('Pass1')).toBe(false);
      expect(validatePassword('1234567')).toBe(false);
    });

    it('应该拒绝没有大写字母的密码', () => {
      expect(validatePassword('password1')).toBe(false);
    });

    it('应该拒绝没有小写字母的密码', () => {
      expect(validatePassword('PASSWORD1')).toBe(false);
    });

    it('应该拒绝没有数字的密码', () => {
      expect(validatePassword('Password')).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('应该转义HTML特殊字符', () => {
      expect(sanitizeInput('<script>alert(1)</script>'))
        .toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    });

    it('应该处理SQL注入尝试', () => {
      expect(sanitizeInput("' OR '1'='1"))
        .not.toContain("'");
    });
  });
});

// ============================================
// 2. Token管理测试
// ============================================

describe('Token Manager', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('setToken', () => {
    it('应该正确存储token', () => {
      const token = 'test_jwt_token';
      setToken(token);
      expect(localStorage.getItem('access_token')).toBe(token);
    });
  });

  describe('getToken', () => {
    it('应该返回存储的token', () => {
      const token = 'test_jwt_token';
      localStorage.setItem('access_token', token);
      expect(getToken()).toBe(token);
    });

    it('无token时应该返回null', () => {
      expect(getToken()).toBeNull();
    });
  });

  describe('removeToken', () => {
    it('应该清除token', () => {
      localStorage.setItem('access_token', 'test_token');
      removeToken();
      expect(localStorage.getItem('access_token')).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('应该正确判断过期token', () => {
      // 创建一个已过期token（payload中exp为过去时间）
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
        'eyJleHAiOjE1MDAwMDAwMDB9.' +
        'signature';
      expect(isTokenExpired(expiredToken)).toBe(true);
    });

    it('应该正确判断有效token', () => {
      // 创建一个未来过期token
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
        btoa(JSON.stringify({ exp: futureExp })) +
        '.signature';
      expect(isTokenExpired(validToken)).toBe(false);
    });
  });
});

// ============================================
// 3. 登录状态管理测试 (Zustand Store)
// ============================================

describe('Auth Store', () => {
  beforeEach(() => {
    // 重置store状态
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  });

  describe('login', () => {
    it('登录成功应该更新状态', async () => {
      const mockUser = { id: '1', username: 'testuser' };
      const mockResponse = {
        user: mockUser,
        accessToken: 'test_token',
        refreshToken: 'refresh_token'
      };

      // Mock API调用
      vi.mocked(api.post).mockResolvedValueOnce({ data: mockResponse });

      await useAuthStore.getState().login('testuser', 'Password1');

      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().error).toBeNull();
    });

    it('登录失败应该设置错误状态', async () => {
      vi.mocked(api.post).mockRejectedValueOnce({
        response: { data: { message: '用户名或密码错误' } }
      });

      await useAuthStore.getState().login('testuser', 'wrongpass');

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().error).toBe('用户名或密码错误');
    });
  });

  describe('logout', () => {
    it('登出应该清除状态', () => {
      // 先设置登录状态
      useAuthStore.setState({
        user: { id: '1', username: 'testuser' },
        isAuthenticated: true
      });

      useAuthStore.getState().logout();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });
});

// ============================================
// 4. API拦截器测试
// ============================================

describe('API Interceptors', () => {
  describe('request interceptor', () => {
    it('应该在请求头中添加token', async () => {
      localStorage.setItem('access_token', 'test_token');
      
      const config = { headers: {} };
      const result = await api.interceptors.request.handlers[0].fulfilled(config);
      
      expect(result.headers.Authorization).toBe('Bearer test_token');
    });
  });

  describe('response interceptor - token refresh', () => {
    it('401错误时应该尝试刷新token', async () => {
      const mockNewToken = 'new_access_token';
      vi.mocked(api.post)
        .mockRejectedValueOnce({ response: { status: 401 } }) // 原始请求失败
        .mockResolvedValueOnce({ data: { accessToken: mockNewToken } }); // 刷新成功

      const originalRequest = { url: '/api/protected', headers: {} };
      
      try {
        await api.interceptors.response.handlers[0].rejected({
          response: { status: 401 },
          config: originalRequest
        });
      } catch (e) {
        // 预期会重试原请求
      }

      expect(api.post).toHaveBeenCalledWith('/api/auth/refresh');
    });
  });
});

// ============================================
// 辅助函数实现 (用于测试)
// ============================================

function validateUsername(username: string): boolean {
  const minLength = 4;
  const maxLength = 20;
  const pattern = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
  
  return username.length >= minLength && 
         username.length <= maxLength && 
         pattern.test(username);
}

function validatePassword(password: string): boolean {
  const minLength = 8;
  const maxLength = 32;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  return password.length >= minLength && 
         password.length <= maxLength && 
         hasUpperCase && hasLowerCase && hasNumber;
}

function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\\/g, '\\\\');
}

function setToken(token: string): void {
  localStorage.setItem('access_token', token);
}

function getToken(): string | null {
  return localStorage.getItem('access_token');
}

function removeToken(): void {
  localStorage.removeItem('access_token');
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

// Zustand Store 类型定义
type User = {
  id: string;
  username: string;
};

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

// Mock API
const api = {
  post: vi.fn(),
  interceptors: {
    request: { handlers: [] as any[] },
    response: { handlers: [] as any[] }
  }
};

// Mock Store
const useAuthStore = {
  getState: vi.fn(),
  setState: vi.fn()
};
