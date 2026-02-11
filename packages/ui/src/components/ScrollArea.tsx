import * as React from 'react';
import { cn } from '../utils/cn';

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  scrollbarClassName?: string;
}

export function ScrollArea({
  children,
  className,
  scrollbarClassName,
  ...props
}: ScrollAreaProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'h-full w-full overflow-auto',
          // 自定义滚动条样式
          '[&::-webkit-scrollbar]:w-2',
          '[&::-webkit-scrollbar-track]:bg-bronze-100',
          '[&::-webkit-scrollbar-track]:rounded-full',
          '[&::-webkit-scrollbar-thumb]:bg-bronze-400',
          '[&::-webkit-scrollbar-thumb]:rounded-full',
          '[&::-webkit-scrollbar-thumb]:hover:bg-bronze-500',
          scrollbarClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}
