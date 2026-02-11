import type { Tile, Position, GameMap, TerrainType, ElevationType, Resource } from '@chunqiu/types';

// 地形生成配置
interface TerrainConfig {
  type: TerrainType;
  weight: number;
  minElevation: ElevationType;
  maxElevation: ElevationType;
}

const terrainConfigs: TerrainConfig[] = [
  { type: 'grassland', weight: 35, minElevation: 'flat', maxElevation: 'hill' },
  { type: 'plains', weight: 25, minElevation: 'flat', maxElevation: 'hill' },
  { type: 'desert', weight: 15, minElevation: 'flat', maxElevation: 'hill' },
  { type: 'tundra', weight: 10, minElevation: 'flat', maxElevation: 'mountain' },
  { type: 'coast', weight: 10, minElevation: 'flat', maxElevation: 'flat' },
  { type: 'ocean', weight: 5, minElevation: 'flat', maxElevation: 'flat' },
];

// 资源定义
const resourceDefinitions: Record<string, Partial<Resource>[]> = {
  grassland: [
    { type: 'food', name: '小麦', yields: { food: 2 } },
    { type: 'food', name: '牛群', yields: { food: 2, production: 1 } },
  ],
  plains: [
    { type: 'food', name: '鹿群', yields: { food: 2 } },
    { type: 'production', name: '马群', yields: { production: 1 } },
    { type: 'gold', name: '金矿', yields: { gold: 3 } },
  ],
  desert: [
    { type: 'gold', name: '银矿', yields: { gold: 2 } },
    { type: 'luxury', name: '香料', yields: { gold: 2 } },
  ],
  tundra: [
    { type: 'food', name: '鱼群', yields: { food: 2 } },
    { type: 'strategic', name: '铁矿', yields: { production: 2 } },
  ],
  coast: [
    { type: 'food', name: '鱼群', yields: { food: 2 } },
    { type: 'gold', name: '珍珠', yields: { gold: 2 } },
  ],
  ocean: [
    { type: 'food', name: '鱼群', yields: { food: 1 } },
  ],
};

// 海拔权重
const elevationWeights: Record<ElevationType, number> = {
  flat: 60,
  hill: 30,
  mountain: 10,
};

// 简单的噪声函数（用于地形生成）
class SimpleNoise {
  private seed: number;

  constructor(seed: number = Math.random()) {
    this.seed = seed;
  }

  noise(x: number, y: number): number {
    const n = Math.sin(x * 12.9898 + y * 78.233 + this.seed) * 43758.5453;
    return n - Math.floor(n);
  }

  smoothNoise(x: number, y: number): number {
    const corners =
      this.noise(x - 1, y - 1) +
      this.noise(x + 1, y - 1) +
      this.noise(x - 1, y + 1) +
      this.noise(x + 1, y + 1);
    const sides =
      this.noise(x - 1, y) +
      this.noise(x + 1, y) +
      this.noise(x, y - 1) +
      this.noise(x, y + 1);
    const center = this.noise(x, y);
    return corners / 16 + sides / 8 + center / 4;
  }
}

export interface MapGenerationOptions {
  width: number;
  height: number;
  seed?: number;
  waterLevel?: number;
  resourceDensity?: number;
}

