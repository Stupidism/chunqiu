import * as React from 'react';
import { cn } from '../utils/cn';

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
}

export function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: SeparatorProps) {
  return (
    <div
      role={decorative ? 'none' : 'separator'}
      aria-orientation={decorative ? undefined : orientation}
      className={cn(
        'shrink-0 bg-bronze-200',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        // 青铜器装饰效果
        'relative',
        'after:absolute after:inset-0',
        'after:bg-gradient-to-r after:from-transparent after:via-bronze-400 after:to-transparent',
        className
      )}
      {...props}
    />
  );
}
