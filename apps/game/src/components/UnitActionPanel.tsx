'use client';

import { Button, OracleIcon } from '@chunqiu/ui';
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
const unitIcons: Record<string, string> = {
  warrior: `${iconBase}/eras/剑.svg`,
  archer: `${iconBase}/status/击.svg`,
  chariot: `${iconBase}/status/足.svg`,
  spearman: `${iconBase}/status/盾.svg`,
  swordsman: `${iconBase}/eras/剑.svg`,
  worker: `${iconBase}/status/造.svg`,
  settler: `${iconBase}/buildings/市.svg`,
  scout: `${iconBase}/status/医.svg`,
};
const actionIcons = {
  move: `${iconBase}/status/足.svg`,
  fortify: `${iconBase}/status/盾.svg`,
  skip: `${iconBase}/status/毁.svg`,
  attack: `${iconBase}/status/击.svg`,
};

export function UnitActionPanel() {
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

  if (!gameState || !selectedUnit) return null;
  const unit = gameState.units[selectedUnit];
  if (!unit) return null;
  const definition = unitDefinitions[unit.type];

  const actions = [
    {
      id: 'move',
      label: activeAction === 'move' ? '选择目标' : '移动',
      icon: actionIcons.move,
      disabled: unit.movement <= 0,
      onClick: () => {
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
      },
    },
    {
      id: 'fortify',
      label: '加固',
      icon: actionIcons.fortify,
      onClick: () => fortifyUnit(unit.id),
    },
    {
      id: 'skip',
      label: '跳过',
      icon: actionIcons.skip,
      onClick: () => skipUnit(unit.id),
    },
    definition?.combatStrength
      ? {
          id: 'attack',
          label: '攻击',
          icon: actionIcons.attack,
          onClick: () => {
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
          },
        }
      : null,
  ].filter(Boolean) as Array<{
    id: string;
    label: string;
    icon: string;
    disabled?: boolean;
    onClick: () => void;
  }>;

  return (
    <div className="bg-slate-900/90 border border-bronze-600/40 rounded-lg px-3 py-3 min-w-[260px] shadow-lg backdrop-blur pointer-events-auto">
      <div className="flex items-center gap-2 text-bronze-100 text-sm mb-3 border-b border-bronze-700/40 pb-2">
        <div className="w-9 h-9 rounded-full border border-bronze-600/60 bg-slate-900/80 flex items-center justify-center">
          <OracleIcon
            src={unitIcons[unit.type] || unitIcons.warrior}
            size={18}
            tone="text-bronze-100"
            label={unitTypeNames[unit.type] || unit.type}
          />
        </div>
        <div className="flex flex-col">
          <span className="font-medium">{unitTypeNames[unit.type]}</span>
          <span className="text-[11px] text-bronze-300">
            生命 {unit.health}/{unit.maxHealth} · 移动 {unit.movement}/{unit.maxMovement}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {actions.map(action => (
          <Button
            key={action.id}
            size="sm"
            variant="outline"
            className={`text-xs text-bronze-100 border-bronze-500/60 ${
              activeAction === 'move' && action.id === 'move'
                ? 'bg-bronze-700/30'
                : ''
            }`}
            data-testid={`unit-${action.id}`}
            disabled={action.disabled}
            onClick={action.onClick}
          >
            <OracleIcon src={action.icon} size={12} tone="text-bronze-100" />
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
