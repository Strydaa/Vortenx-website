'use client';

import dynamic from 'next/dynamic';
import { useReducedMotion } from 'motion/react';
import type { ForgeSector } from './forge-robot';

/*
 * ForgeRobot'un sunucu sınırı.
 *
 * Neden ayrı bir dosya: `Vortex` sunucu sayfalarına doğrudan import ediliyor
 * çünkü saf canvas 2D ve sunucuda render edilmesinde sakınca yok. ForgeRobot
 * ise kurulurken `hasWebGL()` ile `document`e bakıyor — sunucuda patlar.
 * Çözüm hero.tsx'teki ile aynı: `dynamic(..., { ssr: false })`. Ama bu çağrı
 * bir sunucu bileşeninden yapılamıyor, dolayısıyla araya bu istemci
 * sarmalayıcısı giriyor. Aynı sınır three + fiber + drei'yi (~700 KB) ayrı bir
 * parçaya alıyor: sayfanın ilk boyaması bunu beklemiyor.
 */
const ForgeRobot = dynamic(
  () => import('./forge-robot').then((m) => m.ForgeRobot),
  { ssr: false },
);

export function ForgeRobotScene({ sectors }: { sectors: ForgeSector[] }) {
  const reduced = useReducedMotion();

  return (
    <div className="relative h-full w-full bg-[#050403]">
      {/*
        Durağan katman her zaman çiziliyor ve üç işi birden görüyor: 3B parça
        inerken görünen zemin, WebGL desteklenmediğinde kalıcı arka plan,
        hareket azaltma tercihinde tek görünen katman. Renkler shader'ın
        paletini taklit ediyor — sağ üstte erimiş bronz, sol altta safir.
      */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 78% 42%, rgba(255, 84, 38, 0.20) 0%, rgba(124, 74, 34, 0.10) 34%, transparent 66%)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(90% 80% at 14% 104%, rgba(24, 62, 128, 0.22) 0%, transparent 62%)',
        }}
      />

      {!reduced && (
        <ForgeRobot sectors={sectors} className="absolute inset-0 h-full w-full" />
      )}
    </div>
  );
}

export default ForgeRobotScene;
