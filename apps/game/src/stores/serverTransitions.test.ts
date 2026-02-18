import { describe, expect, it } from 'vitest';
import type { Position, Unit } from '@chunqiu/types';
import {
  attackServerState,
  buildInCityServerState,
  computeVisibleAndExploredTiles,
  endTurnServerState,
  moveUnitServerState,
  setUnitStateServerState,
  surrenderCurrentPlayerServerState,
  toggleCityWorkedTileServerState,
} from './serverTransitions';
import { createTestGameState, createTestMap } from '@/test/fixtures';

function key(pos: Position): string {
  return `${pos.row},${pos.col}`;
}

describe('serverTransitions', () => {
  it('moveUnitServerState should update position and consume movement by distance cost', () => {
    const gameState = createTestGameState();
    const next = moveUnitServerState(gameState, 'unit-1', { row: 4, col: 5 }, 2);

    expect(next.units['unit-1'].position).toEqual({ row: 4, col: 5 });
    expect(next.units['unit-1'].movement).toBe(0);
    expect(gameState.units['unit-1'].position).toEqual({ row: 4, col: 4 });
  });

  it('moveUnitServerState should ignore move when movement is 0', () => {
    const gameState = createTestGameState({
      units: {
        ...createTestGameState().units,
        'unit-1': {
          ...createTestGameState().units['unit-1'],
          movement: 0,
        },
      },
    });

    const next = moveUnitServerState(gameState, 'unit-1', { row: 1, col: 1 }, 1);
    expect(next).toBe(gameState);
  });

  it('attackServerState should consume attacker movement and damage target', () => {
    const gameState = createTestGameState();
    const next = attackServerState(gameState, 'unit-1', 'unit-2');

    expect(next.units['unit-1'].movement).toBe(0);
    expect(next.units['unit-2'].health).toBe(80);
  });

  it('attackServerState should remove target when health drops to 0', () => {
    const gameState = createTestGameState({
      units: {
        ...createTestGameState().units,
        'unit-2': {
          ...createTestGameState().units['unit-2'],
          health: 20,
        },
      },
    });

    const next = attackServerState(gameState, 'unit-1', 'unit-2');
    expect(next.units['unit-2']).toBeUndefined();
  });

  it('setUnitStateServerState should update target unit state only', () => {
    const gameState = createTestGameState();
    const next = setUnitStateServerState(gameState, 'unit-1', 'fortified');

    expect(next.units['unit-1'].state).toBe('fortified');
    expect(next.units['unit-2'].state).toBe(gameState.units['unit-2'].state);
  });

  it('buildInCityServerState should append production item to queue', () => {
    const gameState = createTestGameState();
    const next = buildInCityServerState(gameState, 'city-1', 'building', 'granary');

    expect(next.cities['city-1'].productionQueue).toHaveLength(1);
    expect(next.cities['city-1'].productionQueue[0]).toMatchObject({
      type: 'building',
      id: 'granary',
      progress: 0,
    });
  });

  it('toggleCityWorkedTileServerState should add/remove worked tile with validation', () => {
    const gameState = createTestGameState({ map: createTestMap(10, 10) });

    const add = toggleCityWorkedTileServerState(gameState, 'city-1', { row: 4, col: 4 });
    expect(add.result).toBe('added');
    expect(add.gameState.cities['city-1'].workedTiles.map(key)).toContain('4,4');

    const remove = toggleCityWorkedTileServerState(add.gameState, 'city-1', { row: 4, col: 4 });
    expect(remove.result).toBe('removed');
    expect(remove.gameState.cities['city-1'].workedTiles.map(key)).not.toContain('4,4');

    const centerLocked = toggleCityWorkedTileServerState(remove.gameState, 'city-1', { row: 4, col: 3 });
    expect(centerLocked.result).toBe('center_locked');
  });

  it('toggleCityWorkedTileServerState should enforce population limit and bounds', () => {
    const gameState = createTestGameState({
      cities: {
        ...createTestGameState().cities,
        'city-1': {
          ...createTestGameState().cities['city-1'],
          population: 1,
          workedTiles: [
            { row: 4, col: 3 },
            { row: 4, col: 4 },
          ],
        },
      },
    });

    const limit = toggleCityWorkedTileServerState(gameState, 'city-1', { row: 5, col: 3 });
    expect(limit.result).toBe('population_limit');

    const out = toggleCityWorkedTileServerState(gameState, 'city-1', { row: -1, col: 999 });
    expect(out.result).toBe('out_of_bounds');

    const missing = toggleCityWorkedTileServerState(gameState, 'missing-city', { row: 1, col: 1 });
    expect(missing.result).toBe('missing');
  });

  it('endTurnServerState should switch to next player and refresh only next player units', () => {
    const gameState = createTestGameState({
      currentPlayerId: 'player-1',
      units: {
        'unit-1': {
          ...createTestGameState().units['unit-1'],
          movement: 0,
          state: 'fortified',
        },
        'unit-2': {
          ...createTestGameState().units['unit-2'],
          movement: 0,
          state: 'sentry',
        },
      },
    });

    const next = endTurnServerState(gameState);
    expect(next.currentPlayerId).toBe('player-2');
    expect(next.currentTurn).toBe(1);
    expect(next.units['unit-2'].movement).toBe(next.units['unit-2'].maxMovement);
    expect(next.units['unit-2'].state).toBe('idle');
    expect(next.units['unit-1'].movement).toBe(0);
  });

  it('endTurnServerState should increment turn counter when wrapping to player-1', () => {
    const gameState = createTestGameState({ currentPlayerId: 'player-2', currentTurn: 3 });
    const next = endTurnServerState(gameState);
    expect(next.currentPlayerId).toBe('player-1');
    expect(next.currentTurn).toBe(4);
  });

  it('surrenderCurrentPlayerServerState should set phase=ended once', () => {
    const gameState = createTestGameState({ phase: 'playing' });
    const ended = surrenderCurrentPlayerServerState(gameState);
    expect(ended.phase).toBe('ended');

    const unchanged = surrenderCurrentPlayerServerState(ended);
    expect(unchanged).toBe(ended);
  });

  it('computeVisibleAndExploredTiles should accumulate fog-of-war exploration', () => {
    const gameState = createTestGameState({
      currentPlayerId: 'player-1',
      units: {
        'unit-1': {
          ...createTestGameState().units['unit-1'],
          position: { row: 2, col: 2 },
        },
      } as Record<string, Unit>,
      cities: {},
    });

    const first = computeVisibleAndExploredTiles(gameState, new Set());
    expect(first.visibleTiles.size).toBeGreaterThan(0);
    expect(first.exploredTiles.size).toBe(first.visibleTiles.size);

    const moved = {
      ...gameState,
      units: {
        ...gameState.units,
        'unit-1': {
          ...gameState.units['unit-1'],
          position: { row: 4, col: 4 },
        },
      },
    };
    const second = computeVisibleAndExploredTiles(moved, first.exploredTiles);
    expect(second.exploredTiles.size).toBeGreaterThanOrEqual(first.exploredTiles.size);
    expect([...first.exploredTiles].every(k => second.exploredTiles.has(k))).toBe(true);
  });

  it('computeVisibleAndExploredTiles should reveal all when player has no units/cities', () => {
    const map = createTestMap(4, 3);
    const gameState = createTestGameState({
      map,
      currentPlayerId: 'player-1',
      units: {},
      cities: {},
    });
    const all = computeVisibleAndExploredTiles(gameState, new Set());
    expect(all.visibleTiles.size).toBe(12);
    expect(all.exploredTiles.size).toBe(12);
    expect(all.visibleTiles.has('2,3')).toBe(true);
  });
});
