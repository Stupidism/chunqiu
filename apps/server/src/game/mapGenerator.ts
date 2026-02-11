// 春秋 (Chunqiu) - 地图生成器
// 生成随机游戏地图，包含各种地形和玩家起始位置

// ============ 类型定义 ============

export enum TerrainType {
  PLAINS = 'plains',       // 平原 - 适合建设
  FOREST = 'forest',       // 森林 - 提供木材
  MOUNTAIN = 'mountain',   // 山地 - 提供矿产，难以通行
  HILL = 'hill',           // 丘陵 - 适合防守
  RIVER = 'river',         // 河流 - 提供水源，难以通行
  DESERT = 'desert',       // 沙漠 - 资源稀少
  SWAMP = 'swamp',         // 沼泽 - 难以通行
  OCEAN = 'ocean',         // 海洋 - 无法通行
}

export interface TerrainInfo {
  type: TerrainType;
  name: string;
  description: string;
  moveCost: number;         // 移动消耗
  defenseBonus: number;     // 防御加成
  productionBonus: number;  // 生产加成
  foodBonus: number;        // 食物加成
  buildable: boolean;       // 是否可建造
}

export interface MapTile {
  x: number;
  y: number;
  terrain: TerrainType;
  resource?: ResourceType;
  owner?: string;           // 玩家ID
  cityId?: string;          // 城市ID
  unitId?: string;          // 单位ID
  visibility: string[];     // 可见玩家列表
}

export enum ResourceType {
  IRON = 'iron',           // 铁矿
  HORSE = 'horse',         // 马匹
  WHEAT = 'wheat',         // 小麦
  RICE = 'rice',           // 稻米
  SILK = 'silk',           // 丝绸
  TEA = 'tea',             // 茶叶
  COPPER = 'copper',       // 铜矿
  SALT = 'salt',           // 盐
}

export interface ResourceInfo {
  type: ResourceType;
  name: string;
  production: number;
  food: number;
  gold: number;
}

export interface GameMap {
  width: number;
  height: number;
  tiles: MapTile[][];
  playerStarts: { x: number; y: number }[];
  seed: number;
}

// ============ 地形信息 ============

export const TERRAIN_INFO: Record<TerrainType, TerrainInfo> = {
  [TerrainType.PLAINS]: {
    type: TerrainType.PLAINS,
    name: '平原',
    description: '肥沃的平原，适合农业和城市建设',
    moveCost: 1,
    defenseBonus: 0,
    productionBonus: 1,
    foodBonus: 2,
    buildable: true,
  },
  [TerrainType.FOREST]: {
    type: TerrainType.FOREST,
    name: '森林',
    description: '茂密的森林，提供木材资源',
    moveCost: 2,
    defenseBonus: 25,
    productionBonus: 2,
    foodBonus: 1,
    buildable: true,
  },
  [TerrainType.MOUNTAIN]: {
    type: TerrainType.MOUNTAIN,
    name: '山脉',
    description: '险峻的山脉，富含矿产但难以通行',
    moveCost: 999,
    defenseBonus: 50,
    productionBonus: 3,
    foodBonus: 0,
    buildable: false,
  },
  [TerrainType.HILL]: {
    type: TerrainType.HILL,
    name: '丘陵',
    description: '起伏的丘陵，适合防守',
    moveCost: 2,
    defenseBonus: 25,
    productionBonus: 1,
    foodBonus: 1,
    buildable: true,
  },
  [TerrainType.RIVER]: {
    type: TerrainType.RIVER,
    description: '河流，提供水源但难以穿越',
    name: '河流',
    moveCost: 3,
    defenseBonus: 0,
    productionBonus: 0,
    foodBonus: 3,
    buildable: false,
  },
  [TerrainType.DESERT]: {
    type: TerrainType.DESERT,
    name: '沙漠',
    description: '干旱的沙漠，资源稀少',
    moveCost: 2,
    defenseBonus: 0,
    productionBonus: 0,
    foodBonus: 0,
    buildable: true,
  },
  [TerrainType.SWAMP]: {
    type: TerrainType.SWAMP,
    name: '沼泽',
    description: '危险的沼泽，难以通行',
    moveCost: 3,
    defenseBonus: -25,
    productionBonus: 0,
    foodBonus: 1,
    buildable: false,
  },
  [TerrainType.OCEAN]: {
    type: TerrainType.OCEAN,
    name: '海洋',
    description: '广阔的海洋',
    moveCost: 999,
    defenseBonus: 0,
    productionBonus: 1,
    foodBonus: 2,
    buildable: false,
  },
};

// ============ 资源信息 ============

