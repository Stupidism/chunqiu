'use client';

import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@chunqiu/ui';
import { useGameStore } from '@/stores/gameStore';
import { calculateTileYields } from '@chunqiu/game-core';
import { Building2, Users, Hammer } from 'lucide-react';

export function CityPanel() {
  const { gameState, selectedCity, selectedTile, buildInCity, showMessage } = useGameStore();

  // 如果没有选中城市，但选中了地块，检查该地块是否有城市
  let city = selectedCity ? gameState?.cities[selectedCity] : null;
  
  if (!city && selectedTile && gameState) {
    city = Object.values(gameState.cities).find(
      c => c.position.row === selectedTile.row && c.position.col === selectedTile.col
    );
  }

  if (!gameState || !city) {
    return (
      <Card className="opacity-50">
        <CardHeader>
          <CardTitle className="text-sm">城市信息</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-bronze-500 text-center py-4">
            选择一个城市查看详情
          </p>
        </CardContent>
      </Card>
    );
  }

  const { yields } = city;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <span className="text-2xl">🏛️</span>
            <span>{city.name}</span>
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {city.population} 👥
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 产出 */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-green-50 p-2 rounded flex items-center gap-2">
            <span className="text-lg">🌾</span>
            <div>
              <div className="text-xs text-green-600">粮食</div>
              <div className="font-bold text-green-700">{yields.food}</div>
            </div>
          </div>
          <div className="bg-amber-50 p-2 rounded flex items-center gap-2">
            <span className="text-lg">⚒️</span>
            <div>
              <div className="text-xs text-amber-600">产能</div>
              <div className="font-bold text-amber-700">{yields.production}</div>
            </div>
          </div>
          <div className="bg-yellow-50 p-2 rounded flex items-center gap-2">
            <span className="text-lg">💰</span>
            <div>
              <div className="text-xs text-yellow-600">金币</div>
              <div className="font-bold text-yellow-700">{yields.gold}</div>
            </div>
          </div>
          <div className="bg-blue-50 p-2 rounded flex items-center gap-2">
            <span className="text-lg">📜</span>
            <div>
              <div className="text-xs text-blue-600">科研</div>
              <div className="font-bold text-blue-700">{yields.science}</div>
            </div>
          </div>
        </div>

        {/* 人口增长 */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-bronze-600">人口增长</span>
            <span className="font-medium">{city.population} / {city.population + 1}</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all"
              style={{ width: '45%' }}
            />
          </div>
        </div>

        {/* 文化扩张 */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-bronze-600">文化扩张</span>
            <span className="font-medium">{city.culture} / 100</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-pink-500 transition-all"
              style={{ width: `${Math.min(city.culture, 100)}%` }}
            />
          </div>
        </div>

        {/* 建筑列表 */}
        {city.buildings.length > 0 && (
          <div>
            <div className="text-xs text-bronze-600 mb-2">已建造建筑</div>
            <div className="flex flex-wrap gap-1">
              {city.buildings.map((building) => (
                <Badge key={building.id} variant="secondary" className="text-xs">
                  <Building2 className="w-3 h-3 mr-1" />
                  {building.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 生产队列 */}
        {city.productionQueue.length > 0 && (
          <div>
            <div className="text-xs text-bronze-600 mb-2">正在生产</div>
            <div className="space-y-1">
              {city.productionQueue.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="flex items-center justify-between text-xs bg-slate-100 p-2 rounded"
                >
                  <span className="flex items-center gap-1">
                    <Hammer className="w-3 h-3" />
                    {item.name}
                  </span>
                  <span className="text-bronze-600">
                    {item.progress}/{item.productionCost}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-bronze-200">
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            data-testid="city-build"
            onClick={() => {
              buildInCity(city.id, 'building', 'granary');
              showMessage('已加入生产队列：粮仓');
            }}
          >
            <Building2 className="w-3 h-3 mr-1" />
            建造
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            data-testid="city-manage"
            onClick={() => showMessage('市民管理面板开发中')}
          >
            <Users className="w-3 h-3 mr-1" />
            管理市民
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
