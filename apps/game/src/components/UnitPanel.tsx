'use client';

import { Button, Card, CardContent, CardHeader, CardTitle, OracleIcon } from '@chunqiu/ui';
import { useGameStore } from '@/stores/gameStore';
import { unitDefinitions } from '@chunqiu/game-core';

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

const iconBase = '/oracle-bone-icons';
const unitIcons: Record<string, { src: string; fallback: string }> = {
  warrior: { src: `${iconBase}/eras/剑.svg`, fallback: '⚔️' },
  archer: { src: `${iconBase}/status/击.svg`, fallback: '🏹' },
  chariot: { src: `${iconBase}/status/足.svg`, fallback: '🛺' },
  spearman: { src: `${iconBase}/status/盾.svg`, fallback: '🔱' },
  swordsman: { src: `${iconBase}/eras/剑.svg`, fallback: '🗡️' },
  worker: { src: `${iconBase}/status/造.svg`, fallback: '🔨' },
  settler: { src: `${iconBase}/buildings/市.svg`, fallback: '🏠' },
  scout: { src: `${iconBase}/status/医.svg`, fallback: '🔭' },
};
const actionIcons = {
  move: `${iconBase}/status/足.svg`,
  fortify: `${iconBase}/status/盾.svg`,
  skip: `${iconBase}/status/毁.svg`,
  attack: `${iconBase}/status/击.svg`,
};

export function UnitPanel() {
  const {
    gameState,
    selectedUnit,
    selectedTile,
    activeAction,
    setActiveAction,
    fortifyUnit,
    skipUnit,
    attack,
    showMessage,
  } = useGameStore();

  if (!gameState || !selectedUnit) {
    return (
      <Card variant="ink" className="opacity-50">
        <CardHeader>
          <CardTitle className="text-sm text-bronze-100">单位信息</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-bronze-300 text-center py-4">
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
    <Card variant="ink" className="bg-slate-900/85 border-bronze-600/40">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2 text-bronze-100">
            {unitIcons[unit.type]?.src ? (
              <OracleIcon
                src={unitIcons[unit.type].src}
                size={22}
                label={unitTypeNames[unit.type] || unit.type}
                tone="text-bronze-100"
              />
            ) : (
              <span className="text-2xl">{unitIcons[unit.type]?.fallback}</span>
            )}
            <span>{unitTypeNames[unit.type]}</span>
          </CardTitle>
          <span className="text-xs text-bronze-300">
            Lv.{unit.level}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-bronze-100">
        {/* 生命值 */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-bronze-300">生命值</span>
            <span className="font-medium">{unit.health}/{unit.maxHealth}</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
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
            <span className="text-bronze-300">移动力</span>
            <span className="font-medium">{unit.movement}/{unit.maxMovement}</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${(unit.movement / unit.maxMovement) * 100}%` }}
            />
          </div>
        </div>

        {/* 经验值 */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-bronze-300">经验值</span>
            <span className="font-medium">{unit.experience}/100</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all"
              style={{ width: `${(unit.experience / 100) * 100}%` }}
            />
          </div>
        </div>

        {/* 属性 */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-800/70 p-2 rounded">
            <span className="text-bronze-300 block">战斗力</span>
            <span className="font-bold text-lg text-bronze-100">{definition?.combatStrength || '-'}</span>
          </div>
          {definition?.rangedStrength && (
            <div className="bg-slate-800/70 p-2 rounded">
              <span className="text-bronze-300 block">远程攻击力</span>
              <span className="font-bold text-lg text-bronze-100">{definition.rangedStrength}</span>
            </div>
          )}
          {definition?.range && (
            <div className="bg-slate-800/70 p-2 rounded">
              <span className="text-bronze-300 block">射程</span>
              <span className="font-bold text-lg text-bronze-100">{definition.range}</span>
            </div>
          )}
        </div>

        {/* 状态 */}
        <div className="text-xs">
          <span className="text-bronze-300">状态: </span>
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
        {unit.state !== 'fortified' && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-bronze-700/60">
            <Button
              size="sm"
              variant="outline"
              className="text-xs text-bronze-100 border-bronze-500/60"
              data-testid="unit-move"
              disabled={unit.movement <= 0}
              onClick={() => {
                if (unit.movement <= 0) {
                  showMessage('移动力不足');
                  return;
                }
                if (activeAction === 'move') {
                  setActiveAction(null);
                  showMessage('已取消移动');
                  return;
                }
                setActiveAction('move');
                showMessage('请选择目标地块');
              }}
            >
              <OracleIcon src={actionIcons.move} size={12} tone="text-bronze-100" />
              {activeAction === 'move' ? '选择目标' : '移动'}
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs text-bronze-100 border-bronze-500/60"
              data-testid="unit-fortify"
              onClick={() => fortifyUnit(unit.id)}
            >
              <OracleIcon src={actionIcons.fortify} size={12} tone="text-bronze-100" />
              加固
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs text-bronze-100 border-bronze-500/60"
              data-testid="unit-skip"
              onClick={() => skipUnit(unit.id)}
            >
              <OracleIcon src={actionIcons.skip} size={12} tone="text-bronze-100" />
              跳过
            </Button>
            {definition?.combatStrength > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs text-bronze-100 border-bronze-500/60"
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
                <OracleIcon src={actionIcons.attack} size={12} tone="text-bronze-100" />
                攻击
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
