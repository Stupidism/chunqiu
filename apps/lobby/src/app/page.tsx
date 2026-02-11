'use client';

import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@chunqiu/ui';
import { LoginForm } from '@/components/LoginForm';
import { RoomList } from '@/components/RoomList';
import { CreateRoomDialog } from '@/components/CreateRoomDialog';
import { useLobbyStore } from '@/stores/lobbyStore';

export default function LobbyPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { 
    isAuthenticated, 
    user, 
    logout, 
    rooms,
    currentRoom,
    createRoom,
    joinRoom,
    leaveRoom,
    setReady,
    startGame,
  } = useLobbyStore();

  const gameBaseUrl = process.env.NEXT_PUBLIC_GAME_URL || 'http://localhost:5002';

  const openGame = (roomId?: string) => {
    const target = roomId ? `${gameBaseUrl}?roomId=${roomId}` : gameBaseUrl;
    window.location.assign(target);
  };

  const handleJoinRandom = async () => {
    const available = rooms.filter(r => r.status === 'waiting' && !r.hasPassword && r.players.length < r.maxPlayers);
    if (!available.length) {
      alert('暂无可加入房间');
      return;
    }
    const room = available[Math.floor(Math.random() * available.length)];
    const ok = await joinRoom(room.id);
    if (!ok) alert('加入失败');
  };

  const handleSingleGame = async () => {
    const room = await createRoom('单人游戏', { maxPlayers: 1, mapSize: 'small', gameSpeed: 'standard' });
    if (!room) return;
    setReady(true);
    startGame();
    openGame(room.id);
  };

  const me = currentRoom?.players.find(p => p.id === user?.id);
  const isHost = currentRoom?.hostId === user?.id;
  const allReady = currentRoom ? currentRoom.players.every(p => p.isReady) : false;

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-bronze-50 via-oracle-50 to-bronze-100">
        <LoginForm />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-bronze-50 via-oracle-50 to-bronze-100">
      {/* Header */}
      <header className="bg-bronze-800 text-bronze-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold font-oracle">春秋</h1>
            <span className="text-bronze-300">|</span>
            <span className="text-bronze-200">游戏大厅</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-bronze-200">
              欢迎，{user?.username}
            </span>
            <Button variant="ghost" size="sm" onClick={logout}>
              退出
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>快速操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={() => setShowCreateDialog(true)}
                >
                  创建房间
                </Button>
                <Button variant="outline" className="w-full" onClick={handleJoinRandom}>
                  加入随机房间
                </Button>
                <Button variant="secondary" className="w-full" onClick={handleSingleGame}>
                  单人游戏
                </Button>
              </CardContent>
            </Card>

            {currentRoom && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>当前房间</CardTitle>
                    <Badge variant={currentRoom.status === 'waiting' ? 'success' : 'default'}>
                      {currentRoom.status === 'waiting' ? '等待中' : '游戏中'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-bronze-600">
                    房间：{currentRoom.name}
                  </div>
                  <div className="space-y-1">
                    {currentRoom.players.map(player => (
                      <div key={player.id} className="flex items-center justify-between text-sm">
                        <span>
                          {player.name}
                          {player.isHost && ' 👑'}
                        </span>
                        <span className={player.isReady ? 'text-emerald-600' : 'text-bronze-500'}>
                          {player.isReady ? '已准备' : '未准备'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      variant={me?.isReady ? 'outline' : 'default'}
                      onClick={() => setReady(!me?.isReady)}
                    >
                      {me?.isReady ? '取消准备' : '准备'}
                    </Button>

                    {currentRoom.status === 'playing' ? (
                      <Button onClick={() => openGame(currentRoom.id)}>
                        进入游戏
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        disabled={!isHost || (!allReady && currentRoom.players.length > 1)}
                        onClick={() => {
                          startGame();
                          openGame(currentRoom.id);
                        }}
                      >
                        开始游戏
                      </Button>
                    )}

                    <Button variant="ghost" onClick={leaveRoom}>
                      离开房间
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>游戏统计</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-bronze-600">游戏场次</span>
                    <span className="font-medium">{user?.stats?.gamesPlayed || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-bronze-600">胜利</span>
                    <span className="font-medium text-emerald-600">
                      {user?.stats?.gamesWon || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-bronze-600">失败</span>
                    <span className="font-medium text-red-600">
                      {user?.stats?.gamesLost || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Room List */}
          <div className="lg:col-span-3">
            <RoomList />
          </div>
        </div>
      </div>

      {/* Create Room Dialog */}
      <CreateRoomDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      />
    </main>
  );
}
