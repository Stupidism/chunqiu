import type { Unit, Position, GameMap, Tile } from '@chunqiu/types';

// 单位类型定义
interface UnitDefinition {
  type: string;
  name: string;
  maxHealth: number;
  movement: number;
  combatStrength: number;
  rangedStrength?: number;
  range?: number;
  cost: number;
  maintenance: number;
  resourceRequirements?: string[];
}

// 单位定义表
export const unitDefinitions: Record<string, UnitDefinition> = {
  warrior: {
    type: 'warrior',
    name: '战士',
    maxHealth: 100,
    movement: 2,
    combatStrength: 8,
    cost: 40,
    maintenance: 1,
  },
  archer: {
    type: 'archer',
    name: '弓箭手',
    maxHealth: 80,
    movement: 2,
    combatStrength: 4,
    rangedStrength: 7,
    range: 2,
    cost: 40,
    maintenance: 1,
  },
  chariot: {
    type: 'chariot',
    name: '战车',
    maxHealth: 100,
    movement: 4,
    combatStrength: 10,
    cost: 60,
    maintenance: 2,
  },
  spearman: {
    type: 'spearman',
    name: '矛兵',
    maxHealth: 100,
    movement: 2,
    combatStrength: 9,
    cost: 50,
    maintenance: 1,
  },
  swordsman: {
    type: 'swordsman',
    name: '剑士',
    maxHealth: 100,
    movement: 2,
    combatStrength: 14,
    cost: 75,
    maintenance: 2,
  },
  worker: {
    type: 'worker',
    name: '工人',
    maxHealth: 50,
    movement: 2,
    combatStrength: 0,
    cost: 50,
    maintenance: 0,
  },
  settler: {
    type: 'settler',
    name: '移民',
    maxHealth: 50,
    movement: 2,
    combatStrength: 0,
    cost: 80,
    maintenance: 0,
  },
  scout: {
    type: 'scout',
    name: '侦察兵',
    maxHealth: 60,
    movement: 3,
    combatStrength: 4,
    cost: 25,
    maintenance: 0,
  },
};

// 创建新单位
export function createUnit(
  type: string,
  ownerId: string,
  position: Position,
  id?: string
): Unit {
  const definition = unitDefinitions[type];
  if (!definition) {
    throw new Error(`Unknown unit type: ${type}`);
  }

  return {
    id: id || `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    ownerId,
    position,
    health: definition.maxHealth,
    maxHealth: definition.maxHealth,
    movement: definition.movement,
    maxMovement: definition.movement,
    experience: 0,
    level: 1,
    state: 'idle',
    promotions: [],
  };
}

// 地形移动力消耗
const terrainMovementCost: Record<string, number> = {
  grassland: 1,
  plains: 1,
  desert: 1,
  tundra: 1,
  coast: 1,
  ocean: 999, // 无法通过（除非有海军单位）
};

const elevationMovementCost: Record<string, number> = {
  flat: 0,
  hill: 1,
  mountain: 999, // 无法通过
};

// 计算移动到某个地块的消耗
export function calculateMovementCost(tile: Tile): number {
  const terrainCost = terrainMovementCost[tile.terrain] || 1;
  const elevationCost = elevationMovementCost[tile.elevation] || 0;
  return terrainCost + elevationCost;
}

// 检查单位是否可以移动到某个位置
export function canMoveTo(unit: Unit, tile: Tile, remainingMovement: number): boolean {
  const cost = calculateMovementCost(tile);
  if (cost >= 999) return false;
  return remainingMovement >= cost;
}

// 获取单位在地图上的视野范围
export function getVisionRange(unit: Unit): number {
  const baseVision = 2;
  // 侦察兵视野更远
  if (unit.type === 'scout') return 3;
  // 站在高地上视野更远
  return baseVision;
}

// 获取单位可以看到的所有地块
export function getVisibleTiles(unit: Unit, map: GameMap): Position[] {
  const visionRange = getVisionRange(unit);
  const visible: Position[] = [];

  for (let row = -visionRange; row <= visionRange; row++) {
    for (let col = -visionRange; col <= visionRange; col++) {
      const targetRow = unit.position.row + row;
      const targetCol = unit.position.col + col;
      
      // 检查是否在地图范围内
      if (
        targetRow >= 0 &&
        targetRow < map.height &&
        targetCol >= 0 &&
        targetCol < map.width
      ) {
        const distance = Math.abs(row) + Math.abs(col);
        if (distance <= visionRange) {
          visible.push({ row: targetRow, col: targetCol });
        }
      }
    }
  }

  return visible;
}

// 计算战斗伤害
export function calculateCombatDamage(
  attacker: Unit,
  defender: Unit,
  isRanged: boolean = false
): { attackerDamage: number; defenderDamage: number } {
  const attackerDef = unitDefinitions[attacker.type];
  const defenderDef = unitDefinitions[defender.type];

  if (!attackerDef || !defenderDef) {
    return { attackerDamage: 0, defenderDamage: 0 };
  }

  // 计算攻击强度
  let attackStrength = isRanged
    ? (attackerDef.rangedStrength || attackerDef.combatStrength)
    : attackerDef.combatStrength;

  // 应用生命值惩罚
  const attackerHealthFactor = attacker.health / attacker.maxHealth;
  attackStrength *= attackerHealthFactor;

  // 计算防御强度
  let defenseStrength = defenderDef.combatStrength;
  const defenderHealthFactor = defender.health / defender.maxHealth;
  defenseStrength *= defenderHealthFactor;

  // 基础伤害公式
  const baseDamage = 30;
  const strengthRatio = attackStrength / Math.max(defenseStrength, 1);

  // 攻击者受到的伤害（近战单位会受到反击）
  let attackerDamage = 0;
  if (!isRanged) {
    const defenderCounterRatio = defenseStrength / Math.max(attackStrength, 1);
    attackerDamage = Math.floor(baseDamage * defenderCounterRatio * 0.5);
  }

  // 防御者受到的伤害
  const defenderDamage = Math.floor(baseDamage * strengthRatio);

  return {
    attackerDamage: Math.min(attackerDamage, attacker.health),
    defenderDamage: Math.min(defenderDamage, defender.health),
  };
}

// 检查单位是否可以攻击
export function canAttack(attacker: Unit, target: Unit, distance: number): boolean {
  const attackerDef = unitDefinitions[attacker.type];
  if (!attackerDef) return false;

  // 检查是否是友方单位
  if (attacker.ownerId === target.ownerId) return false;

  // 检查移动力
  if (attacker.movement <= 0) return false;

  // 检查攻击范围
  if (attackerDef.range) {
    // 远程单位
    return distance <= attackerDef.range;
  } else {
    // 近战单位
    return distance <= 1;
  }
}

// 单位升级
export function levelUpUnit(unit: Unit): Unit {
  const newLevel = unit.level + 1;
  const maxHealthBonus = 10;

  return {
    ...unit,
    level: newLevel,
    maxHealth: unit.maxHealth + maxHealthBonus,
    health: Math.min(unit.health + maxHealthBonus, unit.maxHealth + maxHealthBonus),
    experience: 0,
  };
}

// 治疗单位
export function healUnit(unit: Unit, amount: number): Unit {
  return {
    ...unit,
    health: Math.min(unit.health + amount, unit.maxHealth),
  };
}

// 重置单位移动力（回合开始时调用）
export function resetUnitMovement(unit: Unit): Unit {
  return {
    ...unit,
    movement: unit.maxMovement,
    state: 'idle',
  };
}
