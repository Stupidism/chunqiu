'use client';

import { useEffect } from 'react';
import { Toolbar } from '@/components/Toolbar';
import { MapCanvas } from '@/components/MapCanvas';
import { PropertiesPanel } from '@/components/PropertiesPanel';
import { useEditorStore } from '@/stores/editorStore';
import { generateMap } from '@chunqiu/game-core';
import { Button, Card } from '@chunqiu/ui';
import { Save, FolderOpen, FilePlus } from 'lucide-react';

export default function EditorPage() {
  const { map, setMap, createNewMap } = useEditorStore();

  useEffect(() => {
    if (!map) {
      createNewMap(20, 15);
    }
  }, [map, createNewMap]);

  const handleNewMap = () => {
    const width = parseInt(prompt('地图宽度:', '20') || '20');
    const height = parseInt(prompt('地图高度:', '15') || '15');
    createNewMap(width, height);
  };

  const handleSave = () => {
    if (!map) return;
    const data = JSON.stringify(map, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'map.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoad = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            setMap(data);
          } catch (error) {
            alert('无效的地图文件');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  if (!map) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bronze-50">
        <div className="text-center">
          <div className="text-4xl mb-4">🗺️</div>
          <h1 className="text-2xl font-oracle mb-2">加载编辑器...</h1>
        </div>
      </div>
    );
  }

  return (
    <main className="h-screen flex flex-col bg-bronze-50">
      {/* Header */}
      <header className="bg-bronze-800 text-bronze-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold font-oracle">春秋 - 地图编辑器</h1>
          <span className="text-bronze-300">|</span>
          <span className="text-sm text-bronze-300">
            {map.width} x {map.height}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleNewMap}>
            <FilePlus className="w-4 h-4 mr-1" />
            新建
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLoad}>
            <FolderOpen className="w-4 h-4 mr-1" />
            打开
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" />
            保存
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Left Toolbar */}
        <div className="w-64 flex-shrink-0">
          <Toolbar />
        </div>

        {/* Center Canvas */}
        <div className="flex-1 bg-slate-900 rounded-lg overflow-hidden shadow-lg">
          <MapCanvas />
        </div>

        {/* Right Properties Panel */}
        <div className="w-64 flex-shrink-0">
          <PropertiesPanel />
        </div>
      </div>
    </main>
  );
}
