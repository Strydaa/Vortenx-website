'use client';

import { Suspense, lazy } from 'react';
import { siteConfig } from '@/lib/site-config';

/**
 * Cal.com embed runtime ayrı bir parçada — splite.tsx'teki Spline deseniyle aynı
 * gerekçe: sayfanın ilk boyaması bunu beklemesin.
 */
const Cal = lazy(() => import('@calcom/embed-react'));

export function CalBooking({ loadingLabel }: { loadingLabel?: string }) {
  if (!siteConfig.calCom) return null;

  return (
    <div className="relative h-[600px] w-full overflow-hidden border border-rule bg-paper md:h-[720px] dark:bg-surface">
      <Suspense
        fallback={
          <div className="bg-dots flex h-full w-full flex-col items-center justify-center gap-4 opacity-40">
            <span className="live-dot" aria-hidden />
            {loadingLabel && <span className="label">{loadingLabel}</span>}
          </div>
        }
      >
        <Cal
          calLink={siteConfig.calCom}
          style={{ width: '100%', height: '100%', overflow: 'auto' }}
          config={{ layout: 'month_view' }}
        />
      </Suspense>
    </div>
  );
}

export default CalBooking;
