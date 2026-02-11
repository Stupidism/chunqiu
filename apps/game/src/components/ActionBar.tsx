'use client';

import { Button } from '@chunqiu/ui';
import { useGameStore } from '@/stores/gameStore';
import { 
  BookOpen, 
  HeartHandshake, 
  BarChart3, 
  Settings, 
  HelpCircle,
  MessageSquare
} from 'lucide-react';

export function ActionBar() {
  const { gameState, setActivePanel, showMessage } = useGameStore();

  if (!gameState) return null;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-t border-bronze-600/50 px-4 py-2">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* 左侧：主要操作 */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-bronze-200 hover:text-bronze-100"
            data-testid="action-tech"
            onClick={() => {
              setActivePanel('tech');
              showMessage('已打开科技树面板');
            }}
          >
            <BookOpen className="w-4 h-4 mr-1" />
            科技树
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-bronze-200 hover:text-bronze-100"
            data-testid="action-diplomacy"
            onClick={() => {
              setActivePanel('diplomacy');
              showMessage('已打开外交面板');
            }}
          >
            <HeartHandshake className="w-4 h-4 mr-1" />
            外交
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-bronze-200 hover:text-bronze-100"
            data-testid="action-stats"
            onClick={() => {
              setActivePanel('stats');
              showMessage('已打开统计面板');
            }}
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            统计
          </Button>
        </div>

        {/* 中间：回合信息 */}
        <div className="flex items-center gap-4 text-sm">
          <span className="text-bronze-300">
            时代: <span className="text-bronze-100 font-medium">远古时代</span>
          </span>
          <span className="text-bronze-300">
            年份: <span className="text-bronze-100 font-medium">公元前2000年</span>
          </span>
        </div>

        {/* 右侧：系统操作 */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-bronze-200 hover:text-bronze-100"
            data-testid="action-chat"
            onClick={() => {
              setActivePanel('chat');
              showMessage('已打开聊天面板');
            }}
          >
            <MessageSquare className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-bronze-200 hover:text-bronze-100"
            data-testid="action-help"
            onClick={() => {
              setActivePanel('help');
              showMessage('已打开帮助面板');
            }}
          >
            <HelpCircle className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-bronze-200 hover:text-bronze-100"
            data-testid="action-settings"
            onClick={() => {
              setActivePanel('settings');
              showMessage('已打开设置面板');
            }}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
