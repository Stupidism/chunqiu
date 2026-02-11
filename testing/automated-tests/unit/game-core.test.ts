/**
 * 游戏核心逻辑单元测试
 * 包括：地图系统、单位系统、战斗系统、回合系统
 */

import { describe, it, expect, beforeEach } from 'vitest';

// ============================================
// 1. 地图系统测试
// ============================================

describe('Map System', () => {
  let map: HexMap;

  beforeEach(() => {
    map = new HexMap(20, 15); // 20x15 错位四边形网格
  });

  describe('Grid Creation', () => {
    it('应该正确创建指定大小的地图', () => {
      expect(map.width).toBe(20);
      expect(map.height).toBe(15);
      expect(map.getTotalCells()).toBe(300);
    });

    it('应该正确初始化所有格子', () => {
      for (let x = 0; x < map.width; x++) {
        for (let y = 0; y < map.height; y++) {
          const cell = map.getCell(x, y);
          expect(cell).toBeDefined();
          expect(cell.x).toBe(x);
          expect(cell.y).toBe(y);
        }
      }
    });
  });

  describe('Hex Coordinate System', () => {
    it('应该正确计算错位偏移', () => {
      // 偶数行无偏移
      expect(map.getHexOffset(0)).toBe(0);
      expect(map.getHexOffset(2)).toBe(0);
      
      // 奇数行有偏移
      expect(map.getHexOffset(1)).toBe(0.5);
      expect(map.getHexOffset(3)).toBe(0.5);
    });

    it('应该正确计算邻居格子', () => {
      // 偶数行(0,0)的邻居
      const evenNeighbors = map.getNeighbors(0, 0);
      expect(evenNeighbors).toContainEqual({ x: 1, y: 0 });
      expect(evenNeighbors).toContainEqual({ x: 0, y: 1 });
      expect(evenNeighbors).toContainEqual({ x: 1, y: 1 });

      // 奇数行(0,1)的邻居
      const oddNeighbors = map.getNeighbors(0, 1);
      expect(oddNeighbors).toContainEqual({ x: 0, y: 0 });
      expect(oddNeighbors).toContainEqual({ x: 1, y: 0 });
      expect(oddNeighbors).toContainEqual({ x: 1, y: 1 });
    });

    it('边界格子应该有正确的邻居数量', () => {
      // 角落格子只有3个邻居
      const cornerNeighbors = map.getNeighbors(0, 0);
      expect(cornerNeighbors.length).toBe(3);

      // 中间格子有6个邻居
      const centerNeighbors = map.getNeighbors(10, 7);
      expect(centerNeighbors.length).toBe(6);
    });
  });

  describe('Terrain System', () => {
    it('应该支持多种地形', () => {
      map.setTerrain(0, 0, TerrainType.PLAIN);
      map.setTerrain(1, 0, TerrainType.FOREST);
      map.setTerrain(2, 0, TerrainType.MOUNTAIN);
      map.setTerrain(3, 0, TerrainType.RIVER);

      expect(map.getCell(0, 0).terrain).toBe(TerrainType.PLAIN);
      expect(map.getCell(1, 0).terrain).toBe(TerrainType.FOREST);
      expect(map.getCell(2, 0).terrain).toBe(TerrainType.MOUNTAIN);
      expect(map.getCell(3, 0).terrain).toBe(TerrainType.RIVER);
    });

    it('应该正确返回地形移动力消耗', () => {
      expect(getMovementCost(TerrainType.PLAIN)).toBe(1);
      expect(getMovementCost(TerrainType.FOREST)).toBe(2);
      expect(getMovementCost(TerrainType.MOUNTAIN)).toBe(3);
      expect(getMovementCost(TerrainType.RIVER)).toBe(2);
    });
  });

  describe('Fog of War', () => {
    it('应该正确计算视野范围', () => {
      // 在(10, 10)放置视野为2的单位
      const visibleCells = map.getVisibleCells(10, 10, 2);
      
      // 视野范围内的格子应该可见
      expect(visibleCells.some(c => c.x === 10 && c.y === 10)).toBe(true);
      expect(visibleCells.some(c => c.x === 11 && c.y === 10)).toBe(true);
      expect(visibleCells.some(c => c.x === 10 && c.y === 12)).toBe(true);
    });

    it('地形应该影响视野', () => {
      // 森林阻挡视野
      map.setTerrain(11, 10, TerrainType.FOREST);
      const visibleCells = map.getVisibleCells(10, 10, 3);
      
      // 森林后的格子可能不可见
      expect(visibleCells.some(c => c.x === 12 && c.y === 10)).toBe(false);
    });
  });
});

