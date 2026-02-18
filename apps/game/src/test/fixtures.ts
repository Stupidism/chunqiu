import type { City, GameMap, GameState, Player, Tile, Unit } from '@chunqiu/types';

function createTile(row: number, col: number, terrain: Tile['terrain'] = 'grassland'): Tile {
  return {
    position: { row, col },
    terrain,
    elevation: 'flat',
  };
}

export function createTestMap(width = 8, height = 8): GameMap {
  return {
    width,
    height,
    tiles: Array.from({ length: height }, (_, row) =>
      Array.from({ length: width }, (_, col) => {
        if ((row + col) % 7 === 0) return createTile(row, col, 'coast');
        if ((row + col) % 5 === 0) return createTile(row, col, 'plains');
        return createTile(row, col, 'grassland');
      })
    ),
  };
}

export function createTestPlayers(): Player[] {
  return [
    {
      id: 'player-1',
      name: '玩家1',
      civilization: 'qin',
      color: '#8B0000',
      leader: '秦穆公',
      isAI: false,
      isReady: true,
      cities: ['city-1'],
      units: ['unit-1'],
      resources: {
        gold: 100,
        goldPerTurn: 5,
        science: 0,
        sciencePerTurn: 3,
        culture: 0,
        culturePerTurn: 2,
        happiness: 10,
      },
      techs: [],
      researchProgress: 0,
    },
    {
      id: 'player-2',
      name: '玩家2',
      civilization: 'chu',
      color: '#0047AB',
      leader: '楚庄王',
      isAI: true,
      isReady: true,
      cities: ['city-2'],
      units: ['unit-2'],
      resources: {
        gold: 90,
        goldPerTurn: 4,
        science: 0,
        sciencePerTurn: 3,
        culture: 0,
        culturePerTurn: 2,
        happiness: 8,
      },
      techs: [],
      researchProgress: 0,
    },
  ];
}

export function createTestUnits(): Record<string, Unit> {
  return {
    'unit-1': {
      id: 'unit-1',
      type: 'warrior',
      ownerId: 'player-1',
      position: { row: 4, col: 4 },
      health: 100,
      maxHealth: 100,
      movement: 2,
      maxMovement: 2,
      experience: 0,
      level: 1,
      state: 'idle',
      promotions: [],
    },
    'unit-2': {
      id: 'unit-2',
      type: 'archer',
      ownerId: 'player-2',
      position: { row: 5, col: 5 },
      health: 100,
      maxHealth: 100,
      movement: 2,
      maxMovement: 2,
      experience: 0,
      level: 1,
      state: 'idle',
      promotions: [],
    },
  };
}

export function createTestCities(): Record<string, City> {
  return {
    'city-1': {
      id: 'city-1',
      name: '镐京',
      ownerId: 'player-1',
      position: { row: 4, col: 3 },
      population: 1,
      health: 200,
      maxHealth: 200,
      defenses: 10,
      buildings: [],
      productionQueue: [],
      workedTiles: [{ row: 4, col: 3 }],
      yields: {
        food: 2,
        production: 1,
        gold: 1,
        science: 0,
        culture: 0,
      },
      culture: 0,
      borders: [
        { row: 4, col: 3 },
        { row: 3, col: 3 },
        { row: 5, col: 3 },
        { row: 4, col: 2 },
        { row: 4, col: 4 },
      ],
    },
    'city-2': {
      id: 'city-2',
      name: '郢都',
      ownerId: 'player-2',
      position: { row: 6, col: 6 },
      population: 1,
      health: 200,
      maxHealth: 200,
      defenses: 10,
      buildings: [],
      productionQueue: [],
      workedTiles: [{ row: 6, col: 6 }],
      yields: {
        food: 2,
        production: 1,
        gold: 1,
        science: 0,
        culture: 0,
      },
      culture: 0,
      borders: [
        { row: 6, col: 6 },
        { row: 5, col: 6 },
        { row: 7, col: 6 },
        { row: 6, col: 5 },
        { row: 6, col: 7 },
      ],
    },
  };
}

export function createTestGameState(partial?: Partial<GameState>): GameState {
  const map = partial?.map ?? createTestMap();
  return {
    id: partial?.id ?? 'game-test',
    name: partial?.name ?? '测试对局',
    phase: partial?.phase ?? 'playing',
    turnPhase: partial?.turnPhase ?? 'planning',
    currentTurn: partial?.currentTurn ?? 1,
    currentPlayerId: partial?.currentPlayerId ?? 'player-1',
    players: partial?.players ?? createTestPlayers(),
    map,
    units: partial?.units ?? createTestUnits(),
    cities: partial?.cities ?? createTestCities(),
    turnStartTime: partial?.turnStartTime ?? 1700000000000,
    turnTimeLimit: partial?.turnTimeLimit,
  };
}
