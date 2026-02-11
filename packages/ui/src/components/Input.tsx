import * as React from 'react';
import { cn } from '../utils/cn';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-bronze-800 mb-1.5 font-oracle">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            type={type}
            className={cn(
              // 基础样式
              'flex h-10 w-full rounded-md border bg-white px-3 py-2',
              'text-sm text-bronze-900 placeholder:text-bronze-400',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-bronze-400 focus:border-bronze-400',
              // 甲骨文装饰
              'border-bronze-300',
              'shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]',
              // 装饰角
              "relative",
              "before:absolute before:top-0 before:left-0 before:w-1.5 before:h-1.5",
              "before:border-t before:border-l before:border-bronze-400",
              "after:absolute after:bottom-0 after:right-0 after:w-1.5 after:h-1.5",
              "after:border-b after:border-r after:border-bronze-400",
              // 错误状态
              error && 'border-red-400 focus:ring-red-400 focus:border-red-400',
              // 禁用状态
              'disabled:cursor-not-allowed disabled:bg-bronze-50 disabled:text-bronze-400',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