// ============================================
// 2. 单位系统测试
// ============================================

describe('Unit System', () => {
  let unit: Unit;

  beforeEach(() => {
    unit = new Unit({
      id: 'unit_1',
      type: UnitType.WARRIOR,
      owner: 'player_1',
      x: 5,
      y: 5,
      attack: 10,
      defense: 5,
      maxHealth: 100,
      movement: 3
    });
  });

  describe('Unit Creation', () => {
    it('应该正确创建单位', () => {
      expect(unit.id).toBe('unit_1');
      expect(unit.type).toBe(UnitType.WARRIOR);
      expect(unit.owner).toBe('player_1');
      expect(unit.x).toBe(5);
      expect(unit.y).toBe(5);
    });

    it('应该正确初始化单位属性', () => {
      expect(unit.attack).toBe(10);
      expect(unit.defense).toBe(5);
      expect(unit.maxHealth).toBe(100);
      expect(unit.currentHealth).toBe(100);
      expect(unit.movement).toBe(3);
      expect(unit.remainingMovement).toBe(3);
    });
  });

  describe('Unit Movement', () => {
    it('应该正确移动单位', () => {
      const result = unit.moveTo(6, 5);
      expect(result).toBe(true);
      expect(unit.x).toBe(6);
      expect(unit.y).toBe(5);
      expect(unit.remainingMovement).toBe(2);
    });

    it('移动力不足时不应该移动', () => {
      unit.remainingMovement = 0;
      const result = unit.moveTo(6, 5);
      expect(result).toBe(false);
      expect(unit.x).toBe(5);
      expect(unit.y).toBe(5);
    });

    it('超出移动力范围的移动应该失败', () => {
      // 尝试移动4格，但只有3点移动力
      const result = unit.moveTo(9, 5);
      expect(result).toBe(false);
    });

    it('新回合应该重置移动力', () => {
      unit.remainingMovement = 0;
      unit.onNewTurn();
      expect(unit.remainingMovement).toBe(3);
    });
  });

  describe('Unit Combat', () => {
    let enemyUnit: Unit;

    beforeEach(() => {
      enemyUnit = new Unit({
        id: 'unit_2',
        type: UnitType.WARRIOR,
        owner: 'player_2',
        x: 6,
        y: 5,
        attack: 8,
        defense: 4,
        maxHealth: 80,
        movement: 3
      });
    });

    it('应该正确计算伤害', () => {
      const damage = calculateDamage(unit, enemyUnit);
      // 伤害 = max(1, 攻击方攻击 - 防御方防御 + 随机波动[-2, +2])
      expect(damage).toBeGreaterThanOrEqual(4); // 10 - 4 - 2 = 4
      expect(damage).toBeLessThanOrEqual(8);    // 10 - 4 + 2 = 8
    });

    it('攻击应该造成伤害', () => {
      const initialHealth = enemyUnit.currentHealth;
      unit.attackTarget(enemyUnit);
      expect(enemyUnit.currentHealth).toBeLessThan(initialHealth);
    });

    it('单位死亡应该被标记', () => {
      enemyUnit.currentHealth = 1;
      unit.attackTarget(enemyUnit);
      expect(enemyUnit.isDead()).toBe(true);
    });

    it('死亡单位不应该能攻击', () => {
      unit.currentHealth = 0;
      expect(() => unit.attackTarget(enemyUnit)).toThrow('Unit is dead');
    });

    it('不能攻击友方单位', () => {
      const friendlyUnit = new Unit({
        id: 'unit_3',
        type: UnitType.WARRIOR,
        owner: 'player_1', // 同所有者
        x: 6,
        y: 5,
        attack: 8,
        defense: 4,
        maxHealth: 80,
        movement: 3
      });

      expect(() => unit.attackTarget(friendlyUnit)).toThrow('Cannot attack friendly unit');
    });
  });

  describe('Unit Experience', () => {
    it('击杀单位应该获得经验', () => {
      const enemyUnit = new Unit({
        id: 'unit_2',
        type: UnitType.WARRIOR,
        owner: 'player_2',
        x: 6,
        y: 5,
        attack: 8,
        defense: 4,
        maxHealth: 1,
        movement: 3
      });

      const initialExp = unit.experience;
      unit.attackTarget(enemyUnit);
      expect(unit.experience).toBeGreaterThan(initialExp);
    });

    it('经验足够应该升级', () => {
      unit.experience = 90;
      unit.addExperience(20); // 超过100
      expect(unit.level).toBe(2);
    });

    it('升级应该提升属性', () => {
      const initialAttack = unit.attack;
      unit.levelUp();
      expect(unit.attack).toBeGreaterThan(initialAttack);
    });
  });
});

