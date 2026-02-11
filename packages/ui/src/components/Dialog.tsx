import * as React from 'react';
import { cn } from '../utils/cn';
import { X } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  size = 'md',
}: DialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 对话框 */}
      <div
        className={cn(
          'relative w-full mx-4',
          sizeClasses[size],
          // 青铜器风格
          'bg-gradient-to-br from-bronze-50 via-white to-bronze-50',
          'rounded-lg border-2 border-bronze-300',
          'shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]',
          'animate-in fade-in zoom-in-95 duration-200',
          className
        )}
      >
        {/* 装饰边框 */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-bronze-400 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-bronze-400 to-transparent" />

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className={cn(
            'absolute top-3 right-3',
            'w-8 h-8 rounded-full',
            'flex items-center justify-center',
            'text-bronze-500 hover:text-bronze-700',
            'hover:bg-bronze-100 transition-colors'
          )}
        >
          <X className="w-5 h-5" />
        </button>

        {/* 标题区域 */}
        {(title || description) && (
          <div className="px-6 pt-6 pb-4 border-b border-bronze-200">
            {title && (
              <h2 className="text-xl font-semibold text-bronze-900 font-oracle pr-8">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-bronze-600">{description}</p>
            )}
          </div>
        )}

        {/* 内容区域 */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// 对话框页脚
interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogFooter({ children, className }: DialogFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3',
        'mt-6 pt-4 border-t border-bronze-200',
        className
      )}
    >
      {children}
    </div>
  );
}
