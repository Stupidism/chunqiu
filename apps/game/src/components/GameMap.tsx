'use client';

import { useRef, useEffect, useCallback } from 'react';
import { HexTile } from '@chunqiu/ui';
import { useGameStore } from '@/stores/gameStore';

export function GameMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    gameState,
    selectedTile,
    selectedUnit,
    selectTile,
    selectUnit,
    selectCity,
    moveUnit,
    setHoveredTile,
    showMessage,
    visibleTiles,
    exploredTiles,
    cameraPosition,
    zoom,
    setCameraPosition,
  } = useGameStore();

  if (!gameState) return null;

  const { map, units, cities } = gameState;
  const tileSize = 60 * zoom;

  // 处理地块点击
  const handleTileClick = useCallback((row: number, col: number) => {
    const position = { row, col };
    selectTile(position);

    // 检查是否有单位
    const unit = Object.values(units).find(
      u => u.position.row === row && u.position.col === col
    );
    if (unit) {
      selectUnit(unit.id);
      return;
    }

    // 检查是否有城市
    const city = Object.values(cities).find(
      c => c.position.row === row && c.position.col === col
    );
    if (city) {
      selectCity(city.id);
      return;
    }

    if (selectedUnit && units[selectedUnit]) {
      const activeUnit = units[selectedUnit];
      if (activeUnit.position.row === row && activeUnit.position.col === col) {
        showMessage('已在该地块');
        return;
      }
      moveUnit(activeUnit.id, position);
      showMessage('单位已移动');
      return;
    }

    selectUnit(null);
    selectCity(null);
  }, [units, cities, selectedUnit, selectTile, selectUnit, selectCity, moveUnit, showMessage]);

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

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      // 可以在这里添加缩放功能
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('wheel', handleWheel);
    };
  }, [cameraPosition, setCameraPosition]);

  // 计算六边形网格的偏移
  const hexHeight = tileSize * Math.sqrt(3) / 2;
  const hexWidth = tileSize;

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden relative bg-slate-950"
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(196, 132, 62, 0.05) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(139, 0, 0, 0.05) 0%, transparent 50%)
        `,
      }}
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
              const tileKey = `${rowIndex},${colIndex}`;
              const isVisible = visibleTiles.has(tileKey);
              const isExplored = exploredTiles.has(tileKey);
              const isSelected = selectedTile?.row === rowIndex && selectedTile?.col === colIndex;

              // 检查是否有单位
              const unit = Object.values(units).find(
                u => u.position.row === rowIndex && u.position.col === colIndex
              );

              // 检查是否有城市
              const city = Object.values(cities).find(
                c => c.position.row === rowIndex && c.position.col === colIndex
              );

              // 更新tile数据
              const displayTile = {
                ...tile,
                unitId: unit?.id,
                hasCity: !!city,
              };

              if (!isVisible && !isExplored) {
                // 战争迷雾
                return (
                  <div
                    key={colIndex}
                    style={{ width: hexWidth, height: hexHeight }}
                    className="bg-slate-950"
                  />
                );
              }

              return (
                <div
                  key={colIndex}
                  data-tile-row={rowIndex}
                  data-tile-col={colIndex}
                  data-testid={`tile-${rowIndex}-${colIndex}`}
                  onClick={() => handleTileClick(rowIndex, colIndex)}
                  onMouseEnter={() => setHoveredTile({ row: rowIndex, col: colIndex })}
                  onMouseLeave={() => setHoveredTile(null)}
                  className="relative"
                  style={{ width: hexWidth, height: hexHeight }}
                >
                  <HexTile
                    tile={displayTile}
                    isSelected={isSelected}
                    isHighlighted={isVisible}
                    size={tileSize}
                  />
                  {!isVisible && isExplored && (
                    <div className="absolute inset-0 bg-slate-950/60 pointer-events-none" />
                  )}
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
    </div>
  );
}