// ============================================
// 3. 回合系统测试
// ============================================

describe('Turn System', () => {
  let turnManager: TurnManager;

  beforeEach(() => {
    turnManager = new TurnManager({
      players: ['player_1', 'player_2', 'player_3'],
      mode: TurnMode.SIMULTANEOUS,
      turnTimeLimit: 60
    });
  });

  describe('Turn Initialization', () => {
    it('应该正确初始化回合管理器', () => {
      expect(turnManager.currentTurn).toBe(1);
      expect(turnManager.currentPlayer).toBe('player_1');
      expect(turnManager.mode).toBe(TurnMode.SIMULTANEOUS);
    });
  });

  describe('Simultaneous Turn', () => {
    it('所有玩家结束回合后应该进入下一回合', () => {
      turnManager.endTurn('player_1');
      expect(turnManager.currentTurn).toBe(1); // 还是第1回合

      turnManager.endTurn('player_2');
      expect(turnManager.currentTurn).toBe(1);

      turnManager.endTurn('player_3');
      expect(turnManager.currentTurn).toBe(2); // 进入第2回合
    });

    it('玩家不应该能重复结束回合', () => {
      turnManager.endTurn('player_1');
      expect(() => turnManager.endTurn('player_1')).toThrow('Already ended turn');
    });

    it('超时应该自动结束回合', () => {
      vi.advanceTimersByTime(61000); // 超过60秒
      expect(turnManager.currentTurn).toBe(2);
    });
  });

  describe('Sequential Turn', () => {
    beforeEach(() => {
      turnManager = new TurnManager({
        players: ['player_1', 'player_2'],
        mode: TurnMode.SEQUENTIAL
      });
    });

    it('应该按顺序切换玩家', () => {
      expect(turnManager.currentPlayer).toBe('player_1');
      
      turnManager.endTurn('player_1');
      expect(turnManager.currentPlayer).toBe('player_2');
      
      turnManager.endTurn('player_2');
      expect(turnManager.currentTurn).toBe(2);
      expect(turnManager.currentPlayer).toBe('player_1');
    });
  });

  describe('Turn Events', () => {
    it('新回合应该触发事件', () => {
      const onNewTurn = vi.fn();
      turnManager.on('newTurn', onNewTurn);
      
      turnManager.endTurn('player_1');
      turnManager.endTurn('player_2');
      turnManager.endTurn('player_3');
      
      expect(onNewTurn).toHaveBeenCalledWith({ turn: 2 });
    });
  });
});

// ============================================
// 4. 路径查找测试
// ============================================

