'use client';

import { useGameStore } from '@/stores/gameStore';
import { SingleResource } from '@chunqiu/ui';

const civilizationNames: Record<string, string> = {
  qin: '秦',
  qi: '齐',
  chu: '楚',
  jin: '晋',
  yan: '燕',
  wu: '吴',
  yue: '越',
  song: '宋',
  lu: '鲁',
  wei: '魏',
};

export function ResourceBar() {
  const { gameState } = useGameStore();

  if (!gameState) return null;

  const currentPlayer = gameState.players.find(
    p => p.id === gameState.currentPlayerId
  );

  if (!currentPlayer) return null;

  const { resources } = currentPlayer;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-bronze-600/50">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* 左侧：玩家信息 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-full border-2 border-bronze-400 flex items-center justify-center"
                style={{ backgroundColor: currentPlayer.color }}
              >
                <span className="text-white text-sm font-bold">
                  {civilizationNames[currentPlayer.civilization] || '?'}
                </span>
              </div>
              <div>
                <div className="text-bronze-100 font-medium text-sm">
                  {currentPlayer.name}
                </div>
                <div className="text-bronze-400 text-xs">
                  {currentPlayer.leader}
                </div>
              </div>
            </div>
          </div>

          {/* 中间：资源 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-yellow-500 text-lg">💰</span>
              <div className="text-right">
                <div className="text-yellow-400 font-bold text-sm">
                  {resources.gold}
                </div>
                <div className={`text-xs ${resources.goldPerTurn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {resources.goldPerTurn >= 0 ? '+' : ''}{resources.goldPerTurn}/回合
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-blue-400 text-lg">📜</span>
              <div className="text-right">
                <div className="text-blue-300 font-bold text-sm">
                  {resources.science}
                </div>
                <div className="text-green-400 text-xs">
                  +{resources.sciencePerTurn}/回合
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-purple-400 text-lg">🎭</span>
              <div className="text-right">
                <div className="text-purple-300 font-bold text-sm">
                  {resources.culture}
                </div>
                <div className="text-green-400 text-xs">
                  +{resources.culturePerTurn}/回合
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-emerald-400 text-lg">😊</span>
              <div className="text-right">
                <div className={`font-bold text-sm ${resources.happiness >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {resources.happiness}
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：回合信息 */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-bronze-200 text-xs">回合</div>
              <div className="text-bronze-100 font-bold text-lg">
                {gameState.currentTurn}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
