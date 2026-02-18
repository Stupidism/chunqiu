import { create } from 'zustand';
import type { 
  GameState, 
  GameMap, 
  Player, 
  Unit, 
  City, 
  Tile, 
  Position,
  TurnPhase 
} from '@chunqiu/types';

type InitialSelection = 'unit' | 'city' | 'none';
type GameInitConfig = Partial<GameState> & { initialSelection?: InitialSelection };

interface GameStoreState {
  // 游戏状态
  gameState: GameState | null;

  // UI 提示
  uiMessage: string | null;
  activePanel: 'tech' | 'diplomacy' | 'stats' | 'chat' | 'help' | 'settings' | 'search' | null;
  activeAction: 'move' | 'pin' | null;
  showTileYields: boolean;
  
  // UI状态
  selectedTile: Position | null;
  selectedUnit: string | null;
  selectedCity: string | null;
  hoveredTile: Position | null;
  cameraPosition: { x: number; y: number };
  zoom: number;
  cameraVersion: number;
  mapPins: Array<{ id: string; position: Position; createdAt: number }>;
  
  // 可见范围
  visibleTiles: Set<string>;
  exploredTiles: Set<string>;
  
  // Actions
  initializeGame: (config: GameInitConfig) => void;
  
  // 选择操作
  selectTile: (position: Position | null) => void;
  selectUnit: (unitId: string | null) => void;
  selectCity: (cityId: string | null) => void;
  setHoveredTile: (position: Position | null) => void;
  
  // 相机操作
  setCameraPosition: (position: { x: number; y: number }) => void;
  setZoom: (zoom: number) => void;
  requestCameraRecenter: () => void;
  focusUnitId: string | null;
  requestFocusUnit: (unitId: string | null) => void;
  toggleMapPin: (position: Position) => void;
  clearMapPins: () => void;
  
  // 单位操作
  moveUnit: (unitId: string, to: Position, cost: number) => void;
  attack: (attackerId: string, targetId: string) => void;
  fortifyUnit: (unitId: string) => void;
  skipUnit: (unitId: string) => void;
  
  // 城市操作
  buildInCity: (cityId: string, itemType: string, itemId: string) => void;
  
  // 回合操作
  endTurn: () => void;
  
  // 视野更新
  updateVisibility: () => void;

  // UI 操作
  showMessage: (message: string) => void;
  setActivePanel: (panel: GameStoreState['activePanel']) => void;
  setActiveAction: (action: GameStoreState['activeAction']) => void;
  toggleTileYields: () => void;
}

let messageTimer: ReturnType<typeof setTimeout> | null = null;

