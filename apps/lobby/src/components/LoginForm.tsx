'use client';

import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@chunqiu/ui';
import { useLobbyStore } from '@/stores/lobbyStore';

export function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useLobbyStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let success;
      if (isLogin) {
        success = await login(username, password);
      } else {
        success = await register(username, email, password);
      }

      if (!success) {
        setError(isLogin ? '登录失败，请检查用户名和密码' : '注册失败，请检查输入信息');
      }
    } catch {
      setError('发生错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 mb-4 bg-gradient-to-br from-bronze-400 to-bronze-600 rounded-full flex items-center justify-center">
          <span className="text-3xl">🏛️</span>
        </div>
        <CardTitle className="text-2xl">春秋</CardTitle>
        <p className="text-bronze-600 mt-1">
          {isLogin ? '登录您的账号' : '创建新账号'}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="请输入用户名"
            required
          />
          
          {!isLogin && (
            <Input
              label="邮箱"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入邮箱"
              required
            />
          )}
          
          <Input
            label="密码"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
            required
          />

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            loading={loading}
          >
            {isLogin ? '登录' : '注册'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-bronze-600 hover:text-bronze-800 underline"
          >
            {isLogin ? '没有账号？点击注册' : '已有账号？点击登录'}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
