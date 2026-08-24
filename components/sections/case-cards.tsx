'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Section, SectionHeader } from '@/components/ui/section';
import { Reveal } from '@/components/motion/reveal';

type CaseItem = {
  slug: string;
  client: string;
  sector: string;
  tags: string[];
  headline: string;
  summary: string;
  metric: string;
  metricLabel: string;
};

export function CaseCards() {
  const t = useTranslations('home.cases');
  const tCases = useTranslations('cases');
  const items = tCases.raw('items') as CaseItem[];

  return (
    <Section id="cases" className="bg-surface">
      <div className="shell">
        <SectionHeader
          index={t('index')}
          eyebrow={t('eyebrow')}
          title={t('title')}
          description={t('description')}
        />

        <div className="grid gap-5 md:grid-cols-2">
          {items.map((item, i) => (
            <Reveal key={item.slug} delay={i * 0.09}>
              <Link
                href={`/cases/${item.slug}`}
                className="card group relative flex h-full flex-col overflow-hidden transition-colors duration-500 hover:border-signal/50"
              >
                {/* Soyut desen — gerçek görsel yok, sadece endüstriyel doku */}
                <div className="bg-stripes relative aspect-[16/10] overflow-hidden border-b border-rule bg-paper opacity-70 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="flex flex-1 flex-col p-7">
                  <div className="flex items-center justify-between">
                    <span className="label">{item.sector}</span>
                    <span className="label text-rule">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Metrik — hover'da büyüyüp vurgu rengine geçer */}
                  <div className="mt-8">
                    <div className="font-display text-[clamp(2.25rem,5vw,3.25rem)] font-extrabold leading-none tracking-[-0.05em] transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-hover:text-signal">
                      {item.metric}
                    </div>
                    <p className="mt-3 max-w-[24ch] text-sm leading-snug">
                      {item.metricLabel}
                    </p>
                  </div>

                  <div className="mt-7 flex-1">
                    <p className="font-display text-lg font-bold tracking-[-0.02em]">
                      {item.client}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {item.summary}
                    </p>
                  </div>

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
              </Link>
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