export const RESOURCE_INFO: Record<ResourceType, ResourceInfo> = {
  [ResourceType.IRON]: {
    type: ResourceType.IRON,
    name: '铁矿',
    production: 3,
    food: 0,
    gold: 1,
  },
  [ResourceType.HORSE]: {
    type: ResourceType.HORSE,
    name: '马匹',
    production: 1,
    food: 1,
    gold: 2,
  },
  [ResourceType.WHEAT]: {
    type: ResourceType.WHEAT,
    name: '小麦',
    production: 0,
    food: 3,
    gold: 1,
  },
  [ResourceType.RICE]: {
    type: ResourceType.RICE,
    name: '稻米',
    production: 0,
    food: 4,
    gold: 1,
  },
  [ResourceType.SILK]: {
    type: ResourceType.SILK,
    name: '丝绸',
    production: 0,
    food: 0,
    gold: 4,
  },
  [ResourceType.TEA]: {
    type: ResourceType.TEA,
    name: '茶叶',
    production: 0,
    food: 1,
    gold: 3,
  },
  [ResourceType.COPPER]: {
    type: ResourceType.COPPER,
    name: '铜矿',
    production: 2,
    food: 0,
    gold: 2,
  },
  [ResourceType.SALT]: {
    type: ResourceType.SALT,
    name: '盐',
    production: 1,
    food: 2,
    gold: 2,
  },
};

// ============ 随机数生成器 ============

class SeededRandom {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  // 线性同余生成器
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  
  // 生成指定范围的整数
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  
  // 生成指定范围的浮点数
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }
  
  // 从数组中随机选择
  choice<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }
  
  // 根据权重随机选择
  weightedChoice<T>(items: T[], weights: number[]): T {
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = this.next() * totalWeight;
    
    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return items[i];
      }
    }
    
    return items[items.length - 1];
  }
}

// ============ 地图生成器 ============

export interface MapGenerationOptions {
  width: number;
  height: number;
  playerCount: number;
  seed?: number;
  waterLevel?: number;      // 0-1，水位高度
  mountainLevel?: number;   // 0-1，山脉密度
  forestLevel?: number;     // 0-1，森林密度
  resourceDensity?: number; // 0-1，资源密度
}

// 生成地图
export function generateMap(
  width: number,
  height: number,
  playerCount: number,
  seed?: number
): GameMap {
  const options: MapGenerationOptions = {
    width,
    height,
    playerCount,
    seed: seed || Date.now(),
    waterLevel: 0.15,
    mountainLevel: 0.12,
    forestLevel: 0.25,
    resourceDensity: 0.08,
  };
  
  return generateMapWithOptions(options);
}

// 使用选项生成地图
export function generateMapWithOptions(options: MapGenerationOptions): GameMap {
  const { width, height, playerCount, seed } = options;
  const rng = new SeededRandom(seed || Date.now());
  
  // 初始化地图
  const tiles: MapTile[][] = [];
  for (let y = 0; y < height; y++) {
    tiles[y] = [];
    for (let x = 0; x < width; x++) {
      tiles[y][x] = createTile(x, y, TerrainType.PLAINS);
    }
  }
  
  // 1. 生成基础地形（使用噪声模拟）
  generateBaseTerrain(tiles, width, height, options, rng);
  
  // 2. 生成河流
  generateRivers(tiles, width, height, options, rng);
  
  // 3. 生成资源
  generateResources(tiles, width, height, options, rng);
  
  // 4. 生成玩家起始位置
  const playerStarts = generatePlayerStarts(tiles, width, height, playerCount, rng);
  
  // 5. 确保起始位置周围是适合发展的地形
  improveStartAreas(tiles, playerStarts);
  
  return {
    width,
    height,
    tiles,
    playerStarts,
    seed: seed || Date.now(),
  };
}

// 创建地图格子
function createTile(x: number, y: number, terrain: TerrainType): MapTile {
  return {
    x,
    y,
    terrain,
    visibility: [],
  };
}

// 生成基础地形
function generateBaseTerrain(
  tiles: MapTile[][],
  width: number,
  height: number,
  options: MapGenerationOptions,
  rng: SeededRandom
): void {
  const { mountainLevel, forestLevel, waterLevel } = options;
  
  // 使用简单的噪声模拟
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const noise = rng.next();
      
      // 边缘生成海洋
      const edgeDistance = Math.min(x, y, width - 1 - x, height - 1 - y);
      if (edgeDistance < 2 && rng.next() < 0.7) {
        tiles[y][x].terrain = TerrainType.OCEAN;
        continue;
      }
      
      // 根据噪声值决定地形
      if (noise < waterLevel) {
        tiles[y][x].terrain = rng.next() < 0.5 ? TerrainType.OCEAN : TerrainType.SWAMP;
      } else if (noise < waterLevel + (mountainLevel || 0.12)) {
        tiles[y][x].terrain = rng.next() < 0.7 ? TerrainType.MOUNTAIN : TerrainType.HILL;
      } else if (noise < waterLevel + (mountainLevel || 0.12) + (forestLevel || 0.25)) {
        tiles[y][x].terrain = TerrainType.FOREST;
      } else if (noise > 0.85) {
        tiles[y][x].terrain = TerrainType.DESERT;
      } else {
        tiles[y][x].terrain = TerrainType.PLAINS;
      }
    }
  }
}

