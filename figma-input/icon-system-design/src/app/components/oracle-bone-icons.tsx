/**
 * 甲骨文风格图标系统（完整版）
 * 参考真实甲骨文和金文的象形特征
 * 设计原则：高度象形、线条原始、刻刀质感、结构紧凑
 */

import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

// ==================== 文明标识 ====================

// 秦 - 西陲霸主
export function QinIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4 L12 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M8 8 L16 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M7 12 L17 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M8 16 L16 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M10 8 L10 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 8 L14 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 齐 - 九合诸侯
export function QiIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <line x1="6" y1="7" x2="18" y2="7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="7" y1="11" x2="17" y2="11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="7" y1="15" x2="17" y2="15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="9" y1="7" x2="9" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="7" x2="12" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="15" y1="7" x2="15" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 楚 - 荆楚霸业
export function ChuIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 5 L12 11" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M8 8 Q10 6 12 6 Q14 6 16 8" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <path d="M7 12 L17 12 L17 18 L7 18 Z" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <line x1="10" y1="12" x2="10" y2="18" stroke="currentColor" strokeWidth="2" />
      <line x1="14" y1="12" x2="14" y2="18" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

// 晋 - 中原霸主
export function JinIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4 L6 8 L12 12 L18 8 Z" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="6" y1="14" x2="18" y2="14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="8" y1="18" x2="16" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// 吴 - 太湖雄国
export function WuIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M7 6 L7 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M12 5 L12 19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M17 6 L17 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M5 10 L19 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 14 L19 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 越 - 卧薪尝胆
export function YueIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M6 6 L12 4 L18 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M8 10 L16 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M7 14 L17 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M9 18 L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 郑 - 郑商天下
export function ZhengIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="6" width="12" height="12" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <line x1="6" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="2" />
      <line x1="6" y1="14" x2="18" y2="14" stroke="currentColor" strokeWidth="2" />
      <line x1="10" y1="6" x2="10" y2="18" stroke="currentColor" strokeWidth="2" />
      <line x1="14" y1="6" x2="14" y2="18" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

// 宋 - 殷商遗民
export function SongIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4 L6 8 L6 16 L12 20 L18 16 L18 8 Z" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" strokeWidth="2" />
      <line x1="6" y1="12" x2="18" y2="12" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

// 鲁 - 周礼之邦
export function LuIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M4 8 L12 4 L20 8" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
      <line x1="6" y1="8" x2="6" y2="18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="12" y1="8" x2="12" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="18" y1="8" x2="18" y2="18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="4" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// 燕 - 北地雄燕
export function YanIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 6 L8 10 L12 14 L16 10 Z" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <path d="M6 12 L12 14 L18 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="14" x2="12" y2="18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M8 18 L12 16 L16 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ==================== 单位图标 ====================

// 战士 (戈)
export function WarriorIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M8 8 L18 8 L20 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 8 L7 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="7" cy="20" r="1.5" fill="currentColor" />
    </svg>
  );
}

// 弓手 (弓)
export function ArcherIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M8 5 Q6 12 8 19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M8 5 L8 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 12 L16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

// 骑兵 (马)
export function CavalryIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M6 8 L6 6 L8 4 L10 6 L10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 6 L5 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 10 L18 10 L18 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="11" y1="10" x2="11" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="17" y1="12" x2="17" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M18 11 Q20 12 19 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 开拓者 (行) - 十字路口形
export function ScoutIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M12 5 L9 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 5 L15 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 12 L8 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M19 12 L16 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 工人 (力) - 手臂用力形
export function WorkerIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M8 6 Q10 10 12 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M12 10 Q14 8 17 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="17" cy="7" r="1.5" fill="currentColor" />
    </svg>
  );
}

// 投石车 (石) - 崖下之石
export function CatapultIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M6 6 L14 6 L14 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="8" y="12" width="6" height="6" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <circle cx="11" cy="15" r="1" fill="currentColor" />
    </svg>
  );
}

// 斥候 (目) - 眼睛形
export function SpyIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="8" width="12" height="8" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <line x1="6" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="2" />
      <line x1="6" y1="12" x2="18" y2="12" stroke="currentColor" strokeWidth="2" />
      <line x1="6" y1="14" x2="18" y2="14" stroke="currentColor" strokeWidth="2" />
      <line x1="10" y1="8" x2="10" y2="16" stroke="currentColor" strokeWidth="2" />
      <line x1="14" y1="8" x2="14" y2="16" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

