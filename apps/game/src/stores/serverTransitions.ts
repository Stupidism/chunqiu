import { calculateCityYields } from '@chunqiu/game-core';
import type { GameState, Position, Unit } from '@chunqiu/types';

export type ToggleCityWorkedTileResult =
  | 'added'
  | 'removed'
  | 'center_locked'
  | 'population_limit'
  | 'out_of_bounds'
  | 'missing';

export function moveUnitServerState(
  gameState: GameState,
  unitId: string,
  to: Position,
  cost: number
): GameState {
  const unit = gameState.units[unitId];
  if (!unit || unit.movement <= 0) return gameState;

  return {
    ...gameState,
    units: {
      ...gameState.units,
      [unitId]: {
        ...unit,
        position: to,
        movement: Math.max(0, unit.movement - Math.max(1, cost)),
      },
    },
  };
}

export function attackServerState(
  gameState: GameState,
  attackerId: string,
  targetId: string
): GameState {
  const attacker = gameState.units[attackerId];
  const target = gameState.units[targetId];
  if (!attacker || !target) return gameState;

  const updatedTarget: Unit = {
    ...target,
    health: Math.max(0, target.health - 20),
  };
  const updatedAttacker: Unit = {
    ...attacker,
    movement: 0,
  };

  const units = { ...gameState.units, [attackerId]: updatedAttacker };
  if (updatedTarget.health <= 0) {
    delete units[targetId];
  } else {
    units[targetId] = updatedTarget;
  }

  return {
    ...gameState,
    units,
  };
}

export function setUnitStateServerState(
  gameState: GameState,
  unitId: string,
  state: Unit['state']
): GameState {
  const unit = gameState.units[unitId];
  if (!unit) return gameState;
  return {
    ...gameState,
    units: {
      ...gameState.units,
      [unitId]: { ...unit, state },
    },
  };
}

export function buildInCityServerState(
  gameState: GameState,
  cityId: string,
  itemType: string,
  itemId: string
): GameState {
  const city = gameState.cities[cityId];
  if (!city) return gameState;

  return {
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
  };
}

export function toggleCityWorkedTileServerState(
  gameState: GameState,
  cityId: string,
  position: Position
): { gameState: GameState; result: ToggleCityWorkedTileResult } {
  const city = gameState.cities[cityId];
  if (!city) return { gameState, result: 'missing' };

  if (
    position.row < 0 ||
    position.row >= gameState.map.height ||
    position.col < 0 ||
    position.col >= gameState.map.width
  ) {
    return { gameState, result: 'out_of_bounds' };
  }

  const isCenter = city.position.row === position.row && city.position.col === position.col;
  const alreadyWorked = city.workedTiles.some(
    tile => tile.row === position.row && tile.col === position.col
  );

  if (alreadyWorked) {
    if (isCenter) return { gameState, result: 'center_locked' };
    const nextWorkedTiles = city.workedTiles.filter(
      tile => !(tile.row === position.row && tile.col === position.col)
    );
    const updatedCity = {
      ...city,
      workedTiles: nextWorkedTiles,
    };
    const nextYields = calculateCityYields(updatedCity, gameState.map);
    return {
      gameState: {
        ...gameState,
        cities: {
          ...gameState.cities,
          [cityId]: {
            ...updatedCity,
            yields: {
              ...city.yields,
              ...nextYields,
            },
          },
        },
      },
      result: 'removed',
    };
  }

  if (city.workedTiles.length >= city.population + 1) {
    return { gameState, result: 'population_limit' };
  }

  const nextWorkedTiles = [...city.workedTiles, position];
  const updatedCity = {
    ...city,
    workedTiles: nextWorkedTiles,
  };
  const nextYields = calculateCityYields(updatedCity, gameState.map);
  return {
    gameState: {
      ...gameState,
      cities: {
        ...gameState.cities,
        [cityId]: {
          ...updatedCity,
          yields: {
            ...city.yields,
            ...nextYields,
          },
        },
      },
    },
    result: 'added',
  };
}

export function endTurnServerState(gameState: GameState): GameState {
  const currentPlayerIndex = gameState.players.findIndex(
    player => player.id === gameState.currentPlayerId
  );
  const nextPlayerIndex = (currentPlayerIndex + 1) % gameState.players.length;
  const nextPlayerId = gameState.players[nextPlayerIndex].id;
  const isNewTurn = nextPlayerIndex === 0;

  const units: Record<string, Unit> = {};
  Object.entries(gameState.units).forEach(([id, unit]) => {
    if (unit.ownerId === nextPlayerId) {
      units[id] = {
        ...unit,
        movement: unit.maxMovement,
        state: 'idle',
      };
      return;
    }
    units[id] = unit;
  });

  return {
    ...gameState,
    currentTurn: isNewTurn ? gameState.currentTurn + 1 : gameState.currentTurn,
    currentPlayerId: nextPlayerId,
    units,
    turnStartTime: Date.now(),
  };
}

export function surrenderCurrentPlayerServerState(gameState: GameState): GameState {
  if (gameState.phase === 'ended') return gameState;
  return {
    ...gameState,
    phase: 'ended',
  };
}

export function computeVisibleAndExploredTiles(
  gameState: GameState,
  previousExploredTiles: Set<string>
): { visibleTiles: Set<string>; exploredTiles: Set<string> } {
  const visibleTiles = new Set<string>();
  const exploredTiles = new Set<string>(previousExploredTiles);

  const playerUnits = Object.values(gameState.units).filter(
    unit => unit.ownerId === gameState.currentPlayerId
  );
  const playerCities = Object.values(gameState.cities).filter(
    city => city.ownerId === gameState.currentPlayerId
  );

  if (playerUnits.length === 0 && playerCities.length === 0) {
    for (let row = 0; row < gameState.map.height; row++) {
      for (let col = 0; col < gameState.map.width; col++) {
        const key = `${row},${col}`;
        visibleTiles.add(key);
        exploredTiles.add(key);
      }
    }
    return { visibleTiles, exploredTiles };
  }

  playerUnits.forEach(unit => {
    const visionRange = 2;
    for (let row = -visionRange; row <= visionRange; row++) {
      for (let col = -visionRange; col <= visionRange; col++) {
        if (Math.abs(row) + Math.abs(col) > visionRange) continue;
        const targetRow = unit.position.row + row;
        const targetCol = unit.position.col + col;
        if (
          targetRow < 0 ||
          targetRow >= gameState.map.height ||
          targetCol < 0 ||
          targetCol >= gameState.map.width
        ) {
          continue;
        }
        const key = `${targetRow},${targetCol}`;
        visibleTiles.add(key);
        exploredTiles.add(key);
      }
    }
  });

  playerCities.forEach(city => {
    const visionRange = 3;
    for (let row = -visionRange; row <= visionRange; row++) {
      for (let col = -visionRange; col <= visionRange; col++) {
        if (Math.abs(row) + Math.abs(col) > visionRange) continue;
        const targetRow = city.position.row + row;
        const targetCol = city.position.col + col;
        if (
          targetRow < 0 ||
          targetRow >= gameState.map.height ||
          targetCol < 0 ||
          targetCol >= gameState.map.width
        ) {
          continue;
        }
        const key = `${targetRow},${targetCol}`;
        visibleTiles.add(key);
        exploredTiles.add(key);
      }
    }
  });

  return { visibleTiles, exploredTiles };
}
