'use client';

import { Button, Card, CardContent } from '@chunqiu/ui';
import { useGameStore } from '@/stores/gameStore';
import { SkipForward, Flag } from 'lucide-react';

export function TurnPanel() {
  const { gameState, endTurn, showMessage } = useGameStore();

  if (!gameState) return null;

  const currentPlayer = gameState.players.find(
    p => p.id === gameState.currentPlayerId
  );

  // 检查是否还有未行动的单位
  const pendingUnits = Object.values(gameState.units).filter(
    u => u.ownerId === gameState.currentPlayerId && u.movement > 0 && u.state === 'idle'
  );

  return (
    <Card className="m-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs text-bronze-500">当前回合</div>
            <div className="text-2xl font-bold text-bronze-900">
              {gameState.currentTurn}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-bronze-500">当前玩家</div>
            <div className="font-medium text-bronze-800">
              {currentPlayer?.name}
            </div>
          </div>
        </div>

        {pendingUnits.length > 0 && (
          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
            还有 {pendingUnits.length} 个单位未行动
          </div>
        )}

        <Button 
          className="w-full"
          data-testid="turn-end"
          onClick={endTurn}
        >
          <SkipForward className="w-4 h-4 mr-2" />
          结束回合
        </Button>

        <Button 
          variant="outline" 
          className="w-full mt-2"
          size="sm"
          data-testid="turn-surrender"
          onClick={() => showMessage('投降功能开发中')}
        >
          <Flag className="w-4 h-4 mr-2" />
          投降
        </Button>
      </CardContent>
    </Card>
  );
}