describe('Pathfinding', () => {
  let map: HexMap;
  let pathfinder: Pathfinder;

  beforeEach(() => {
    map = new HexMap(20, 15);
    pathfinder = new Pathfinder(map);
  });

  describe('A* Pathfinding', () => {
    it('应该找到直线路径', () => {
      const path = pathfinder.findPath(0, 0, 3, 0);
      expect(path).not.toBeNull();
      expect(path!.length).toBe(4); // 包含起点和终点
    });

    it('应该绕过障碍物', () => {
      // 设置障碍物
      map.setObstacle(1, 0, true);
      map.setObstacle(1, 1, true);

      const path = pathfinder.findPath(0, 0, 3, 0);
      expect(path).not.toBeNull();
      // 路径应该绕过障碍物
      expect(path!.some(p => p.x === 1 && p.y === 0)).toBe(false);
    });

    it('无路可走时应该返回null', () => {
      // 完全包围起点
      map.setObstacle(1, 0, true);
      map.setObstacle(0, 1, true);
      map.setObstacle(1, 1, true);

      const path = pathfinder.findPath(0, 0, 5, 5);
      expect(path).toBeNull();
    });

    it('应该考虑地形消耗', () => {
      // 设置森林地形（消耗2）
      map.setTerrain(1, 0, TerrainType.FOREST);
      
      const path = pathfinder.findPath(0, 0, 2, 0);
      const movementCost = pathfinder.calculateMovementCost(path!);
      
      // 经过森林的路径消耗更高
      expect(movementCost).toBeGreaterThan(path!.length - 1);
    });
  });
});

// ============================================
// 5. 资源系统测试
// ============================================

describe('Resource System', () => {
  let resourceManager: ResourceManager;

  beforeEach(() => {
    resourceManager = new ResourceManager({
      gold: 100,
      food: 50,
      production: 30,
      science: 0
    });
  });

  describe('Resource Management', () => {
    it('应该正确增加资源', () => {
      resourceManager.addResource('gold', 50);
      expect(resourceManager.getResource('gold')).toBe(150);
    });

    it('应该正确消耗资源', () => {
      const result = resourceManager.consumeResource('gold', 30);
      expect(result).toBe(true);
      expect(resourceManager.getResource('gold')).toBe(70);
    });

    it('资源不足时不应该消耗', () => {
      const result = resourceManager.consumeResource('gold', 200);
      expect(result).toBe(false);
      expect(resourceManager.getResource('gold')).toBe(100);
    });

    it('应该正确检查资源是否足够', () => {
      expect(resourceManager.hasEnough({ gold: 50 })).toBe(true);
      expect(resourceManager.hasEnough({ gold: 150 })).toBe(false);
      expect(resourceManager.hasEnough({ gold: 50, food: 60 })).toBe(false);
    });
  });

  describe('Resource Production', () => {
    it('新回合应该产出资源', () => {
      resourceManager.setProduction({ gold: 10, food: 5 });
      resourceManager.onNewTurn();
      
      expect(resourceManager.getResource('gold')).toBe(110);
      expect(resourceManager.getResource('food')).toBe(55);
    });
  });
});

// ============================================
// 类型定义和辅助函数
// ============================================

enum TerrainType {
  PLAIN = 'plain',
  FOREST = 'forest',
  MOUNTAIN = 'mountain',
  RIVER = 'river',
  OCEAN = 'ocean'
}

enum UnitType {
  WARRIOR = 'warrior',
  ARCHER = 'archer',
  CAVALRY = 'cavalry',
  SIEGE = 'siege'
}

enum TurnMode {
  SIMULTANEOUS = 'simultaneous',
  SEQUENTIAL = 'sequential'
}

