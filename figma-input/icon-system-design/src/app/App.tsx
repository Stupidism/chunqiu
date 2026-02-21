/**
 * 甲骨文风格游戏界面 - 仿文明6布局
 * 包含顶部信息栏、左侧面板、中央地图、右侧详情、底部控制
 */

import React, { useState } from 'react';
import { HexGrid } from './components/HexGrid';
import { MythicalCreature } from './components/MythicalCreature';
import { PanelHeader } from './components/DecorativeBorder';
import { TileData } from './components/TileData';
import {
  QinIcon,
  QiIcon,
  ChuIcon,
  WarriorIcon,
  ArcherIcon,
  CavalryIcon,
  PalaceIcon,
  BarracksIcon,
  FarmIcon,
  GoldIcon,
  ScienceIcon,
  CultureIcon,
  FaithIcon,
  MountainIcon,
  ForestIcon,
  WaterIcon,
  SettingsIcon,
  MapIcon,
  DiplomacyIcon,
  TechIcon,
  CivicIcon,
  FoodIcon,
  ProductionIcon,
  IronIcon,
  HorseIcon,
  WheatIcon,
  GranaryIcon,
  MarketIcon,
  PlainIcon,
  GrasslandIcon,
  HillIcon,
  OceanIcon,
} from './components/oracle-bone-icons';

