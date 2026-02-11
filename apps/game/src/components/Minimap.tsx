'use client';

import { useGameStore } from '@/stores/gameStore';
import { MiniHex } from '@chunqiu/ui';

export function Minimap() {
  const { gameState, exploredTiles, cameraPosition, setCameraPosition } = useGameStore();

  if (!gameState) return null;

  const { map } = gameState;
  const scale = 0.15; // 小地图缩放比例

  // 简化的地形颜色
  const terrainColors: Record<string, string> = {
    grassland: '#7CB342',
    plains: '#C5A059',
    desert: '#E6C875',
    tundra: '#B8C5D6',
    coast: '#4FC3F7',
    ocean: '#0288D1',
  };

  const miniTileSize = 8;

  return (
    <div className="bg-slate-800/90 border border-bronze-600/50 rounded-lg p-2 shadow-lg">
      <div className="text-xs text-bronze-300 mb-1 text-center">小地图</div>
      <div 
        className="relative overflow-hidden rounded"
        style={{
          width: map.width * miniTileSize,
          height: map.height * miniTileSize * 0.75,
        }}
      >
        {/* 简化的地图渲染 */}
        <svg
          width={map.width * miniTileSize}
          height={map.height * miniTileSize * 0.75}
          className="absolute inset-0"
        >
          {map.tiles.map((row, rowIndex) =>
            row.map((tile, colIndex) => {
              const tileKey = `${rowIndex},${colIndex}`;
              const isExplored = exploredTiles.has(tileKey);

              if (!isExplored) {
                return (
                  <rect
                    key={tileKey}
                    x={colIndex * miniTileSize + (rowIndex % 2) * (miniTileSize / 2)}
                    y={rowIndex * miniTileSize * 0.75}
                    width={miniTileSize}
                    height={miniTileSize * 0.75}
                    fill="#0f172a"
                  />
                );
              }

              return (
                <rect
                  key={tileKey}
                  x={colIndex * miniTileSize + (rowIndex % 2) * (miniTileSize / 2)}
                  y={rowIndex * miniTileSize * 0.75}
                  width={miniTileSize}
                  height={miniTileSize * 0.75}
                  fill={terrainColors[tile.terrain] || '#666'}
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth={0.5}
                />
              );
            })
          )}

          {/* 相机视口指示器 */}
          <rect
            x={-cameraPosition.x * scale}
            y={-cameraPosition.y * scale}
            width={400 * scale}
            height={300 * scale}
            fill="none"
            stroke="#DAA520"
            strokeWidth={1}
            className="animate-pulse"
          />
        </svg>
      </div>
    </div>
  );
}