// 商人 (贝) - 货币贝壳形
export function MerchantIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 5 L8 7 L7 12 L8 17 L12 19 L16 17 L17 12 L16 7 Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
      <line x1="12" y1="6" x2="12" y2="18" stroke="currentColor" strokeWidth="2" />
      <path d="M8 10 L16 10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 12 L16 12" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 14 L16 14" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

// 僧侣 (巫) - 祈祷舞蹈之人形
export function PriestIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <line x1="12" y1="6" x2="12" y2="18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M6 10 L12 8 L18 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 18 L12 14 L16 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="5" r="1.5" fill="currentColor" />
      <line x1="9" y1="11" x2="9" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="15" y1="11" x2="15" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ==================== 建筑图标 ====================

// 宫殿 (宫) - 屋顶 + 多层结构
export function PalaceIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M4 10 L12 4 L20 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="4" y1="10" x2="4" y2="20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="20" y1="10" x2="20" y2="20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <rect x="9" y="11" width="6" height="4" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <rect x="9" y="16" width="6" height="4" stroke="currentColor" strokeWidth="2.5" fill="none" />
    </svg>
  );
}

// 粮仓 (仓) - 有盖容器形
export function GranaryIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M6 8 L12 5 L18 8" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
      <path d="M6 8 L6 18 L18 18 L18 8" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" fill="none" />
      <line x1="12" y1="5" x2="12" y2="18" stroke="currentColor" strokeWidth="2" />
      <line x1="6" y1="12" x2="18" y2="12" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

// 兵营 (屯) - 驻扎聚集形
export function BarracksIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="8" width="14" height="11" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <path d="M4 8 L12 4 L20 8" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
      <path d="M9 12 L15 12 L16 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 12 L10 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 市场 (市) - 旗帜 + 人聚集形
export function MarketIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <line x1="8" y1="5" x2="8" y2="19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M8 5 L16 8 L8 11" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
      <line x1="12" y1="14" x2="12" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="16" y1="14" x2="16" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// 学宫 (学) - 双手捧书 + 屋顶形
export function AcademyIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M6 8 L12 5 L18 8" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
      <rect x="8" y="10" width="8" height="8" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <line x1="10" y1="10" x2="10" y2="18" stroke="currentColor" strokeWidth="2" />
      <line x1="14" y1="10" x2="14" y2="18" stroke="currentColor" strokeWidth="2" />
      <line x1="8" y1="13" x2="16" y2="13" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

// 祭坛 (宗) - 祖先牌位 + 屋顶形
export function TempleIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <line x1="10" y1="5" x2="14" y2="5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="9" y1="7" x2="15" y2="7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="8" y1="9" x2="16" y2="9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="12" y1="5" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 13 L18 13 L17 18 L7 18 Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
      <line x1="5" y1="19" x2="19" y2="19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// 城墙 (邑) - 城邑轮廓形
export function WallIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M6 8 L6 18 L18 18 L18 8" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <rect x="8" y="5" width="3" height="3" stroke="currentColor" strokeWidth="2" fill="none" />
      <rect x="13" y="5" width="3" height="3" stroke="currentColor" strokeWidth="2" fill="none" />
      <rect x="10" y="13" width="4" height="5" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}

// 水井 (井) - 井口俯视图
export function WellIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <rect x="7" y="7" width="10" height="10" stroke="currentColor" strokeWidth="3" fill="none" />
      <line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" strokeWidth="2.5" />
      <line x1="12" y1="7" x2="12" y2="17" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  );
}

// 工坊 (斤) - 斧斤工具形
export function WorkshopIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M14 6 L8 9 L9 12 L15 9 Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
      <path d="M10 11 L7 19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="12" y1="10" x2="9" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 港口 (舟) - 小船形
export function HarborIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M6 14 L6 12 L12 10 L18 12 L18 14" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
      <path d="M6 14 L8 18 L16 18 L18 14" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
      <line x1="12" y1="5" x2="12" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 驿站 (亭) - 有顶凉亭形
