'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

import { LightSpeed } from '@/components/ui/light-speed';

/** Otomatik kapanma süresi (ms). Kapanış solması ayrıca 600 ms. */
const AUTO_CLOSE_MS = 2500;
const FADE_MS = 600;

/**
 * Açılış ekranı: shader oynar, 2.5 sn sonra kendiliğinden siteye geçer.
 * Atla / Escape / tıklama ile hemen kapanır.
 *
 * Görünürlük React state'i ile değil DOM üzerinden yönetiliyor:
 *  - Oturumda görülmüşse `<body>`nin başındaki script `<html>`e `intro-seen`
 *    class'ı ekliyor, globals.css bu katmanı `display:none` yapıyor.
 *    Böylece render sırasında sessionStorage okunmuyor → hidrasyon uyuşmazlığı yok.
 *  - Kapanış `data-closing` attribute'u ile CSS geçişi olarak yapılıyor,
 *    yani `react-hooks/set-state-in-effect` kuralına hiç takılmıyoruz.
 *
 * Kaldırmak istersen: layout.tsx'ten <IntroOverlay /> satırını sil.
 */
export function IntroOverlay() {
  const t = useTranslations('intro');
  const rootRef = useRef<HTMLDivElement | null>(null);
  const skipRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const html = document.documentElement;

    // Bu oturumda zaten görülmüş — hiç başlama.
    if (html.classList.contains('intro-seen')) return;

    // Hareket azaltma tercihi: açılış ekranı gösterilmez.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      html.classList.add('intro-seen');
      return;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    let closed = false;
    let fadeTimer = 0;

    const finish = () => {
      if (closed) return;
      closed = true;

      root.dataset.closing = 'true';
      try {
        sessionStorage.setItem('nf-intro', '1');
      } catch {
        // gizli sekmede sessionStorage kapalı olabilir; sorun değil
      }

      fadeTimer = window.setTimeout(() => {
        html.classList.add('intro-seen');
        document.body.style.overflow = prevOverflow;
      }, FADE_MS);
    };

    const autoTimer = window.setTimeout(finish, AUTO_CLOSE_MS);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') finish();
    };

    window.addEventListener('keydown', onKey);
    root.addEventListener('click', finish);
    skipRef.current?.focus();

    return () => {
      window.clearTimeout(autoTimer);
      window.clearTimeout(fadeTimer);
      window.removeEventListener('keydown', onKey);
      root.removeEventListener('click', finish);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <div
      id="nf-intro"
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={t('label')}
      className="fixed inset-0 z-[10000] bg-black transition-opacity duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] data-[closing=true]:pointer-events-none data-[closing=true]:opacity-0"
    >
      <LightSpeed className="absolute inset-0" />

      {/* Merkezdeki marka */}
      <div className="relative flex h-full flex-col items-center justify-center gap-7 px-6">
        <div className="flex items-center gap-3 text-[#f2efe7]">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect
              x="0.75"
              y="0.75"
              width="22.5"
              height="22.5"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path d="M6 7L12 17L18 7" stroke="#ff5426" strokeWidth="2" strokeLinecap="square" />
          </svg>
          <span className="font-display text-2xl font-extrabold tracking-[-0.04em] md:text-3xl">
            Vortenxflow
          </span>
        </div>

        {/* İlerleme çizgisi — süre bittiğinde dolmuş olur */}
        <div className="h-px w-40 overflow-hidden bg-[#f2efe7]/20 md:w-56">
          <div className="nf-intro-bar h-full w-full origin-left bg-[#ff5426]" />
        </div>
      </div>

      <button
        ref={skipRef}
        type="button"
        className="absolute bottom-8 right-6 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-[#f2efe7]/70 transition-colors duration-300 hover:text-[#f2efe7] md:bottom-10 md:right-10"
      >
        {t('skip')} <span aria-hidden>→</span>
      </button>
    </div>
  );
}
