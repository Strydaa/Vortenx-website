'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { TubesCursorInstance } from 'threejs-components/build/cursors/tubes1.min.js';

/*
 * threejs-components (0.0.19) tubes1 imleç efekti, bölüm arka planı olarak.
 *
 * Verilen koda göre beş değişiklik — gerekçeleri:
 *
 *  1. CDN'den `import('https://cdn.jsdelivr.net/...')` kaldırıldı.
 *     Next.js derlemede mutlak URL'li dinamik import'u çözemez; ayrıca her
 *     ziyaretçinin IP'si jsDelivr'a gider ve CDN düşerse bölüm boş kalır.
 *     Paket npm'den kuruldu, import artık yerel.
 *  2. Modül görünür alana yaklaşınca yükleniyor. Bu paket 775 KB (three.js
 *     gömülü) ve SSS sayfanın en altında — sayfa açılışında indirmenin
 *     anlamı yok.
 *  3. `h-screen w-screen` + `fixed` canvas kaldırıldı. Orijinal tam sayfa
 *     hero içindi; burada bölümün içine `absolute inset-0` olarak oturuyor.
 *  4. Tıklayınca rastgele renk atama kaldırıldı. Bu arka planın üstünde
 *     akordeon var; her soruya tıklayan ziyaretçi renkleri de değiştirirdi.
 *  5. `dispose()` React 18+ çift effect'ine karşı korumalı. Modül yüklenmesi
 *     asenkron olduğu için, effect temizlendikten sonra dönen `then` bloğu
 *     örneği hemen kapatıyor; yoksa arkada sahipsiz bir WebGL context kalırdı.
 *
 * Kare atlama gerekmiyor: kütüphane kendi içinde IntersectionObserver ve
 * visibilitychange kullanıyor, ekran dışındayken ve sekme arkadayken çizmiyor.
 */

/**
 * Lacivert → turuncu. Renkler tüp gövdelerine soldan sağa interpolasyonla
 * dağıtılıyor, yani dizideki komşu duraklar arasında geçiş yaşanıyor.
 * Lacivertten turuncuya doğrudan atlamak ortada gri/kahve bir bant bırakıyor;
 * araya açık mavi konarak geçiş kısaltıldı.
 */
const TUBE_COLORS = ['#0d2452', '#2f6fb5', '#ff5426', '#ff9d3d'];

/**
 * Işıklar sabit 4 adet — kütüphane dizinin ilk 4 elemanını okuyor.
 * Sıcak ve soğuk sırayla dizildi: tüplerin bir yüzü turuncu, öteki yüzü
 * lacivert parlıyor, karışım hareket ettikçe ortaya çıkıyor.
 */
const LIGHT_COLORS = ['#ff5426', '#1e4fa3', '#ffa11f', '#3f8ede'];

type Props = {
  className?: string;
  /** Tüp gövde renkleri (soldan sağa geçiş). */
  colors?: string[];
  /** Tam 4 ışık rengi. */
  lightColors?: string[];
  /** Işık şiddeti. Yükseldikçe parlama artar. */
  intensity?: number;
};

export function TubesCursor({
  className,
  colors = TUBE_COLORS,
  lightColors = LIGHT_COLORS,
  intensity = 180,
}: Props) {
  const reduce = useReducedMotion();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fallbackRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<TubesCursorInstance | null>(null);

  // Effect'i yeniden kurmadan okunabilsinler diye ref'te.
  const colorsRef = useRef(colors);
  const lightColorsRef = useRef(lightColors);
  const intensityRef = useRef(intensity);
  const reduceRef = useRef(reduce);

  useEffect(() => {
    colorsRef.current = colors;
    lightColorsRef.current = lightColors;
    intensityRef.current = intensity;
    reduceRef.current = reduce;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const showFallback = () => {
      if (fallbackRef.current) fallbackRef.current.hidden = false;
    };

    // Hareket azaltma tercihinde hiç yükleme — 775 KB'ı da indirmiyoruz.
    if (reduceRef.current) {
      showFallback();
      return;
    }

    let cancelled = false;
    let io: IntersectionObserver | null = null;

    const start = () => {
      import('threejs-components/build/cursors/tubes1.min.js')
        .then(({ default: createTubesCursor }) => {
          // Effect bu arada temizlendiyse context açma.
          if (cancelled || !canvasRef.current) return;

          const app = createTubesCursor(canvasRef.current, {
            tubes: {
              colors: colorsRef.current,
              lights: {
                intensity: intensityRef.current,
                colors: lightColorsRef.current,
              },
            },
          });

          // Kütüphane piksel oranını 2'ye sabitliyor. Ekranın gerçek
          // oranını aşmanın görsel karşılığı yok, GPU yükü ise iki katı.
          const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
          app.three.minPixelRatio = 1;
          app.three.maxPixelRatio = dpr;
          app.three.resize();

          appRef.current = app;
        })
        .catch(() => {
          // WebGPU/WebGL yoksa ya da chunk inemezse sessizce desene düş.
          if (!cancelled) showFallback();
        });
    };

    // Görünür alana 300px kala yüklemeye başla.
    io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        io?.disconnect();
        io = null;
        start();
      },
      { rootMargin: '300px 0px' },
    );
    io.observe(canvas);

    return () => {
      cancelled = true;
      io?.disconnect();
      appRef.current?.dispose();
      appRef.current = null;
    };
  }, []);

  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
      <canvas ref={canvasRef} className="block h-full w-full" />

      {/* Animasyon çalışmazsa (hareket azaltma, WebGL yok, chunk inmedi). */}
      <div ref={fallbackRef} hidden className="bg-dots absolute inset-0 opacity-25" />
    </div>
  );
}
