'use client';

import { useReducedMotion } from 'motion/react';

import { Card } from '@/components/ui/card';
import { Spotlight } from '@/components/ui/spotlight';
import { SplineScene } from '@/components/ui/splite';
import { Reveal } from '@/components/motion/reveal';
import { siteConfig } from '@/lib/site-config';

type Props = {
  eyebrow: string;
  title: string;
  body: string;
  loadingLabel: string;
};

/**
 * Danışmanlık sayfasındaki etkileşimli 3B panel.
 *
 * Metinler prop olarak geliyor: bu bileşen client-side (Spline ve imleç takibi
 * tarayıcıda çalışıyor), oysa onu çağıran AdvisoryContent bir Server Component.
 * Projede PricingCards ve FaqAccordion de aynı deseni kullanıyor.
 *
 * Renkler: panel her iki temada da koyu kalmalı. `--ink` koyu temada
 * açık renge döndüğü için `dark:` varyantlarıyla yüzey/mürekkep takas ediliyor.
 */
export function AdvisorySpline({ eyebrow, title, body, loadingLabel }: Props) {
  const reduce = useReducedMotion();
  const scene = siteConfig.splineScene;

  return (
    <Reveal>
      <Card className="crosshair relative w-full overflow-hidden bg-ink text-paper md:h-[500px] dark:bg-surface dark:text-ink">
        <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" size={320} />

        <div className="flex h-full flex-col md:flex-row">
          {/* Sol: metin */}
          <div className="relative z-10 flex flex-1 flex-col justify-center p-8 md:p-12">
            <div className="label mb-6 flex items-center gap-3">
              <span className="live-dot" aria-hidden />
              <span className="text-signal">{eyebrow}</span>
            </div>

            <h2 className="display-md font-display max-w-[16ch] bg-gradient-to-b from-paper to-muted bg-clip-text font-extrabold text-transparent dark:from-ink dark:to-muted">
              {title}
            </h2>

            <p className="mt-5 max-w-lg text-sm leading-relaxed text-paper/65 md:text-base dark:text-ink/65">
              {body}
            </p>
          </div>

          {/* Sağ: 3B sahne */}
          <div className="relative h-[260px] w-full md:h-auto md:flex-1">
            {reduce ? (
              // Hareket azaltma tercihi: sürekli oynayan sahne yüklenmez.
              <div className="bg-dots h-full w-full opacity-30" aria-hidden />
            ) : (
              <SplineScene
                scene={scene}
                loadingLabel={loadingLabel}
                className="h-full w-full"
              />
            )}
          </div>
        </div>
      </Card>
    </Reveal>
  );
}
