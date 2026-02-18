'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, OracleIcon } from '@chunqiu/ui';
import { useGameStore } from '@/stores/gameStore';

const iconBase = '/oracle-bone-icons';

type SearchResult =
  | {
      kind: 'city';
      id: string;
      title: string;
      subtitle: string;
      row: number;
      col: number;
      cityId: string;
    }
  | {
      kind: 'unit';
      id: string;
      title: string;
      subtitle: string;
      row: number;
      col: number;
      unitId: string;
    }
  | {
      kind: 'tile';
      id: string;
      title: string;
      subtitle: string;
      row: number;
      col: number;
    };

function parseCoordinate(query: string) {
  const matched = query.trim().match(/^(\d+)\s*[,，\s]\s*(\d+)$/);
  if (!matched) return null;
  return { row: Number(matched[1]), col: Number(matched[2]) };
}

const unitNameMap: Record<string, string> = {
  warrior: '战士',
  archer: '弓箭手',
  chariot: '战车',
  spearman: '矛兵',
  swordsman: '剑士',
  worker: '工人',
  settler: '移民',
  scout: '侦察兵',
};

export function MapSearchPanel() {
  const {
    gameState,
    setActivePanel,
    requestCameraRecenter,
    requestFocusUnit,
    selectTile,
    selectUnit,
    selectCity,
    showMessage,
  } = useGameStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActivePanel(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setActivePanel]);

  const results = useMemo<SearchResult[]>(() => {
    if (!gameState) return [];
    const normalized = query.trim().toLowerCase();
    const list: SearchResult[] = [];

    const coordinate = parseCoordinate(query);
    if (coordinate) {
      const inBounds =
        coordinate.row >= 0 &&
        coordinate.row < gameState.map.height &&
        coordinate.col >= 0 &&
        coordinate.col < gameState.map.width;
      if (inBounds) {
        list.push({
          kind: 'tile',
          id: `tile-${coordinate.row}-${coordinate.col}`,
          title: `坐标 (${coordinate.row}, ${coordinate.col})`,
          subtitle: '定位到指定地块',
          row: coordinate.row,
          col: coordinate.col,
        });
      }
    }

    Object.values(gameState.cities).forEach(city => {
      const key = `${city.name} ${city.position.row},${city.position.col}`.toLowerCase();
      if (normalized && !key.includes(normalized)) return;
      list.push({
        kind: 'city',
        id: `city-${city.id}`,
        title: city.name,
        subtitle: `城市 · (${city.position.row}, ${city.position.col})`,
        row: city.position.row,
        col: city.position.col,
        cityId: city.id,
      });
    });

    Object.values(gameState.units).forEach(unit => {
      const unitName = unitNameMap[unit.type] || unit.type;
      const key = `${unitName} ${unit.type} ${unit.position.row},${unit.position.col}`.toLowerCase();
      if (normalized && !key.includes(normalized)) return;
      list.push({
        kind: 'unit',
        id: `unit-${unit.id}`,
        title: unitName,
        subtitle: `单位 · (${unit.position.row}, ${unit.position.col})`,
        row: unit.position.row,
        col: unit.position.col,
        unitId: unit.id,
      });
    });

    return list.slice(0, 10);
  }, [gameState, query]);

  const applyResult = (result: SearchResult) => {
    selectTile({ row: result.row, col: result.col });
    if (result.kind === 'city') {
      selectCity(result.cityId);
      requestFocusUnit(null);
      requestCameraRecenter();
      showMessage(`已定位城市：${result.title}`);
    } else if (result.kind === 'unit') {
      selectUnit(result.unitId);
      requestFocusUnit(result.unitId);
      showMessage(`已定位单位：${result.title}`);
    } else {
      selectUnit(null);
      selectCity(null);
      requestFocusUnit(null);
      requestCameraRecenter();
      showMessage(`已定位坐标：(${result.row}, ${result.col})`);
    }
    setActivePanel(null);
  };

  const iconByKind: Record<SearchResult['kind'], string> = {
    city: `${iconBase}/buildings/市.svg`,
    unit: `${iconBase}/eras/剑.svg`,
    tile: `${iconBase}/terrain/泽.svg`,
  };

  return (
    <div className="w-80 max-w-[calc(100vw-1rem)] bg-slate-900/95 border border-bronze-600/50 rounded-lg px-3 py-3 text-bronze-100 shadow-lg backdrop-blur pointer-events-auto">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium flex items-center gap-2">
          <OracleIcon src={`${iconBase}/status/医.svg`} size={14} tone="text-bronze-100" label="搜索" />
          地图搜索
        </div>
        <button
          type="button"
          className="text-xs text-bronze-300 hover:text-bronze-100"
          onClick={() => setActivePanel(null)}
        >
          关闭
        </button>
      </div>
      <input
        ref={inputRef}
        data-testid="map-search-input"
        value={query}
        onChange={event => setQuery(event.target.value)}
        placeholder="城市名 / 单位名 / 坐标(7,6)"
        className="w-full h-9 rounded border border-bronze-600/60 bg-slate-950/80 px-3 text-sm text-bronze-100 placeholder:text-bronze-500 focus:outline-none focus:ring-1 focus:ring-bronze-400/70"
      />
      <div className="mt-3 max-h-72 overflow-y-auto space-y-2">
        {results.length === 0 && (
          <div className="text-xs text-bronze-400 px-1 py-3">没有匹配结果</div>
        )}
        {results.map(result => (
          <Button
            key={result.id}
            size="sm"
            variant="ghost"
            data-testid={`search-result-${result.kind}`}
            className="w-full justify-start text-left text-bronze-100 hover:bg-slate-800/60 border border-transparent hover:border-bronze-700/50"
            onClick={() => applyResult(result)}
          >
            <OracleIcon src={iconByKind[result.kind]} size={12} tone="text-bronze-200" />
            <span className="flex flex-col items-start leading-tight">
              <span className="text-sm">{result.title}</span>
              <span className="text-[11px] text-bronze-400">{result.subtitle}</span>
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}
