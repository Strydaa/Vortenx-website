'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Reveal } from '@/components/motion/reveal';
import { TextReveal } from '@/components/motion/text-reveal';

/**
 * Alt sayfaların ortak başlık bloğu.
 *
 * `background`, `fullScreen` ve `tone` opsiyonel — verilmezse davranış
 * eskisiyle birebir aynı. Bu bileşeni altı sayfa paylaşıyor
 * (advisory, systems, cases, about, blog, contact); diğerleri etkilenmesin diye.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  children,
  background,
  fullScreen = false,
  tone = 'default',
}: {
  eyebrow: string;
  title: string;
  lead: string;
  children?: ReactNode;
  /** Verilirse varsayılan blueprint grid'in yerine tam kanama arka plan olarak çizilir. */
  background?: ReactNode;
  /** Tam ekran yükseklik (mobil tarayıcı çubuğu için svh). */
  fullScreen?: boolean;
  /** Koyu/hareketli arka plan üstünde metnin okunur kalması için. */
  tone?: 'default' | 'onDark';
}) {
  const onDark = tone === 'onDark';

  return (
    <section
      className={cn(
        'relative overflow-hidden',
        fullScreen
          ? 'flex min-h-[100svh] items-center py-32 md:py-40'
          : 'pb-16 pt-32 md:pb-24 md:pt-44',
      )}
    >
      {background ? (
        <>
          <div className="absolute inset-0 -z-10" aria-hidden>
            {background}
          </div>
          {/* Shader hareketli — scrim olmadan başlık okunmuyor. */}
          <div
            className="absolute inset-0 -z-10 bg-gradient-to-r from-black/85 via-black/55 to-black/20"
            aria-hidden
          />
        </>
      ) : (
        <>
          <div className="bg-grid absolute inset-0 -z-10" aria-hidden />
          <div
            className="absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-gradient-to-t from-paper to-transparent"
            aria-hidden
          />
        </>
      )}

      <div className="shell relative">
        <Reveal from="none">
          <div className="label mb-8 flex items-center gap-3">
            <span className="live-dot" aria-hidden />
            <span className="text-signal">{eyebrow}</span>
          </div>
        </Reveal>

        <TextReveal
          as="h1"
          text={title}
          className={cn(
            'display-lg font-display max-w-[18ch] font-extrabold',
            onDark && 'text-paper dark:text-ink',
          )}
        />

        <Reveal delay={0.3}>
          <p
            className={cn(
              'mt-9 max-w-2xl text-lg leading-relaxed',
              onDark ? 'text-paper/75 dark:text-ink/75' : 'text-muted',
            )}
          >
            {lead}
          </p>
        </Reveal>

        {children && (
          <Reveal delay={0.4}>
            <div className="mt-10">{children}</div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
