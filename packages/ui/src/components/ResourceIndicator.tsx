import * as React from 'react';
import { cn } from '../utils/cn';
import type { Yields } from '@chunqiu/types';

interface ResourceIndicatorProps {
  yields: Partial<Yields>;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
}

const resourceConfig = {
  food: {
    icon: '🌾',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: '粮食',
  },
  production: {
    icon: '⚒️',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    label: '产能',
  },
  gold: {
    icon: '💰',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    label: '金币',
  },
  science: {
    icon: '📜',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: '科研',
  },
  culture: {
    icon: '🎭',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    label: '文化',
  },
};

const sizeConfig = {
  sm: {
    container: 'gap-1',
    item: 'px-1.5 py-0.5 text-xs',
    icon: 'text-xs',
  },
  md: {
    container: 'gap-2',
    item: 'px-2 py-1 text-sm',
    icon: 'text-sm',
  },
  lg: {
    container: 'gap-3',
    item: 'px-3 py-1.5 text-base',
    icon: 'text-base',
  },
};

export function ResourceIndicator({
  yields,
  size = 'md',
  showLabels = false,
  className,
}: ResourceIndicatorProps) {
  const sizeClasses = sizeConfig[size];

  return (
    <div className={cn('flex flex-wrap', sizeClasses.container, className)}>
      {(Object.entries(yields) as [keyof Yields, number][]).map(
        ([key, value]) => {
          if (value === 0 || value === undefined) return null;
          const config = resourceConfig[key];
          const isPositive = value > 0;

          return (
            <div
              key={key}
              className={cn(
                'flex items-center gap-1 rounded-md font-medium',
                sizeClasses.item,
                config.bgColor,
                config.color,
                'border border-opacity-20',
                isPositive ? 'border-current' : 'border-red-400 bg-red-50 text-red-600'
              )}
              title={config.label}
            >
              <span className={sizeClasses.icon}>{config.icon}</span>
              <span>
                {isPositive ? '+' : ''}
                {value}
              </span>
              {showLabels && (
                <span className="text-xs opacity-70 ml-0.5">{config.label}</span>
              )}
            </div>
          );
        }
      )}
    </div>
  );
}

// 单个资源指示器
interface SingleResourceProps {
  type: keyof Yields;
  value: number;
  perTurn?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SingleResource({
  type,
  value,
  perTurn = false,
  size = 'md',
  className,
}: SingleResourceProps) {
  const config = resourceConfig[type];
  const sizeClasses = sizeConfig[size];

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 rounded-md font-medium',
        sizeClasses.item,
        config.bgColor,
        config.color,
        'border border-current border-opacity-20',
        className
      )}
    >
      <span className={sizeClasses.icon}>{config.icon}</span>
      <span>
        {perTurn && value >= 0 ? '+' : ''}
        {value}
        {perTurn && '/回合'}
      </span>
    </div>
  );
}
