import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Room, RoomPlayer, Civilization } from '@chunqiu/types';

interface LobbyState {
  // 用户状态
  user: User | null;
  isAuthenticated: boolean;
  
  // 房间状态
  rooms: Room[];
  currentRoom: Room | null;
  
  // 连接状态
  isConnected: boolean;
  
  // Actions
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // 房间操作
  setRooms: (rooms: Room[]) => void;
  createRoom: (name: string, options: Partial<Room>) => Promise<Room | null>;
  joinRoom: (roomId: string, password?: string) => Promise<boolean>;
  leaveRoom: () => void;
  setCurrentRoom: (room: Room | null) => void;
  startGame: () => void;
  
  // 玩家操作
  selectCivilization: (civilization: Civilization) => void;
  setReady: (ready: boolean) => void;
  
  // 连接操作
  setConnected: (connected: boolean) => void;
}

// 模拟房间数据
const mockRooms: Room[] = [
  {
    id: 'room-1',
    name: '新手友好房',
    hostId: 'user-1',
    maxPlayers: 4,
    players: [
      { id: 'user-1', name: '秦王', civilization: 'qin', isReady: true, isHost: true },
      { id: 'user-2', name: '齐桓公', civilization: 'qi', isReady: false, isHost: false },
    ],
    status: 'waiting',
    mapSize: 'small',
    gameSpeed: 'standard',
    createdAt: new Date().toISOString(),
    hasPassword: false,
  },
  {
    id: 'room-2',
    name: '高手对决',
    hostId: 'user-3',
    maxPlayers: 6,
    players: [
      { id: 'user-3', name: '楚庄王', civilization: 'chu', isReady: true, isHost: true },
      { id: 'user-4', name: '晋文公', civilization: 'jin', isReady: true, isHost: false },
      { id: 'user-5', name: '越王', civilization: 'yue', isReady: false, isHost: false },
    ],
    status: 'waiting',
    mapSize: 'medium',
    gameSpeed: 'standard',
    createdAt: new Date().toISOString(),
    hasPassword: true,
  },
  {
    id: 'room-3',
    name: '史诗战役',
    hostId: 'user-6',
    maxPlayers: 8,
    players: [
      { id: 'user-6', name: '燕昭王', civilization: 'yan', isReady: true, isHost: true },
    ],
    status: 'waiting',
    mapSize: 'large',
    gameSpeed: 'epic',
    createdAt: new Date().toISOString(),
    hasPassword: false,
  },
];

export const useLobbyStore = create<LobbyState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      isAuthenticated: false,
      rooms: mockRooms,
      currentRoom: null,
      isConnected: false,

      // 登录
      login: async (username: string, password: string) => {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 模拟验证
        if (username && password) {
          const user: User = {
            id: `user-${Date.now()}`,
            username,
            email: `${username}@example.com`,
            stats: {
              gamesPlayed: 10,
              gamesWon: 6,
              gamesLost: 4,
              totalPlayTime: 3600,
            },
            createdAt: new Date().toISOString(),
          };
          
          set({ user, isAuthenticated: true });
          return true;
        }
        return false;
      },

      // 注册
      register: async (username: string, email: string, password: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (username && email && password) {
          const user: User = {
            id: `user-${Date.now()}`,
            username,
            email,
            stats: {
              gamesPlayed: 0,
              gamesWon: 0,
              gamesLost: 0,
              totalPlayTime: 0,
            },
            createdAt: new Date().toISOString(),
          };
          
          set({ user, isAuthenticated: true });
          return true;
        }
        return false;
      },

      // 退出登录
      logout: () => {
        set({ user: null, isAuthenticated: false, currentRoom: null });
      },

      // 设置房间列表
      setRooms: (rooms: Room[]) => {
        set({ rooms });
      },

      // 创建房间
      createRoom: async (name: string, options: Partial<Room>) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const { user } = get();
        if (!user) return null;

        const newRoom: Room = {
          id: `room-${Date.now()}`,
          name,
          hostId: user.id,
          maxPlayers: options.maxPlayers || 4,
          players: [
            {
              id: user.id,
              name: user.username,
              isReady: false,
              isHost: true,
            },
          ],
          status: 'waiting',
          mapSize: options.mapSize || 'medium',
          gameSpeed: options.gameSpeed || 'standard',
          createdAt: new Date().toISOString(),
          hasPassword: !!options.hasPassword,
        };

        set(state => ({
          rooms: [newRoom, ...state.rooms],
          currentRoom: newRoom,
        }));

        return newRoom;
      },

      // 加入房间
      joinRoom: async (roomId: string, password?: string) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const { user, rooms } = get();
        if (!user) return false;

        const room = rooms.find(r => r.id === roomId);
        if (!room) return false;

        if (room.hasPassword && !password) {
          return false;
        }

        if (room.players.length >= room.maxPlayers) {
          return false;
        }

        const updatedRoom: Room = {
          ...room,
          players: [
            ...room.players,
            {
              id: user.id,
              name: user.username,
              isReady: false,
              isHost: false,
            },
          ],
        };

        set(state => ({
          rooms: state.rooms.map(r => r.id === roomId ? updatedRoom : r),
          currentRoom: updatedRoom,
        }));

        return true;
      },

      // 离开房间
      leaveRoom: () => {
        const { user, currentRoom } = get();
        if (!user || !currentRoom) return;

        const updatedRoom: Room = {
          ...currentRoom,
          players: currentRoom.players.filter(p => p.id !== user.id),
        };

        set(state => ({
          rooms: state.rooms.map(r => r.id === currentRoom.id ? updatedRoom : r),
          currentRoom: null,
        }));
      },

      // 设置当前房间
      setCurrentRoom: (room: Room | null) => {
        set({ currentRoom: room });
      },

      // 开始游戏（仅更新本地房间状态）
      startGame: () => {
        const { currentRoom } = get();
        if (!currentRoom) return;

        const updatedRoom: Room = {
          ...currentRoom,
          status: 'playing',
        };

        set(state => ({
          rooms: state.rooms.map(r => r.id === currentRoom.id ? updatedRoom : r),
          currentRoom: updatedRoom,
        }));
      },

      // 选择文明
      selectCivilization: (civilization: Civilization) => {
        const { user, currentRoom } = get();
        if (!user || !currentRoom) return;

        const updatedRoom: Room = {
          ...currentRoom,
          players: currentRoom.players.map(p =>
            p.id === user.id ? { ...p, civilization } : p
          ),
        };

        set(state => ({
          rooms: state.rooms.map(r => r.id === currentRoom.id ? updatedRoom : r),
          currentRoom: updatedRoom,
        }));
      },

      // 设置准备状态
      setReady: (ready: boolean) => {
        const { user, currentRoom } = get();
        if (!user || !currentRoom) return;

        const updatedRoom: Room = {
          ...currentRoom,
          players: currentRoom.players.map(p =>
            p.id === user.id ? { ...p, isReady: ready } : p
          ),
        };

        set(state => ({
          rooms: state.rooms.map(r => r.id === currentRoom.id ? updatedRoom : r),
          currentRoom: updatedRoom,
        }));
      },

      // 设置连接状态
      setConnected: (connected: boolean) => {
        set({ isConnected: connected });
      },
    }),
    {
      name: 'chunqiu-lobby-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
