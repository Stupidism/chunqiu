'use client';

import { useState } from 'react';
import { 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Badge,
  Input,
  ScrollArea 
} from '@chunqiu/ui';
import { useLobbyStore } from '@/stores/lobbyStore';
import type { Room } from '@chunqiu/types';
import { Users, Lock, Globe, Clock } from 'lucide-react';

const civilizationNames: Record<string, string> = {
  qin: '秦',
  qi: '齐',
  chu: '楚',
  jin: '晋',
  yan: '燕',
  wu: '吴',
  yue: '越',
  song: '宋',
  lu: '鲁',
  wei: '魏',
};

const mapSizeNames: Record<string, string> = {
  small: '小型',
  medium: '中型',
  large: '大型',
};

const gameSpeedNames: Record<string, string> = {
  quick: '快速',
  standard: '标准',
  epic: '史诗',
};

export function RoomList() {
  const [searchQuery, setSearchQuery] = useState('');
  const { rooms, joinRoom } = useLobbyStore();

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleJoinRoom = async (room: Room) => {
    if (room.hasPassword) {
      // 需要输入密码
      const password = prompt('请输入房间密码:');
      if (!password) return;
      await joinRoom(room.id, password);
    } else {
      await joinRoom(room.id);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>房间列表</CardTitle>
          <Badge variant="secondary">
            {filteredRooms.length} 个房间
          </Badge>
        </div>
        <div className="mt-4">
          <Input
            placeholder="搜索房间..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-3">
            {filteredRooms.map((room) => (
              <RoomCard 
                key={room.id} 
                room={room} 
                onJoin={() => handleJoinRoom(room)}
              />
            ))}
            {filteredRooms.length === 0 && (
              <div className="text-center py-8 text-bronze-500">
                没有找到房间
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

interface RoomCardProps {
  room: Room;
  onJoin: () => void;
}

function RoomCard({ room, onJoin }: RoomCardProps) {
  const isFull = room.players.length >= room.maxPlayers;
  const canJoin = room.status === 'waiting' && !isFull;

  return (
    <div className="p-4 border border-bronze-200 rounded-lg bg-white/50 hover:bg-white transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-bronze-900">{room.name}</h3>
            {room.hasPassword && (
              <Lock className="w-4 h-4 text-bronze-500" />
            )}
            <Badge 
              variant={room.status === 'waiting' ? 'success' : 'default'}
              className="text-xs"
            >
              {room.status === 'waiting' ? '等待中' : '游戏中'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 mt-2 text-sm text-bronze-600">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {room.players.length}/{room.maxPlayers}
            </span>
            <span className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              {mapSizeNames[room.mapSize]}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {gameSpeedNames[room.gameSpeed]}
            </span>
          </div>

          <div className="flex flex-wrap gap-1 mt-2">
            {room.players.map((player) => (
              <Badge 
                key={player.id} 
                variant="outline" 
                className="text-xs"
              >
                {player.name}
                {player.civilization && ` (${civilizationNames[player.civilization]})`}
                {player.isHost && ' 👑'}
              </Badge>
            ))}
          </div>
        </div>

        <Button
          size="sm"
          onClick={onJoin}
          disabled={!canJoin}
          variant={canJoin ? 'default' : 'outline'}
        >
          {isFull ? '已满' : canJoin ? '加入' : '不可加入'}
        </Button>
      </div>
    </div>
  );
}
