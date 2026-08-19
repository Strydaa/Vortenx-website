'use client';

import { Reveal } from '@/components/motion/reveal';
import { ButtonLink } from '@/components/ui/button';
import { GlowCard } from '@/components/ui/spotlight-card';
import { cn } from '@/lib/utils';

export type Package = {
  /** Advisory paketlerinde harf kodu (A/B/C), Systems'te yok */
  code?: string;
  name: string;
  price: string;
  /** Advisory'de süre satırı, Systems'te teslim süresi */
  duration?: string;
  body: string;
  /** Advisory: includes[], Systems: features[] — çağıran hangisini geçerse */
  items: string[];
  featured?: boolean;
};

export function PricingCards({
  packages,
  itemsLabel,
  priceLabel,
  cta,
  ctaHref = '/contact',
  columns = 3,
}: {
  packages: Package[];
  itemsLabel: string;
  priceLabel?: string;
  cta: string;
  ctaHref?: string;
  columns?: 2 | 3;
}) {
  return (
    <div
      className={cn(
        'grid gap-5',
        columns === 3 ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2',
      )}
    >
      {packages.map((pkg, i) => (
        <Reveal key={pkg.name} delay={i * 0.07}>
          {/*
            Çerçeve GlowCard: kenar, imlecin ekrandaki konumuna göre
            aydınlanıyor. `card` sınıfı bırakıldı — zemin ve kenarlığı artık
            [data-glow] veriyor, ikisi çakışırdı. Öne çıkan pakette ışık
            havuzu büyük ve kenar tam opak (Tailwind keyfi özellikleriyle,
            bileşenin CSS değişkenlerini ezerek).
          */}
          <GlowCard
            as="article"
            customSize
            className={cn(
              'flex h-full flex-col p-7 transition-colors duration-500 md:p-8',
              pkg.featured
                ? 'border-signal/60 bg-signal/[0.04] [--border-spot-opacity:1] [--size:320]'
                : 'hover:border-signal/40',
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                {pkg.code && (
                  <span className="label text-signal">{pkg.code}</span>
                )}
                <h3
                  className={cn(
                    'font-display text-xl font-bold tracking-[-0.03em] md:text-2xl',
                    pkg.code && 'mt-2',
                  )}
                >
                  {pkg.name}
                </h3>
              </div>
              {pkg.featured && (
                <span className="shrink-0 bg-signal px-2 py-1 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-[color:var(--signal-ink)]">
                  ★
                </span>
              )}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-muted">{pkg.body}</p>

            <div className="mt-7 border-t border-rule pt-5">
              {priceLabel && <p className="label mb-1.5">{priceLabel}</p>}
              <p className="font-display text-2xl font-extrabold tracking-[-0.035em]">
                {pkg.price}
              </p>
              {pkg.duration && (
                <p className="label mt-2 normal-case tracking-normal">
                  {pkg.duration}
                </p>
              )}
            </div>

            <div className="mt-6 flex-1 border-t border-rule pt-5">
              <p className="label mb-4">{itemsLabel}</p>
              <ul className="space-y-2.5">
                {pkg.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm">
                    <span
                      aria-hidden
                      className="mt-[0.4em] text-[0.55rem] text-signal"
                    >
                      ◆
                    </span>
                    <span className="text-muted">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <ButtonLink
              href={ctaHref}
              variant={pkg.featured ? 'solid' : 'outline'}
              className="mt-8 w-full"
              arrow
            >
              {cta}
            </ButtonLink>
          </GlowCard>
        </Reveal>
      ))}
    </div>
  );
}
