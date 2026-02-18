'use client';

import { useCallback, useEffect, useState } from 'react';
import { OracleIcon } from '@chunqiu/ui';
import { useGameStore } from '@/stores/gameStore';

const iconBase = '/oracle-bone-icons';

const mapControls = [
  { id: 'lens', label: '滤镜', icon: `${iconBase}/status/盾.svg`, hint: '4/9' },
  { id: 'yields', label: '收益', icon: `${iconBase}/yields/金.svg`, hint: 'Y' },
  { id: 'center', label: '归位', icon: `${iconBase}/terrain/泽.svg`, hint: 'Space' },
  { id: 'pin', label: '地图钉', icon: `${iconBase}/status/造.svg`, hint: 'P' },
  { id: 'search', label: '搜索', icon: `${iconBase}/status/医.svg`, hint: '/' },
  { id: 'strategic', label: '战略', icon: `${iconBase}/eras/剑.svg`, hint: 'V' },
  { id: 'fullscreen', label: '全屏', icon: `${iconBase}/status/足.svg`, hint: 'F' },
];

export function ActionBar() {
  const {
    gameState,
    showMessage,
    setActivePanel,
    showTileYields,
    toggleTileYields,
    requestCameraRecenter,
    activeAction,
    setActiveAction,
    activePanel,
    mapLens,
    setMapLens,
  } = useGameStore();
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
      const key = event.key.toLowerCase();
      if (
        key !== 'f' &&
        key !== ' ' &&
        key !== 'spacebar' &&
        key !== 'p' &&
        key !== '/' &&
        key !== '?' &&
        key !== 'v' &&
        key !== 'y'
      ) {
        return;
      }
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (isEditable(event.target)) return;
      event.preventDefault();
      if (key === 'f') {
        void toggleFullscreen();
        return;
      }
      if (key === 'p') {
        if (activeAction === 'pin') {
          setActiveAction(null);
          showMessage('已取消地图钉模式');
          return;
        }
        setActiveAction('pin');
        showMessage('地图钉模式：点击地块放置/移除');
        return;
      }
      if (key === '/' || key === '?') {
        setActivePanel('search');
        showMessage(activePanel === 'search' ? '已关闭地图搜索' : '已打开地图搜索');
        return;
      }
      if (key === 'y') {
        toggleTileYields();
        showMessage(showTileYields ? '已隐藏地块收益' : '已显示地块收益');
        return;
      }
      if (key === 'v') {
        const nextLens = mapLens === 'strategic' ? 'normal' : 'strategic';
        setMapLens(nextLens);
        showMessage(nextLens === 'strategic' ? '已启用战略镜头' : '已关闭战略镜头');
        return;
      }
      requestCameraRecenter();
      showMessage('镜头已归位');
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    activeAction,
    activePanel,
    mapLens,
    requestCameraRecenter,
    setActiveAction,
    setActivePanel,
    setMapLens,
    showMessage,
    showTileYields,
    toggleFullscreen,
    toggleTileYields,
  ]);

  if (!gameState) return null;

  return (
    <div className="bg-slate-900/85 border border-bronze-600/40 rounded-lg px-2 py-2 shadow-lg backdrop-blur pointer-events-auto">
      <div className="flex items-center gap-2">
        {mapControls.map(control => (
          <button
            key={control.id}
            type="button"
            data-testid={
              control.id === 'lens'
                ? 'action-lens'
                : control.id === 'yields'
                ? 'action-yields'
                : control.id === 'center'
                  ? 'action-center'
                : control.id === 'pin'
                  ? 'action-pin'
                : control.id === 'search'
                  ? 'action-search'
                : control.id === 'strategic'
                  ? 'action-strategic'
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
              if (control.id === 'center') {
                requestCameraRecenter();
                showMessage('镜头已归位');
                return;
              }
              if (control.id === 'search') {
                setActivePanel('search');
                showMessage(activePanel === 'search' ? '已关闭地图搜索' : '已打开地图搜索');
                return;
              }
              if (control.id === 'lens') {
                const nextLens = mapLens === 'resource' ? 'normal' : 'resource';
                setMapLens(nextLens);
                showMessage(nextLens === 'resource' ? '已启用资源镜头' : '已关闭资源镜头');
                return;
              }
              if (control.id === 'strategic') {
                const nextLens = mapLens === 'strategic' ? 'normal' : 'strategic';
                setMapLens(nextLens);
                showMessage(nextLens === 'strategic' ? '已启用战略镜头' : '已关闭战略镜头');
                return;
              }
              if (control.id === 'pin') {
                if (activeAction === 'pin') {
                  setActiveAction(null);
                  showMessage('已取消地图钉模式');
                  return;
                }
                setActiveAction('pin');
                showMessage('地图钉模式：点击地块放置/移除');
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
                  : control.id === 'lens' && mapLens === 'resource'
                    ? 'border-emerald-300/90 ring-1 ring-emerald-400/60'
                  : control.id === 'strategic' && mapLens === 'strategic'
                    ? 'border-amber-300/90 ring-1 ring-amber-400/60'
                  : control.id === 'search' && activePanel === 'search'
                    ? 'border-cyan-300/90 ring-1 ring-cyan-400/60'
                  : control.id === 'pin' && activeAction === 'pin'
                    ? 'border-sky-300/90 ring-1 ring-sky-400/60'
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
