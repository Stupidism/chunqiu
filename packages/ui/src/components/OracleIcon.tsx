import * as React from 'react';
import { cn } from '../utils/cn';

interface OracleIconProps {
  src: string;
  size?: number;
  label?: string;
  className?: string;
  tone?: string;
  blend?: 'multiply' | 'screen' | 'normal';
}

export function OracleIcon({
  src,
  size = 16,
  label,
  className,
  tone,
  blend = 'normal',
}: OracleIconProps) {
  const isSvg = src.toLowerCase().endsWith('.svg');
  const commonClass = cn('inline-block align-middle', tone, className);

  if (isSvg) {
    return (
      <span
        role={label ? 'img' : undefined}
        aria-label={label}
        className={commonClass}
        style={{
          width: size,
          height: size,
          backgroundColor: 'currentColor',
          WebkitMaskImage: `url(${src})`,
          maskImage: `url(${src})`,
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
        }}
      />
    );
  }

  return (
    <img
      src={src}
      alt={label || ''}
      className={commonClass}
      style={{
        width: size,
        height: size,
        mixBlendMode: blend === 'normal' ? undefined : blend,
      }}
    />
  );
}
