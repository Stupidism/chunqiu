import type { City, Tile, Position, Yields, Building, ProductionItem, GameMap } from '@chunqiu/types';
import { calculateTileYields } from './mapGenerator';

// 建筑定义
interface BuildingDefinition {
  id: string;
  name: string;
  type: string;
  productionCost: number;
  maintenance: number;
  effects: Partial<Yields>;
  prerequisites?: string[];
}

// 建筑定义表
export const buildingDefinitions: Record<string, BuildingDefinition> = {
  monument: {
    id: 'monument',
    name: '纪念碑',
    type: 'culture',
    productionCost: 40,
    maintenance: 0,
    effects: { culture: 2 },
  },
  granary: {
    id: 'granary',
    name: '粮仓',
    type: 'food',
    productionCost: 60,
    maintenance: 1,
    effects: { food: 2 },
  },
  barracks: {
    id: 'barracks',
    name: '军营',
    type: 'military',
    productionCost: 75,
    maintenance: 1,
    effects: { production: 1 },
  },
  library: {
    id: 'library',
    name: '图书馆',
    type: 'science',
    productionCost: 75,
    maintenance: 1,
    effects: { science: 2 },
  },
  market: {
    id: 'market',
    name: '市场',
    type: 'gold',
    productionCost: 75,
    maintenance: 0,
    effects: { gold: 2 },
  },
  workshop: {
    id: 'workshop',
    name: '工坊',
    type: 'production',
    productionCost: 100,
    maintenance: 2,
    effects: { production: 2 },
  },
  temple: {
    id: 'temple',
    name: '神庙',
    type: 'culture',
    productionCost: 100,
    maintenance: 2,
    effects: { culture: 3 },
  },
  courthouse: {
    id: 'courthouse',
    name: '法院',
    type: 'administration',
    productionCost: 100,
    maintenance: 0,
    effects: {},
  },
};

