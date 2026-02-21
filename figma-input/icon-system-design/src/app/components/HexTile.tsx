/**
 * 六边形地块组件
 * 显示地形、资源、改良、产出等信息
 */

import React from 'react';
import { TileData, TERRAIN_COLORS } from './TileData';
import {
  FoodIcon,
  ProductionIcon,
  GoldIcon,
  ScienceIcon,
  CultureIcon,
  FaithIcon,
  IronIcon,
  HorseIcon,
  WheatIcon,
  SilkIcon,
  JadeIcon,
  TeaIcon,
  FarmIcon,
  WarriorIcon,
  ArcherIcon,
  CavalryIcon,
  PalaceIcon,
} from './oracle-bone-icons';

interface HexTileProps {
  x: number;
  y: number;
  size: number;
  data: TileData;
  isSelected?: boolean;
  onClick?: () => void;
}

// 生成六边形路径 - 尖顶朝上
function hexPoints(x: number, y: number, size: number): string {
  const points: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    points.push([
      x + size * Math.cos(angle),
      y + size * Math.sin(angle)
    ]);
  }
  return points.map(p => p.join(',')).join(' ');
}

// 产出类型定义
type YieldType = 'food' | 'production' | 'gold' | 'culture' | 'science' | 'faith';

// 产出配置（颜色和图标）
const YIELD_CONFIG: Record<YieldType, { color: string; Icon: any }> = {
  food: { color: '#fb923c', Icon: FoodIcon },
  production: { color: '#5a9f81', Icon: ProductionIcon },
  gold: { color: '#f59e0b', Icon: GoldIcon },
  culture: { color: '#a855f7', Icon: CultureIcon },
  science: { color: '#06b6d4', Icon: ScienceIcon },
  faith: { color: '#f97316', Icon: FaithIcon },
};

