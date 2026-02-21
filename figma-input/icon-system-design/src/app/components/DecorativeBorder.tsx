/**
 * 甲骨文装饰边框组件
 * 用于为面板添加古朴的装饰性边框
 */

import React from 'react';

interface DecorativeBorderProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'bronze' | 'parchment';
}

export function DecorativeBorder({ 
  children, 
  className = '', 
  variant = 'bronze' 
}: DecorativeBorderProps) {
  const borderColor = variant === 'bronze' ? 'var(--bronze-600)' : 'var(--parchment-600)';
  const bgColor = variant === 'bronze' ? 'var(--bronze-900)' : 'var(--parchment-200)';

  return (
    <div className={`relative ${className}`}>
      {/* 主内容 */}
      <div className="relative z-10">
        {children}
      </div>

      {/* 装饰性边框 - 四角 */}
      <svg 
        className="absolute top-0 left-0 w-8 h-8 pointer-events-none" 
        viewBox="0 0 32 32"
        fill="none"
      >
        <path 
          d="M0 8 L0 0 L8 0" 
          stroke={borderColor} 
          strokeWidth="2" 
          strokeLinecap="round"
        />
        <circle cx="6" cy="6" r="1.5" fill={borderColor} />
      </svg>

      <svg 
        className="absolute top-0 right-0 w-8 h-8 pointer-events-none" 
        viewBox="0 0 32 32"
        fill="none"
      >
        <path 
          d="M32 8 L32 0 L24 0" 
          stroke={borderColor} 
          strokeWidth="2" 
          strokeLinecap="round"
        />
        <circle cx="26" cy="6" r="1.5" fill={borderColor} />
      </svg>

      <svg 
        className="absolute bottom-0 left-0 w-8 h-8 pointer-events-none" 
        viewBox="0 0 32 32"
        fill="none"
      >
        <path 
          d="M0 24 L0 32 L8 32" 
          stroke={borderColor} 
          strokeWidth="2" 
          strokeLinecap="round"
        />
        <circle cx="6" cy="26" r="1.5" fill={borderColor} />
      </svg>

      <svg 
        className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none" 
        viewBox="0 0 32 32"
        fill="none"
      >
        <path 
          d="M32 24 L32 32 L24 32" 
          stroke={borderColor} 
          strokeWidth="2" 
          strokeLinecap="round"
        />
        <circle cx="26" cy="26" r="1.5" fill={borderColor} />
      </svg>
    </div>
  );
}

interface PanelHeaderProps {
  title: string;
  icon?: React.ReactNode;
}

export function PanelHeader({ title, icon }: PanelHeaderProps) {
  return (
    <div className="relative bg-[var(--bronze-800)] border-b-2 border-[var(--bronze-700)] p-3">
      {/* 装饰性纹路 */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(90deg, var(--bronze-600) 0px, transparent 1px, transparent 4px)',
        }}
      />
      
      <div className="relative flex items-center justify-center gap-2">
        {icon}
        <h2 className="text-[var(--parchment-100)] font-bold tracking-wide">{title}</h2>
      </div>

      {/* 底部装饰线 */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[var(--gold-500)] to-transparent" />
    </div>
  );
}
