'use client';

import { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { HexTile, OracleIcon } from '@chunqiu/ui';
import { useGameStore } from '@/stores/gameStore';
import { calculateTileYields } from '@chunqiu/game-core';

function offsetToCube(row: number, col: number) {
  const x = col - (row - (row & 1)) / 2;
  const z = row;
  const y = -x - z;
  return { x, y, z };
}

function getHexDistance(a: { row: number; col: number }, b: { row: number; col: number }) {
  const ac = offsetToCube(a.row, a.col);
  const bc = offsetToCube(b.row, b.col);
  return Math.max(
    Math.abs(ac.x - bc.x),
    Math.abs(ac.y - bc.y),
    Math.abs(ac.z - bc.z)
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function GameMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAutoCentered = useRef(false);
  const suppressClickUntilRef = useRef(0);
  const cameraRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const {
    gameState,
    selectedTile,
    selectedUnit,
    activeAction,
    selectTile,
    selectUnit,
    selectCity,
    moveUnit,
    setHoveredTile,
    setActiveAction,
    showMessage,
    hoveredTile,
    visibleTiles,
    exploredTiles,
    cameraPosition,
    zoom,
    setCameraPosition,
    setZoom,
  } = useGameStore();

  if (!gameState) return null;

  const { map, units, cities } = gameState;
  const tileSize = 60 * zoom;
  const hexHeight = tileSize * Math.sqrt(3) / 2;
  const hexWidth = tileSize;
  const mapPixelWidth = map.width * hexWidth + hexWidth / 2;
  const mapPixelHeight = hexHeight + Math.max(0, map.height - 1) * (hexHeight * 0.75);

  const clampCameraPosition = useCallback(
    (position: { x: number; y: number }) => {
      const container = containerRef.current;
      if (!container) return position;
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return position;

      const marginX = Math.max(120, rect.width * 0.2);
      const marginY = Math.max(80, rect.height * 0.18);
      let minX = rect.width - mapPixelWidth - marginX;
      let maxX = marginX;
      let minY = rect.height - mapPixelHeight - marginY;
      let maxY = marginY;

      if (mapPixelWidth + marginX * 2 <= rect.width) {
        minX = (rect.width - mapPixelWidth) / 2;
        maxX = minX;
      }
      if (mapPixelHeight + marginY * 2 <= rect.height) {
        minY = (rect.height - mapPixelHeight) / 2;
        maxY = minY;
      }

      return {
        x: clamp(position.x, minX, maxX),
        y: clamp(position.y, minY, maxY),
      };
    },
    [mapPixelHeight, mapPixelWidth]
  );

  useEffect(() => {
    cameraRef.current = cameraPosition;
  }, [cameraPosition]);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  const moveRange = useMemo(() => {
    if (activeAction !== 'move' || !selectedUnit) return new Set<string>();
    const unit = units[selectedUnit];
    if (!unit || unit.movement <= 0) return new Set<string>();

    const range = new Set<string>();
    for (let row = 0; row < map.height; row++) {
      for (let col = 0; col < map.width; col++) {
        const distance = getHexDistance(unit.position, { row, col });
        if (distance > 0 && distance <= unit.movement) {
          range.add(`${row},${col}`);
        }
      }
    }
    return range;
  }, [activeAction, selectedUnit, units, map.height, map.width]);

  // 处理地块点击
  const handleTileClick = useCallback((row: number, col: number) => {
    if (Date.now() < suppressClickUntilRef.current) return;
    const position = { row, col };
    selectTile(position);

    if (activeAction === 'move' && selectedUnit && units[selectedUnit]) {
      const activeUnit = units[selectedUnit];
      if (activeUnit.movement <= 0) {
        showMessage('移动力不足');
        setActiveAction(null);
        return;
      }

      const distance = getHexDistance(activeUnit.position, position);
      if (distance === 0) {
        showMessage('已在该地块');
        setActiveAction(null);
        return;
      }
      if (distance > activeUnit.movement) {
        showMessage('超出移动范围');
        return;
      }

      const occupiedUnit = Object.values(units).find(
        u => u.position.row === row && u.position.col === col && u.id !== activeUnit.id
      );
      if (occupiedUnit) {
        showMessage('目标被单位占用');
        return;
      }

      const occupiedCity = Object.values(cities).find(
        c => c.position.row === row && c.position.col === col
      );
      if (occupiedCity) {
        showMessage('目标被城市占用');
        return;
      }

      moveUnit(activeUnit.id, position, distance);
      showMessage(`单位已移动 (-${distance})`);
      setActiveAction(null);
      return;
    }

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

    selectUnit(null);
    selectCity(null);
  }, [
    units,
    cities,
    selectedUnit,
    activeAction,
    selectTile,
    selectUnit,
    selectCity,
    moveUnit,
    showMessage,
    setActiveAction,
  ]);

  // 首次进入自动把地图放到视口中心，避免初始偏到左上角。
  useEffect(() => {
    if (hasAutoCentered.current) return;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const playerUnit = Object.values(units).find(
      u => u.ownerId === gameState.currentPlayerId
    );
    const playerCity = Object.values(cities).find(
      c => c.ownerId === gameState.currentPlayerId
    );
    const focus =
      selectedTile ??
      playerUnit?.position ??
      playerCity?.position ?? {
        row: Math.floor(map.height / 2),
        col: Math.floor(map.width / 2),
      };
    const focusX = focus.col * hexWidth + (focus.row % 2 === 1 ? hexWidth / 2 : 0) + hexWidth / 2;
    const focusY = focus.row * (hexHeight * 0.75) + hexHeight / 2;

    // 给右侧 UI 留出空间，镜头中心略偏左。
    const viewportCenterX = rect.width * 0.42;
    const viewportCenterY = rect.height * 0.52;
    const nextX = viewportCenterX - focusX;
    const nextY = viewportCenterY - focusY;
    setCameraPosition(clampCameraPosition({ x: nextX, y: nextY }));
    hasAutoCentered.current = true;
  }, [
    map.width,
    map.height,
    selectedTile,
    units,
    cities,
    gameState.currentPlayerId,
    hexHeight,
    hexWidth,
    clampCameraPosition,
    setCameraPosition,
  ]);

  // 处理拖拽
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const panState = {
      active: false,
      moved: false,
      startX: 0,
      startY: 0,
      startCamX: 0,
      startCamY: 0,
    };
    const dragThreshold = 6;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0 || e.button === 1 || (e.button === 0 && e.shiftKey)) {
        panState.active = true;
        panState.moved = false;
        panState.startX = e.clientX;
        panState.startY = e.clientY;
        panState.startCamX = cameraRef.current.x;
        panState.startCamY = cameraRef.current.y;
        if (e.button === 0) {
          e.preventDefault();
        }
        container.style.cursor = 'grabbing';
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!panState.active) return;
      const dx = e.clientX - panState.startX;
      const dy = e.clientY - panState.startY;
      if (!panState.moved && Math.hypot(dx, dy) < dragThreshold) {
        return;
      }
      panState.moved = true;
      setCameraPosition(clampCameraPosition({
        x: panState.startCamX + dx,
        y: panState.startCamY + dy,
      }));
    };

    const handleMouseUp = () => {
      if (!panState.active) return;
      if (panState.moved) {
        suppressClickUntilRef.current = Date.now() + 180;
      }
      panState.active = false;
      panState.moved = false;
      container.style.cursor = 'default';
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const direction = e.deltaY > 0 ? -0.08 : 0.08;
      const currentZoom = zoomRef.current;
      const currentCamera = cameraRef.current;
      const nextZoom = clamp(currentZoom + direction, 0.5, 2);
      if (nextZoom === currentZoom) return;
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const anchorX = (mouseX - currentCamera.x) / currentZoom;
      const anchorY = (mouseY - currentCamera.y) / currentZoom;
      setCameraPosition(clampCameraPosition({
        x: mouseX - anchorX * nextZoom,
        y: mouseY - anchorY * nextZoom,
      }));
      setZoom(nextZoom);
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
  }, [clampCameraPosition, setCameraPosition, setZoom]);

  const hoveredInfo = useMemo(() => {
    if (!hoveredTile) return null;
    const { row, col } = hoveredTile;
    if (row < 0 || row >= map.height || col < 0 || col >= map.width) return null;
    const tile = map.tiles[row][col];
    const unit = Object.values(units).find(
      u => u.position.row === row && u.position.col === col
    );
    const city = Object.values(cities).find(
      c => c.position.row === row && c.position.col === col
    );
    const tileKey = `${row},${col}`;
    const isVisible = visibleTiles.has(tileKey);
    const isExplored = exploredTiles.has(tileKey);
    return { tile, unit, city, isVisible, isExplored };
  }, [hoveredTile, map.tiles, map.height, map.width, units, cities, visibleTiles, exploredTiles]);

  const iconBase = '/oracle-bone-icons';
  const terrainNames: Record<string, string> = {
    grassland: '草原',
    plains: '平原',
    desert: '沙漠',
    tundra: '冻土',
    coast: '海岸',
    ocean: '海洋',
  };

  const elevationNames: Record<string, string> = {
    flat: '平地',
    hill: '丘陵',
    mountain: '山地',
  };

  const unitNames: Record<string, string> = {
    warrior: '战士',
    archer: '弓箭手',
    chariot: '战车',
    spearman: '矛兵',
    swordsman: '剑士',
    worker: '工人',
    settler: '移民',
    scout: '侦察兵',
  };

  const tooltipStyle = useMemo(() => {
    if (!hoverPos || typeof window === 'undefined') return null;
    const offset = 14;
    const width = 220;
    const height = 150;
    let left = hoverPos.x + offset;
    let top = hoverPos.y + offset;
    const maxLeft = window.innerWidth - width - 12;
    const maxTop = window.innerHeight - height - 12;
    if (left > maxLeft) left = hoverPos.x - width - offset;
    if (left < 12) left = 12;
    if (top > maxTop) top = hoverPos.y - height - offset;
    if (top < 12) top = 12;
    return { left, top, width };
  }, [hoverPos]);

  const terrainIcons: Record<string, string> = {
    grassland: `${iconBase}/terrain/草.svg`,
    plains: `${iconBase}/terrain/泥.svg`,
    desert: `${iconBase}/terrain/沙.svg`,
    tundra: `${iconBase}/terrain/冰.svg`,
    coast: `${iconBase}/terrain/海.svg`,
    ocean: `${iconBase}/terrain/海.svg`,
  };

  const yieldIcons: Record<string, string> = {
    food: `${iconBase}/terrain/草.svg`,
    production: `${iconBase}/buildings/斤.svg`,
    gold: `${iconBase}/yields/金.svg`,
  };

  const unitTypeIcons: Record<string, string> = {
    warrior: `${iconBase}/eras/剑.svg`,
    archer: `${iconBase}/status/击.svg`,
    chariot: `${iconBase}/status/足.svg`,
    spearman: `${iconBase}/status/盾.svg`,
    swordsman: `${iconBase}/eras/剑.svg`,
    worker: `${iconBase}/status/造.svg`,
    settler: `${iconBase}/buildings/市.svg`,
    scout: `${iconBase}/status/医.svg`,
  };

  const hoveredYields = useMemo(() => {
    if (!hoveredInfo || !hoveredInfo.isExplored) return null;
    return calculateTileYields(hoveredInfo.tile);
  }, [hoveredInfo]);

  const handlePointerMove = useCallback((event: React.MouseEvent) => {
    setHoverPos({ x: event.clientX, y: event.clientY });
  }, []);

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
              const isInRange = moveRange.has(tileKey) && isVisible;

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
              const tileYields = isVisible ? calculateTileYields(tile) : undefined;

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
                  onMouseEnter={(event) => {
                    setHoveredTile({ row: rowIndex, col: colIndex });
                    handlePointerMove(event);
                  }}
                  onMouseMove={handlePointerMove}
                  onMouseLeave={() => {
                    setHoveredTile(null);
                    setHoverPos(null);
                  }}
                  className="relative"
                  style={{ width: hexWidth, height: hexHeight }}
                >
                  <HexTile
                    tile={displayTile}
                    isSelected={isSelected}
                    isHighlighted={isVisible}
                    isInRange={isInRange}
                    size={tileSize}
                    unitType={unit?.type}
                    tileYields={tileYields}
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
      <div className="absolute top-24 left-4 bg-slate-900/85 border border-bronze-600/40 text-bronze-100 px-3 py-1 rounded text-sm shadow-lg backdrop-blur">
        {activeAction === 'move'
          ? '移动模式：点击高亮地块'
          : selectedTile
            ? `坐标: (${selectedTile.row}, ${selectedTile.col})`
            : '鼠标悬停查看信息'}
      </div>

      {hoveredInfo && hoverPos && tooltipStyle && (
        <div
          className="fixed bg-slate-900/95 border border-bronze-600/50 text-bronze-100 px-3 py-2 rounded text-xs space-y-2 min-w-[200px] shadow-lg backdrop-blur pointer-events-none"
          style={tooltipStyle}
        >
          <div className="flex items-center justify-between">
            <div className="font-medium text-bronze-200">地块信息</div>
            {hoveredTile && (
              <div className="text-[10px] text-bronze-400">
                {hoveredTile.row},{hoveredTile.col}
              </div>
            )}
          </div>
          {!hoveredInfo.isExplored && <div className="text-bronze-400">未探索</div>}
          {hoveredInfo.isExplored && (
            <>
              <div className="flex items-center gap-2">
                <OracleIcon
                  src={terrainIcons[hoveredInfo.tile.terrain]}
                  size={14}
                  tone="text-emerald-200"
                  label={terrainNames[hoveredInfo.tile.terrain]}
                />
                <span>
                  {terrainNames[hoveredInfo.tile.terrain] || hoveredInfo.tile.terrain} ·{' '}
                  {elevationNames[hoveredInfo.tile.elevation] || hoveredInfo.tile.elevation}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-bronze-400">资源</span>
                {hoveredInfo.tile.resource ? (
                  <>
                    <OracleIcon
                      src={hoveredInfo.tile.resource.type === 'strategic' ? `${iconBase}/resources/铁.svg` : `${iconBase}/resources/香.svg`}
                      size={12}
                      tone="text-bronze-100"
                      label={hoveredInfo.tile.resource.name}
                    />
                    <span>{hoveredInfo.tile.resource.name}</span>
                  </>
                ) : (
                  <span className="text-bronze-200">无</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-bronze-400">单位</span>
                {hoveredInfo.unit ? (
                  <>
                    <OracleIcon
                      src={unitTypeIcons[hoveredInfo.unit.type] || unitTypeIcons.warrior}
                      size={12}
                      tone="text-bronze-100"
                      label={unitNames[hoveredInfo.unit.type]}
                    />
                    <span>
                      {unitNames[hoveredInfo.unit.type] || hoveredInfo.unit.type}
                    </span>
                    <span className="text-[10px] text-bronze-400">
                      {hoveredInfo.unit.health}/{hoveredInfo.unit.maxHealth} · {hoveredInfo.unit.movement}/{hoveredInfo.unit.maxMovement}
                    </span>
                  </>
                ) : (
                  <span className="text-bronze-200">无</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-bronze-400">城市</span>
                {hoveredInfo.city ? (
                  <>
                    <OracleIcon src={`${iconBase}/buildings/市.svg`} size={12} tone="text-bronze-100" label="城市" />
                    <span>{hoveredInfo.city.name}</span>
                  </>
                ) : (
                  <span className="text-bronze-200">无</span>
                )}
              </div>
              {hoveredYields && (
                <div className="flex items-center gap-2 pt-1 border-t border-bronze-700/40">
                  {(['food', 'production', 'gold'] as const).map(key => (
                    <div key={key} className="flex items-center gap-1">
                      <OracleIcon src={yieldIcons[key]} size={12} tone="text-bronze-100" label={key} />
                      <span className="text-[11px] text-bronze-200">{hoveredYields[key]}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