export const useGameStore = create<GameStoreState>((set, get) => ({
  // 初始状态
  gameState: null,
  uiMessage: null,
  activePanel: null,
  activeAction: null,
  showTileYields: true,
  selectedTile: null,
  selectedUnit: null,
  selectedCity: null,
  hoveredTile: null,
  cameraPosition: { x: 0, y: 0 },
  zoom: 1,
  cameraVersion: 0,
  focusUnitId: null,
  mapPins: [],
  visibleTiles: new Set(),
  exploredTiles: new Set(),

  // 初始化游戏
  initializeGame: (config: GameInitConfig) => {
    const gameState: GameState = {
      id: config.id || `game-${Date.now()}`,
      name: config.name || '新游戏',
      phase: 'playing',
      turnPhase: 'planning',
      currentTurn: 1,
      currentPlayerId: config.players?.[0]?.id || '',
      players: config.players || [],
      map: config.map || { width: 10, height: 10, tiles: [] },
      units: config.units || {},
      cities: config.cities || {},
      turnStartTime: Date.now(),
      turnTimeLimit: config.turnTimeLimit,
    };

    const firstUnit = Object.values(gameState.units)[0];
    const firstCity = Object.values(gameState.cities)[0];
    const selectionPreference = config.initialSelection ?? 'unit';

    let selectedUnit: string | null = null;
    let selectedCity: string | null = null;
    let selectedTile: Position | null = null;

    if (selectionPreference === 'city') {
      if (firstCity) {
        selectedCity = firstCity.id;
        selectedTile = { ...firstCity.position };
      } else if (firstUnit) {
        selectedUnit = firstUnit.id;
        selectedTile = { ...firstUnit.position };
      }
    } else if (selectionPreference === 'unit') {
      if (firstUnit) {
        selectedUnit = firstUnit.id;
        selectedTile = { ...firstUnit.position };
      } else if (firstCity) {
        selectedCity = firstCity.id;
        selectedTile = { ...firstCity.position };
      }
    }

    set({ gameState, selectedUnit, selectedCity, selectedTile });
    get().updateVisibility();
  },

  // 选择地块
  selectTile: (position: Position | null) => {
    set({ selectedTile: position });
    if (!position) {
      set({ selectedUnit: null, selectedCity: null });
    }
  },

  // 选择单位
  selectUnit: (unitId: string | null) => {
    set({ selectedUnit: unitId });
    if (unitId) {
      set({ selectedCity: null });
    }
    set({ activeAction: null });
  },

  // 选择城市
  selectCity: (cityId: string | null) => {
    set({ selectedCity: cityId });
    if (cityId) {
      set({ selectedUnit: null });
    }
    set({ activeAction: null });
  },

  // 设置悬停地块
  setHoveredTile: (position: Position | null) => {
    set({ hoveredTile: position });
  },

  // 设置相机位置
  setCameraPosition: (position: { x: number; y: number }) => {
    set({ cameraPosition: position });
  },

  // 设置缩放
  setZoom: (zoom: number) => {
    set({ zoom: Math.max(0.5, Math.min(2, zoom)) });
  },

  requestCameraRecenter: () => {
    set(state => ({ cameraVersion: state.cameraVersion + 1 }));
  },

  requestFocusUnit: (unitId: string | null) => {
    set({ focusUnitId: unitId });
  },

  toggleMapPin: (position: Position) => {
    set(state => {
      const key = `${position.row},${position.col}`;
      const existing = state.mapPins.find(pin => `${pin.position.row},${pin.position.col}` === key);
      if (existing) {
        return { mapPins: state.mapPins.filter(pin => pin.id !== existing.id) };
      }
      return {
        mapPins: [
          ...state.mapPins,
          {
            id: `pin-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
            position,
            createdAt: Date.now(),
          },
        ],
      };
    });
  },

  clearMapPins: () => {
    set({ mapPins: [] });
  },

  // 移动单位
  moveUnit: (unitId: string, to: Position, cost: number) => {
    const { gameState } = get();
    if (!gameState) return;

    const unit = gameState.units[unitId];
    if (!unit) return;
    if (unit.movement <= 0) return;

    const updatedUnit: Unit = {
      ...unit,
      position: to,
      movement: Math.max(0, unit.movement - Math.max(1, cost)),
    };

    set({
      gameState: {
        ...gameState,
        units: {
          ...gameState.units,
          [unitId]: updatedUnit,
        },
      },
    });

    get().updateVisibility();
  },

  // 攻击
  attack: (attackerId: string, targetId: string) => {
    const { gameState } = get();
    if (!gameState) return;

    const attacker = gameState.units[attackerId];
    const target = gameState.units[targetId];
    if (!attacker || !target) return;

    // 简化的战斗逻辑
    const damage = 20;
    const updatedTarget: Unit = {
      ...target,
      health: Math.max(0, target.health - damage),
    };

    const updatedAttacker: Unit = {
      ...attacker,
      movement: 0,
    };

    const newUnits = { ...gameState.units };
    newUnits[attackerId] = updatedAttacker;
    
    if (updatedTarget.health <= 0) {
      delete newUnits[targetId];
    } else {
      newUnits[targetId] = updatedTarget;
    }

    set({
      gameState: {
        ...gameState,
        units: newUnits,
      },
    });
  },

  // 加固单位
  fortifyUnit: (unitId: string) => {
    const { gameState } = get();
    if (!gameState) return;

    const unit = gameState.units[unitId];
    if (!unit) return;

    set({
      gameState: {
        ...gameState,
        units: {
          ...gameState.units,
          [unitId]: { ...unit, state: 'fortified' },
        },
      },
    });
  },

  // 跳过单位
  skipUnit: (unitId: string) => {
    const { gameState } = get();
    if (!gameState) return;

    const unit = gameState.units[unitId];
    if (!unit) return;

    set({
      gameState: {
        ...gameState,
        units: {
          ...gameState.units,
          [unitId]: { ...unit, state: 'sentry' },
        },
      },
    });
  },

  // 在城市中建造
  buildInCity: (cityId: string, itemType: string, itemId: string) => {
    const { gameState } = get();
    if (!gameState) return;

    const city = gameState.cities[cityId];
    if (!city) return;

    // 简化的建造逻辑
    set({
      gameState: {
        ...gameState,
        cities: {
          ...gameState.cities,
          [cityId]: {
            ...city,
            productionQueue: [
              ...city.productionQueue,
              {
                type: itemType as any,
                id: itemId,
                name: itemId,
                productionCost: 100,
                progress: 0,
              },
            ],
          },
        },
      },
    });
  },

  // 结束回合
  endTurn: () => {
    const { gameState } = get();
    if (!gameState) return;

    const currentPlayerIndex = gameState.players.findIndex(
      p => p.id === gameState.currentPlayerId
    );
    const nextPlayerIndex = (currentPlayerIndex + 1) % gameState.players.length;
    const nextPlayerId = gameState.players[nextPlayerIndex].id;

    // 重置所有单位移动力
    const resetUnits: Record<string, Unit> = {};
    Object.entries(gameState.units).forEach(([id, unit]) => {
      if (unit.ownerId === nextPlayerId) {
        resetUnits[id] = {
          ...unit,
          movement: unit.maxMovement,
          state: 'idle',
        };
      } else {
        resetUnits[id] = unit;
      }
    });

    const isNewTurn = nextPlayerIndex === 0;

    set({
      gameState: {
        ...gameState,
        currentTurn: isNewTurn ? gameState.currentTurn + 1 : gameState.currentTurn,
        currentPlayerId: nextPlayerId,
        units: resetUnits,
        turnStartTime: Date.now(),
      },
      selectedUnit: null,
      selectedCity: null,
      selectedTile: null,
      activeAction: null,
    });

    get().updateVisibility();
  },

  // 更新视野
  updateVisibility: () => {
    const { gameState } = get();
    if (!gameState) return;

    const visible = new Set<string>();
    const explored = new Set(get().exploredTiles);

    // 获取当前玩家的所有单位
    const playerUnits = Object.values(gameState.units).filter(
      u => u.ownerId === gameState.currentPlayerId
    );

    // 获取城市视野
    const playerCities = Object.values(gameState.cities).filter(
      c => c.ownerId === gameState.currentPlayerId
    );

    // 如果没有单位和城市，默认显示全图（开发模式）
    if (playerUnits.length === 0 && playerCities.length === 0) {
      for (let row = 0; row < gameState.map.height; row++) {
        for (let col = 0; col < gameState.map.width; col++) {
          const key = `${row},${col}`;
          visible.add(key);
          explored.add(key);
        }
      }
      set({ visibleTiles: visible, exploredTiles: explored });
      return;
    }

    // 计算单位视野
    playerUnits.forEach(unit => {
      const visionRange = 2;
      for (let row = -visionRange; row <= visionRange; row++) {
        for (let col = -visionRange; col <= visionRange; col++) {
          const distance = Math.abs(row) + Math.abs(col);
          if (distance <= visionRange) {
            const targetRow = unit.position.row + row;
            const targetCol = unit.position.col + col;
            if (
              targetRow >= 0 &&
              targetRow < gameState.map.height &&
              targetCol >= 0 &&
              targetCol < gameState.map.width
            ) {
              const key = `${targetRow},${targetCol}`;
              visible.add(key);
              explored.add(key);
            }
          }
        }
      }
    });

    // 城市视野
    playerCities.forEach(city => {
      const visionRange = 3;
      for (let row = -visionRange; row <= visionRange; row++) {
        for (let col = -visionRange; col <= visionRange; col++) {
          const distance = Math.abs(row) + Math.abs(col);
          if (distance <= visionRange) {
            const targetRow = city.position.row + row;
            const targetCol = city.position.col + col;
            if (
              targetRow >= 0 &&
              targetRow < gameState.map.height &&
              targetCol >= 0 &&
              targetCol < gameState.map.width
            ) {
              const key = `${targetRow},${targetCol}`;
              visible.add(key);
              explored.add(key);
            }
          }
        }
      }
    });

    set({ visibleTiles: visible, exploredTiles: explored });
  },

  showMessage: (message: string) => {
    set({ uiMessage: message });
    if (messageTimer) clearTimeout(messageTimer);
    messageTimer = setTimeout(() => {
      set({ uiMessage: null });
    }, 2000);
  },

  setActivePanel: (panel) => {
    set(state => ({
      activePanel: state.activePanel === panel ? null : panel,
    }));
  },

  setActiveAction: (action) => {
    set({ activeAction: action });
  },

  toggleTileYields: () => {
    set(state => ({ showTileYields: !state.showTileYields }));
  },
}));
