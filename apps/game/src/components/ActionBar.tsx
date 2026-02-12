'use client';

import { useCallback, useEffect, useState } from 'react';
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
  const { gameState, showMessage, setActivePanel, showTileYields, toggleTileYields } = useGameStore();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(async () => {
    if (typeof document === 'undefined') return;
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        showMessage('已进入全屏');
      } else {
        await document.exitFullscreen();
        showMessage('已退出全屏');
      }
    } catch {
      showMessage('当前环境不支持全屏');
    }
  }, [showMessage]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const syncFullscreen = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    syncFullscreen();
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () => document.removeEventListener('fullscreenchange', syncFullscreen);
  }, []);

  useEffect(() => {
    const isEditable = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      if (target.isContentEditable) return true;
      const tag = target.tagName.toLowerCase();
      return tag === 'input' || tag === 'textarea' || tag === 'select';
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'f') return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (isEditable(event.target)) return;
      event.preventDefault();
      void toggleFullscreen();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggleFullscreen]);

  if (!gameState) return null;

  return (
    <div className="bg-slate-900/85 border border-bronze-600/40 rounded-lg px-2 py-2 shadow-lg backdrop-blur pointer-events-auto">
      <div className="flex items-center gap-2">
        {mapControls.map(control => (
          <button
            key={control.id}
            type="button"
            data-testid={
              control.id === 'yields'
                ? 'action-yields'
                : control.id === 'fullscreen'
                  ? 'action-fullscreen'
                  : undefined
            }
            className="group flex flex-col items-center gap-1 w-12"
            onClick={() => {
              if (control.id === 'fullscreen') {
                void toggleFullscreen();
                return;
              }
              if (control.id === 'yields') {
                toggleTileYields();
                showMessage(showTileYields ? '已隐藏地块收益' : '已显示地块收益');
                return;
              }
              showMessage(`${control.label}功能开发中`);
            }}
          >
            <div
              className={`relative w-9 h-9 rounded-full border bg-slate-900/80 flex items-center justify-center shadow-inner group-hover:bg-slate-800/80 ${
                control.id === 'fullscreen' && isFullscreen
                  ? 'border-bronze-300/90 ring-1 ring-bronze-300/60'
                  : control.id === 'yields' && showTileYields
                    ? 'border-emerald-300/90 ring-1 ring-emerald-400/60'
                  : 'border-bronze-600/60'
              }`}
            >
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
