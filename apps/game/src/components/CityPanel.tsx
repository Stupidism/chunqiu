'use client';

import { Button, Card, CardContent, CardHeader, CardTitle, Badge, OracleIcon } from '@chunqiu/ui';
import { useGameStore } from '@/stores/gameStore';

const iconBase = '/oracle-bone-icons';
const yieldIcons: Record<string, string> = {
  food: `${iconBase}/terrain/草.svg`,
  production: `${iconBase}/buildings/斤.svg`,
  gold: `${iconBase}/yields/金.svg`,
  science: `${iconBase}/buildings/学.svg`,
};

export function CityPanel() {
  const { gameState, selectedCity, buildInCity, showMessage, selectCity } = useGameStore();

  const city = selectedCity ? gameState?.cities[selectedCity] : null;

  if (!gameState || !city) {
    return null;
  }

  const { yields } = city;

  return (
    <Card variant="ink" className="bg-slate-900/85 border-bronze-600/40 h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2 text-bronze-100">
            <OracleIcon src={`${iconBase}/buildings/市.svg`} size={20} label="城市" tone="text-bronze-100" />
            <span>{city.name}</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs text-bronze-100 border-bronze-500/60">
              {city.population} 👥
            </Badge>
            <button
              type="button"
              data-testid="city-close"
              onClick={() => selectCity(null)}
              className="w-7 h-7 rounded-full border border-bronze-600/60 bg-slate-900/70 flex items-center justify-center hover:bg-slate-800/80"
            >
              <OracleIcon src={`${iconBase}/ui/否.svg`} size={12} tone="text-bronze-200" label="关闭" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-bronze-100 overflow-y-auto max-h-[calc(100vh-260px)] pr-1">
        {/* 产出 */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-800/70 p-2 rounded flex items-center gap-2">
            <OracleIcon src={yieldIcons.food} size={16} label="粮食" tone="text-emerald-300" />
            <div>
              <div className="text-xs text-emerald-300">粮食</div>
              <div className="font-bold text-bronze-100">{yields.food}</div>
            </div>
          </div>
          <div className="bg-slate-800/70 p-2 rounded flex items-center gap-2">
            <OracleIcon src={yieldIcons.production} size={16} label="产能" tone="text-amber-300" />
            <div>
              <div className="text-xs text-amber-300">产能</div>
              <div className="font-bold text-bronze-100">{yields.production}</div>
            </div>
          </div>
          <div className="bg-slate-800/70 p-2 rounded flex items-center gap-2">
            <OracleIcon src={yieldIcons.gold} size={16} label="金币" tone="text-yellow-300" />
            <div>
              <div className="text-xs text-yellow-300">金币</div>
              <div className="font-bold text-bronze-100">{yields.gold}</div>
            </div>
          </div>
          <div className="bg-slate-800/70 p-2 rounded flex items-center gap-2">
            <OracleIcon src={yieldIcons.science} size={16} label="科研" tone="text-sky-300" />
            <div>
              <div className="text-xs text-sky-300">科研</div>
              <div className="font-bold text-bronze-100">{yields.science}</div>
            </div>
          </div>
        </div>

        {/* 城市条 */}
        <div className="bg-slate-800/60 rounded px-3 py-2">
          <div className="flex items-center justify-between text-xs text-bronze-300 mb-1">
            <span>人口增长</span>
            <span>{city.population} / {city.population + 1}</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-purple-500 transition-all" style={{ width: '45%' }} />
          </div>
          <div className="flex items-center justify-between text-xs text-bronze-300 mb-1">
            <span>文化扩张</span>
            <span>{city.culture} / 100</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-pink-500 transition-all"
              style={{ width: `${Math.min(city.culture, 100)}%` }}
            />
          </div>
        </div>

        {/* 人口增长 */}
        {/* 生产 */}
        <div className="bg-slate-800/60 rounded px-3 py-2">
          <div className="text-xs text-bronze-300 mb-2">正在生产</div>
          {city.productionQueue.length > 0 ? (
            city.productionQueue.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="flex items-center justify-between text-xs bg-slate-800/70 p-2 rounded mb-1"
              >
                <span className="flex items-center gap-1">
                  <OracleIcon src={`${iconBase}/buildings/斤.svg`} size={12} tone="text-bronze-100" />
                  {item.name}
                </span>
                <span className="text-bronze-300">
                  {item.progress}/{item.productionCost}
                </span>
              </div>
            ))
          ) : (
            <div className="text-xs text-bronze-200">未选择生产项目</div>
          )}
        </div>

        {/* 建筑列表 */}
        {city.buildings.length > 0 && (
          <div>
            <div className="text-xs text-bronze-300 mb-2">已建造建筑</div>
            <div className="flex flex-wrap gap-1">
              {city.buildings.map((building) => (
                <Badge key={building.id} variant="secondary" className="text-xs text-bronze-100">
                  <OracleIcon src={`${iconBase}/buildings/斤.svg`} size={12} tone="text-bronze-100" />
                  {building.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 生产队列 */}
        {/* 操作按钮 */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-bronze-700/60">
          <Button
            size="sm"
            variant="outline"
            className="text-xs text-bronze-100 border-bronze-500/60"
            data-testid="city-build"
            onClick={() => {
              buildInCity(city.id, 'building', 'granary');
              showMessage('已加入生产队列：粮仓');
            }}
          >
            <OracleIcon src={`${iconBase}/buildings/斤.svg`} size={12} tone="text-bronze-100" />
            建造
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs text-bronze-100 border-bronze-500/60"
            data-testid="city-manage"
            onClick={() => showMessage('市民管理面板开发中')}
          >
            <OracleIcon src={`${iconBase}/status/和.svg`} size={12} tone="text-bronze-100" />
            管理市民
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
