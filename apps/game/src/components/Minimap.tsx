'use client';

import { useCallback, useRef, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';

export function Minimap() {
  const { gameState, exploredTiles, cameraPosition, zoom, setCameraPosition } = useGameStore();
  const dragRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  if (!gameState) return null;

  const { map } = gameState;

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

  const miniWidth = map.width * miniTileSize;
  const miniHeight = map.height * miniTileSize * 0.75;
  const mapWidth = map.width * 60 * zoom + 30 * zoom;
  const mapHeight = (0.75 * map.height + 0.25) * (60 * zoom * Math.sqrt(3) / 2);
  const miniScaleX = miniWidth / mapWidth;
  const miniScaleY = miniHeight / mapHeight;
  const viewportWidth = (typeof window === 'undefined' ? 1280 : window.innerWidth) * miniScaleX;
  const viewportHeight = (typeof window === 'undefined' ? 720 : window.innerHeight) * miniScaleY;
  const clampedViewportWidth = Math.min(viewportWidth, miniWidth);
  const clampedViewportHeight = Math.min(viewportHeight, miniHeight);
  const viewportX = Math.max(
    0,
    Math.min(miniWidth - clampedViewportWidth, -cameraPosition.x * miniScaleX)
  );
  const viewportY = Math.max(
    0,
    Math.min(miniHeight - clampedViewportHeight, -cameraPosition.y * miniScaleY)
  );

  const moveCameraFromMinimapPoint = useCallback(
    (localX: number, localY: number) => {
      const clampedX = Math.max(0, Math.min(miniWidth, localX));
      const clampedY = Math.max(0, Math.min(miniHeight, localY));
      const ratioX = clampedX / miniWidth;
      const ratioY = clampedY / miniHeight;
      const targetX = ratioX * mapWidth;
      const targetY = ratioY * mapHeight;
      const viewportCenterX = window.innerWidth / 2;
      const viewportCenterY = window.innerHeight / 2 + 16;
      const marginX = Math.max(120, window.innerWidth * 0.2);
      const marginY = Math.max(80, window.innerHeight * 0.18);
      let minX = window.innerWidth - mapWidth - marginX;
      let maxX = marginX;
      let minY = window.innerHeight - mapHeight - marginY;
      let maxY = marginY;
      if (mapWidth + marginX * 2 <= window.innerWidth) {
        minX = (window.innerWidth - mapWidth) / 2;
        maxX = minX;
      }
      if (mapHeight + marginY * 2 <= window.innerHeight) {
        minY = (window.innerHeight - mapHeight) / 2;
        maxY = minY;
      }
      const next = {
        x: viewportCenterX - targetX,
        y: viewportCenterY - targetY,
      };
      setCameraPosition({
        x: Math.max(minX, Math.min(maxX, next.x)),
        y: Math.max(minY, Math.min(maxY, next.y)),
      });
    },
    [mapHeight, mapWidth, miniHeight, miniWidth, setCameraPosition]
  );

  return (
    <div className="bg-slate-900/85 border border-bronze-600/40 rounded-lg p-2 shadow-lg backdrop-blur">
      <div className="text-xs text-bronze-300 mb-1 text-center">小地图</div>
      <div 
        className={`relative overflow-hidden rounded ${isDragging ? 'cursor-grabbing' : 'cursor-pointer'}`}
        data-testid="minimap"
        title="点击小地图可快速定位"
        style={{
          width: miniWidth,
          height: miniHeight,
          touchAction: 'none',
        }}
        onPointerDown={(event) => {
          dragRef.current = true;
          setIsDragging(true);
          event.currentTarget.setPointerCapture(event.pointerId);
          const rect = event.currentTarget.getBoundingClientRect();
          const localX = event.clientX - rect.left;
          const localY = event.clientY - rect.top;
          moveCameraFromMinimapPoint(localX, localY);
        }}
        onPointerMove={(event) => {
          if (!dragRef.current) return;
          const rect = event.currentTarget.getBoundingClientRect();
          const localX = event.clientX - rect.left;
          const localY = event.clientY - rect.top;
          moveCameraFromMinimapPoint(localX, localY);
        }}
        onPointerUp={(event) => {
          dragRef.current = false;
          setIsDragging(false);
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
        }}
        onPointerCancel={(event) => {
          dragRef.current = false;
          setIsDragging(false);
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
        }}
      >
        {/* 简化的地图渲染 */}
        <svg
          width={miniWidth}
          height={miniHeight}
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
            x={viewportX}
            y={viewportY}
            width={clampedViewportWidth}
            height={clampedViewportHeight}
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
