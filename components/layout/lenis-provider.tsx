'use client';

import { ReactLenis } from 'lenis/react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

/**
 * Akıcı scroll. Kullanıcı "hareketi azalt" tercihi yapmışsa devre dışı kalır
 * ve native scroll'a düşer.
 */
export function LenisProvider({ children }: { children: ReactNode }) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  if (reduced) return <>{children}</>;

  return (
    <ReactLenis root options={{ lerp: 0.09, wheelMultiplier: 0.9 }}>
      {children}
    </ReactLenis>
  );
}
