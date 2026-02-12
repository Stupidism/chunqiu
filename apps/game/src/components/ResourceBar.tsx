'use client';

import { useEffect, useMemo, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { OracleIcon } from '@chunqiu/ui';

const civilizationNames: Record<string, string> = {
  qin: '秦',
  qi: '齐',
  chu: '楚',
  jin: '晋',
  yan: '燕',
  wu: '吴',
  yue: '越',
  song: '宋',
  lu: '鲁',
  wei: '魏',
};

const iconBase = '/oracle-bone-icons';
const powerIcons = {
  science: { src: `${iconBase}/buildings/学.svg`, tone: 'text-sky-200' },
  culture: { src: `${iconBase}/resources/茶.svg`, tone: 'text-purple-200' },
  faith: { src: `${iconBase}/resources/香.svg`, tone: 'text-slate-100' },
  gold: { src: `${iconBase}/yields/金.svg`, tone: 'text-yellow-200' },
  happiness: { src: `${iconBase}/status/和.svg`, tone: 'text-emerald-200' },
  tourism: { src: `${iconBase}/resources/瓦.svg`, tone: 'text-amber-200' },
  diplomacy: { src: `${iconBase}/resources/铜.svg`, tone: 'text-cyan-200' },
  trade: { src: `${iconBase}/status/足.svg`, tone: 'text-bronze-200' },
  envoy: { src: `${iconBase}/status/盾.svg`, tone: 'text-bronze-200' },
};

const interfaceButtons = [
  { id: 'tech', label: '科技树', icon: `${iconBase}/buildings/学.svg` },
  { id: 'civics', label: '市政树', icon: `${iconBase}/buildings/市.svg` },
  { id: 'government', label: '政体', icon: `${iconBase}/status/盾.svg` },
  { id: 'religion', label: '宗教', icon: `${iconBase}/resources/香.svg` },
  { id: 'greatPeople', label: '伟人', icon: `${iconBase}/status/医.svg` },
  { id: 'greatWorks', label: '巨作', icon: `${iconBase}/resources/瓦.svg` },
  { id: 'weather', label: '天气', icon: `${iconBase}/terrain/泽.svg` },
  { id: 'governors', label: '总督', icon: `${iconBase}/status/造.svg` },
  { id: 'moments', label: '历史时刻', icon: `${iconBase}/status/击.svg` },
];

export function ResourceBar() {
  const { gameState, setActivePanel, showMessage } = useGameStore();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (!gameState) return null;

  const currentPlayer = gameState.players.find(
    p => p.id === gameState.currentPlayerId
  );

  if (!currentPlayer) return null;

  const { resources } = currentPlayer;
  const powerStats = useMemo(
    () => [
      { key: 'science', label: '科技', value: resources.science, delta: resources.sciencePerTurn },
      { key: 'culture', label: '文化', value: resources.culture, delta: resources.culturePerTurn },
      { key: 'faith', label: '信仰', value: 0, delta: 0 },
      { key: 'gold', label: '金币', value: resources.gold, delta: resources.goldPerTurn },
      { key: 'happiness', label: '宜居', value: resources.happiness, delta: null },
      { key: 'tourism', label: '旅游', value: 0, delta: 0 },
      { key: 'diplomacy', label: '外交', value: 0, delta: 0 },
      { key: 'trade', label: '商路', value: '0/1', delta: null },
      { key: 'envoy', label: '使者', value: 0, delta: null },
    ],
    [resources]
  );

  const timeLabel = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none">
      <div className="bg-slate-900/90 border-b border-bronze-600/40 backdrop-blur pointer-events-auto">
        <div className="px-4 pt-2 pb-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-9 h-9 rounded-full border-2 border-bronze-400 flex items-center justify-center shadow-inner"
                  style={{ backgroundColor: currentPlayer.color }}
                >
                  <span className="text-white text-sm font-bold">
                    {civilizationNames[currentPlayer.civilization] || '?'}
                  </span>
                </div>
                <div>
                  <div className="text-bronze-100 font-medium text-sm">
                    {currentPlayer.name}
                  </div>
                  <div className="text-bronze-400 text-xs">
                    {currentPlayer.leader}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {powerStats.map(stat => {
                  const icon = powerIcons[stat.key as keyof typeof powerIcons];
                  const displayDelta =
                    typeof stat.delta === 'number'
                      ? `${stat.delta >= 0 ? '+' : ''}${stat.delta}/回合`
                      : null;
                  return (
                    <div key={stat.key} className="flex items-center gap-1.5">
                      {icon && (
                        <OracleIcon
                          src={icon.src}
                          size={16}
                          label={stat.label}
                          tone={icon.tone}
                        />
                      )}
                      <div className="text-xs leading-tight">
                        <div className="text-bronze-100 font-semibold">
                          {stat.value}
                        </div>
                        {displayDelta && (
                          <div className="text-[10px] text-emerald-300/80">
                            {displayDelta}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-bronze-200">
              <div className="text-right">
                <div className="text-bronze-400">回合</div>
                <div className="text-bronze-100 font-semibold text-base">
                  {gameState.currentTurn}
                </div>
              </div>
              <div className="text-right">
                <div className="text-bronze-400">年份</div>
                <div className="text-bronze-100 font-semibold">公元前2000年</div>
              </div>
              <div className="text-right">
                <div className="text-bronze-400">现实时间</div>
                <div className="text-bronze-100 font-semibold">{timeLabel}</div>
              </div>
              <button
                type="button"
                data-testid="action-help"
                onClick={() => {
                  setActivePanel('help');
                  showMessage('已打开帮助面板');
                }}
                className="w-8 h-8 rounded-full border border-bronze-600/60 bg-slate-900/80 flex items-center justify-center hover:bg-slate-800/80"
              >
                <OracleIcon src={`${iconBase}/ui/否.svg`} size={14} tone="text-bronze-200" label="帮助" />
              </button>
              <button
                type="button"
                data-testid="action-settings"
                onClick={() => {
                  setActivePanel('settings');
                  showMessage('已打开设置面板');
                }}
                className="w-8 h-8 rounded-full border border-bronze-600/60 bg-slate-900/80 flex items-center justify-center hover:bg-slate-800/80"
              >
                <OracleIcon src={`${iconBase}/status/造.svg`} size={14} tone="text-bronze-200" label="设置" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-4 pb-2">
          <div className="flex items-center gap-2 overflow-x-auto max-w-full">
            {interfaceButtons.map(btn => (
              <button
                key={btn.id}
                type="button"
                data-testid={btn.id === 'tech' ? 'action-tech' : undefined}
                onClick={() => {
                  if (btn.id === 'tech') {
                    setActivePanel('tech');
                    showMessage('已打开科技树面板');
                    return;
                  }
                  showMessage(`${btn.label}面板开发中`);
                }}
                className="flex items-center gap-1.5 px-2 py-1 rounded-full border border-bronze-600/40 bg-slate-900/70 text-xs text-bronze-200 hover:text-bronze-100"
              >
                <OracleIcon src={btn.icon} size={14} tone="text-bronze-200" label={btn.label} />
                <span className="whitespace-nowrap">{btn.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {gameState.players.slice(0, 3).map(player => (
                <div
                  key={player.id}
                  className="w-7 h-7 rounded-full border border-bronze-500/70 flex items-center justify-center text-[10px] text-bronze-100"
                  style={{ backgroundColor: player.color }}
                  title={player.name}
                >
                  {civilizationNames[player.civilization] || '？'}
                </div>
              ))}
            </div>
            <button
              type="button"
              data-testid="action-diplomacy"
              onClick={() => {
                setActivePanel('diplomacy');
                showMessage('已打开外交面板');
              }}
              className="flex items-center gap-1.5 px-2 py-1 rounded-full border border-bronze-600/40 bg-slate-900/70 text-xs text-bronze-200 hover:text-bronze-100"
            >
              <OracleIcon src={`${iconBase}/status/和.svg`} size={14} tone="text-emerald-200" label="外交" />
              外交
            </button>
            <button
              type="button"
              data-testid="action-stats"
              onClick={() => {
                setActivePanel('stats');
                showMessage('已打开统计面板');
              }}
              className="flex items-center gap-1.5 px-2 py-1 rounded-full border border-bronze-600/40 bg-slate-900/70 text-xs text-bronze-200 hover:text-bronze-100"
            >
              <OracleIcon src={`${iconBase}/status/击.svg`} size={14} tone="text-bronze-200" label="报告" />
              报告
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