export function PostIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M6 10 L12 6 L18 10" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
      <line x1="6" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="8" y1="10" x2="8" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="16" y1="10" x2="16" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="6" y1="18" x2="18" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// ==================== 产出图标 ====================

// 粮食 (禾) - 稻穗下垂形
export function FoodIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 6 L12 19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M12 8 Q9 9 8 11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M12 11 Q10 12 9 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M12 8 Q15 9 16 11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M12 11 Q14 12 15 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// 生产 (工) - 工具规矩形
export function ProductionIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <line x1="6" y1="7" x2="18" y2="7" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="12" y1="7" x2="12" y2="17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="6" y1="17" x2="18" y2="17" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

// 金币 (金) - 熔炉 + 金块形
export function GoldIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <line x1="12" y1="7" x2="12" y2="17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="9" cy="9" r="1.5" fill="currentColor" />
      <circle cx="15" cy="9" r="1.5" fill="currentColor" />
      <circle cx="9" cy="15" r="1.5" fill="currentColor" />
      <circle cx="15" cy="15" r="1.5" fill="currentColor" />
    </svg>
  );
}

// 科研 (册) - 竹简成册形
export function ScienceIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <line x1="7" y1="5" x2="7" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="11" y1="5" x2="11" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="15" y1="5" x2="15" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M5 8 L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 12 L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 16 L21 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 文化 (文) - 纹身交错纹样形
export function CultureIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M12 8 L8 10 L12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M12 12 L8 14 L12 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M12 8 L16 10 L12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M12 12 L16 14 L12 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

// 信仰 (祀) - 祭台献祭形
export function FaithIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <line x1="10" y1="5" x2="14" y2="5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="9" y1="7" x2="15" y2="7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="8" y1="9" x2="16" y2="9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="12" y1="5" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10" cy="15" r="2" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="14" cy="15" r="2" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="12" cy="18" r="1.5" fill="currentColor" />
    </svg>
  );
}

// 影响力 (令) - 发号施令形
export function InfluenceIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 5 L8 9 L12 9 L12 19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 12 L16 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M10 15 L14 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 外交点 (言) - 口出言语形
export function DiplomacyIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <rect x="7" y="12" width="10" height="7" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <line x1="12" y1="5" x2="12" y2="12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="9" y1="7" x2="15" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="10" y1="9" x2="14" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ==================== 地形图标 ====================

// 平原 (田) - 方正田亩形
export function PlainIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="6" width="12" height="12" stroke="currentColor" strokeWidth="3" fill="none" />
      <line x1="6" y1="12" x2="18" y2="12" stroke="currentColor" strokeWidth="2.5" />
      <line x1="12" y1="6" x2="12" y2="18" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  );
}

// 草原 (艸) - 双草并生形
export function GrasslandIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M7 18 L7 10 Q7 7 5 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M12 18 L12 8 Q12 5 12 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M17 18 L17 10 Q17 7 19 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="4" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 森林 (林) - 双木并立形
export function ForestIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <line x1="8" y1="8" x2="8" y2="19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="5" y1="12" x2="11" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 8 L6 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 8 L10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="8" x2="16" y2="19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="13" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 8 L14 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 8 L18 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 山脉 (山) - 三峰连绵形
export function MountainIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 5 L8 13 L16 13 Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
      <line x1="12" y1="5" x2="12" y2="13" stroke="currentColor" strokeWidth="2" />
      <path d="M6 10 L3 17 L9 17" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
      <path d="M18 10 L15 17 L21 17" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
      <line x1="3" y1="17" x2="21" y2="17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// 丘陵 (阜) - 层叠土堆形
export function HillIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M6 16 Q9 10 12 12 Q15 14 18 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M4 18 Q8 14 12 15 Q16 16 20 13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <line x1="3" y1="19" x2="21" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// 河流 (川) - 三道水流形
export function RiverIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M6 5 L6 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M12 5 L12 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M18 5 L18 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M6 9 Q8 8 10 9" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M14 9 Q16 8 18 9" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M6 15 Q8 14 10 15" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M14 15 Q16 14 18 15" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

