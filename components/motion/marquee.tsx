'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  children: ReactNode;
  /** Bir turun süresi (saniye) — büyük değer = yavaş */
  duration?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
  className?: string;
};

/**
 * Sonsuz yatay şerit. İçerik iki kez render edilir, -50% kaydırılarak
 * kusursuz döngü sağlanır. CSS-only — scroll performansını etkilemez.
 */
export function Marquee({
  children,
  duration = 40,
  reverse = false,
  pauseOnHover = true,
  className,
}: Props) {
  return (
    <div
      className={cn('group relative overflow-hidden', className)}
      style={{
        maskImage:
          'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
      }}
    >
      <div
        className={cn(
          'flex w-max',
          pauseOnHover && 'group-hover:[animation-play-state:paused]',
        )}
        style={{
          animation: `marquee-x ${duration}s linear infinite`,
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
