'use client';

import { Suspense, lazy, useState } from 'react';

/**
 * Spline runtime'ı ~1.5 MB. `lazy` sayesinde ilk bundle'a girmiyor,
 * ancak bu bileşen render edildiğinde indirilmeye başlıyor.
 */
const Spline = lazy(() => import('@splinetool/react-spline'));

interface SplineSceneProps {
  /** .splinecode sahne dosyasının URL'si. */
  scene: string;
  className?: string;
  /** Yükleme sırasında gösterilecek mono etiket. Verilmezse sadece nokta çizilir. */
  loadingLabel?: string;
}

export function SplineScene({ scene, className, loadingLabel }: SplineSceneProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative h-full w-full">
      <Suspense fallback={null}>
        <Spline scene={scene} className={className} onLoad={() => setLoaded(true)} />
      </Suspense>

      {/*
        Suspense fallback'i tek başına yetmiyor: Spline kendi sarmalayıcısını
        (gizli bir <canvas> ile) hemen çiziyor, yani boundary anında çözülüyor.
        Asıl bekleme runtime indirilirken ve sahne çekilirken yaşanıyor —
        o aralıkta kutu bomboş kalıyordu. Bu katman onLoad tetiklenene kadar duruyor.
      */}
      {!loaded && (
        <div className="pointer-events-none absolute inset-0">
          <SceneFallback label={loadingLabel} />
        </div>
      )}
    </div>
  );
}

/**
 * Orijinal bileşen burada `<span className="loader">` kullanıyordu ama
 * `.loader` sınıfı globals.css'te tanımlı değil — boş bir kutu çizilirdi.
 * Yerine projede zaten var olan parçalar: nokta deseni + canlı nokta + mono etiket.
 */
function SceneFallback({ label }: { label?: string }) {
  return (
    <div className="bg-dots flex h-full w-full flex-col items-center justify-center gap-4 opacity-40">
      <span className="live-dot" aria-hidden />
      {label && <span className="label">{label}</span>}
    </div>
  );
}
