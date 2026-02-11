import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

const buttonVariants = cva(
  // 基础样式 - 甲骨文风格
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        // 青铜器风格 - 主按钮
        default: [
          'bg-bronze-600 text-bronze-50',
          'border-2 border-bronze-400',
          'shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,0,0,0.3)]',
          'hover:bg-bronze-500 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_4px_8px_rgba(0,0,0,0.4)]',
          'active:bg-bronze-700 active:shadow-inner',
          'focus-visible:ring-bronze-400',
        ],
        // 甲骨文风格 - 次要按钮
        secondary: [
          'bg-oracle-100 text-oracle-900',
          'border-2 border-oracle-300',
          'hover:bg-oracle-200 hover:border-oracle-400',
          'active:bg-oracle-300',
          'focus-visible:ring-oracle-400',
        ],
        // 古风红色 - 危险/重要操作
        destructive: [
          'bg-ancient-red text-white',
          'border-2 border-red-700',
          'hover:bg-red-700',
          'active:bg-red-800',
          'focus-visible:ring-red-400',
        ],
        // 玉色 - 成功/确认
        success: [
          'bg-ancient-jade text-white',
          'border-2 border-emerald-600',
          'hover:bg-emerald-600',
          'active:bg-emerald-700',
          'focus-visible:ring-emerald-400',
        ],
        // 幽灵按钮
        ghost: [
          'bg-transparent text-bronze-700',
          'border-2 border-transparent',
          'hover:bg-bronze-100 hover:border-bronze-300',
          'focus-visible:ring-bronze-400',
        ],
        // 轮廓按钮
        outline: [
          'bg-transparent text-bronze-700',
          'border-2 border-bronze-400',
          'hover:bg-bronze-50',
          'focus-visible:ring-bronze-400',
        ],
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(
          buttonVariants({ variant, size }),
          // 甲骨文装饰角
          "relative overflow-hidden",
          "before:absolute before:top-0 before:left-0 before:w-2 before:h-2",
          "before:border-t-2 before:border-l-2 before:border-current before:opacity-50",
          "after:absolute after:bottom-0 after:right-0 after:w-2 after:h-2",
          "after:border-b-2 after:border-r-2 after:border-current after:opacity-50",
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
