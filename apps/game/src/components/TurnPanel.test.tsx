import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TurnPanel } from './TurnPanel';
import { useGameStore } from '@/stores/gameStore';
import { createTestGameState } from '@/test/fixtures';

function seedTurnState(partial?: Parameters<typeof createTestGameState>[0]) {
  const gameState = createTestGameState(partial);
  const current = useGameStore.getState();
  useGameStore.setState(
    {
      ...current,
      gameState,
      serverState: { gameState },
      activePanel: null,
      activeAction: null,
      selectedUnit: null,
      selectedCity: null,
      selectedTile: null,
    },
    true
  );
  return gameState;
}

describe('TurnPanel', () => {
  it('should render pending unit count for current player', () => {
    seedTurnState();
    render(<TurnPanel />);

    expect(screen.getByText('还有 1 个单位未行动')).toBeInTheDocument();
    expect(screen.getByTestId('turn-end')).toBeEnabled();
  });

  it('should switch to next player when end turn is clicked', () => {
    seedTurnState();
    render(<TurnPanel />);

    fireEvent.click(screen.getByTestId('turn-end'));

    const next = useGameStore.getState().gameState;
    expect(next?.currentPlayerId).toBe('player-2');
    expect(next?.currentTurn).toBe(1);
  });

  it('should disable end-turn when game already ended', () => {
    seedTurnState({ phase: 'ended' });
    render(<TurnPanel />);

    const button = screen.getByTestId('turn-end');
    expect(button).toBeDisabled();

    fireEvent.click(button);
    const next = useGameStore.getState().gameState;
    expect(next?.phase).toBe('ended');
  });

  it('should end game when surrender is clicked', () => {
    seedTurnState({ phase: 'playing' });
    render(<TurnPanel />);

    fireEvent.click(screen.getByTestId('turn-surrender'));

    const next = useGameStore.getState().gameState;
    expect(next?.phase).toBe('ended');
  });
});
