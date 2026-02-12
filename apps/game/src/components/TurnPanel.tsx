'use client';

import { useGameStore } from '@/stores/gameStore';

export function TurnPanel() {
  const { gameState, endTurn, showMessage } = useGameStore();

  if (!gameState) return null;

  const currentPlayer = gameState.players.find(
    p => p.id === gameState.currentPlayerId
  );

  const pendingUnits = Object.values(gameState.units).filter(
    u => u.ownerId === gameState.currentPlayerId && u.movement > 0 && u.state === 'idle'
  );

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="bg-slate-900/85 border border-bronze-600/40 rounded px-3 py-2 text-xs text-bronze-200 shadow-lg backdrop-blur">
        <div className="flex items-center gap-3">
          <div>
            <div className="text-bronze-400">回合</div>
            <div className="text-bronze-100 text-lg font-semibold">{gameState.currentTurn}</div>
          </div>
          <div className="text-right">
            <div className="text-bronze-400">当前玩家</div>
            <div className="text-bronze-100">{currentPlayer?.name}</div>
          </div>
        </div>
      </div>

      {pendingUnits.length > 0 && (
        <div className="bg-amber-900/80 border border-amber-500/60 text-amber-100 px-3 py-1 rounded text-xs shadow">
          还有 {pendingUnits.length} 个单位未行动
        </div>
      )}

      <button
        type="button"
        data-testid="turn-end"
        onClick={endTurn}
        className="relative w-28 h-28 rounded-full bg-gradient-to-br from-bronze-400 via-bronze-600 to-bronze-800 border-4 border-bronze-300 shadow-[0_10px_20px_rgba(0,0,0,0.4)] text-bronze-50 hover:scale-[1.02] transition-transform"
      >
        <div className="absolute inset-2 rounded-full border border-bronze-200/60 bg-slate-900/25" />
        <div className="relative flex flex-col items-center justify-center text-xs font-semibold tracking-wide">
          <span className="text-[11px] uppercase">下一回合</span>
          <span className="text-2xl font-bold">{gameState.currentTurn + 1}</span>
        </div>
      </button>

      <button
        type="button"
        data-testid="turn-surrender"
        onClick={() => showMessage('投降功能开发中')}
        className="text-xs text-bronze-200 hover:text-bronze-100 px-3 py-1 rounded border border-bronze-600/50 bg-slate-900/70"
      >
        投降
      </button>
    </div>
  );
}
