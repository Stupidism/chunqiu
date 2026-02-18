import { create } from 'zustand';
import {
  attackServerState,
  buildInCityServerState,
  computeVisibleAndExploredTiles,
  endTurnServerState,
  moveUnitServerState,
  setUnitStateServerState,
  surrenderCurrentPlayerServerState,
  toggleCityWorkedTileServerState,
  type ToggleCityWorkedTileResult,
} from './serverTransitions';
import type { 
  GameState, 
  Position,
} from '@chunqiu/types';

type InitialSelection = 'unit' | 'city' | 'none';
type GameInitConfig = Partial<GameState> & { initialSelection?: InitialSelection };
type ActivePanel = 'tech' | 'diplomacy' | 'stats' | 'chat' | 'help' | 'settings' | 'search' | null;
type ActiveAction = 'move' | 'pin' | null;
type MapLens = 'normal' | 'resource' | 'strategic';

interface ServerStateSnapshot {
  gameState: GameState | null;
}

interface ClientStateSnapshot {
  uiMessage: string | null;
  activePanel: ActivePanel;
  activeAction: ActiveAction;
  showTileYields: boolean;
  mapLens: MapLens;
  selectedTile: Position | null;
  selectedUnit: string | null;
  selectedCity: string | null;
  hoveredTile: Position | null;
  cameraPosition: { x: number; y: number };
  zoom: number;
  cameraVersion: number;
  focusUnitId: string | null;
  mapPins: Array<{ id: string; position: Position; createdAt: number }>;
  visibleTiles: Set<string>;
  exploredTiles: Set<string>;
}

interface GameStoreState {
  // 游戏状态
  gameState: GameState | null;
  serverState: ServerStateSnapshot;
  clientState: ClientStateSnapshot;

  // UI 提示
  uiMessage: string | null;
  activePanel: ActivePanel;
  activeAction: ActiveAction;
  showTileYields: boolean;
  mapLens: MapLens;
  
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
  toggleCityWorkedTile: (
    cityId: string,
    position: Position
  ) => ToggleCityWorkedTileResult;
  
  // 回合操作
  endTurn: () => void;
  surrenderCurrentPlayer: () => void;
  
  // 视野更新
  updateVisibility: () => void;
  resetClientState: () => void;

  // UI 操作
  showMessage: (message: string) => void;
  setActivePanel: (panel: ActivePanel) => void;
  setActiveAction: (action: ActiveAction) => void;
  toggleTileYields: () => void;
  setMapLens: (lens: MapLens) => void;
}

let messageTimer: ReturnType<typeof setTimeout> | null = null;

function buildClientStateSnapshot(state: GameStoreState): ClientStateSnapshot {
  return {
    uiMessage: state.uiMessage,
    activePanel: state.activePanel,
    activeAction: state.activeAction,
    showTileYields: state.showTileYields,
    mapLens: state.mapLens,
    selectedTile: state.selectedTile,
    selectedUnit: state.selectedUnit,
    selectedCity: state.selectedCity,
    hoveredTile: state.hoveredTile,
    cameraPosition: state.cameraPosition,
    zoom: state.zoom,
    cameraVersion: state.cameraVersion,
    focusUnitId: state.focusUnitId,
    mapPins: state.mapPins,
    visibleTiles: state.visibleTiles,
    exploredTiles: state.exploredTiles,
  };
}