// 简化实现用于测试
class HexMap {
  width: number;
  height: number;
  private cells: MapCell[][];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.cells = Array(height).fill(null).map((_, y) =>
      Array(width).fill(null).map((_, x) => ({
        x, y,
        terrain: TerrainType.PLAIN,
        obstacle: false
      }))
    );
  }

  getCell(x: number, y: number): MapCell {
    return this.cells[y]?.[x];
  }

  getTotalCells(): number {
    return this.width * this.height;
  }

  getHexOffset(y: number): number {
    return y % 2 === 0 ? 0 : 0.5;
  }

  getNeighbors(x: number, y: number): { x: number; y: number }[] {
    const neighbors: { x: number; y: number }[] = [];
    const directions = y % 2 === 0
      ? [[1, 0], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1]]
      : [[1, 0], [1, 1], [0, 1], [-1, 0], [0, -1], [1, -1]];

    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
        neighbors.push({ x: nx, y: ny });
      }
    }
    return neighbors;
  }

  setTerrain(x: number, y: number, terrain: TerrainType): void {
    if (this.cells[y]?.[x]) {
      this.cells[y][x].terrain = terrain;
    }
  }

  setObstacle(x: number, y: number, obstacle: boolean): void {
    if (this.cells[y]?.[x]) {
      this.cells[y][x].obstacle = obstacle;
    }
  }

  getVisibleCells(x: number, y: number, range: number): { x: number; y: number }[] {
    // 简化实现
    const visible: { x: number; y: number }[] = [];
    for (let dx = -range; dx <= range; dx++) {
      for (let dy = -range; dy <= range; dy++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
          const cell = this.getCell(nx, ny);
          if (!cell.obstacle && Math.abs(dx) + Math.abs(dy) <= range * 1.5) {
            visible.push({ x: nx, y: ny });
          }
        }
      }
    }
    return visible;
  }
}

interface MapCell {
  x: number;
  y: number;
  terrain: TerrainType;
  obstacle: boolean;
}

function getMovementCost(terrain: TerrainType): number {
  const costs: Record<TerrainType, number> = {
    [TerrainType.PLAIN]: 1,
    [TerrainType.FOREST]: 2,
    [TerrainType.MOUNTAIN]: 3,
    [TerrainType.RIVER]: 2,
    [TerrainType.OCEAN]: 999
  };
  return costs[terrain] || 1;
}

interface UnitData {
  id: string;
  type: UnitType;
  owner: string;
  x: number;
  y: number;
  attack: number;
  defense: number;
  maxHealth: number;
  movement: number;
}

class Unit {
  id: string;
  type: UnitType;
  owner: string;
  x: number;
  y: number;
  attack: number;
  defense: number;
  maxHealth: number;
  currentHealth: number;
  movement: number;
  remainingMovement: number;
  experience: number;
  level: number;

  constructor(data: UnitData) {
    Object.assign(this, data);
    this.currentHealth = data.maxHealth;
    this.remainingMovement = data.movement;
    this.experience = 0;
    this.level = 1;
  }

  moveTo(x: number, y: number): boolean {
    const distance = Math.abs(x - this.x) + Math.abs(y - this.y);
    if (this.remainingMovement >= distance && distance > 0) {
      this.x = x;
      this.y = y;
      this.remainingMovement -= distance;
      return true;
    }
    return false;
  }

  onNewTurn(): void {
    this.remainingMovement = this.movement;
  }

  isDead(): boolean {
    return this.currentHealth <= 0;
  }

  attackTarget(target: Unit): void {
    if (this.isDead()) throw new Error('Unit is dead');
    if (this.owner === target.owner) throw new Error('Cannot attack friendly unit');

    const damage = calculateDamage(this, target);
    target.currentHealth -= damage;

    if (target.isDead()) {
      this.addExperience(10);
    }
  }

  addExperience(exp: number): void {
    this.experience += exp;
    if (this.experience >= 100) {
      this.levelUp();
    }
  }

  levelUp(): void {
    this.level++;
    this.experience = 0;
    this.attack += 2;
    this.defense += 1;
    this.maxHealth += 10;
    this.currentHealth = this.maxHealth;
  }
}

