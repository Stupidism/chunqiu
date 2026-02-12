import * as React from 'react';
import { cn } from '../utils/cn';
import { OracleIcon } from './OracleIcon';
import type { Tile, Position, UnitType } from '@chunqiu/types';

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
  unitType?: UnitType;
  tileYields?: {
    food: number;
    production: number;
    gold: number;
  };
}

const iconBase = '/oracle-bone-icons';

// 地形颜色映射
const terrainColors: Record<string, string> = {
  grassland: '#7CB342',
  plains: '#C5A059',
  desert: '#E6C875',
  tundra: '#B8C5D6',
  coast: '#4FC3F7',
  ocean: '#0288D1',
};

// 海拔明暗调整
const elevationShade: Record<string, number> = {
  flat: 0,
  hill: -14,
  mountain: -28,
};

// 资源图标
const resourceIcons: Record<string, { src: string; tone: string; fallback: string }> = {
  food: { src: `${iconBase}/terrain/草.svg`, tone: 'text-emerald-200', fallback: '🌾' },
  production: { src: `${iconBase}/buildings/斤.svg`, tone: 'text-amber-200', fallback: '⚒️' },
  gold: { src: `${iconBase}/yields/金.svg`, tone: 'text-yellow-200', fallback: '💰' },
  luxury: { src: `${iconBase}/resources/香.svg`, tone: 'text-purple-200', fallback: '💎' },
  strategic: { src: `${iconBase}/resources/铁.svg`, tone: 'text-slate-100', fallback: '⛏️' },
};

const unitTypeIcons: Record<string, { src: string; tone: string }> = {
  warrior: { src: `${iconBase}/eras/剑.svg`, tone: 'text-bronze-100' },
  archer: { src: `${iconBase}/status/击.svg`, tone: 'text-bronze-100' },
  chariot: { src: `${iconBase}/status/足.svg`, tone: 'text-bronze-100' },
  spearman: { src: `${iconBase}/status/盾.svg`, tone: 'text-bronze-100' },
  swordsman: { src: `${iconBase}/eras/剑.svg`, tone: 'text-bronze-100' },
  worker: { src: `${iconBase}/status/造.svg`, tone: 'text-bronze-100' },
  settler: { src: `${iconBase}/buildings/市.svg`, tone: 'text-bronze-100' },
  scout: { src: `${iconBase}/status/医.svg`, tone: 'text-bronze-100' },
};

const cityIconSrc = `${iconBase}/buildings/市.svg`;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function adjustHexColor(hex: string, amount: number) {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return hex;
  const num = parseInt(clean, 16);
  const r = clamp((num >> 16) + amount, 0, 255);
  const g = clamp(((num >> 8) & 0xff) + amount, 0, 255);
  const b = clamp((num & 0xff) + amount, 0, 255);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

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
  unitType,
  tileYields,
}: HexTileProps) {
  const { terrain, elevation, resource, improvement, owner, hasCity, unitId } = tile;
  const baseColor = terrainColors[terrain] || '#666666';
  const fillColor = adjustHexColor(baseColor, elevationShade[elevation] ?? 0);

  const yieldEntries = tileYields
    ? [
        { key: 'food', count: tileYields.food },
        { key: 'production', count: tileYields.production },
        { key: 'gold', count: tileYields.gold },
      ].filter(entry => entry.count > 0)
    : [];

  const yieldBase = Math.max(5, Math.round(size * 0.085));
  const yieldSingle = Math.max(6, Math.round(size * 0.1));
  const yieldLarge = Math.max(8, Math.round(size * 0.14));

  const renderYieldDot = (type: string, dotSize: number, showCount?: number) => {
    const icon = resourceIcons[type];
    if (!icon) return null;
    return (
      <div
        className={cn(
          'rounded-full flex items-center justify-center relative shadow-[0_1px_3px_rgba(0,0,0,0.45)]',
          type === 'food' && 'bg-emerald-500/90',
          type === 'production' && 'bg-amber-500/90',
          type === 'gold' && 'bg-yellow-500/90'
        )}
        style={{ width: dotSize, height: dotSize }}
      >
        <OracleIcon
          src={icon.src}
          size={Math.max(7, dotSize - 5)}
          tone={icon.tone}
          label={type}
        />
        {showCount && showCount > 5 && (
          <span className="absolute inset-0 flex items-center justify-center text-[8px] text-slate-900 font-bold">
            {showCount}
          </span>
        )}
      </div>
    );
  };

  const renderYieldCluster = (type: string, count: number) => {
    if (count <= 0) return null;
    if (count === 1) {
      return renderYieldDot(type, yieldSingle);
    }
    if (count === 2) {
      return (
        <div className="flex flex-col items-center gap-0.5">
          {renderYieldDot(type, yieldBase)}
          {renderYieldDot(type, yieldBase)}
        </div>
      );
    }
    if (count === 3) {
      return (
        <div className="grid grid-cols-2 grid-rows-2 gap-0.5">
          <div className="col-span-2 flex justify-center">
            {renderYieldDot(type, yieldBase)}
          </div>
          {renderYieldDot(type, yieldBase)}
          {renderYieldDot(type, yieldBase)}
        </div>
      );
    }
    if (count === 4) {
      return (
        <div className="grid grid-cols-2 grid-rows-2 gap-0.5">
          {renderYieldDot(type, yieldBase)}
          {renderYieldDot(type, yieldBase)}
          {renderYieldDot(type, yieldBase)}
          {renderYieldDot(type, yieldBase)}
        </div>
      );
    }
    return renderYieldDot(type, yieldLarge, count);
  };

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
          className="transition-all duration-200"
          fill={fillColor}
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
        {/* 产出 */}
        {(yieldEntries.length > 0 || resource) && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 opacity-90">
            {yieldEntries.length > 0 && (
              <div className="flex items-center gap-1">
                {yieldEntries.map(entry => (
                  <div key={entry.key} className="flex items-center">
                    {renderYieldCluster(entry.key, entry.count)}
                  </div>
                ))}
              </div>
            )}
            {resource && (
              <div className="w-4 h-4 rounded-full bg-slate-900/70 border border-slate-700 flex items-center justify-center mt-0.5">
                {resourceIcons[resource.type]?.src ? (
                  <OracleIcon
                    src={resourceIcons[resource.type].src}
                    size={11}
                    tone={resourceIcons[resource.type].tone}
                    label={resource.name}
                  />
                ) : (
                  <span className="text-[9px]">{resourceIcons[resource.type]?.fallback || '•'}</span>
                )}
              </div>
            )}
          </div>
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
              <OracleIcon src={cityIconSrc} size={16} tone="text-bronze-50" label="城市" />
            </div>
          </div>
        )}

        {/* 单位标记 */}
        {unitId && (
          <div className="absolute top-1 right-1 w-5 h-5 bg-bronze-700/90 rounded-full flex items-center justify-center shadow-md border border-bronze-300">
            {unitTypeIcons[unitType || 'warrior'] ? (
              <OracleIcon
                src={unitTypeIcons[unitType || 'warrior'].src}
                size={12}
                tone={unitTypeIcons[unitType || 'warrior'].tone}
                label="单位"
              />
            ) : (
              <span className="text-[10px]">⚔️</span>
            )}
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
        fill={terrainColors[terrain] || '#666666'}
        stroke="rgba(0,0,0,0.1)"
        strokeWidth={0.5}
      />
    </svg>
  );
}
