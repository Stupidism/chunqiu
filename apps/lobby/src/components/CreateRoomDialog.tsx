'use client';

import { useState } from 'react';
import { 
  Button, 
  Dialog, 
  DialogFooter,
  Input 
} from '@chunqiu/ui';
import { useLobbyStore } from '@/stores/lobbyStore';

interface CreateRoomDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const mapSizeOptions = [
  { value: 'small', label: '小型 (4人)', players: 4 },
  { value: 'medium', label: '中型 (6人)', players: 6 },
  { value: 'large', label: '大型 (8人)', players: 8 },
];

const gameSpeedOptions = [
  { value: 'quick', label: '快速' },
  { value: 'standard', label: '标准' },
  { value: 'epic', label: '史诗' },
];

export function CreateRoomDialog({ isOpen, onClose }: CreateRoomDialogProps) {
  const [name, setName] = useState('');
  const [mapSize, setMapSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [gameSpeed, setGameSpeed] = useState<'quick' | 'standard' | 'epic'>('standard');
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { createRoom } = useLobbyStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const maxPlayers = mapSizeOptions.find(o => o.value === mapSize)?.players || 4;
    
    await createRoom(name, {
      maxPlayers,
      mapSize,
      gameSpeed,
      hasPassword,
    });

    setLoading(false);
    onClose();
    
    // 重置表单
    setName('');
    setPassword('');
    setHasPassword(false);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="创建房间"
      description="设置游戏房间的参数"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input
            label="房间名称"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="输入房间名称"
            required
          />

          <div>
            <label className="block text-sm font-medium text-bronze-800 mb-1.5">
              地图大小
            </label>
            <div className="grid grid-cols-3 gap-2">
              {mapSizeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMapSize(option.value as any)}
                  className={`
                    px-3 py-2 text-sm rounded-md border transition-colors
                    ${mapSize === option.value
                      ? 'bg-bronze-600 text-white border-bronze-600'
                      : 'bg-white text-bronze-700 border-bronze-300 hover:bg-bronze-50'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-bronze-800 mb-1.5">
              游戏速度
            </label>
            <div className="grid grid-cols-3 gap-2">
              {gameSpeedOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setGameSpeed(option.value as any)}
                  className={`
                    px-3 py-2 text-sm rounded-md border transition-colors
                    ${gameSpeed === option.value
                      ? 'bg-bronze-600 text-white border-bronze-600'
                      : 'bg-white text-bronze-700 border-bronze-300 hover:bg-bronze-50'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hasPassword"
              checked={hasPassword}
              onChange={(e) => setHasPassword(e.target.checked)}
              className="rounded border-bronze-300 text-bronze-600 focus:ring-bronze-500"
            />
            <label htmlFor="hasPassword" className="text-sm text-bronze-700">
              设置密码
            </label>
          </div>

          {hasPassword && (
            <Input
              label="密码"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入房间密码"
            />
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button type="submit" loading={loading}>
            创建房间
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
