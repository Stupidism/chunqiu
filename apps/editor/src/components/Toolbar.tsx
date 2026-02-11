'use client';

import { Card, CardContent, CardHeader, CardTitle, Button } from '@chunqiu/ui';
import { useEditorStore, EditorTool } from '@/stores/editorStore';
import { 
  MousePointer2, 
  Mountain, 
  Layers, 
  Gem, 
  Eraser,
  Undo2,
  Redo2
} from 'lucide-react';

const tools: { id: EditorTool; name: string; icon: React.ReactNode }[] = [
  { id: 'select', name: '选择', icon: <MousePointer2 className="w-5 h-5" /> },
  { id: 'terrain', name: '地形', icon: <Mountain className="w-5 h-5" /> },
  { id: 'elevation', name: '海拔', icon: <Layers className="w-5 h-5" /> },
  { id: 'resource', name: '资源', icon: <Gem className="w-5 h-5" /> },
  { id: 'eraser', name: '橡皮擦', icon: <Eraser className="w-5 h-5" /> },
];

export function Toolbar() {
  const { 
    selectedTool, 
    setSelectedTool, 
    brushSize, 
    setBrushSize,
    undo,
    redo,
    historyIndex,
    history,
  } = useEditorStore();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">工具</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 撤销/重做 */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={undo}
            disabled={!canUndo}
          >
            <Undo2 className="w-4 h-4 mr-1" />
            撤销
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={redo}
            disabled={!canRedo}
          >
            <Redo2 className="w-4 h-4 mr-1" />
            重做
          </Button>
        </div>

        {/* 工具列表 */}
        <div className="space-y-1">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                ${selectedTool === tool.id
                  ? 'bg-bronze-600 text-white'
                  : 'hover:bg-bronze-100 text-bronze-700'
                }
              `}
            >
              {tool.icon}
              <span className="text-sm">{tool.name}</span>
            </button>
          ))}
        </div>

        {/* 笔刷大小 */}
        <div>
          <div className="text-xs text-bronze-600 mb-2">笔刷大小</div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((size) => (
              <button
                key={size}
                onClick={() => setBrushSize(size)}
                className={`
                  w-8 h-8 rounded flex items-center justify-center text-sm transition-all
                  ${brushSize === size
                    ? 'bg-bronze-600 text-white'
                    : 'bg-bronze-100 text-bronze-700 hover:bg-bronze-200'
                  }
                `}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