export default function App() {
  const [selectedCity, setSelectedCity] = useState(0);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [selectedTile, setSelectedTile] = useState<TileData | null>(null);
  const [resources] = useState({
    gold: 285,
    science: 42,
    culture: 38,
    faith: 15,
  });

  const cities = [
    { name: '咸阳城', civilization: 'qin', population: 8 },
    { name: '临淄城', civilization: 'qi', population: 6 },
  ];

  const units = [
    { name: '戈兵', type: 'warrior', hp: 80, mp: 2 },
    { name: '弓兵', type: 'archer', hp: 95, mp: 2 },
    { name: '战车', type: 'cavalry', hp: 100, mp: 4 },
  ];

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col bg-[var(--parchment-200)]" 
         style={{ 
           backgroundImage: 'repeating-linear-gradient(90deg, var(--parchment-200), var(--parchment-200) 2px, var(--parchment-100) 2px, var(--parchment-100) 4px)',
           fontFamily: 'system-ui, -apple-system, sans-serif'
         }}>
      
      {/* ==================== 顶部信息栏 ==================== */}
      <header className="h-16 bg-gradient-to-b from-[var(--bronze-900)] to-[var(--bronze-800)] border-b-4 border-[var(--bronze-700)] flex items-center justify-between px-4 shadow-lg relative">
        {/* 左侧：回合信息和文明图标 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[var(--bronze-800)] px-4 py-2 rounded border-2 border-[var(--bronze-600)]">
            <QinIcon size={24} className="text-[var(--gold-400)]" />
            <span className="text-[var(--parchment-100)] font-bold tracking-wider">秦</span>
          </div>
          <div className="text-[var(--parchment-100)] px-3 py-2 bg-[var(--bronze-800)] rounded border-2 border-[var(--bronze-600)]">
            <span className="text-sm opacity-75">回合</span>
            <span className="ml-2 font-bold text-lg">{currentTurn}</span>
          </div>
        </div>

        {/* 中间：资源信息 */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-[var(--bronze-800)] px-3 py-2 rounded border border-[var(--bronze-600)]">
            <GoldIcon size={20} className="text-[var(--gold-400)]" />
            <span className="text-[var(--parchment-100)] font-bold">{resources.gold}</span>
            <span className="text-[var(--gold-300)] text-sm ml-1">+15</span>
          </div>
          <div className="flex items-center gap-2 bg-[var(--bronze-800)] px-3 py-2 rounded border border-[var(--bronze-600)]">
            <ScienceIcon size={20} className="text-[var(--jade-400)]" />
            <span className="text-[var(--parchment-100)] font-bold">{resources.science}</span>
            <span className="text-[var(--jade-300)] text-sm ml-1">+8</span>
          </div>
          <div className="flex items-center gap-2 bg-[var(--bronze-800)] px-3 py-2 rounded border border-[var(--bronze-600)]">
            <CultureIcon size={20} className="text-[var(--purple-400)]" />
            <span className="text-[var(--parchment-100)] font-bold">{resources.culture}</span>
            <span className="text-[var(--purple-300)] text-sm ml-1">+6</span>
          </div>
          <div className="flex items-center gap-2 bg-[var(--bronze-800)] px-3 py-2 rounded border border-[var(--bronze-600)]">
            <FaithIcon size={20} className="text-[var(--terracotta-400)]" />
            <span className="text-[var(--parchment-100)] font-bold">{resources.faith}</span>
            <span className="text-[var(--terracotta-300)] text-sm ml-1">+3</span>
          </div>
        </div>

        {/* 右侧：功能按钮 */}
        <div className="flex items-center gap-2">
          <button className="p-2 bg-[var(--bronze-800)] hover:bg-[var(--bronze-700)] rounded border border-[var(--bronze-600)] transition-colors">
            <TechIcon size={24} className="text-[var(--jade-400)]" />
          </button>
          <button className="p-2 bg-[var(--bronze-800)] hover:bg-[var(--bronze-700)] rounded border border-[var(--bronze-600)] transition-colors">
            <CivicIcon size={24} className="text-[var(--purple-400)]" />
          </button>
          <button className="p-2 bg-[var(--bronze-800)] hover:bg-[var(--bronze-700)] rounded border border-[var(--bronze-600)] transition-colors">
            <DiplomacyIcon size={24} className="text-[var(--parchment-200)]" />
          </button>
          <button className="p-2 bg-[var(--bronze-800)] hover:bg-[var(--bronze-700)] rounded border border-[var(--bronze-600)] transition-colors">
            <SettingsIcon size={24} className="text-[var(--parchment-200)]" />
          </button>
        </div>
      </header>

      {/* ==================== 主体内容区 ==================== */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* 左侧：城市/单位面板 */}
        <aside className="w-60 bg-[var(--bronze-900)]/90 border-r-4 border-[var(--bronze-700)] flex flex-col shadow-xl">
          {/* 面板标题 */}
          <div className="bg-[var(--bronze-800)] border-b-2 border-[var(--bronze-700)] p-3">
            <h2 className="text-[var(--parchment-100)] font-bold tracking-wide text-center">城邑面板</h2>
          </div>

          {/* 城市列表 */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {cities.map((city, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedCity(idx)}
                className={`p-3 rounded border-2 cursor-pointer transition-all ${
                  selectedCity === idx
                    ? 'bg-[var(--bronze-700)] border-[var(--gold-500)]'
                    : 'bg-[var(--bronze-800)] border-[var(--bronze-600)] hover:border-[var(--bronze-500)]'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {city.civilization === 'qin' ? (
                    <QinIcon size={24} className="text-[var(--gold-400)]" />
                  ) : (
                    <QiIcon size={24} className="text-[var(--jade-400)]" />
                  )}
                  <span className="text-[var(--parchment-100)] font-bold">{city.name}</span>
                </div>
                <div className="text-[var(--parchment-300)] text-sm">
                  人口: {city.population}
                </div>
              </div>
            ))}
          </div>

          {/* 单位分隔 */}
          <div className="bg-[var(--bronze-800)] border-y-2 border-[var(--bronze-700)] p-2">
            <h3 className="text-[var(--parchment-200)] text-sm font-bold text-center">军队单位</h3>
          </div>

          {/* 单位列表 */}
          <div className="p-2 space-y-2 max-h-48 overflow-y-auto">
            {units.map((unit, idx) => (
              <div
                key={idx}
                className="p-2 bg-[var(--bronze-800)] hover:bg-[var(--bronze-700)] rounded border border-[var(--bronze-600)] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  {unit.type === 'warrior' && <WarriorIcon size={20} className="text-[var(--cinnabar-400)]" />}
                  {unit.type === 'archer' && <ArcherIcon size={20} className="text-[var(--terracotta-400)]" />}
                  {unit.type === 'cavalry' && <CavalryIcon size={20} className="text-[var(--gold-400)]" />}
                  <span className="text-[var(--parchment-100)] text-sm font-medium">{unit.name}</span>
                </div>
                <div className="flex justify-between text-xs text-[var(--parchment-300)]">
                  <span>HP: {unit.hp}%</span>
                  <span>移动: {unit.mp}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* 中央：地图区域 */}
        <main className="flex-1 relative overflow-hidden">
          {/* 山海经神兽装饰 - 右下角 */}
          <div className="absolute bottom-12 right-12 w-80 h-80 pointer-events-none">
            <MythicalCreature type="dragon" />
          </div>

          {/* 山海经神兽装饰 - 左上角 */}
          <div className="absolute top-8 left-8 w-48 h-48 pointer-events-none">
            <MythicalCreature type="phoenix" />
          </div>

          {/* 地图容器 */}
          <div className="w-full h-full flex items-center justify-center p-8 overflow-auto">
            <div className="relative">
              <HexGrid 
                rows={8} 
                cols={12} 
                hexSize={35} 
                onHexClick={(r, c, data) => {
                  console.log(`Hex clicked: ${r},${c}`, data);
                  setSelectedTile(data);
                }} 
              />
            </div>
          </div>
        </main>

        {/* 右侧：单位/城市详情 */}
        <aside className="w-72 bg-[var(--bronze-900)]/90 border-l-4 border-[var(--bronze-700)] flex flex-col shadow-xl">
          {/* 详情标题 */}
          <div className="bg-[var(--bronze-800)] border-b-2 border-[var(--bronze-700)] p-3">
            <h2 className="text-[var(--parchment-100)] font-bold tracking-wide text-center">城邑详情</h2>
          </div>

          {/* 城市信息 */}
          <div className="p-4 border-b-2 border-[var(--bronze-700)]">
            <div className="flex items-center gap-3 mb-3">
              <QinIcon size={32} className="text-[var(--gold-400)]" />
              <div>
                <h3 className="text-[var(--parchment-100)] font-bold text-lg">{cities[selectedCity].name}</h3>
                <p className="text-[var(--parchment-300)] text-sm">人口: {cities[selectedCity].population}</p>
              </div>
            </div>
          </div>

          {/* 建筑列表 */}
          <div className="flex-1 overflow-y-auto p-3">
            {/* 城市产出 */}
            <h4 className="text-[var(--parchment-200)] text-sm font-bold mb-2">城市产出</h4>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-[var(--bronze-800)] p-2 rounded border border-[var(--bronze-600)] flex items-center gap-2">
                <FoodIcon size={18} className="text-[var(--terracotta-400)]" />
                <div className="flex flex-col">
                  <span className="text-[var(--parchment-100)] text-xs">粮食</span>
                  <span className="text-[var(--terracotta-300)] font-bold">+12</span>
                </div>
              </div>
              <div className="bg-[var(--bronze-800)] p-2 rounded border border-[var(--bronze-600)] flex items-center gap-2">
                <ProductionIcon size={18} className="text-[var(--bronze-400)]" />
                <div className="flex flex-col">
                  <span className="text-[var(--parchment-100)] text-xs">生产</span>
                  <span className="text-[var(--bronze-300)] font-bold">+8</span>
                </div>
              </div>
              <div className="bg-[var(--bronze-800)] p-2 rounded border border-[var(--bronze-600)] flex items-center gap-2">
                <GoldIcon size={18} className="text-[var(--gold-400)]" />
                <div className="flex flex-col">
                  <span className="text-[var(--parchment-100)] text-xs">金币</span>
                  <span className="text-[var(--gold-300)] font-bold">+6</span>
                </div>
              </div>
              <div className="bg-[var(--bronze-800)] p-2 rounded border border-[var(--bronze-600)] flex items-center gap-2">
                <ScienceIcon size={18} className="text-[var(--jade-400)]" />
                <div className="flex flex-col">
                  <span className="text-[var(--parchment-100)] text-xs">科研</span>
                  <span className="text-[var(--jade-300)] font-bold">+4</span>
                </div>
              </div>
            </div>

            <h4 className="text-[var(--parchment-200)] text-sm font-bold mb-2">建筑</h4>
            <div className="space-y-2">
              <div className="bg-[var(--bronze-800)] p-2 rounded border border-[var(--bronze-600)]">
                <div className="flex items-center gap-2">
                  <PalaceIcon size={20} className="text-[var(--gold-400)]" />
                  <span className="text-[var(--parchment-100)] text-sm">王宫</span>
                </div>
              </div>
              <div className="bg-[var(--bronze-800)] p-2 rounded border border-[var(--bronze-600)]">
                <div className="flex items-center gap-2">
                  <BarracksIcon size={20} className="text-[var(--cinnabar-400)]" />
                  <span className="text-[var(--parchment-100)] text-sm">兵营</span>
                </div>
              </div>
              <div className="bg-[var(--bronze-800)] p-2 rounded border border-[var(--bronze-600)]">
                <div className="flex items-center gap-2">
                  <GranaryIcon size={20} className="text-[var(--terracotta-400)]" />
                  <span className="text-[var(--parchment-100)] text-sm">粮仓</span>
                </div>
              </div>
              <div className="bg-[var(--bronze-800)] p-2 rounded border border-[var(--bronze-600)]">
                <div className="flex items-center gap-2">
                  <MarketIcon size={20} className="text-[var(--gold-400)]" />
                  <span className="text-[var(--parchment-100)] text-sm">市场</span>
                </div>
              </div>
            </div>

            <h4 className="text-[var(--parchment-200)] text-sm font-bold mt-4 mb-2">战略资源</h4>
            <div className="space-y-2">
              <div className="bg-[var(--bronze-800)] p-2 rounded border border-[var(--bronze-600)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IronIcon size={20} className="text-[var(--ink-500)]" />
                    <span className="text-[var(--parchment-100)] text-sm">铁矿</span>
                  </div>
                  <span className="text-[var(--parchment-300)] text-xs">×2</span>
                </div>
              </div>
              <div className="bg-[var(--bronze-800)] p-2 rounded border border-[var(--bronze-600)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HorseIcon size={20} className="text-[var(--terracotta-400)]" />
                    <span className="text-[var(--parchment-100)] text-sm">马匹</span>
                  </div>
                  <span className="text-[var(--parchment-300)] text-xs">×1</span>
                </div>
              </div>
              <div className="bg-[var(--bronze-800)] p-2 rounded border border-[var(--bronze-600)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <WheatIcon size={20} className="text-[var(--gold-300)]" />
                    <span className="text-[var(--parchment-100)] text-sm">小麦</span>
                  </div>
                  <span className="text-[var(--parchment-300)] text-xs">×3</span>
                </div>
              </div>
            </div>

            <h4 className="text-[var(--parchment-200)] text-sm font-bold mt-4 mb-2">地形资源</h4>
            <div className="space-y-2">
              <div className="bg-[var(--bronze-800)] p-2 rounded border border-[var(--bronze-600)]">
                <div className="flex items-center gap-2">
                  <MountainIcon size={24} className="text-[var(--ink-400)]" />
                  <span className="text-[var(--parchment-100)] text-sm">山脉</span>
                </div>
              </div>
              <div className="bg-[var(--bronze-800)] p-2 rounded border border-[var(--bronze-600)]">
                <div className="flex items-center gap-2">
                  <ForestIcon size={24} className="text-[var(--bronze-400)]" />
                  <span className="text-[var(--parchment-100)] text-sm">森林</span>
                </div>
              </div>
              <div className="bg-[var(--bronze-800)] p-2 rounded border border-[var(--bronze-600)]">
                <div className="flex items-center gap-2">
                  <WaterIcon size={24} className="text-[var(--jade-400)]" />
                  <span className="text-[var(--parchment-100)] text-sm">河流</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ==================== 底部控制栏 ==================== */}
      <footer className="h-44 bg-gradient-to-t from-[var(--bronze-900)] to-[var(--bronze-800)] border-t-4 border-[var(--bronze-700)] flex items-center px-4 gap-4 shadow-xl relative">
        
        {/* 小地图 */}
        <div className="w-56 h-36 bg-[var(--parchment-900)]/30 border-2 border-[var(--bronze-600)] rounded overflow-hidden shadow-inner relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <MapIcon size={48} className="text-[var(--bronze-600)] opacity-50" />
          </div>
          <div className="absolute top-2 left-2 bg-[var(--bronze-900)]/80 px-2 py-1 rounded text-xs text-[var(--parchment-200)]">
            小地图
          </div>
        </div>

        {/* 单位行动按钮组 */}
        <div className="flex-1 flex items-center justify-center gap-3">
          <button className="group flex flex-col items-center gap-1 p-3 bg-[var(--bronze-800)] hover:bg-[var(--bronze-700)] rounded-lg border-2 border-[var(--bronze-600)] hover:border-[var(--bronze-500)] transition-all">
            <WarriorIcon size={32} className="text-[var(--cinnabar-400)] group-hover:scale-110 transition-transform" />
            <span className="text-[var(--parchment-300)] text-xs">移动</span>
          </button>
          <button className="group flex flex-col items-center gap-1 p-3 bg-[var(--bronze-800)] hover:bg-[var(--bronze-700)] rounded-lg border-2 border-[var(--bronze-600)] hover:border-[var(--bronze-500)] transition-all">
            <ArcherIcon size={32} className="text-[var(--terracotta-400)] group-hover:scale-110 transition-transform" />
            <span className="text-[var(--parchment-300)] text-xs">攻击</span>
          </button>
          <button className="group flex flex-col items-center gap-1 p-3 bg-[var(--bronze-800)] hover:bg-[var(--bronze-700)] rounded-lg border-2 border-[var(--bronze-600)] hover:border-[var(--bronze-500)] transition-all">
            <BarracksIcon size={32} className="text-[var(--bronze-400)] group-hover:scale-110 transition-transform" />
            <span className="text-[var(--parchment-300)] text-xs">驻守</span>
          </button>
          <button className="group flex flex-col items-center gap-1 p-3 bg-[var(--bronze-800)] hover:bg-[var(--bronze-700)] rounded-lg border-2 border-[var(--bronze-600)] hover:border-[var(--bronze-500)] transition-all">
            <FarmIcon size={32} className="text-[var(--terracotta-500)] group-hover:scale-110 transition-transform" />
            <span className="text-[var(--parchment-300)] text-xs">建造</span>
          </button>
        </div>

        {/* 回合结束按钮 */}
        <button
          onClick={() => setCurrentTurn(currentTurn + 1)}
          className="group relative w-32 h-32 rounded-full bg-gradient-to-br from-[var(--gold-500)] to-[var(--gold-700)] border-4 border-[var(--gold-600)] shadow-2xl hover:from-[var(--gold-400)] hover:to-[var(--gold-600)] transition-all hover:scale-105 active:scale-95"
        >
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,var(--gold-300)_0%,transparent_70%)] opacity-30" />
          <div className="relative flex flex-col items-center justify-center h-full">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mb-1">
              <path d="M9 5 L17 12 L9 19 Z" fill="var(--parchment-50)" stroke="var(--bronze-900)" strokeWidth="1.5" />
            </svg>
            <span className="text-[var(--bronze-900)] font-bold text-sm tracking-wide">下一回合</span>
          </div>
          {/* 旋转装饰 */}
          <div className="absolute inset-0 rounded-full border-2 border-[var(--gold-400)] animate-spin" style={{ animationDuration: '8s' }}>
            <div className="absolute top-0 left-1/2 w-2 h-2 bg-[var(--parchment-50)] rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-[var(--parchment-50)] rounded-full -translate-x-1/2 translate-y-1/2" />
            <div className="absolute left-0 top-1/2 w-2 h-2 bg-[var(--parchment-50)] rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute right-0 top-1/2 w-2 h-2 bg-[var(--parchment-50)] rounded-full translate-x-1/2 -translate-y-1/2" />
          </div>
        </button>
      </footer>
    </div>
  );
}