// 生成河流
function generateRivers(
  tiles: MapTile[][],
  width: number,
  height: number,
  options: MapGenerationOptions,
  rng: SeededRandom
): void {
  const riverCount = Math.floor(Math.sqrt(width * height) / 8);
  
  for (let i = 0; i < riverCount; i++) {
    // 随机选择河流起点（通常是山脉）
    let startX = rng.nextInt(2, width - 3);
    let startY = rng.nextInt(2, height - 3);
    
    // 寻找山脉作为起点
    let attempts = 0;
    while (tiles[startY][startX].terrain !== TerrainType.MOUNTAIN && attempts < 50) {
      startX = rng.nextInt(2, width - 3);
      startY = rng.nextInt(2, height - 3);
      attempts++;
    }
    
    // 生成河流路径
    let x = startX;
    let y = startY;
    const riverLength = rng.nextInt(5, 15);
    
    for (let j = 0; j < riverLength; j++) {
      if (x < 1 || x >= width - 1 || y < 1 || y >= height - 1) break;
      
      // 不覆盖海洋和山脉
      if (tiles[y][x].terrain === TerrainType.OCEAN || 
          tiles[y][x].terrain === TerrainType.MOUNTAIN) break;
      
      tiles[y][x].terrain = TerrainType.RIVER;
      
      // 随机流向（倾向于流向低处）
      const directions = [
        { dx: 0, dy: 1, weight: 3 },  // 向下
        { dx: -1, dy: 1, weight: 2 }, // 左下
        { dx: 1, dy: 1, weight: 2 },  // 右下
        { dx: -1, dy: 0, weight: 1 }, // 左
        { dx: 1, dy: 0, weight: 1 },  // 右
      ];
      
      const dir = rng.weightedChoice(
        directions.map(d => d),
        directions.map(d => d.weight)
      );
      
      x += dir.dx;
      y += dir.dy;
    }
  }
}

// 生成资源
function generateResources(
  tiles: MapTile[][],
  width: number,
  height: number,
  options: MapGenerationOptions,
  rng: SeededRandom
): void {
  const { resourceDensity } = options;
  const resourceCount = Math.floor(width * height * (resourceDensity || 0.08));
  
  const resourceTypes = Object.values(ResourceType);
  
  for (let i = 0; i < resourceCount; i++) {
    const x = rng.nextInt(1, width - 2);
    const y = rng.nextInt(1, height - 2);
    const tile = tiles[y][x];
    
    // 不在海洋和山脉上生成资源
    if (tile.terrain === TerrainType.OCEAN || tile.terrain === TerrainType.MOUNTAIN) {
      continue;
    }
    
    // 根据地形选择合适的资源
    let suitableResources = resourceTypes;
    
    switch (tile.terrain) {
      case TerrainType.PLAINS:
        suitableResources = [ResourceType.WHEAT, ResourceType.HORSE];
        break;
      case TerrainType.FOREST:
        suitableResources = [ResourceType.COPPER, ResourceType.SILK];
        break;
      case TerrainType.HILL:
        suitableResources = [ResourceType.IRON, ResourceType.COPPER, ResourceType.SHEEP];
        break;
      case TerrainType.RIVER:
        suitableResources = [ResourceType.RICE, ResourceType.FISH];
        break;
      case TerrainType.DESERT:
        suitableResources = [ResourceType.SALT, ResourceType.OASIS];
        break;
    }
    
    // 过滤掉undefined的值
    suitableResources = suitableResources.filter(r => r !== undefined);
    
    if (suitableResources.length > 0) {
      tile.resource = rng.choice(suitableResources);
    }
  }
}

