import * as React from 'react';
import { cn } from '../utils/cn';
import type { Tile, Position, Yields } from '@chunqiu/types';

interface HexTileProps {
  tile: Tile;
  isSelected?: boolean;
  isHighlighted?: boolean;
  isInRange?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  size?: number;
  className?: string;
}

// 地形颜色映射
const terrainColors: Record<string, string> = {
  grassland: 'bg-terrain-grassland',
  plains: 'bg-terrain-plains',
  desert: 'bg-terrain-desert',
  tundra: 'bg-terrain-tundra',
  coast: 'bg-terrain-coast',
  ocean: 'bg-terrain-ocean',
};

// 海拔样式
const elevationStyles: Record<string, string> = {
  flat: '',
  hill: 'brightness-90',
  mountain: 'brightness-75 grayscale-20',
};

// 资源图标
const resourceIcons: Record<string, string> = {
  food: '🌾',
  production: '⚒️',
  gold: '💰',
  luxury: '💎',
  strategic: '⛏️',
};

export function HexTile({
  tile,
  isSelected = false,
  isHighlighted = false,
  isInRange = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  size = 60,
  className,
}: HexTileProps) {
  const { terrain, elevation, resource, improvement, owner, hasCity, unitId } = tile;

  // 计算六边形路径
  const hexPath = React.useMemo(() => {
    const w = size;
    const h = size * Math.sqrt(3) / 2;
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const x = w / 2 + (w / 2 - 2) * Math.cos(angle);
      const y = h / 2 + (h / 2 - 2) * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  }, [size]);

  return (
    <div
      className={cn(
        'relative cursor-pointer transition-all duration-150',
        'hover:scale-105 hover:z-10',
        className
      )}
      style={{
        width: size,
        height: size * Math.sqrt(3) / 2,
      }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* 六边形 SVG */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${size} ${size * Math.sqrt(3) / 2}`}
      >
        {/* 基础地形 */}
        <polygon
          points={hexPath}
          className={cn(
            terrainColors[terrain] || 'bg-gray-400',
            elevationStyles[elevation],
            'transition-all duration-200'
          )}
          stroke={isSelected ? '#DAA520' : isHighlighted ? '#7CB342' : 'rgba(0,0,0,0.2)'}
          strokeWidth={isSelected ? 3 : isHighlighted ? 2 : 1}
        />

        {/* 选中/高亮效果 */}
        {(isSelected || isHighlighted || isInRange) && (
          <polygon
            points={hexPath}
            className={cn(
              'pointer-events-none',
              isSelected && 'fill-ancient-gold/20',
              isHighlighted && 'fill-green-400/20',
              isInRange && 'fill-blue-400/15'
            )}
          />
        )}

        {/* 边界线 - 如果有所有者 */}
        {owner && (
          <polygon
            points={hexPath}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeDasharray="4,2"
            className="text-bronze-600"
          />
        )}
      </svg>

      {/* 内容层 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {/* 资源图标 */}
        {resource && (
          <span
            className="text-lg drop-shadow-md"
            title={resource.name}
          >
            {resourceIcons[resource.type] || '•'}
          </span>
        )}

        {/* 改良设施 */}
        {improvement && (
          <span className="text-xs absolute bottom-1 opacity-80">
            {improvement.type === 'farm' && '🚜'}
            {improvement.type === 'mine' && '⛏️'}
            {improvement.type === 'lumber_mill' && '🪵'}
            {improvement.type === 'trading_post' && '🏪'}
            {improvement.type === 'camp' && '⛺'}
          </span>
        )}

        {/* 城市标记 */}
        {hasCity && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-ancient-red rounded-full flex items-center justify-center shadow-lg border-2 border-ancient-gold">
              <span className="text-xs">🏛️</span>
            </div>
          </div>
        )}

        {/* 单位标记 */}
        {unitId && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-bronze-600 rounded-full flex items-center justify-center shadow-md">
            <span className="text-xs">⚔️</span>
          </div>
        )}
      </div>

      {/* 坐标调试 (开发时可用) */}
      {/*
      <div className="absolute bottom-0 left-0 right-0 text-[8px] text-center text-black/50">
        {tile.position.row},{tile.position.col}
      </div>
      */}
    </div>
  );
}

// 简化版六边形（用于小地图等）
interface MiniHexProps {
  terrain: string;
  size?: number;
  className?: string;
}

export function MiniHex({ terrain, size = 20, className }: MiniHexProps) {
  const hexPath = React.useMemo(() => {
    const w = size;
    const h = size * Math.sqrt(3) / 2;
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const x = w / 2 + (w / 2 - 1) * Math.cos(angle);
      const y = h / 2 + (h / 2 - 1) * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  }, [size]);

  return (
    <svg
      className={className}
      width={size}
      height={size * Math.sqrt(3) / 2}
      viewBox={`0 0 ${size} ${size * Math.sqrt(3) / 2}`}
    >
      <polygon
        points={hexPath}
        className={terrainColors[terrain] || 'bg-gray-400'}
        stroke="rgba(0,0,0,0.1)"
        strokeWidth={0.5}
      />
    </svg>
  );
}