export function HexTile({ x, y, size, data, isSelected, onClick }: HexTileProps) {
  const terrainColor = TERRAIN_COLORS[data.terrain];
  
  // 获取资源图标
  const getResourceIcon = () => {
    const iconSize = 18;
    const iconProps = { size: iconSize, className: "drop-shadow" };
    
    switch (data.resource) {
      case 'iron':
        return <IronIcon {...iconProps} className="text-[var(--ink-600)]" />;
      case 'horse':
        return <HorseIcon {...iconProps} className="text-[var(--terracotta-500)]" />;
      case 'wheat':
        return <WheatIcon {...iconProps} className="text-[var(--gold-400)]" />;
      case 'silk':
        return <SilkIcon {...iconProps} className="text-[var(--purple-400)]" />;
      case 'jade':
        return <JadeIcon {...iconProps} className="text-[var(--jade-500)]" />;
      case 'tea':
        return <TeaIcon {...iconProps} className="text-[var(--bronze-500)]" />;
      default:
        return null;
    }
  };
  
  // 获取改良图标
  const getImprovementIcon = () => {
    if (!data.improvement) return null;
    const iconSize = 14;
    
    switch (data.improvement) {
      case 'farm':
        return <FarmIcon size={iconSize} className="text-[var(--terracotta-600)]" />;
      default:
        return null;
    }
  };
  
  // 获取单位图标
  const getUnitIcon = () => {
    if (!data.unit) return null;
    const iconSize = 22;
    
    switch (data.unit) {
      case 'warrior':
        return <WarriorIcon size={iconSize} className="text-[var(--cinnabar-500)]" />;
      case 'archer':
        return <ArcherIcon size={iconSize} className="text-[var(--terracotta-500)]" />;
      case 'cavalry':
        return <CavalryIcon size={iconSize} className="text-[var(--gold-500)]" />;
      default:
        return null;
    }
  };
  
  // 渲染单种产出的堆叠图标
  const renderSingleYieldStack = (amount: number, type: YieldType) => {
    if (amount <= 0) return null;
    
    const { color, Icon } = YIELD_CONFIG[type];
    const iconSize = 11;
    
    if (amount === 1) {
      // 1个：单个居中
      return (
        <div className="relative w-3 h-3 flex items-center justify-center">
          <div 
            className="absolute w-3 h-3 rounded-full opacity-90"
            style={{ backgroundColor: color }}
          />
          <Icon size={iconSize} className="relative text-white" style={{ filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.5))' }} />
        </div>
      );
    } else if (amount === 2) {
      // 2个：上下排布
      return (
        <div className="relative w-3 h-5 flex items-center justify-center">
          {[0, 1].map(i => (
            <div key={i} className="absolute" style={{ top: `${i * 6}px` }}>
              <div 
                className="absolute w-3 h-3 rounded-full opacity-90"
                style={{ backgroundColor: color }}
              />
              <div className="relative w-3 h-3 flex items-center justify-center">
                <Icon size={iconSize} className="text-white" style={{ filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.5))' }} />
              </div>
            </div>
          ))}
        </div>
      );
    } else if (amount === 3) {
      // 3个：正三角形
      return (
        <div className="relative w-5 h-5 flex items-center justify-center">
          {/* 底部两个 */}
          {[-1, 1].map((offset, i) => (
            <div key={`bottom-${i}`} className="absolute" style={{ left: `${6 + offset * 5}px`, top: '8px' }}>
              <div 
                className="absolute w-3 h-3 rounded-full opacity-90"
                style={{ backgroundColor: color }}
              />
              <div className="relative w-3 h-3 flex items-center justify-center">
                <Icon size={iconSize} className="text-white" style={{ filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.5))' }} />
              </div>
            </div>
          ))}
          {/* 顶部一个 */}
          <div className="absolute" style={{ left: '6px', top: '2px' }}>
            <div 
              className="absolute w-3 h-3 rounded-full opacity-90"
              style={{ backgroundColor: color }}
            />
            <div className="relative w-3 h-3 flex items-center justify-center">
              <Icon size={iconSize} className="text-white" style={{ filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.5))' }} />
            </div>
          </div>
        </div>
      );
    } else if (amount === 4) {
      // 4个：正方形（菱形）
      return (
        <div className="relative w-5 h-5 flex items-center justify-center">
          {[
            { x: 6, y: 2 },   // 上
            { x: 1, y: 6 },   // 左
            { x: 11, y: 6 },  // 右
            { x: 6, y: 10 },  // 下
          ].map((pos, i) => (
            <div key={i} className="absolute" style={{ left: `${pos.x}px`, top: `${pos.y}px` }}>
              <div 
                className="absolute w-3 h-3 rounded-full opacity-90"
                style={{ backgroundColor: color }}
              />
              <div className="relative w-3 h-3 flex items-center justify-center">
                <Icon size={iconSize} className="text-white" style={{ filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.5))' }} />
              </div>
            </div>
          ))}
        </div>
      );
    } else if (amount === 5) {
      // 5个：大图标
      return (
        <div className="relative w-4 h-4 flex items-center justify-center">
          <div 
            className="absolute w-4 h-4 rounded-full opacity-90"
            style={{ backgroundColor: color }}
          />
          <Icon size={14} className="relative text-white" style={{ filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.5))' }} />
        </div>
      );
    } else {
      // 超过5个：大图标+数字
      return (
        <div className="relative w-5 h-5 flex items-center justify-center">
          <div 
            className="absolute w-4 h-4 rounded-full opacity-90"
            style={{ backgroundColor: color }}
          />
          <Icon size={14} className="relative text-white" style={{ filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.5))' }} />
          <span 
            className="absolute -bottom-0.5 -right-0.5 text-[8px] font-bold rounded-full w-2.5 h-2.5 flex items-center justify-center border border-white"
            style={{ 
              backgroundColor: color,
              color: 'white',
              textShadow: '0 0 2px rgba(0,0,0,0.8)'
            }}
          >
            {amount}
          </span>
        </div>
      );
    }
  };
  
  // 渲染所有产出
  const renderYields = () => {
    if (data.hasCity) return null;
    
    // 按顺序收集产出：粮食、生产力、金钱、文化、科技、信仰
    const yields: Array<{ type: YieldType; amount: number }> = [];
    if (data.yields.food > 0) yields.push({ type: 'food', amount: data.yields.food });
    if (data.yields.production > 0) yields.push({ type: 'production', amount: data.yields.production });
    if (data.yields.gold > 0) yields.push({ type: 'gold', amount: data.yields.gold });
    if (data.yields.culture && data.yields.culture > 0) yields.push({ type: 'culture', amount: data.yields.culture });
    if (data.yields.science && data.yields.science > 0) yields.push({ type: 'science', amount: data.yields.science });
    if (data.yields.faith && data.yields.faith > 0) yields.push({ type: 'faith', amount: data.yields.faith });
    
    if (yields.length === 0) return null;
    
    // 分成两行
    const firstRow = yields.slice(0, 3);
    const secondRow = yields.slice(3);
    
    const renderRow = (rowYields: typeof yields) => {
      if (rowYields.length === 0) return null;
      
      if (rowYields.length === 1) {
        // 1种：居中
        return (
          <div className="flex items-center justify-center">
            {renderSingleYieldStack(rowYields[0].amount, rowYields[0].type)}
          </div>
        );
      } else if (rowYields.length === 2) {
        // 2种：第一种居中（实际占中间），第二种在右边，左边空
        return (
          <div className="flex items-center justify-center gap-0.5">
            <div className="w-5" /> {/* 左边占位 */}
            {renderSingleYieldStack(rowYields[0].amount, rowYields[0].type)}
            {renderSingleYieldStack(rowYields[1].amount, rowYields[1].type)}
          </div>
        );
      } else {
        // 3种：第一种居中，第二种右边，第三种左边
        return (
          <div className="flex items-center justify-center gap-0.5">
            {renderSingleYieldStack(rowYields[2].amount, rowYields[2].type)}
            {renderSingleYieldStack(rowYields[0].amount, rowYields[0].type)}
            {renderSingleYieldStack(rowYields[1].amount, rowYields[1].type)}
          </div>
        );
      }
    };
    
    return (
      <foreignObject
        x={x - size * 0.6}
        y={y - 12}
        width={size * 1.2}
        height={24}
        className="pointer-events-none"
      >
        <div className="flex flex-col items-center justify-center h-full gap-0.5">
          {renderRow(firstRow)}
          {secondRow.length > 0 && renderRow(secondRow)}
        </div>
      </foreignObject>
    );
  };
  
  return (
    <g onClick={onClick} className="cursor-pointer hex-tile-group">
      {/* 六边形底色 */}
      <polygon
        points={hexPoints(x, y, size)}
        fill={terrainColor}
        stroke={isSelected ? 'var(--gold-500)' : 'var(--bronze-700)'}
        strokeWidth={isSelected ? 3 : 1.5}
        opacity={0.9}
        className="transition-all hover:brightness-110"
      />
      
      {/* 城市 */}
      {data.hasCity && (
        <g>
          <circle
            cx={x}
            cy={y - size * 0.1}
            r={size * 0.4}
            fill="var(--bronze-800)"
            stroke="var(--gold-500)"
            strokeWidth="2"
            opacity="0.9"
          />
          <foreignObject
            x={x - size * 0.3}
            y={y - size * 0.4}
            width={size * 0.6}
            height={size * 0.6}
            className="pointer-events-none"
          >
            <div className="flex items-center justify-center w-full h-full">
              <PalaceIcon size={size * 0.5} className="text-[var(--gold-400)]" />
            </div>
          </foreignObject>
          {data.cityName && (
            <text
              x={x}
              y={y + size * 0.75}
              textAnchor="middle"
              fill="var(--parchment-50)"
              stroke="var(--bronze-900)"
              strokeWidth="2"
              paintOrder="stroke"
              fontSize="10"
              fontWeight="bold"
              className="pointer-events-none"
            >
              {data.cityName}
            </text>
          )}
        </g>
      )}
      
      {/* 单位图标（偏上位置） */}
      {!data.hasCity && data.unit && (
        <foreignObject
          x={x - 12}
          y={y - size * 0.55}
          width={24}
          height={24}
          className="pointer-events-none"
        >
          <div className="flex items-center justify-center w-full h-full bg-[var(--bronze-800)] rounded-full border-2 border-[var(--bronze-600)]">
            {getUnitIcon()}
          </div>
        </foreignObject>
      )}
      
      {/* 产出图标（格子中间） */}
      {renderYields()}
      
      {/* 资源图标（偏下位置） */}
      {data.resource && (
        <foreignObject
          x={x - 10}
          y={y + size * 0.35}
          width={20}
          height={20}
          className="pointer-events-none"
        >
          <div className="flex items-center justify-center w-full h-full bg-[var(--parchment-100)] rounded-full border-2 border-[var(--bronze-600)] p-0.5">
            {getResourceIcon()}
          </div>
        </foreignObject>
      )}
      
      {/* 改良图标（左上角） */}
      {data.improvement && (
        <foreignObject
          x={x - size * 0.5}
          y={y - size * 0.5}
          width={16}
          height={16}
          className="pointer-events-none"
        >
          <div className="flex items-center justify-center w-full h-full">
            {getImprovementIcon()}
          </div>
        </foreignObject>
      )}
    </g>
  );
}
