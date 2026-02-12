'use client';

import { OracleIcon } from '@chunqiu/ui';
import { useGameStore } from '@/stores/gameStore';

const iconBase = '/oracle-bone-icons';

const mapControls = [
  { id: 'lens', label: '滤镜', icon: `${iconBase}/status/盾.svg`, hint: '4/9' },
  { id: 'yields', label: '收益', icon: `${iconBase}/yields/金.svg`, hint: 'Y' },
  { id: 'pin', label: '地图钉', icon: `${iconBase}/status/造.svg`, hint: 'P' },
  { id: 'search', label: '搜索', icon: `${iconBase}/status/医.svg`, hint: '/' },
  { id: 'strategic', label: '战略', icon: `${iconBase}/eras/剑.svg`, hint: 'V' },
  { id: 'fullscreen', label: '全屏', icon: `${iconBase}/status/足.svg`, hint: 'F' },
];

export function ActionBar() {
  const { gameState, showMessage, setActivePanel } = useGameStore();

  if (!gameState) return null;

  return (
    <div className="bg-slate-900/85 border border-bronze-600/40 rounded-lg px-2 py-2 shadow-lg backdrop-blur pointer-events-auto">
      <div className="flex items-center gap-2">
        {mapControls.map(control => (
          <button
            key={control.id}
            type="button"
            className="group flex flex-col items-center gap-1 w-12"
            onClick={() => {
              if (control.id === 'yields') {
                showMessage('地块收益显示已切换');
                return;
              }
              showMessage(`${control.label}功能开发中`);
            }}
          >
            <div className="relative w-9 h-9 rounded-full border border-bronze-600/60 bg-slate-900/80 flex items-center justify-center shadow-inner group-hover:bg-slate-800/80">
              <OracleIcon src={control.icon} size={16} tone="text-bronze-200" label={control.label} />
              {control.hint && (
                <span className="absolute -top-1 -right-1 text-[9px] text-bronze-100 bg-slate-900/90 border border-bronze-600/60 rounded px-1">
                  {control.hint}
                </span>
              )}
            </div>
            <span className="text-[10px] text-bronze-200 group-hover:text-bronze-100">
              {control.label}
            </span>
          </button>
        ))}

        <button
          type="button"
          data-testid="action-chat"
          className="group flex flex-col items-center gap-1 w-12"
          onClick={() => {
            setActivePanel('chat');
            showMessage('已打开聊天面板');
          }}
        >
          <div className="relative w-9 h-9 rounded-full border border-bronze-600/60 bg-slate-900/80 flex items-center justify-center shadow-inner group-hover:bg-slate-800/80">
            <OracleIcon src={`${iconBase}/status/和.svg`} size={16} tone="text-emerald-200" label="聊天" />
          </div>
          <span className="text-[10px] text-bronze-200 group-hover:text-bronze-100">聊天</span>
        </button>
      </div>
    </div>
  );
}
