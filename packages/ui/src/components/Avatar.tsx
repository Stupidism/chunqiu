import * as React from 'react';
import { cn } from '../utils/cn';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-lg',
};

export function Avatar({
  className,
  src,
  alt,
  fallback,
  size = 'md',
  ...props
}: AvatarProps) {
  const [error, setError] = React.useState(false);

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center',
        'rounded-full overflow-hidden',
        'bg-gradient-to-br from-bronze-200 to-bronze-300',
        'border-2 border-bronze-400',
        'shadow-sm',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src && !error ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        <span className="font-medium text-bronze-800">
          {fallback?.slice(0, 2).toUpperCase() || '?'}
        </span>
      )}
    </div>
  );
}

// 头像组
interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  max?: number;
}

export function AvatarGroup({
  className,
  children,
  max,
  ...props
}: AvatarGroupProps) {
  const childrenArray = React.Children.toArray(children);
  const displayChildren = max ? childrenArray.slice(0, max) : childrenArray;
  const remaining = max && childrenArray.length > max ? childrenArray.length - max : 0;

  return (
    <div
      className={cn('flex -space-x-2', className)}
      {...props}
    >
      {displayChildren}
      {remaining > 0 && (
        <div
          className={cn(
            'relative inline-flex items-center justify-center',
            'w-10 h-10 rounded-full',
            'bg-bronze-200 border-2 border-white',
            'text-sm font-medium text-bronze-800'
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