// 创建新城市
export function createCity(
  name: string,
  ownerId: string,
  position: Position,
  id?: string
): City {
  return {
    id: id || `city_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    ownerId,
    position,
    population: 1,
    health: 100,
    maxHealth: 100,
    defenses: 10,
    buildings: [],
    productionQueue: [],
    workedTiles: [position], // 初始工作市中心地块
    yields: {
      food: 0,
      production: 0,
      gold: 0,
      science: 0,
      culture: 0,
    },
    culture: 0,
    borders: getInitialBorders(position),
  };
}

// 获取初始边界
function getInitialBorders(center: Position): Position[] {
  const borders: Position[] = [center];
  const radius = 1;

  for (let row = -radius; row <= radius; row++) {
    for (let col = -radius; col <= radius; col++) {
      if (row === 0 && col === 0) continue;
      const distance = Math.abs(row) + Math.abs(col);
      if (distance <= radius) {
        borders.push({
          row: center.row + row,
          col: center.col + col,
        });
      }
    }
  }

  return borders;
}

// 计算城市产出
export function calculateCityYields(city: City, map: GameMap): Yields {
  const yields: Yields = {
    food: 0,
    production: 0,
    gold: 0,
    science: 0,
    culture: 0,
  };

  // 计算工作地块的产出
  for (const pos of city.workedTiles) {
    if (
      pos.row >= 0 &&
      pos.row < map.height &&
      pos.col >= 0 &&
      pos.col < map.width
    ) {
      const tile = map.tiles[pos.row][pos.col];
      const tileYields = calculateTileYields(tile);
      yields.food += tileYields.food;
      yields.production += tileYields.production;
      yields.gold += tileYields.gold;
    }
  }

  // 添加建筑产出
  for (const building of city.buildings) {
    const definition = buildingDefinitions[building.id];
    if (definition) {
      yields.food += definition.effects.food || 0;
      yields.production += definition.effects.production || 0;
      yields.gold += definition.effects.gold || 0;
      yields.science += definition.effects.science || 0;
      yields.culture += definition.effects.culture || 0;
    }
  }

  // 人口基础产出
  yields.science += city.population * 0.5;
  yields.culture += city.population * 0.2;

  return yields;
}

// 添加建筑
export function addBuilding(city: City, buildingId: string): City {
  const definition = buildingDefinitions[buildingId];
  if (!definition) return city;

  // 检查是否已存在
  if (city.buildings.some(b => b.id === buildingId)) {
    return city;
  }

  const newBuilding: Building = {
    id: buildingId,
    name: definition.name,
    type: definition.type,
    effects: definition.effects,
  };

  return {
    ...city,
    buildings: [...city.buildings, newBuilding],
  };
}

// 添加生产项目到队列
export function addToProductionQueue(city: City, item: ProductionItem): City {
  return {
    ...city,
    productionQueue: [...city.productionQueue, item],
  };
}

// 移除生产项目
export function removeFromProductionQueue(city: City, index: number): City {
  const newQueue = [...city.productionQueue];
  newQueue.splice(index, 1);
  return {
    ...city,
    productionQueue: newQueue,
  };
}

// 处理城市生产
export function processCityProduction(city: City): City {
  if (city.productionQueue.length === 0) return city;

  const currentItem = city.productionQueue[0];
  const productionPerTurn = city.yields.production;

  const updatedItem: ProductionItem = {
    ...currentItem,
    progress: currentItem.progress + productionPerTurn,
  };

  // 检查是否完成
  if (updatedItem.progress >= updatedItem.productionCost) {
    // 项目完成
    const newQueue = city.productionQueue.slice(1);
    return {
      ...city,
      productionQueue: newQueue,
    };
  }

  // 更新进度
  const newQueue = [updatedItem, ...city.productionQueue.slice(1)];
  return {
    ...city,
    productionQueue: newQueue,
  };
}

// 处理城市人口增长
export function processCityGrowth(city: City): City {
  const foodRequiredForGrowth = city.population * 15 + 10;
  const foodSurplus = city.yields.food - city.population * 2;

  // 简化的食物存储逻辑
  const currentFoodStorage = (city as any).foodStorage || 0;
  const newFoodStorage = currentFoodStorage + foodSurplus;

  if (newFoodStorage >= foodRequiredForGrowth) {
    // 人口增长
    return {
      ...city,
      population: city.population + 1,
      // 可以添加新的工作地块
      workedTiles: city.workedTiles, // 需要让玩家选择新工作地块
    };
  }

  return {
    ...city,
    foodStorage: newFoodStorage,
  };
}

// 扩展城市边界
export function expandCityBorders(city: City, cultureThreshold: number): City {
  if (city.culture >= cultureThreshold) {
    const currentRadius = Math.max(
      ...city.borders.map(p => Math.abs(p.row - city.position.row) + Math.abs(p.col - city.position.col))
    );

    const newBorders: Position[] = [...city.borders];
    const newRadius = currentRadius + 1;

    for (let row = -newRadius; row <= newRadius; row++) {
      for (let col = -newRadius; col <= newRadius; col++) {
        const distance = Math.abs(row) + Math.abs(col);
        if (distance === newRadius) {
          const newPos = {
            row: city.position.row + row,
            col: city.position.col + col,
          };
          // 检查是否已经在边界内
          if (!city.borders.some(p => p.row === newPos.row && p.col === newPos.col)) {
            newBorders.push(newPos);
          }
        }
      }
    }

    return {
      ...city,
      borders: newBorders,
      culture: city.culture - cultureThreshold,
    };
  }

  return city;
}

// 切换工作地块
export function toggleWorkedTile(city: City, position: Position): City {
  const isWorked = city.workedTiles.some(
    p => p.row === position.row && p.col === position.col
  );

  if (isWorked) {
    // 停止工作（不能停止市中心）
    if (position.row === city.position.row && position.col === city.position.col) {
      return city;
    }
    return {
      ...city,
      workedTiles: city.workedTiles.filter(
        p => !(p.row === position.row && p.col === position.col)
      ),
    };
  } else {
    // 开始工作（检查是否在边界内）
    const isInBorders = city.borders.some(
      p => p.row === position.row && p.col === position.col
    );
    if (!isInBorders) return city;

    // 检查是否超过人口限制
    if (city.workedTiles.length >= city.population + 1) {
      return city;
    }

    return {
      ...city,
      workedTiles: [...city.workedTiles, position],
    };
  }
}

// 获取城市防御力
export function getCityDefense(city: City): number {
  let defense = city.defenses;

  // 建筑加成
  if (city.buildings.some(b => b.id === 'barracks')) {
    defense += 5;
  }

  // 人口加成
  defense += city.population * 2;

  return defense;
}

// 治疗城市
export function healCity(city: City, amount: number): City {
  return {
    ...city,
    health: Math.min(city.health + amount, city.maxHealth),
  };
}

// 对城市造成伤害
export function damageCity(city: City, damage: number): City {
  return {
    ...city,
    health: Math.max(city.health - damage, 0),
  };
}
