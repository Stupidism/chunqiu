import { create } from 'zustand';
import type { GameMap, Tile, Position, TerrainType, ElevationType, ResourceType } from '@chunqiu/types';
import { generateMap } from '@chunqiu/game-core';

export type EditorTool = 'select' | 'terrain' | 'elevation' | 'resource' | 'eraser';

interface EditorState {
  // 地图数据
  map: GameMap | null;
  
  // 编辑器状态
  selectedTool: EditorTool;
  selectedTerrain: TerrainType;
  selectedElevation: ElevationType;
  selectedResource: ResourceType | null;
  brushSize: number;
  
  // 选择状态
  selectedTile: Position | null;
  
  // 历史记录（用于撤销/重做）
  history: GameMap[];
  historyIndex: number;
  
  // Actions
  setMap: (map: GameMap) => void;
  createNewMap: (width: number, height: number) => void;
  
  // 工具操作
  setSelectedTool: (tool: EditorTool) => void;
  setSelectedTerrain: (terrain: TerrainType) => void;
  setSelectedElevation: (elevation: ElevationType) => void;
  setSelectedResource: (resource: ResourceType | null) => void;
  setBrushSize: (size: number) => void;
  
  // 选择操作
  selectTile: (position: Position | null) => void;
  
  // 编辑操作
  applyTool: (position: Position) => void;
  
  // 历史操作
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  // 初始状态
  map: null,
  selectedTool: 'select',
  selectedTerrain: 'grassland',
  selectedElevation: 'flat',
  selectedResource: null,
  brushSize: 1,
  selectedTile: null,
  history: [],
  historyIndex: -1,

  // 设置地图
  setMap: (map: GameMap) => {
    set({ map });
  },

  // 创建新地图
  createNewMap: (width: number, height: number) => {
    const map = generateMap({ width, height });
    set({ 
      map, 
      history: [map], 
      historyIndex: 0,
      selectedTile: null,
    });
  },

  // 设置选中工具
  setSelectedTool: (tool: EditorTool) => {
    set({ selectedTool: tool });
  },

  // 设置选中地形
  setSelectedTerrain: (terrain: TerrainType) => {
    set({ selectedTerrain: terrain });
  },

  // 设置选中海拔
  setSelectedElevation: (elevation: ElevationType) => {
    set({ selectedElevation: elevation });
  },

  // 设置选中资源
  setSelectedResource: (resource: ResourceType | null) => {
    set({ selectedResource: resource });
  },

  // 设置笔刷大小
  setBrushSize: (size: number) => {
    set({ brushSize: Math.max(1, Math.min(5, size)) });
  },

  // 选择地块
  selectTile: (position: Position | null) => {
    set({ selectedTile: position });
  },

  // 应用工具
  applyTool: (position: Position) => {
    const { map, selectedTool, selectedTerrain, selectedElevation, selectedResource, brushSize } = get();
    if (!map) return;

    // 保存当前状态到历史
    get().saveToHistory();

    const newTiles = map.tiles.map(row => [...row]);

    // 应用笔刷
    for (let rowOffset = -Math.floor(brushSize / 2); rowOffset <= Math.floor(brushSize / 2); rowOffset++) {
      for (let colOffset = -Math.floor(brushSize / 2); colOffset <= Math.floor(brushSize / 2); colOffset++) {
        const targetRow = position.row + rowOffset;
        const targetCol = position.col + colOffset;

        if (
          targetRow >= 0 &&
          targetRow < map.height &&
          targetCol >= 0 &&
          targetCol < map.width
        ) {
          const tile = newTiles[targetRow][targetCol];

          switch (selectedTool) {
            case 'terrain':
              newTiles[targetRow][targetCol] = {
                ...tile,
                terrain: selectedTerrain,
              };
              break;
            case 'elevation':
              newTiles[targetRow][targetCol] = {
                ...tile,
                elevation: selectedElevation,
              };
              break;
            case 'resource':
              if (selectedResource) {
                newTiles[targetRow][targetCol] = {
                  ...tile,
                  resource: {
                    type: selectedResource,
                    name: getResourceName(selectedResource),
                    yields: getResourceYields(selectedResource),
                  },
                };
              }
              break;
            case 'eraser':
              newTiles[targetRow][targetCol] = {
                ...tile,
                resource: undefined,
                improvement: undefined,
              };
              break;
          }
        }
      }
    }

    set({
      map: {
        ...map,
        tiles: newTiles,
      },
    });
  },

  // 保存到历史
  saveToHistory: () => {
    const { map, history, historyIndex } = get();
    if (!map) return;

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(map)));

    // 限制历史记录大小
    if (newHistory.length > 50) {
      newHistory.shift();
    }

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  // 撤销
  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      set({
        map: JSON.parse(JSON.stringify(history[historyIndex - 1])),
        historyIndex: historyIndex - 1,
      });
    }
  },

  // 重做
  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      set({
        map: JSON.parse(JSON.stringify(history[historyIndex + 1])),
        historyIndex: historyIndex + 1,
      });
    }
  },
}));

// 辅助函数
function getResourceName(type: ResourceType): string {
  const names: Record<ResourceType, string> = {
    food: '粮食资源',
    production: '产能资源',
    gold: '黄金资源',
    luxury: '奢侈品',
    strategic: '战略资源',
  };
  return names[type];
}

function getResourceYields(type: ResourceType): { food?: number; production?: number; gold?: number } {
  const yields: Record<ResourceType, { food?: number; production?: number; gold?: number }> = {
    food: { food: 2 },
    production: { production: 2 },
    gold: { gold: 2 },
    luxury: { gold: 2 },
    strategic: { production: 1 },
  };
  return yields[type];
}
