'use client';

import { useReducedMotion } from 'motion/react';

import { SplineScene } from './splite';
import { siteConfig } from '@/lib/site-config';

export function IndustriesRobotScene({ loadingLabel }: { loadingLabel?: string }) {
  const reduced = useReducedMotion();

  return (
    <div className="relative h-full w-full bg-[#050403]">
      {reduced ? (
        <div className="bg-dots h-full w-full opacity-30" aria-hidden />
      ) : (
        <SplineScene
          scene={siteConfig.splineScene}
          loadingLabel={loadingLabel}
          className="h-full w-full"
        />
      )}
    </div>
  );
}

export default IndustriesRobotScene;
