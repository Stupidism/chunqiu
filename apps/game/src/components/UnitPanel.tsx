'use client';

import { Button, Card, CardContent, CardHeader, CardTitle } from '@chunqiu/ui';
import { useGameStore } from '@/stores/gameStore';
import { unitDefinitions } from '@chunqiu/game-core';
import { Move, Shield, SkipForward, Swords } from 'lucide-react';

const unitTypeNames: Record<string, string> = {
  warrior: '战士',
  archer: '弓箭手',
  chariot: '战车',
  spearman: '矛兵',
  swordsman: '剑士',
  worker: '工人',
  settler: '移民',
  scout: '侦察兵',
};

const unitIcons: Record<string, string> = {
  warrior: '⚔️',
  archer: '🏹',
  chariot: '🛺',
  spearman: '🔱',
  swordsman: '🗡️',
  worker: '🔨',
  settler: '🏠',
  scout: '🔭',
};

export function UnitPanel() {
  const { gameState, selectedUnit, selectedTile, moveUnit, fortifyUnit, skipUnit, attack, showMessage } = useGameStore();

  if (!gameState || !selectedUnit) {
    return (
      <Card className="opacity-50">
        <CardHeader>
          <CardTitle className="text-sm">单位信息</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-bronze-500 text-center py-4">
            选择一个单位查看详情
          </p>
        </CardContent>
      </Card>
    );
  }

  const unit = gameState.units[selectedUnit];
  if (!unit) return null;

  const definition = unitDefinitions[unit.type];
  const healthPercent = (unit.health / unit.maxHealth) * 100;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <span className="text-2xl">{unitIcons[unit.type]}</span>
            <span>{unitTypeNames[unit.type]}</span>
          </CardTitle>
          <span className="text-xs text-bronze-500">
            Lv.{unit.level}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 生命值 */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-bronze-600">生命值</span>
            <span className="font-medium">{unit.health}/{unit.maxHealth}</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                healthPercent > 60 ? 'bg-green-500' : healthPercent > 30 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${healthPercent}%` }}
            />
          </div>
        </div>

        {/* 移动力 */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-bronze-600">移动力</span>
            <span className="font-medium">{unit.movement}/{unit.maxMovement}</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${(unit.movement / unit.maxMovement) * 100}%` }}
            />
          </div>
        </div>

        {/* 经验值 */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-bronze-600">经验值</span>
            <span className="font-medium">{unit.experience}/100</span>
          </div>
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all"
              style={{ width: `${(unit.experience / 100) * 100}%` }}
            />
          </div>
        </div>

        {/* 属性 */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-100 p-2 rounded">
            <span className="text-bronze-600 block">战斗力</span>
            <span className="font-bold text-lg">{definition?.combatStrength || '-'}</span>
          </div>
          {definition?.rangedStrength && (
            <div className="bg-slate-100 p-2 rounded">
              <span className="text-bronze-600 block">远程攻击力</span>
              <span className="font-bold text-lg">{definition.rangedStrength}</span>
            </div>
          )}
          {definition?.range && (
            <div className="bg-slate-100 p-2 rounded">
              <span className="text-bronze-600 block">射程</span>
              <span className="font-bold text-lg">{definition.range}</span>
            </div>
          )}
        </div>

        {/* 状态 */}
        <div className="text-xs">
          <span className="text-bronze-600">状态: </span>
          <span className={`font-medium ${
            unit.state === 'idle' ? 'text-green-600' :
            unit.state === 'fortified' ? 'text-blue-600' :
            unit.state === 'sentry' ? 'text-gray-600' :
            'text-yellow-600'
          }`}>
            {unit.state === 'idle' ? '待命' :
             unit.state === 'fortified' ? '加固' :
             unit.state === 'sentry' ? '警戒' :
             unit.state === 'moving' ? '移动中' : '未知'}
          </span>
        </div>

        {/* 操作按钮 */}
        {unit.movement > 0 && unit.state !== 'fortified' && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-bronze-200">
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              data-testid="unit-move"
              onClick={() => {
                if (!selectedTile) {
                  showMessage('请先选择目标地块');
                  return;
                }
                if (selectedTile.row === unit.position.row && selectedTile.col === unit.position.col) {
                  showMessage('已在该地块');
                  return;
                }
                moveUnit(unit.id, selectedTile);
                showMessage('单位已移动');
              }}
            >
              <Move className="w-3 h-3 mr-1" />
              移动
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs"
              data-testid="unit-fortify"
              onClick={() => fortifyUnit(unit.id)}
            >
              <Shield className="w-3 h-3 mr-1" />
              加固
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs"
              data-testid="unit-skip"
              onClick={() => skipUnit(unit.id)}
            >
              <SkipForward className="w-3 h-3 mr-1" />
              跳过
            </Button>
            {definition?.combatStrength > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                data-testid="unit-attack"
                onClick={() => {
                  if (!selectedTile) {
                    showMessage('请选择攻击目标');
                    return;
                  }
                  const target = Object.values(gameState.units).find(
                    u =>
                      u.position.row === selectedTile.row &&
                      u.position.col === selectedTile.col &&
                      u.ownerId !== unit.ownerId
                  );
                  if (!target) {
                    showMessage('目标不可攻击');
                    return;
                  }
                  attack(unit.id, target.id);
                  showMessage('已发起攻击');
                }}
              >
                <Swords className="w-3 h-3 mr-1" />
                攻击
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
