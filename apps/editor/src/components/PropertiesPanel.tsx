'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@chunqiu/ui';
import { useEditorStore } from '@/stores/editorStore';
import type { TerrainType, ElevationType, ResourceType } from '@chunqiu/types';

const terrains: { value: TerrainType; name: string; color: string }[] = [
  { value: 'grassland', name: '草原', color: '#7CB342' },
  { value: 'plains', name: '平原', color: '#C5A059' },
  { value: 'desert', name: '沙漠', color: '#E6C875' },
  { value: 'tundra', name: '冻土', color: '#B8C5D6' },
  { value: 'coast', name: '海岸', color: '#4FC3F7' },
  { value: 'ocean', name: '海洋', color: '#0288D1' },
];

const elevations: { value: ElevationType; name: string }[] = [
  { value: 'flat', name: '平地' },
  { value: 'hill', name: '丘陵' },
  { value: 'mountain', name: '山脉' },
];

const resources: { value: ResourceType; name: string; icon: string }[] = [
  { value: 'food', name: '粮食', icon: '🌾' },
  { value: 'production', name: '产能', icon: '⚒️' },
  { value: 'gold', name: '黄金', icon: '💰' },
  { value: 'luxury', name: '奢侈品', icon: '💎' },
  { value: 'strategic', name: '战略', icon: '⛏️' },
];

export function PropertiesPanel() {
  const {
    selectedTool,
    selectedTerrain,
    setSelectedTerrain,
    selectedElevation,
    setSelectedElevation,
    selectedResource,
    setSelectedResource,
    selectedTile,
    map,
  } = useEditorStore();

  const currentTile = selectedTile && map
    ? map.tiles[selectedTile.row]?.[selectedTile.col]
    : null;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">属性</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 地形选择 */}
        {(selectedTool === 'terrain' || selectedTool === 'select') && (
          <div>
            <div className="text-xs text-bronze-600 mb-2">地形</div>
            <div className="grid grid-cols-2 gap-1">
              {terrains.map((terrain) => (
                <button
                  key={terrain.value}
                  onClick={() => setSelectedTerrain(terrain.value)}
                  className={`
                    flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-all
                    ${selectedTerrain === terrain.value
                      ? 'bg-bronze-600 text-white'
                      : 'bg-bronze-50 text-bronze-700 hover:bg-bronze-100'
                    }
                  `}
                >
                  <span
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: terrain.color }}
                  />
                  {terrain.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 海拔选择 */}
        {(selectedTool === 'elevation' || selectedTool === 'select') && (
          <div>
            <div className="text-xs text-bronze-600 mb-2">海拔</div>
            <div className="space-y-1">
              {elevations.map((elevation) => (
                <button
                  key={elevation.value}
                  onClick={() => setSelectedElevation(elevation.value)}
                  className={`
                    w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-all
                    ${selectedElevation === elevation.value
                      ? 'bg-bronze-600 text-white'
                      : 'bg-bronze-50 text-bronze-700 hover:bg-bronze-100'
                    }
                  `}
                >
                  <span className="text-lg">
                    {elevation.value === 'flat' && '▬'}
                    {elevation.value === 'hill' && '▲'}
                    {elevation.value === 'mountain' && '▲▲'}
                  </span>
                  {elevation.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 资源选择 */}
        {(selectedTool === 'resource' || selectedTool === 'select') && (
          <div>
            <div className="text-xs text-bronze-600 mb-2">资源</div>
            <div className="grid grid-cols-2 gap-1">
              {resources.map((resource) => (
                <button
                  key={resource.value}
                  onClick={() => setSelectedResource(
                    selectedResource === resource.value ? null : resource.value
                  )}
                  className={`
                    flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-all
                    ${selectedResource === resource.value
                      ? 'bg-bronze-600 text-white'
                      : 'bg-bronze-50 text-bronze-700 hover:bg-bronze-100'
                    }
                  `}
                >
                  <span>{resource.icon}</span>
                  {resource.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 选中地块信息 */}
        {currentTile && (
          <div className="pt-4 border-t border-bronze-200">
            <div className="text-xs text-bronze-600 mb-2">选中地块</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-bronze-500">位置</span>
                <span>({currentTile.position.row}, {currentTile.position.col})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-bronze-500">地形</span>
                <span>{terrains.find(t => t.value === currentTile.terrain)?.name || currentTile.terrain}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-bronze-500">海拔</span>
                <span>{elevations.find(e => e.value === currentTile.elevation)?.name || currentTile.elevation}</span>
              </div>
              {currentTile.resource && (
                <div className="flex justify-between">
                  <span className="text-bronze-500">资源</span>
                  <span>{currentTile.resource.name}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
