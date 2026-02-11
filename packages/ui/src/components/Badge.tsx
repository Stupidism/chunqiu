import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: [
          'border-transparent bg-bronze-600 text-bronze-50',
          'hover:bg-bronze-700',
        ],
        secondary: [
          'border-transparent bg-bronze-100 text-bronze-900',
          'hover:bg-bronze-200',
        ],
        destructive: [
          'border-transparent bg-red-600 text-white',
          'hover:bg-red-700',
        ],
        outline: [
          'text-bronze-700 border-bronze-300',
          'hover:bg-bronze-50',
        ],
        success: [
          'border-transparent bg-emerald-600 text-white',
          'hover:bg-emerald-700',
        ],
        warning: [
          'border-transparent bg-amber-500 text-white',
          'hover:bg-amber-600',
        ],
        info: [
          'border-transparent bg-blue-600 text-white',
          'hover:bg-blue-700',
        ],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        badgeVariants({ variant }),
        // 甲骨文装饰角
        "relative",
        "before:absolute before:top-0 before:left-1 before:w-1 before:h-1",
        "before:border-t before:border-l before:border-current before:opacity-40",
        "after:absolute after:bottom-0 after:right-1 after:w-1 after:h-1",
        "after:border-b after:border-r after:border-current after:opacity-40",
        className
      )}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