// 生成玩家起始位置
function generatePlayerStarts(
  tiles: MapTile[][],
  width: number,
  height: number,
  playerCount: number,
  rng: SeededRandom
): { x: number; y: number }[] {
  const starts: { x: number; y: number }[] = [];
  const minDistance = Math.floor(Math.min(width, height) / Math.sqrt(playerCount + 1));
  
  for (let i = 0; i < playerCount; i++) {
    let x: number, y: number;
    let attempts = 0;
    let valid = false;
    
    while (!valid && attempts < 100) {
      // 在地图边缘向内一定距离范围内选择
      const margin = Math.floor(Math.min(width, height) * 0.15);
      x = rng.nextInt(margin, width - margin - 1);
      y = rng.nextInt(margin, height - margin - 1);
      
      // 检查是否是合适的起始位置
      if (!isValidStartLocation(tiles, x, y)) {
        attempts++;
        continue;
      }
      
      // 检查与其他玩家的距离
      valid = true;
      for (const start of starts) {
        const distance = Math.sqrt(Math.pow(x - start.x, 2) + Math.pow(y - start.y, 2));
        if (distance < minDistance) {
          valid = false;
          break;
        }
      }
      
      attempts++;
    }
    
    if (valid) {
      starts.push({ x, y });
    } else {
      // 如果找不到合适位置，使用随机位置
      starts.push({
        x: rng.nextInt(3, width - 4),
        y: rng.nextInt(3, height - 4),
      });
    }
  }
  
  return starts;
}

// 检查是否是有效的起始位置
function isValidStartLocation(tiles: MapTile[][], x: number, y: number): boolean {
  const tile = tiles[y]?.[x];
  if (!tile) return false;
  
  // 不能在海洋、山脉、河流、沼泽上
  const invalidTerrains = [TerrainType.OCEAN, TerrainType.MOUNTAIN, TerrainType.RIVER, TerrainType.SWAMP];
  if (invalidTerrains.includes(tile.terrain)) {
    return false;
  }
  
  // 检查周围是否有足够的可建造格子
  let buildableCount = 0;
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      if (ny >= 0 && ny < tiles.length && nx >= 0 && nx < tiles[0].length) {
        if (TERRAIN_INFO[tiles[ny][nx].terrain].buildable) {
          buildableCount++;
        }
      }
    }
  }
  
  return buildableCount >= 12; // 至少12个可建造格子
}

// 改善起始区域
function improveStartAreas(
  tiles: MapTile[][],
  starts: { x: number; y: number }[]
): void {
  for (const start of starts) {
    // 确保起始位置是平原
    tiles[start.y][start.x].terrain = TerrainType.PLAINS;
    
    // 改善周围区域
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const nx = start.x + dx;
        const ny = start.y + dy;
        
        if (ny >= 0 && ny < tiles.length && nx >= 0 && nx < tiles[0].length) {
          const tile = tiles[ny][nx];
          
          // 将不好的地形改为平原或森林
          if (tile.terrain === TerrainType.OCEAN || 
              tile.terrain === TerrainType.SWAMP ||
              tile.terrain === TerrainType.DESERT) {
            tile.terrain = Math.random() < 0.7 ? TerrainType.PLAINS : TerrainType.FOREST;
          }
          
          // 确保起始位置附近没有山脉
          if (tile.terrain === TerrainType.MOUNTAIN) {
            tile.terrain = TerrainType.HILL;
          }
        }
      }
    }
    
    // 在起始位置附近添加一些资源
    const resourcePositions = [
      { x: start.x + 1, y: start.y },
      { x: start.x - 1, y: start.y },
      { x: start.x, y: start.y + 1 },
      { x: start.x, y: start.y - 1 },
    ];
    
    for (let i = 0; i < 2; i++) {
      const pos = resourcePositions[i];
      if (pos.y >= 0 && pos.y < tiles.length && pos.x >= 0 && pos.x < tiles[0].length) {
        const resources = [ResourceType.WHEAT, ResourceType.IRON, ResourceType.HORSE];
        tiles[pos.y][pos.x].resource = resources[Math.floor(Math.random() * resources.length)];
      }
    }
  }
}

// ============ 辅助函数 ============

// 获取地形信息
export function getTerrainInfo(terrain: TerrainType): TerrainInfo {
  return TERRAIN_INFO[terrain];
}

// 获取资源信息
export function getResourceInfo(resource: ResourceType): ResourceInfo {
  return RESOURCE_INFO[resource];
}

// 计算两个格子之间的距离
export function getDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// 检查格子是否在地图范围内
export function isInBounds(x: number, y: number, width: number, height: number): boolean {
  return x >= 0 && x < width && y >= 0 && y < height;
}

// 获取相邻格子
export function getNeighbors(
  x: number,
  y: number,
  width: number,
  height: number
): { x: number; y: number }[] {
  const neighbors: { x: number; y: number }[] = [];
  const directions = [
    { dx: 0, dy: -1 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
  ];
  
  for (const dir of directions) {
    const nx = x + dir.dx;
    const ny = y + dir.dy;
    if (isInBounds(nx, ny, width, height)) {
      neighbors.push({ x: nx, y: ny });
    }
  }
  
  return neighbors;
}

// 导出默认生成函数
export default generateMap;
