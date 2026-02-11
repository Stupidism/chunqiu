// ============================================
// Chunqiu Game - Shared Types
// ============================================

// ============ Core Game Types ============

export type TerrainType = 'grassland' | 'plains' | 'desert' | 'tundra' | 'coast' | 'ocean';
export type ElevationType = 'flat' | 'hill' | 'mountain';
export type ResourceType = 'food' | 'production' | 'gold' | 'luxury' | 'strategic';
export type ImprovementType = 'farm' | 'mine' | 'lumber_mill' | 'trading_post' | 'camp';

export interface Position {
  row: number;
  col: number;
}

export interface Yields {
  food: number;
  production: number;
  gold: number;
  science: number;
  culture: number;
}

export interface Resource {
  type: ResourceType;
  name: string;
  yields: Partial<Yields>;
}

export interface Improvement {
  type: ImprovementType;
  ownerId: string;
}

export interface Tile {
  position: Position;
  terrain: TerrainType;
  elevation: ElevationType;
  resource?: Resource;
  improvement?: Improvement;
  owner?: string;
  hasCity?: boolean;
  unitId?: string;
}

// ============ Unit Types ============

export type UnitType = 
  | 'warrior' 
  | 'archer' 
  | 'chariot' 
  | 'spearman' 
  | 'swordsman'
  | 'worker'
  | 'settler'
  | 'scout';

export type UnitState = 'idle' | 'moving' | 'fortified' | 'sentry';

export interface Unit {
  id: string;
  type: UnitType;
  ownerId: string;
  position: Position;
  health: number;
  maxHealth: number;
  movement: number;
  maxMovement: number;
  experience: number;
  level: number;
  state: UnitState;
  promotions: string[];
}

// ============ City Types ============

export interface City {
  id: string;
  name: string;
  ownerId: string;
  position: Position;
  population: number;
  health: number;
  maxHealth: number;
  defenses: number;
  buildings: Building[];
  productionQueue: ProductionItem[];
  workedTiles: Position[];
  yields: Yields;
  culture: number;
  borders: Position[];
}

export interface Building {
  id: string;
  name: string;
  type: string;
  effects: Partial<Yields>;
}

export interface ProductionItem {
  type: 'unit' | 'building' | 'wonder';
  id: string;
  name: string;
  productionCost: number;
  progress: number;
}

// ============ Player Types ============

export type Civilization = 
  | 'qin' 
  | 'qi' 
  | 'chu' 
  | 'jin' 
  | 'yan' 
  | 'wu' 
  | 'yue'
  | 'song'
  | 'lu'
  | 'wei';

export interface Player {
  id: string;
  name: string;
  civilization: Civilization;
  color: string;
  leader: string;
  isAI: boolean;
  isReady: boolean;
  cities: string[];
  units: string[];
  resources: PlayerResources;
  techs: string[];
  researchingTech?: string;
  researchProgress: number;
}

export interface PlayerResources {
  gold: number;
  goldPerTurn: number;
  science: number;
  sciencePerTurn: number;
  culture: number;
  culturePerTurn: number;
  happiness: number;
}

// ============ Technology Types ============

export interface Technology {
  id: string;
  name: string;
  description: string;
  era: Era;
  cost: number;
  prerequisites: string[];
  unlocks: Unlockable[];
  icon: string;
}

export type Era = 'ancient' | 'classical' | 'medieval';

export interface Unlockable {
  type: 'unit' | 'building' | 'improvement' | 'policy';
  id: string;
  name: string;
}

// ============ Game State Types ============

export type GamePhase = 'lobby' | 'playing' | 'paused' | 'ended';
export type TurnPhase = 'planning' | 'movement' | 'combat' | 'city_management';

export interface GameState {
  id: string;
  name: string;
  phase: GamePhase;
  turnPhase: TurnPhase;
  currentTurn: number;
  currentPlayerId: string;
  players: Player[];
  map: GameMap;
  units: Record<string, Unit>;
  cities: Record<string, City>;
  turnStartTime: number;
  turnTimeLimit?: number;
}

export interface GameMap {
  width: number;
  height: number;
  tiles: Tile[][];
}

// ============ Room/Lobby Types ============

export type RoomStatus = 'waiting' | 'playing' | 'finished';

export interface Room {
  id: string;
  name: string;
  hostId: string;
  maxPlayers: number;
  players: RoomPlayer[];
  status: RoomStatus;
  mapSize: 'small' | 'medium' | 'large';
  gameSpeed: 'quick' | 'standard' | 'epic';
  createdAt: string;
  hasPassword: boolean;
}

export interface RoomPlayer {
  id: string;
  name: string;
  civilization?: Civilization;
  isReady: boolean;
  isHost: boolean;
}

// ============ User Types ============

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  stats: UserStats;
  createdAt: string;
}

export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  totalPlayTime: number;
  favoriteCivilization?: Civilization;
}

// ============ WebSocket Types ============

export type WebSocketMessageType = 
  | 'player_join'
  | 'player_leave'
  | 'player_ready'
  | 'game_start'
  | 'turn_end'
  | 'unit_move'
  | 'unit_attack'
  | 'city_build'
  | 'chat_message'
  | 'sync_state';

export interface WebSocketMessage {
  type: WebSocketMessageType;
  payload: unknown;
  timestamp: number;
  senderId: string;
}

// ============ Editor Types ============

export type EditorTool = 'select' | 'terrain' | 'elevation' | 'resource' | 'unit' | 'city';

export interface EditorState {
  selectedTool: EditorTool;
  selectedTerrain?: TerrainType;
  selectedElevation?: ElevationType;
  selectedResource?: ResourceType;
  brushSize: number;
}

// ============ UI Types ============

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
}

export type ModalType = 
  | 'city_details' 
  | 'tech_tree' 
  | 'diplomacy' 
  | 'victory' 
  | 'options'
  | 'create_room'
  | 'join_room';
