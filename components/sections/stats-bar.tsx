'use client';

import { useLocale, useTranslations } from 'next-intl';
import { CountUp } from '@/components/motion/count-up';
import { RevealGroup, RevealItem } from '@/components/motion/reveal';

type Stat = { value: number; suffix: string; label: string };

export function StatsBar({ namespace = 'home.stats' }: { namespace?: string }) {
  const t = useTranslations(namespace);
  const locale = useLocale();
  const items = t.raw('items') as Stat[];

  return (
    <section className="border-t border-rule bg-surface">
      <div className="shell py-12 md:py-16">
        <p className="label mb-8">{t('eyebrow')}</p>

        <RevealGroup className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {items.map((stat) => (
            <RevealItem key={stat.label}>
              <div className="flex items-baseline font-display text-[clamp(2.25rem,5vw,3.5rem)] font-extrabold leading-none tracking-[-0.045em]">
                <CountUp
                  to={stat.value}
                  locale={locale === 'tr' ? 'tr-TR' : 'en-US'}
                />
                <span className="text-signal">{stat.suffix}</span>
              </div>
              <p className="mt-3 max-w-[22ch] text-sm leading-snug text-muted">
                {stat.label}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
