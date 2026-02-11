'use client';

import { useRef, useEffect, useCallback } from 'react';
import { HexTile } from '@chunqiu/ui';
import { useEditorStore } from '@/stores/editorStore';

export function MapCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    map,
    selectedTool,
    selectedTile,
    selectTile,
    applyTool,
    cameraPosition,
    setCameraPosition,
  } = useEditorStore();

  if (!map) return null;

  const tileSize = 50;

  // 处理地块点击
  const handleTileClick = useCallback((row: number, col: number) => {
    const position = { row, col };
    
    if (selectedTool === 'select') {
      selectTile(position);
    } else {
      applyTool(position);
    }
  }, [selectedTool, selectTile, applyTool]);

  // 处理拖拽
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startCamX = 0;
    let startCamY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startCamX = cameraPosition.x;
        startCamY = cameraPosition.y;
        container.style.cursor = 'grabbing';
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      setCameraPosition({
        x: startCamX + dx,
        y: startCamY + dy,
      });
    };

    const handleMouseUp = () => {
      isDragging = false;
      container.style.cursor = 'default';
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [cameraPosition, setCameraPosition]);

  const hexHeight = tileSize * Math.sqrt(3) / 2;
  const hexWidth = tileSize;

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden relative"
    >
      <div
        className="absolute"
        style={{
          transform: `translate(${cameraPosition.x}px, ${cameraPosition.y}px)`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        {map.tiles.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex"
            style={{
              marginLeft: rowIndex % 2 === 1 ? hexWidth / 2 : 0,
              marginTop: rowIndex > 0 ? -hexHeight / 4 : 0,
            }}
          >
            {row.map((tile, colIndex) => {
              const isSelected = selectedTile?.row === rowIndex && selectedTile?.col === colIndex;

              return (
                <div
                  key={colIndex}
                  onClick={() => handleTileClick(rowIndex, colIndex)}
                  className={`
                    relative cursor-pointer transition-all
                    ${selectedTool !== 'select' ? 'hover:brightness-110' : ''}
                  `}
                  style={{ width: hexWidth, height: hexHeight }}
                >
                  <HexTile
                    tile={tile}
                    isSelected={isSelected}
                    size={tileSize}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* 坐标显示 */}
      <div className="absolute top-4 left-4 bg-slate-800/80 text-bronze-100 px-3 py-1 rounded text-sm">
        {selectedTile
          ? `选中: (${selectedTile.row}, ${selectedTile.col})`
          : '点击地块选择'}
      </div>

      {/* 当前工具提示 */}
      <div className="absolute bottom-4 left-4 bg-slate-800/80 text-bronze-100 px-3 py-1 rounded text-sm">
        工具: {selectedTool === 'select' ? '选择' : 
               selectedTool === 'terrain' ? '地形' :
               selectedTool === 'elevation' ? '海拔' :
               selectedTool === 'resource' ? '资源' : '橡皮擦'}
      </div>
    </div>
  );
}
