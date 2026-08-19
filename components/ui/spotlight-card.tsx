'use client';

import { useEffect, type CSSProperties, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/*
 * Spotlight/glow kart çerçevesi. Kartın kenarı, imlecin ekrandaki konumuna
 * göre aydınlanıyor: birden çok kart aynı ışık kaynağını paylaşıyor, yani
 * imleç hangi kartın yanındaysa o kartın kenarı parlıyor.
 *
 * Verilen koda göre değişiklikler ve gerekçeleri:
 *
 *  1. `<style dangerouslySetInnerHTML>` kaldırıldı. Her kart aynı CSS'i bir
 *     kez daha sayfaya basıyordu — üç paket kartı = üç kopya. Kurallar
 *     `globals.css` içinde `[data-glow]` altında, tek yerde.
 *  2. Tek `pointermove` dinleyicisi. Orijinal her kart için bir dinleyici
 *     ekliyor ve her harekette her kartın stiline dört değişken yazıyordu.
 *     Artık değişkenler `:root` üzerinde bir kez yazılıyor, kartlar miras
 *     alıyor; dinleyici sayaçlı, son kart kalkınca kaldırılıyor.
 *  3. `touch-action: none` kaldırıldı. Kartın üstünde parmakla sayfayı
 *     kaydırmayı engelliyordu — teklif kartları uzun, mobilde bu ölümcül.
 *  4. Köşe yarıçapı 0'a çekildi (`--radius`). Blueprint Terminal keskin köşe
 *     kullanıyor; `rounded-2xl` sitedeki tek yuvarlak eleman olurdu.
 *  5. Varsayılan ton (`glowColor` verilmezse) artık satır içi yazılmıyor —
 *     `globals.css`'teki `[data-glow]`/`:root.dark [data-glow]` üzerinden
 *     temaya göre geliyor (açık: sarı, koyu: turuncu). Satır içi stil CSS'in
 *     tema override'ını her zaman ezeceği için, tema bağımlılığı gerektiren
 *     bu varsayılan JS'te değil CSS'te tanımlı. `glowColor` açıkça bir renk
 *     ile geçilirse (mavi/mor/yeşil/kırmızı/turuncu) eskisi gibi satır içi
 *     override yazılır — sabit renk isteniyorsa tema bağımsız kalması doğru.
 *  6. Tipler: stil nesnesi `CSSProperties & Record<string, …>` olarak
 *     tiplendi — orijinalde `baseStyles.width` ataması TypeScript'te derlenmez
 *     (nesne o alanla oluşturulmamış), `--base` gibi özel değişkenler de
 *     `CSSProperties`'e cast'siz girmiyor.
 *  7. `as` prop'u eklendi; teklif kartı `<article>` olarak çıkıyor.
 *
 * Ayarlanabilir her şey CSS değişkeni: çağıran taraf Tailwind'in keyfi
 * özellik sınıflarıyla eziyor (örn. `[--size:300]`). Bu yüzden bileşen
 * satır içi stile sadece prop'tan gelen `--base`/`--spread`'i yazıyor —
 * satır içi stil sınıfları ezdiği için gerisi CSS'te kalmalı.
 */

const GLOW_COLORS = {
  blue: { base: 220, spread: 200 },
  purple: { base: 280, spread: 300 },
  green: { base: 120, spread: 200 },
  red: { base: 0, spread: 200 },
  orange: { base: 30, spread: 200 },
};

/** `signal`: sabit bir JS değeri değil, temaya göre CSS'ten gelen varsayılan. */
export type GlowColor = keyof typeof GLOW_COLORS | 'signal';

const SIZE_CLASSES = {
  sm: 'w-48 h-64',
  md: 'w-64 h-80',
  lg: 'w-80 h-96',
};

/*
 * Paylaşılan imleç takibi. Sayaç, aynı anda kaç kart bağlı olduğunu tutuyor;
 * dinleyici ilk kartta ekleniyor, sonuncusu gidince kaldırılıyor.
 */
let subscribers = 0;
let detach: (() => void) | null = null;

function subscribePointer() {
  subscribers += 1;

  if (subscribers === 1) {
    const root = document.documentElement;

    // İmleç hiç kıpırdamadan (ve dokunmatikte hiç kıpırdamayacaksa) ışık sol
    // üst köşede kalmasın; ekranın ortasına yakın bir yerden başlasın.
    if (!root.style.getPropertyValue('--glow-x')) {
      root.style.setProperty('--glow-x', String(Math.round(window.innerWidth / 2)));
      root.style.setProperty('--glow-y', String(Math.round(window.innerHeight * 0.4)));
      root.style.setProperty('--glow-xp', '0.5');
    }

    // Ham pointermove karede yüzlerce kez ateşleyebiliyor (yüksek poll-rate
    // fare/trackpad); her olayda blur'lu [data-glow] katmanını yeniden
    // boyatmamak için yazım karede bire düşürülüyor.
    let pending: PointerEvent | null = null;
    let raf = 0;

    const flush = () => {
      raf = 0;
      if (!pending) return;
      root.style.setProperty('--glow-x', pending.clientX.toFixed(1));
      root.style.setProperty('--glow-y', pending.clientY.toFixed(1));
      root.style.setProperty('--glow-xp', (pending.clientX / window.innerWidth).toFixed(3));
      pending = null;
    };

    const sync = (e: PointerEvent) => {
      pending = e;
      if (!raf) raf = requestAnimationFrame(flush);
    };

    document.addEventListener('pointermove', sync, { passive: true });
    detach = () => {
      document.removeEventListener('pointermove', sync);
      if (raf) cancelAnimationFrame(raf);
    };
  }

  return () => {
    subscribers -= 1;
    if (subscribers === 0 && detach) {
      detach();
      detach = null;
    }
  };
}

export type GlowCardProps = {
  children: ReactNode;
  className?: string;
  glowColor?: GlowColor;
  size?: keyof typeof SIZE_CLASSES;
  width?: string | number;
  height?: string | number;
  /** true ise `size` yok sayılır; ölçüyü className ya da width/height verir. */
  customSize?: boolean;
  as?: 'div' | 'article' | 'section' | 'li';
};

export function GlowCard({
  children,
  className,
  glowColor = 'signal',
  size = 'md',
  width,
  height,
  customSize = false,
  as: Tag = 'div',
}: GlowCardProps) {
  useEffect(() => subscribePointer(), []);

  const style: CSSProperties & Record<string, string | number> = {};
  if (glowColor !== 'signal') {
    const { base, spread } = GLOW_COLORS[glowColor];
    style['--base'] = base;
    style['--spread'] = spread;
  }
  if (width !== undefined) {
    style.width = typeof width === 'number' ? `${width}px` : width;
  }
  if (height !== undefined) {
    style.height = typeof height === 'number' ? `${height}px` : height;
  }

  return (
    <Tag
      data-glow
      style={style}
      className={cn(
        'relative',
        !customSize && `${SIZE_CLASSES[size]} aspect-[3/4]`,
        className,
      )}
    >
      {/* Dış hâle: bulanık ikinci katman. Kuralları globals.css'te. */}
      <div data-glow aria-hidden />
      {children}
    </Tag>
  );
}

export default GlowCard;