// 湖泊 (泽) - 水聚洼地形
export function LakeIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M6 10 Q8 8 12 8 Q16 8 18 10 L18 16 Q16 18 12 18 Q8 18 6 16 Z" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <path d="M8 11 Q10 10 12 10 Q14 10 16 11" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M8 13 Q10 12 12 12 Q14 12 16 13" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M8 15 Q10 14 12 14 Q14 14 16 15" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

// 海洋 (海) - 广阔水域形
export function OceanIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M3 8 Q6 6 9 8 Q12 10 15 8 Q18 6 21 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M3 12 Q6 10 9 12 Q12 14 15 12 Q18 10 21 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M3 16 Q6 14 9 16 Q12 18 15 16 Q18 14 21 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// 沙漠 (沙) - 水边细沙点形
export function DesertIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M3 15 Q6 12 9 15 Q12 18 15 15 Q18 12 21 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M3 18 Q7 16 11 18 Q15 20 19 18 L21 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="6" cy="8" r="1.5" fill="currentColor" />
      <circle cx="11" cy="6" r="1" fill="currentColor" />
      <circle cx="15" cy="9" r="1.5" fill="currentColor" />
      <circle cx="18" cy="7" r="1" fill="currentColor" />
    </svg>
  );
}

// 冻土 (冰) - 凝结冰棱形
export function TundraIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="8" y1="8" x2="16" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="8" x2="8" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="5" r="1.5" fill="currentColor" />
      <circle cx="12" cy="19" r="1.5" fill="currentColor" />
      <circle cx="5" cy="12" r="1.5" fill="currentColor" />
      <circle cx="19" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

// 沼泽 (泥) - 水土混合形
export function SwampIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M4 16 Q6 14 8 16 Q10 18 12 16 Q14 14 16 16 Q18 18 20 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="7" cy="10" r="1.5" fill="currentColor" />
      <circle cx="12" cy="8" r="1.5" fill="currentColor" />
      <circle cx="17" cy="10" r="1.5" fill="currentColor" />
      <circle cx="10" cy="12" r="1" fill="currentColor" />
      <circle cx="14" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

// ==================== 资源图标 ====================

// 铁矿
export function IronIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M8 8 L16 8 L18 12 L16 16 L8 16 L6 12 Z" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <line x1="8" y1="10" x2="16" y2="10" stroke="currentColor" strokeWidth="2" />
      <line x1="8" y1="14" x2="16" y2="14" stroke="currentColor" strokeWidth="2" />
      <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

// 铜矿
export function CopperIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <path d="M9 9 L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 9 L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="9" cy="12" r="1.5" fill="currentColor" />
      <circle cx="15" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

// 马匹
export function HorseIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M6 8 L6 6 L8 4 L10 6 L10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 6 L5 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 10 L18 10 L18 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="11" y1="10" x2="11" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="17" y1="12" x2="17" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M18 11 Q20 12 19 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 硝石
export function NiterIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 5 L8 10 L12 15 L16 10 Z" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <circle cx="12" cy="8" r="1" fill="currentColor" />
      <circle cx="10" cy="11" r="1" fill="currentColor" />
      <circle cx="14" cy="11" r="1" fill="currentColor" />
      <circle cx="12" cy="13" r="1" fill="currentColor" />
      <line x1="6" y1="17" x2="18" y2="17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// 丝绸
export function SilkIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M8 5 Q12 7 16 5" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M8 9 Q12 11 16 9" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M8 13 Q12 15 16 13" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M8 17 Q12 19 16 17" stroke="currentColor" strokeWidth="2" fill="none" />
      <line x1="8" y1="5" x2="8" y2="17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="16" y1="5" x2="16" y2="17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// 玉石
export function JadeIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="12" cy="8" r="2" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="12" cy="16" r="2" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}

// 茶叶
export function TeaIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <line x1="12" y1="6" x2="12" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M12 8 Q9 10 8 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 8 Q15 10 16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 11 Q10 13 9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 11 Q14 13 15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 瓷器
export function PorcelainIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M8 8 L8 16 L16 16 L16 8" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <path d="M8 8 L12 6 L16 8" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
      <line x1="8" y1="11" x2="16" y2="11" stroke="currentColor" strokeWidth="2" />
      <line x1="10" y1="13" x2="14" y2="13" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

