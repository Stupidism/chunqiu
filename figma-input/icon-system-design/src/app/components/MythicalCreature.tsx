/**
 * 山海经风格的神兽装饰组件
 * 用于地图边缘的装饰性元素
 */

import React from 'react';

interface CreatureProps {
  type?: 'qilin' | 'phoenix' | 'dragon';
  className?: string;
}

// 麒麟 - 仁兽
export function QilinCreature({ className = '' }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 200 200" 
      className={`mythical-creature ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 身体轮廓 */}
      <path 
        d="M50 120 Q60 100 80 100 L120 100 Q140 100 150 120 Q155 140 140 150 L60 150 Q45 140 50 120" 
        stroke="var(--bronze-600)" 
        strokeWidth="2" 
        opacity="0.3"
        fill="var(--bronze-200)"
        fillOpacity="0.1"
      />
      {/* 头部 */}
      <circle cx="140" cy="90" r="15" stroke="var(--bronze-600)" strokeWidth="2" opacity="0.3" fill="none" />
      {/* 角 */}
      <path d="M135 75 L130 60 M145 75 L150 60" stroke="var(--bronze-600)" strokeWidth="2" opacity="0.3" />
      {/* 腿部 */}
      <path d="M70 150 L70 170 M90 150 L90 170 M110 150 L110 170 M130 150 L130 170" 
        stroke="var(--bronze-600)" 
        strokeWidth="2" 
        opacity="0.3" 
      />
      {/* 尾巴 */}
      <path d="M60 140 Q40 135 35 150 Q30 165 40 170" stroke="var(--bronze-600)" strokeWidth="2" opacity="0.3" fill="none" />
    </svg>
  );
}

// 凤凰 - 神鸟
export function PhoenixCreature({ className = '' }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 200 200" 
      className={`mythical-creature ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 身体 */}
      <ellipse cx="100" cy="100" rx="30" ry="40" stroke="var(--terracotta-500)" strokeWidth="2" opacity="0.3" />
      {/* 头部 */}
      <circle cx="100" cy="70" r="12" stroke="var(--terracotta-500)" strokeWidth="2" opacity="0.3" />
      {/* 凤冠 */}
      <path d="M90 65 Q85 50 80 45 M100 62 Q100 45 95 40 M110 65 Q115 50 120 45" 
        stroke="var(--terracotta-500)" 
        strokeWidth="2" 
        opacity="0.3" 
      />
      {/* 翅膀 */}
      <path d="M70 90 Q40 85 30 95 Q25 105 35 115" stroke="var(--terracotta-500)" strokeWidth="2" opacity="0.3" />
      <path d="M130 90 Q160 85 170 95 Q175 105 165 115" stroke="var(--terracotta-500)" strokeWidth="2" opacity="0.3" />
      {/* 尾羽 */}
      <path d="M100 140 Q90 170 85 180" stroke="var(--terracotta-500)" strokeWidth="2" opacity="0.3" />
      <path d="M100 140 Q100 175 100 185" stroke="var(--terracotta-500)" strokeWidth="2" opacity="0.3" />
      <path d="M100 140 Q110 170 115 180" stroke="var(--terracotta-500)" strokeWidth="2" opacity="0.3" />
    </svg>
  );
}

// 应龙 - 有翼之龙
export function DragonCreature({ className = '' }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 300 200" 
      className={`mythical-creature ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 龙身 */}
      <path 
        d="M50 100 Q80 90 110 95 Q140 100 170 90 Q200 80 230 85" 
        stroke="var(--jade-600)" 
        strokeWidth="3" 
        opacity="0.3"
      />
      {/* 龙头 */}
      <circle cx="240" cy="80" r="18" stroke="var(--jade-600)" strokeWidth="2.5" opacity="0.3" />
      {/* 龙角 */}
      <path d="M235 65 L230 50 M245 65 L250 50" stroke="var(--jade-600)" strokeWidth="2.5" opacity="0.3" />
      {/* 龙爪 */}
      <path d="M80 95 L75 115 M80 95 L85 115" stroke="var(--jade-600)" strokeWidth="2" opacity="0.3" />
      <path d="M140 100 L135 120 M140 100 L145 120" stroke="var(--jade-600)" strokeWidth="2" opacity="0.3" />
      <path d="M200 85 L195 105 M200 85 L205 105" stroke="var(--jade-600)" strokeWidth="2" opacity="0.3" />
      {/* 翅膀 */}
      <path d="M130 90 Q120 70 125 55 Q130 65 140 70" stroke="var(--jade-600)" strokeWidth="2" opacity="0.3" />
      <path d="M180 85 Q170 65 175 50 Q180 60 190 65" stroke="var(--jade-600)" strokeWidth="2" opacity="0.3" />
      {/* 龙尾 */}
      <path d="M50 100 Q30 105 20 115 Q15 125 25 135" stroke="var(--jade-600)" strokeWidth="2.5" opacity="0.3" />
    </svg>
  );
}

export function MythicalCreature({ type = 'dragon', className = '' }: CreatureProps) {
  switch (type) {
    case 'qilin':
      return <QilinCreature className={className} />;
    case 'phoenix':
      return <PhoenixCreature className={className} />;
    case 'dragon':
    default:
      return <DragonCreature className={className} />;
  }
}
