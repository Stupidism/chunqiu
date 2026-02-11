'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { GameMap } from '@/components/GameMap';
import { ResourceBar } from '@/components/ResourceBar';
import { UnitPanel } from '@/components/UnitPanel';
import { CityPanel } from '@/components/CityPanel';
import { TurnPanel } from '@/components/TurnPanel';
import { Minimap } from '@/components/Minimap';
import { ActionBar } from '@/components/ActionBar';
import { useGameStore } from '@/stores/gameStore';
import { generateMap } from '@chunqiu/game-core';

declare global {
  interface Window {
    render_game_to_text?: () => string;
    advanceTime?: (ms: number) => Promise<void>;
  }
}

export default function GamePage() {
  const { initializeGame, gameState, uiMessage, activePanel } = useGameStore();
  const testCanvasRef = useRef<HTMLCanvasElement>(null);
  const searchParams = useSearchParams();
  const selectionParam = searchParams.get('select');
  const initialSelection = selectionParam === 'city' ? 'city' : selectionParam === 'none' ? 'none' : 'unit';

  useEffect(() => {
    // 初始化游戏
    if (!gameState) {
      const map = generateMap({ width: 20, height: 15 });
      const starterUnit = {
        id: 'unit-1',
        type: 'warrior',
        ownerId: 'player-1',
        position: { row: 7, col: 6 },
        health: 100,
        maxHealth: 100,
        movement: 2,
        maxMovement: 2,
        experience: 0,
        level: 1,
        state: 'idle' as const,
        promotions: [],
      };
      const starterCity = {
        id: 'city-1',
        name: '镐京',
        ownerId: 'player-1',
        position: { row: 7, col: 5 },
        population: 1,
        health: 200,
        maxHealth: 200,
        defenses: 10,
        buildings: [],
        productionQueue: [],
        workedTiles: [],
        yields: {
          food: 2,
          production: 1,
          gold: 1,
          science: 0,
          culture: 0,
          faith: 0,
          happiness: 5,
        },
        culture: 0,
        borders: [],
      };
      initializeGame({
        id: 'game-1',
        name: '测试游戏',
        map,
        initialSelection,
        players: [
          {
            id: 'player-1',
            name: '玩家1',
            civilization: 'qin',
            color: '#8B0000',
            leader: '秦穆公',
            isAI: false,
            isReady: true,
            cities: [],
            units: [],
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
        ],
        units: {
          [starterUnit.id]: starterUnit,
        },
        cities: {
          [starterCity.id]: starterCity,
        },
      });
    }
  }, [gameState, initializeGame, initialSelection]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.render_game_to_text = () => {
      if (!gameState) return JSON.stringify({ mode: 'loading' });
      const { selectedTile, selectedUnit, selectedCity } = useGameStore.getState();
      return JSON.stringify({
        mode: 'playing',
        turn: gameState.currentTurn,
        player: gameState.currentPlayerId,
        map: { width: gameState.map.width, height: gameState.map.height },
        units: Object.values(gameState.units).map(u => ({
          id: u.id,
          row: u.position.row,
          col: u.position.col,
          health: u.health,
          movement: u.movement,
          maxMovement: u.maxMovement,
        })),
        cities: Object.values(gameState.cities).map(c => ({
          id: c.id,
          row: c.position.row,
          col: c.position.col,
          productionQueue: c.productionQueue.length,
        })),
        selectedTile: selectedTile ? { row: selectedTile.row, col: selectedTile.col } : null,
        selectedUnit,
        selectedCity,
        activePanel: activePanel || null,
        message: uiMessage || null,
      });
    };

    window.advanceTime = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  }, [gameState, uiMessage, activePanel]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const canvas = testCanvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-bronze-100">
        <div className="text-center">
          <div className="text-4xl mb-4">🏛️</div>
          <h1 className="text-2xl font-oracle mb-2">加载游戏中...</h1>
          <div className="w-48 h-1 bg-bronze-800 rounded-full overflow-hidden">
            <div className="h-full bg-bronze-500 animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="h-screen flex flex-col bg-slate-900 overflow-hidden">
      <canvas
        ref={testCanvasRef}
        className="fixed top-0 left-0 pointer-events-none opacity-0"
        style={{ width: '100vw', height: '100vh' }}
        aria-hidden="true"
      />
      {/* 顶部资源栏 */}
      <ResourceBar />

      {/* 主游戏区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧信息面板 */}
        <div className="w-72 bg-slate-800/90 border-r border-slate-700 flex flex-col">
          <TurnPanel />
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <UnitPanel />
            <CityPanel />
          </div>
        </div>

        {/* 中间地图区域 */}
        <div className="flex-1 relative bg-slate-950">
          <GameMap />
          
          {/* 小地图 */}
          <div className="absolute bottom-4 right-4 z-10">
            <Minimap />
          </div>

          {activePanel && (
            <div className="absolute top-4 right-4 z-20 bg-slate-900/95 border border-bronze-600/50 rounded-lg px-4 py-3 text-bronze-100 shadow-lg">
              <div className="text-sm font-medium mb-1">
                {activePanel === 'tech' && '科技树'}
                {activePanel === 'diplomacy' && '外交'}
                {activePanel === 'stats' && '统计'}
                {activePanel === 'chat' && '聊天'}
                {activePanel === 'help' && '帮助'}
                {activePanel === 'settings' && '设置'}
              </div>
              <div className="text-xs text-bronze-300">该面板正在开发中</div>
            </div>
          )}
        </div>
      </div>

      {/* 底部操作栏 */}
      <ActionBar />

      {uiMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-bronze-800 text-bronze-50 px-4 py-2 rounded shadow-md text-sm">
          {uiMessage}
        </div>
      )}
    </main>
  );
}
