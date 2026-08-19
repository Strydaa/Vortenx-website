'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Section, SectionHeader } from '@/components/ui/section';
import { Reveal } from '@/components/motion/reveal';

type CaseItem = {
  client: string;
  sector: string;
  metric: string;
  metricLabel: string;
  body: string;
  tags: string[];
};

export function CaseCards() {
  const t = useTranslations('home.cases');
  const items = t.raw('items') as CaseItem[];

  return (
    <Section id="cases" className="bg-surface">
      <div className="shell">
        <SectionHeader
          index={t('index')}
          eyebrow={t('eyebrow')}
          title={t('title')}
          description={t('description')}
        />

        <div className="grid gap-5 md:grid-cols-3">
          {items.map((item, i) => (
            <Reveal key={item.client} delay={i * 0.09}>
              <article className="card group relative flex h-full flex-col overflow-hidden transition-colors duration-500 hover:border-signal/50">
                {/* Teknik diyagram — hover'da hafifçe yaklaşır */}
                <div className="relative aspect-[16/10] overflow-hidden border-b border-rule bg-paper">
                  <Image
                    src={`/images/cases/case-${i + 1}.webp`}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] dark:opacity-80 dark:invert"
                  />
                </div>

                <div className="flex flex-1 flex-col p-7">
                  <div className="flex items-center justify-between">
                    <span className="label">{item.sector}</span>
                    <span className="label text-rule">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Metrik — hover'da büyüyüp vurgu rengine geçer */}
                  <div className="mt-8">
                    <div className="font-display text-[clamp(2.75rem,6vw,4rem)] font-extrabold leading-none tracking-[-0.05em] transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-hover:text-signal">
                      {item.metric}
                    </div>
                    <p className="mt-3 max-w-[24ch] text-sm leading-snug">
                      {item.metricLabel}
                    </p>
                  </div>

                  <p className="mt-7 flex-1 text-sm leading-relaxed text-muted">
                    {item.body}
                  </p>

                  <div className="mt-8 flex flex-wrap gap-2 border-t border-rule pt-5">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="border border-rule px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <Link
            href="/cases"
            className="link-underline mt-12 inline-flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.14em] transition-colors duration-300 hover:text-signal"
          >
            {t('cta')} <span aria-hidden>→</span>
          </Link>
        </Reveal>
      </div>
    </Section>
  );
}
