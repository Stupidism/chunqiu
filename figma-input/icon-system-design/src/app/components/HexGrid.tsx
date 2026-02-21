/**
 * 六边形网格组件 - 带地块数据
 * 用于游戏地图的六边形瓦片系统
 */

import React, { useState, useEffect } from 'react';
import { TileData, generateMapData } from './TileData';
import { HexTile } from './HexTile';

interface HexGridProps {
  rows?: number;
  cols?: number;
  hexSize?: number;
  onHexClick?: (row: number, col: number, data: TileData) => void;
}

export function HexGrid({ rows = 8, cols = 12, hexSize = 40, onHexClick }: HexGridProps) {
  const [mapData, setMapData] = useState<TileData[][]>([]);
  const [selectedTile, setSelectedTile] = useState<{ row: number; col: number } | null>(null);
  
  // 生成地图数据
  useEffect(() => {
    setMapData(generateMapData(rows, cols));
  }, [rows, cols]);
  
  // 对于尖顶朝上的六边形
  const hexWidth = hexSize * Math.sqrt(3);   // 六边形的宽度
  const hexHeight = hexSize * 2;              // 六边形的高度
  
  // 水平方向：同一行紧密排列，间距就是宽度
  const horizSpacing = hexWidth;
  // 垂直方向：行与行之间的间距（重叠部分）
  const vertSpacing = hexSize * 1.5;
  
  const width = (cols + 0.5) * horizSpacing + hexSize * 2;
  const height = rows * vertSpacing + hexSize + hexSize * 2;

  const hexes: Array<{ x: number; y: number; row: number; col: number }> = [];
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // 奇数行向右偏移半个身位
      const xOffset = (row % 2 === 1) ? horizSpacing / 2 : 0;
      const x = col * horizSpacing + xOffset + hexSize * 2;
      const y = row * vertSpacing + hexSize * 2;
      hexes.push({ x, y, row, col });
    }
  }
  
  const handleTileClick = (row: number, col: number) => {
    setSelectedTile({ row, col });
    if (mapData[row] && mapData[row][col]) {
      onHexClick?.(row, col, mapData[row][col]);
    }
  };

  return (
    <svg 
      width={width} 
      height={height}
      className="hex-grid"
      style={{ 
        background: 'transparent',
        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
      }}
    >
      {hexes.map(({ x, y, row, col }) => {
        const tileData = mapData[row]?.[col];
        if (!tileData) return null;
        
        const isSelected = selectedTile?.row === row && selectedTile?.col === col;
        
        return (
          <HexTile
            key={`${row}-${col}`}
            x={x}
            y={y}
            size={hexSize}
            data={tileData}
            isSelected={isSelected}
            onClick={() => handleTileClick(row, col)}
          />
        );
      })}
    </svg>
  );
}