function calculateDamage(attacker: Unit, defender: Unit): number {
  const baseDamage = Math.max(1, attacker.attack - defender.defense);
  const randomFactor = Math.floor(Math.random() * 5) - 2; // -2 to +2
  return Math.max(1, baseDamage + randomFactor);
}

interface TurnManagerConfig {
  players: string[];
  mode: TurnMode;
  turnTimeLimit?: number;
}

class TurnManager {
  currentTurn: number;
  currentPlayer: string;
  mode: TurnMode;
  players: string[];
  endedTurns: Set<string>;
  turnTimeLimit: number;
  private events: Map<string, Function[]>;

  constructor(config: TurnManagerConfig) {
    this.players = config.players;
    this.mode = config.mode;
    this.currentTurn = 1;
    this.currentPlayer = config.players[0];
    this.endedTurns = new Set();
    this.turnTimeLimit = config.turnTimeLimit || 60;
    this.events = new Map();
  }

  endTurn(playerId: string): void {
    if (this.endedTurns.has(playerId)) {
      throw new Error('Already ended turn');
    }

    this.endedTurns.add(playerId);

    if (this.mode === TurnMode.SIMULTANEOUS) {
      if (this.endedTurns.size === this.players.length) {
        this.nextTurn();
      }
    } else {
      const currentIndex = this.players.indexOf(this.currentPlayer);
      const nextIndex = (currentIndex + 1) % this.players.length;
      this.currentPlayer = this.players[nextIndex];
      
      if (nextIndex === 0) {
        this.nextTurn();
      }
    }
  }

  private nextTurn(): void {
    this.currentTurn++;
    this.endedTurns.clear();
    this.currentPlayer = this.players[0];
    this.emit('newTurn', { turn: this.currentTurn });
  }

  on(event: string, callback: Function): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
  }

  private emit(event: string, data: any): void {
    this.events.get(event)?.forEach(cb => cb(data));
  }
}

class Pathfinder {
  constructor(private map: HexMap) {}

  findPath(startX: number, startY: number, endX: number, endY: number): { x: number; y: number }[] | null {
    // 简化A*实现
    const path: { x: number; y: number }[] = [];
    let currentX = startX;
    let currentY = startY;

    path.push({ x: currentX, y: currentY });

    while (currentX !== endX || currentY !== endY) {
      if (currentX < endX) currentX++;
      else if (currentX > endX) currentX--;
      else if (currentY < endY) currentY++;
      else if (currentY > endY) currentY--;

      if (this.map.getCell(currentX, currentY)?.obstacle) {
        return null;
      }

      path.push({ x: currentX, y: currentY });
    }

    return path;
  }

  calculateMovementCost(path: { x: number; y: number }[]): number {
    let cost = 0;
    for (let i = 1; i < path.length; i++) {
      const cell = this.map.getCell(path[i].x, path[i].y);
      cost += getMovementCost(cell?.terrain || TerrainType.PLAIN);
    }
    return cost;
  }
}

interface Resources {
  gold: number;
  food: number;
  production: number;
  science: number;
}

class ResourceManager {
  private resources: Resources;
  private production: Partial<Resources> = {};

  constructor(initial: Resources) {
    this.resources = { ...initial };
  }

  getResource(type: keyof Resources): number {
    return this.resources[type];
  }

  addResource(type: keyof Resources, amount: number): void {
    this.resources[type] += amount;
  }

  consumeResource(type: keyof Resources, amount: number): boolean {
    if (this.resources[type] >= amount) {
      this.resources[type] -= amount;
      return true;
    }
    return false;
  }

  hasEnough(required: Partial<Resources>): boolean {
    return Object.entries(required).every(
      ([type, amount]) => this.resources[type as keyof Resources] >= amount!
    );
  }

  setProduction(production: Partial<Resources>): void {
    this.production = production;
  }

  onNewTurn(): void {
    Object.entries(this.production).forEach(([type, amount]) => {
      this.resources[type as keyof Resources] += amount || 0;
    });
  }
}