function shouldSyncClientSnapshot(state: GameStoreState): boolean {
  const snapshot = state.clientState;
  return (
    snapshot.uiMessage !== state.uiMessage ||
    snapshot.activePanel !== state.activePanel ||
    snapshot.activeAction !== state.activeAction ||
    snapshot.showTileYields !== state.showTileYields ||
    snapshot.mapLens !== state.mapLens ||
    snapshot.selectedTile !== state.selectedTile ||
    snapshot.selectedUnit !== state.selectedUnit ||
    snapshot.selectedCity !== state.selectedCity ||
    snapshot.hoveredTile !== state.hoveredTile ||
    snapshot.cameraPosition !== state.cameraPosition ||
    snapshot.zoom !== state.zoom ||
    snapshot.cameraVersion !== state.cameraVersion ||
    snapshot.focusUnitId !== state.focusUnitId ||
    snapshot.mapPins !== state.mapPins ||
    snapshot.visibleTiles !== state.visibleTiles ||
    snapshot.exploredTiles !== state.exploredTiles
  );
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  // 初始状态
  gameState: null,
  serverState: { gameState: null },
  clientState: {
    uiMessage: null,
    activePanel: null,
    activeAction: null,
    showTileYields: true,
    mapLens: 'normal',
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
  },
  uiMessage: null,
  activePanel: null,
  activeAction: null,
  showTileYields: true,
  mapLens: 'normal',
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
    const nextState = moveUnitServerState(gameState, unitId, to, cost);
    if (nextState === gameState) return;
    set({ gameState: nextState });
    get().updateVisibility();
  },

  // 攻击
  attack: (attackerId: string, targetId: string) => {
    const { gameState } = get();
    if (!gameState) return;
    const nextState = attackServerState(gameState, attackerId, targetId);
    if (nextState === gameState) return;
    set({ gameState: nextState });
  },

  // 加固单位
  fortifyUnit: (unitId: string) => {
    const { gameState } = get();
    if (!gameState) return;
    const nextState = setUnitStateServerState(gameState, unitId, 'fortified');
    if (nextState === gameState) return;
    set({ gameState: nextState });
  },

  // 跳过单位
  skipUnit: (unitId: string) => {
    const { gameState } = get();
    if (!gameState) return;
    const nextState = setUnitStateServerState(gameState, unitId, 'sentry');
    if (nextState === gameState) return;
    set({ gameState: nextState });
  },

  // 在城市中建造
  buildInCity: (cityId: string, itemType: string, itemId: string) => {
    const { gameState } = get();
    if (!gameState) return;
    const nextState = buildInCityServerState(gameState, cityId, itemType, itemId);
    if (nextState === gameState) return;
    set({ gameState: nextState });
  },

  toggleCityWorkedTile: (cityId: string, position: Position) => {
    const { gameState } = get();
    if (!gameState) return 'missing';
    const result = toggleCityWorkedTileServerState(gameState, cityId, position);
    if (result.gameState !== gameState) {
      set({ gameState: result.gameState });
    }
    return result.result;
  },

  // 结束回合
  endTurn: () => {
    const { gameState } = get();
    if (!gameState) return;
    const nextState = endTurnServerState(gameState);
    set({
      gameState: nextState,
      selectedUnit: null,
      selectedCity: null,
      selectedTile: null,
      activeAction: null,
    });

    get().updateVisibility();
  },

  surrenderCurrentPlayer: () => {
    const { gameState } = get();
    if (!gameState) return;
    const nextState = surrenderCurrentPlayerServerState(gameState);
    if (nextState === gameState) return;
    set({
      gameState: nextState,
      selectedUnit: null,
      selectedCity: null,
      selectedTile: null,
      activeAction: null,
      activePanel: null,
    });
  },

  // 更新视野
  updateVisibility: () => {
    const { gameState } = get();
    if (!gameState) return;
    const next = computeVisibleAndExploredTiles(gameState, get().exploredTiles);
    set({
      visibleTiles: next.visibleTiles,
      exploredTiles: next.exploredTiles,
    });
  },

  resetClientState: () => {
    set({
      uiMessage: null,
      activePanel: null,
      activeAction: null,
      showTileYields: true,
      mapLens: 'normal',
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
    });
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

  setMapLens: (lens) => {
    set({ mapLens: lens });
  },
}));

useGameStore.subscribe(state => {
  const shouldSyncServer = state.serverState.gameState !== state.gameState;
  const shouldSyncClient = shouldSyncClientSnapshot(state);
  if (!shouldSyncServer && !shouldSyncClient) return;
  useGameStore.setState({
    serverState: {
      gameState: state.gameState,
    },
    clientState: buildClientStateSnapshot(state),
  });
});