export function generateMap(options: MapGenerationOptions): GameMap {
  const {
    width,
    height,
    seed = Math.random(),
    waterLevel = 0.3,
    resourceDensity = 0.15,
  } = options;

  const noise = new SimpleNoise(seed);
  const tiles: Tile[][] = [];

  for (let row = 0; row < height; row++) {
    tiles[row] = [];
    for (let col = 0; col < width; col++) {
      const noiseValue = noise.smoothNoise(col * 0.1, row * 0.1);
      
      // 根据噪声值确定地形
      let terrain: TerrainType;
      if (noiseValue < waterLevel) {
        terrain = 'ocean';
      } else if (noiseValue < waterLevel + 0.1) {
        terrain = 'coast';
      } else if (noiseValue < waterLevel + 0.35) {
        terrain = 'grassland';
      } else if (noiseValue < waterLevel + 0.55) {
        terrain = 'plains';
      } else if (noiseValue < waterLevel + 0.7) {
        terrain = 'desert';
      } else {
        terrain = 'tundra';
      }

      // 确定海拔
      const elevationNoise = noise.smoothNoise(col * 0.15 + 100, row * 0.15 + 100);
      let elevation: ElevationType;
      if (terrain === 'ocean' || terrain === 'coast') {
        elevation = 'flat';
      } else if (elevationNoise < 0.6) {
        elevation = 'flat';
      } else if (elevationNoise < 0.85) {
        elevation = 'hill';
      } else {
        elevation = 'mountain';
      }

      // 生成资源
      let resource: Resource | undefined;
      const resourceNoise = noise.noise(col * 0.2 + 200, row * 0.2 + 200);
      if (resourceNoise < resourceDensity) {
        const possibleResources = resourceDefinitions[terrain] || [];
        if (possibleResources.length > 0) {
          const resourceDef = possibleResources[Math.floor(noise.noise(col, row) * possibleResources.length)];
          resource = {
            type: resourceDef.type!,
            name: resourceDef.name!,
            yields: resourceDef.yields || {},
          };
        }
      }

      tiles[row][col] = {
        position: { row, col },
        terrain,
        elevation,
        resource,
      };
    }
  }

  return {
    width,
    height,
    tiles,
  };
}

// 计算地块产出
export function calculateTileYields(tile: Tile): { food: number; production: number; gold: number } {
  const baseYields: Record<TerrainType, { food: number; production: number; gold: number }> = {
    grassland: { food: 2, production: 0, gold: 0 },
    plains: { food: 1, production: 1, gold: 0 },
    desert: { food: 0, production: 0, gold: 0 },
    tundra: { food: 1, production: 0, gold: 0 },
    coast: { food: 1, production: 0, gold: 1 },
    ocean: { food: 1, production: 0, gold: 0 },
  };

  const elevationBonus: Record<ElevationType, { food: number; production: number; gold: number }> = {
    flat: { food: 0, production: 0, gold: 0 },
    hill: { food: -1, production: 1, gold: 0 },
    mountain: { food: 0, production: 0, gold: 0 },
  };

  const base = baseYields[tile.terrain] || { food: 0, production: 0, gold: 0 };
  const elevation = elevationBonus[tile.elevation];
  const resource = tile.resource?.yields || {};

  return {
    food: Math.max(0, base.food + elevation.food + (resource.food || 0)),
    production: Math.max(0, base.production + elevation.production + (resource.production || 0)),
    gold: Math.max(0, base.gold + elevation.gold + (resource.gold || 0)),
  };
}

// 获取相邻地块
export function getAdjacentTiles(map: GameMap, position: Position): Tile[] {
  const directions = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
    // 六边形网格的额外方向
    { row: -1, col: position.row % 2 === 0 ? -1 : 1 },
    { row: 1, col: position.row % 2 === 0 ? -1 : 1 },
  ];

  const adjacent: Tile[] = [];
  for (const dir of directions) {
    const newRow = position.row + dir.row;
    const newCol = position.col + dir.col;
    if (
      newRow >= 0 &&
      newRow < map.height &&
      newCol >= 0 &&
      newCol < map.width
    ) {
      adjacent.push(map.tiles[newRow][newCol]);
    }
  }
  return adjacent;
}

// 计算距离
export function getDistance(pos1: Position, pos2: Position): number {
  const dx = Math.abs(pos1.col - pos2.col);
  const dy = Math.abs(pos1.row - pos2.row);
  return Math.max(dx, dy + Math.floor(dx / 2));
}

// 检查位置是否有效
export function isValidPosition(map: GameMap, position: Position): boolean {
  return (
    position.row >= 0 &&
    position.row < map.height &&
    position.col >= 0 &&
    position.col < map.width
  );
}