// 香料
export function SpiceIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M8 14 L8 18 L16 18 L16 14" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
      <path d="M10 14 Q12 12 14 14" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <path d="M12 10 Q10 8 11 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 10 Q14 8 13 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 漆器
export function LacquerIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <line x1="8" y1="6" x2="8" y2="18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M8 8 L14 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M8 10 Q10 12 8 14" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M8 14 Q10 16 8 18" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M13 10 Q15 12 13 14" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}

// 小麦
export function WheatIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <line x1="12" y1="6" x2="12" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="12" cy="8" r="1.5" fill="currentColor" />
      <circle cx="10" cy="10" r="1.5" fill="currentColor" />
      <circle cx="14" cy="10" r="1.5" fill="currentColor" />
      <circle cx="10" cy="13" r="1.5" fill="currentColor" />
      <circle cx="14" cy="13" r="1.5" fill="currentColor" />
      <circle cx="12" cy="15" r="1.5" fill="currentColor" />
    </svg>
  );
}

// 稻米
export function RiceIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <line x1="12" y1="7" x2="12" y2="17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M8 8 L6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 8 L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 16 L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 16 L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 鱼类
export function FishIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M6 12 L10 10 L14 12 L10 14 Z" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <path d="M14 12 L18 10 L20 12 L18 14 Z" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <circle cx="16" cy="12" r="1" fill="currentColor" />
      <path d="M6 12 L4 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 12 L4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 牛羊
export function CattleIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M8 8 L8 6 L12 6 L12 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 8 Q8 7 10 8" stroke="currentColor" strokeWidth="2" fill="none" />
      <rect x="7" y="9" width="10" height="6" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <line x1="9" y1="15" x2="9" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="15" y1="15" x2="15" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 木材
export function TimberIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <line x1="12" y1="6" x2="12" y2="18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="7" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M12 6 L9 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 6 L15 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 10 L7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 10 L17 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 石材
export function StoneIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M6 6 L14 6 L14 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 12 L16 12 L14 16 L10 16 Z" stroke="currentColor" strokeWidth="2.5" fill="none" />
    </svg>
  );
}

// ==================== 状态/操作图标 ====================

// 攻击 (击)
export function AttackIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M6 12 L18 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M14 8 L18 12 L14 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="18" cy="12" r="2" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}

// 防御 (盾)
export function DefenseIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4 L6 7 L6 12 Q6 16 12 20 Q18 16 18 12 L18 7 Z" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="2" />
      <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

// 移动 (足)
export function MoveIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <line x1="8" y1="6" x2="8" y2="9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="11" y1="5" x2="11" y2="8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="14" y1="6" x2="14" y2="9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M6 10 L16 10 L16 15 L6 15 Z" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <line x1="9" y1="15" x2="9" y2="18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="13" y1="15" x2="13" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 驻守 (止)
export function FortifyIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <line x1="12" y1="18" x2="12" y2="6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="7" y1="18" x2="17" y2="18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="12" cy="6" r="2" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}

// 治疗 (医)
export function HealIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <line x1="12" y1="6" x2="12" y2="18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="6" y1="12" x2="18" y2="12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}

// 升级 (升)
export function UpgradeIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 18 L12 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M8 10 L12 6 L16 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="8" y1="14" x2="16" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 建造 (造)
export function BuildIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M6 18 L6 10 L12 6 L18 10 L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
      <rect x="10" y="13" width="4" height="5" stroke="currentColor" strokeWidth="2" fill="none" />
      <line x1="12" y1="6" x2="12" y2="10" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

// 拆除 (毁)
export function DemolishIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M6 6 L18 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M18 6 L6 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M8 8 L12 10 L16 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 16 L12 14 L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// 外交 (和)
export function PeaceIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M8 6 L8 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M8 10 Q10 8 12 10 Q14 12 16 10" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <rect x="14" y="12" width="4" height="6" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}

// 宣战 (戎)
export function WarIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M8 8 L16 8 L18 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 8 L8 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M12 4 L6 7 L6 12 Q6 15 12 18" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}

// ==================== 科技时代图标 ====================

// 远古 (古)
export function AncientIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <line x1="12" y1="6" x2="12" y2="18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="7" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="9" y="13" width="6" height="5" stroke="currentColor" strokeWidth="2.5" fill="none" />
    </svg>
  );
}

