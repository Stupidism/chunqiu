import { describe, expect, it } from 'vitest';
import { useGameStore } from './gameStore';
import { createTestGameState } from '@/test/fixtures';

function resetStore(gameState = createTestGameState()) {
  const current = useGameStore.getState();
  useGameStore.setState(
    {
      ...current,
      gameState,
      serverState: { gameState },
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
      clientState: {
        ...current.clientState,
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
    },
    true
  );
}

describe('gameStore client/server boundary', () => {
  it('resetClientState should clear only client-facing ui state', () => {
    const gameState = createTestGameState();
    resetStore(gameState);

    const store = useGameStore.getState();
    store.selectUnit('unit-1');
    store.selectCity('city-1');
    store.selectTile({ row: 4, col: 3 });
    store.setCameraPosition({ x: 120, y: -60 });
    store.setZoom(1.4);
    store.setActiveAction('move');
    store.setActivePanel('search');

    const serverBefore = useGameStore.getState().serverState.gameState;
    const gameStateBefore = useGameStore.getState().gameState;

    useGameStore.getState().resetClientState();

    const next = useGameStore.getState();
    expect(next.gameState).toBe(gameStateBefore);
    expect(next.serverState.gameState).toBe(serverBefore);

    expect(next.clientState.activePanel).toBeNull();
    expect(next.clientState.activeAction).toBeNull();
    expect(next.clientState.selectedTile).toBeNull();
    expect(next.clientState.selectedUnit).toBeNull();
    expect(next.clientState.selectedCity).toBeNull();
    expect(next.clientState.zoom).toBe(1);

    expect(next.activePanel).toBeNull();
    expect(next.activeAction).toBeNull();
    expect(next.selectedTile).toBeNull();
    expect(next.selectedUnit).toBeNull();
    expect(next.selectedCity).toBeNull();
    expect(next.zoom).toBe(1);
  });

  it('server transition actions should update serverState while preserving client panel state', () => {
    const gameState = createTestGameState();
    resetStore(gameState);

    const store = useGameStore.getState();
    store.setActivePanel('search');
    store.moveUnit('unit-1', { row: 4, col: 5 }, 1);

    const next = useGameStore.getState();
    expect(next.gameState?.units['unit-1'].position).toEqual({ row: 4, col: 5 });
    expect(next.serverState.gameState?.units['unit-1'].position).toEqual({ row: 4, col: 5 });

    expect(next.activePanel).toBe('search');
    expect(next.clientState.activePanel).toBe('search');
  });
});
