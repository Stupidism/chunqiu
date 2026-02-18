import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CityPanel } from './CityPanel';
import { useGameStore } from '@/stores/gameStore';
import { createTestGameState } from '@/test/fixtures';

function seedCityState(selectedCity: string | null) {
  const gameState = createTestGameState();
  const current = useGameStore.getState();
  useGameStore.setState(
    {
      ...current,
      gameState,
      serverState: { gameState },
      selectedCity,
      selectedUnit: null,
      selectedTile: selectedCity ? { ...gameState.cities[selectedCity].position } : null,
      activePanel: null,
      activeAction: null,
    },
    true
  );
}

describe('CityPanel', () => {
  it('should render null when no city is selected', () => {
    seedCityState(null);
    const { container } = render(<CityPanel />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render selected city summary and queue', () => {
    seedCityState('city-1');
    render(<CityPanel />);

    expect(screen.getByText('镐京')).toBeInTheDocument();
    expect(screen.getByText('粮食')).toBeInTheDocument();
    expect(screen.getByText('未选择生产项目')).toBeInTheDocument();
  });

  it('should append production item when clicking build', () => {
    seedCityState('city-1');
    render(<CityPanel />);

    fireEvent.click(screen.getByTestId('city-build'));

    const queue = useGameStore.getState().gameState?.cities['city-1'].productionQueue ?? [];
    expect(queue).toHaveLength(1);
    expect(queue[0].id).toBe('granary');
  });

  it('should toggle citizen assignment from city panel', () => {
    seedCityState('city-1');
    render(<CityPanel />);

    fireEvent.click(screen.getByTestId('city-manage'));

    const assignButtons = screen.getAllByRole('button', { name: '工作' });
    fireEvent.click(assignButtons[0]);

    const workedTiles = useGameStore.getState().gameState?.cities['city-1'].workedTiles ?? [];
    expect(workedTiles.length).toBe(2);
  });
});