// 青铜 (鼎)
export function BronzeIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M7 10 L7 14 L12 18 L17 14 L17 10" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
      <line x1="7" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="9" y1="18" x2="9" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="18" x2="12" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="15" y1="18" x2="15" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 10 L5 6 L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 10 L19 6 L17 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// 铁器 (剑)
export function IronAgeIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <line x1="12" y1="4" x2="12" y2="16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="8" y1="6" x2="16" y2="6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M10 16 L12 20 L14 16" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
      <rect x="10" y="14" width="4" height="2" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}

// 帝国 (王)
export function EmpireIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <line x1="6" y1="8" x2="18" y2="8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="6" y1="16" x2="18" y2="16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="12" y1="6" x2="12" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// ==================== UI 通用图标 ====================

// 菜单 (冊)
export function MenuIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <line x1="6" y1="7" x2="18" y2="7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="6" y1="12" x2="18" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="6" y1="17" x2="18" y2="17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// 关闭 (乂)
export function CloseIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// 确认 (可)
export function ConfirmIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M6 12 L10 16 L18 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// 取消 (否)
export function CancelIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// 信息 (訊)
export function InfoIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <line x1="12" y1="11" x2="12" y2="17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="12" cy="8" r="1.5" fill="currentColor" />
    </svg>
  );
}

// 警告 (戒)
export function WarningIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4 L4 20 L20 20 Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
      <line x1="12" y1="10" x2="12" y2="14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1.5" fill="currentColor" />
    </svg>
  );
}

// 回合 (日)
export function TurnIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <rect x="7" y="7" width="10" height="10" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <line x1="7" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="2" />
      <line x1="7" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth="2" />
      <line x1="10" y1="7" x2="10" y2="17" stroke="currentColor" strokeWidth="2" />
      <line x1="14" y1="7" x2="14" y2="17" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

// 结束回合 (旦)
export function EndTurnIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <rect x="7" y="6" width="10" height="8" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <line x1="5" y1="14" x2="19" y2="14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="7" y1="9" x2="17" y2="9" stroke="currentColor" strokeWidth="2" />
      <line x1="7" y1="11" x2="17" y2="11" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

// 设置 (齿轮 - 现代图标)
export function SettingsIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M12 5 L12 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M12 16 L12 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M5 12 L8 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M16 12 L19 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M7.8 7.8 L9.9 9.9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14.1 14.1 L16.2 16.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7.8 16.2 L9.9 14.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14.1 9.9 L16.2 7.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 地图 (舆)
export function MapIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="14" height="14" stroke="currentColor" strokeWidth="2.5" rx="1" />
      <path d="M9 5 L9 19 M15 5 L15 19" stroke="currentColor" strokeWidth="2" />
      <path d="M5 9 L19 9 M5 15 L19 15" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

// 科技 (智) - 知识与工具结合
export function TechIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4 L6 8 L6 16 L12 20 L18 16 L18 8 Z" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <line x1="12" y1="4" x2="12" y2="9" stroke="currentColor" strokeWidth="2" />
      <line x1="12" y1="15" x2="12" y2="20" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

// 文政 (政) - 政治与礼制
export function CivicIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M6 8 L12 4 L18 8" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <line x1="8" y1="8" x2="8" y2="18" stroke="currentColor" strokeWidth="2.5" />
      <line x1="12" y1="8" x2="12" y2="18" stroke="currentColor" strokeWidth="2.5" />
      <line x1="16" y1="8" x2="16" y2="18" stroke="currentColor" strokeWidth="2.5" />
      <line x1="6" y1="18" x2="18" y2="18" stroke="currentColor" strokeWidth="3" />
    </svg>
  );
}

// 农田 (田)
export function FarmIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="6" width="12" height="12" stroke="currentColor" strokeWidth="2.5" />
      <line x1="6" y1="12" x2="18" y2="12" stroke="currentColor" strokeWidth="2" />
      <line x1="12" y1="6" x2="12" y2="18" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

// 水域 (水)
export function WaterIcon({ className = '', size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M4 12 Q8 9 12 12 Q16 15 20 12" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M4 16 Q8 13 12 16 Q16 19 20 16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M4 8 Q8 5 12 8 Q16 11 20 8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
