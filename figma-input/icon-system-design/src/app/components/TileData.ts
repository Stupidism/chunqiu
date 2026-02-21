/**
 * 地块数据类型定义
 */

export type TerrainType = 'plain' | 'grassland' | 'forest' | 'mountain' | 'hill' | 'water' | 'desert' | 'tundra';
export type ResourceType = 'iron' | 'horse' | 'wheat' | 'silk' | 'jade' | 'tea' | null;
export type ImprovementType = 'farm' | 'mine' | 'pasture' | 'plantation' | null;
export type UnitType = 'warrior' | 'archer' | 'cavalry' | null;

export interface TileYields {
  food: number;
  production: number;
  gold: number;
  science?: number;
  culture?: number;
}

export interface TileData {
  terrain: TerrainType;
  resource: ResourceType;
  improvement: ImprovementType;
  unit: UnitType;
  yields: TileYields;
  hasCity: boolean;
  cityName?: string;
}

// 地形颜色配置
export const TERRAIN_COLORS: Record<TerrainType, string> = {
  plain: '#c4a869',        // 平原 - 土黄色
  grassland: '#7a9b4c',    // 草原 - 草绿色
  forest: '#4a6b3a',       // 森林 - 深绿色
  mountain: '#6b6b6b',     // 山脉 - 灰色
  hill: '#8b7d5c',         // 丘陵 - 褐色
  water: '#4a7b9d',        // 水域 - 蓝色
  desert: '#d4b483',       // 沙漠 - 沙黄色
  tundra: '#b4c4d4',       // 冻土 - 灰蓝色
};

// 生成随机地块数据
export function generateRandomTile(row: number, col: number): TileData {
  const terrains: TerrainType[] = ['plain', 'grassland', 'forest', 'mountain', 'hill', 'water', 'desert'];
  const resources: ResourceType[] = ['iron', 'horse', 'wheat', null, null, null, null]; // 增加null概率
  const improvements: ImprovementType[] = ['farm', null, null, null]; // 大部分地块没有改良
  const units: UnitType[] = ['warrior', 'archer', null, null, null, null, null];
  
  const terrain = terrains[Math.floor(Math.random() * terrains.length)];
  const hasResource = Math.random() > 0.7;
  const hasImprovement = Math.random() > 0.8;
  const hasUnit = Math.random() > 0.9;
  const hasCity = row === 3 && col === 5; // 示例：在特定位置放置城市
  
  // 根据地形生成产出
  let yields: TileYields = { food: 0, production: 0, gold: 0 };
  
  switch (terrain) {
    case 'grassland':
      yields = { food: 2, production: 0, gold: 0 };
      break;
    case 'plain':
      yields = { food: 1, production: 1, gold: 0 };
      break;
    case 'forest':
      yields = { food: 1, production: 1, gold: 0 };
      break;
    case 'hill':
      yields = { food: 0, production: 2, gold: 0 };
      break;
    case 'water':
      yields = { food: 1, production: 0, gold: 1 };
      break;
    case 'desert':
      yields = { food: 0, production: 0, gold: 1 };
      break;
    case 'mountain':
      yields = { food: 0, production: 0, gold: 0 };
      break;
  }
  
  return {
    terrain,
    resource: hasResource ? resources[Math.floor(Math.random() * resources.length)] : null,
    improvement: hasImprovement ? improvements[Math.floor(Math.random() * improvements.length)] : null,
    unit: hasUnit ? units[Math.floor(Math.random() * units.length)] : null,
    yields,
    hasCity,
    cityName: hasCity ? '咸阳城' : undefined,
  };
}

// 预设一些有趣的地块
export function generateMapData(rows: number, cols: number): TileData[][] {
  const map: TileData[][] = [];
  
  for (let row = 0; row < rows; row++) {
    map[row] = [];
    for (let col = 0; col < cols; col++) {
      map[row][col] = generateRandomTile(row, col);
    }
  }
  
  // 设置一些特定的地块
  // 中心城市
  if (map[3] && map[3][5]) {
    map[3][5] = {
      terrain: 'grassland',
      resource: null,
      improvement: null,
      unit: null,
      yields: { food: 3, production: 2, gold: 2 },
      hasCity: true,
      cityName: '咸阳城',
    };
  }
  
  // 周围一些资源 - 演示不同产出数量
  if (map[2] && map[2][4]) {
    map[2][4] = {
      terrain: 'grassland',
      resource: 'wheat',
      improvement: 'farm',
      unit: null,
      yields: { food: 3, production: 0, gold: 0 }, // 3个粮食：正三角形
      hasCity: false,
    };
  }
  
  if (map[3] && map[3][4]) {
    map[3][4] = {
      terrain: 'hill',
      resource: 'iron',
      improvement: null,
      unit: 'warrior',
      yields: { food: 0, production: 2, gold: 1 }, // 2个生产，1个金币：生产居中，金币右边，左边空
      hasCity: false,
    };
  }
  
  if (map[4] && map[4][5]) {
    map[4][5] = {
      terrain: 'plain',
      resource: null,
      improvement: 'farm',
      unit: null,
      yields: { food: 2, production: 1, gold: 0 }, // 2个粮食，1个生产：粮食居中，生产右边，左边空
      hasCity: false,
    };
  }
  
  if (map[3] && map[3][6]) {
    map[3][6] = {
      terrain: 'grassland',
      resource: 'horse',
      improvement: null,
      unit: 'cavalry',
      yields: { food: 1, production: 1, gold: 1, culture: 1 }, // 4种产出：第一行3个，第二行1个
      hasCity: false,
    };
  }
  
  if (map[2] && map[2][5]) {
    map[2][5] = {
      terrain: 'plain',
      resource: null,
      improvement: null,
      unit: null,
      yields: { food: 7, production: 0, gold: 0 }, // 7个粮食：大图标+数字7
      hasCity: false,
    };
  }
  
  if (map[4] && map[4][6]) {
    map[4][6] = {
      terrain: 'hill',
      resource: null,
      improvement: null,
      unit: null,
      yields: { food: 1, production: 6, gold: 2 }, // 1个粮食，6个生产，2个金币
      hasCity: false,
    };
  }
  
  if (map[2] && map[2][6]) {
    map[2][6] = {
      terrain: 'water',
      resource: null,
      improvement: null,
      unit: null,
      yields: { food: 3, production: 0, gold: 3 }, // 3个粮食，3个金币
      hasCity: false,
    };
  }
  
  if (map[4] && map[4][4]) {
    map[4][4] = {
      terrain: 'grassland',
      resource: 'wheat',
      improvement: 'farm',
      unit: 'archer',
      yields: { food: 5, production: 1, gold: 0 }, // 5个粮食（大图标），1个生产
      hasCity: false,
    };
  }
  
  if (map[2] && map[2][3]) {
    map[2][3] = {
      terrain: 'plain',
      resource: null,
      improvement: null,
      unit: null,
      yields: { food: 4, production: 0, gold: 0 }, // 4个粮食：正方形
      hasCity: false,
    };
  }
  
  if (map[3] && map[3][3]) {
    map[3][3] = {
      terrain: 'grassland',
      resource: null,
      improvement: null,
      unit: null,
      yields: { food: 1, production: 2, gold: 3 }, // 混合：粮食居中，生产右边，金币左边
      hasCity: false,
    };
  }
  
  if (map[4] && map[4][3]) {
    map[4][3] = {
      terrain: 'plain',
      resource: null,
      improvement: null,
      unit: null,
      yields: { food: 2, production: 0, gold: 0 }, // 2个粮食：上下排布
      hasCity: false,
    };
  }
  
  return map;
}