import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';

import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { PageHero } from '@/components/ui/page-hero';
import { Vortex } from '@/components/ui/vortex';
import { Section } from '@/components/ui/section';
import { Reveal } from '@/components/motion/reveal';
import { ButtonLink } from '@/components/ui/button';
import { Magnetic } from '@/components/motion/magnetic';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.cases' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}/cases`,
      languages: { tr: '/tr/cases', en: '/en/cases' },
    },
  };
}

export default async function CasesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CasesContent />;
}

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

function CasesContent() {
  const t = useTranslations('cases');
  const items = t.raw('items') as CaseItem[];

  return (
    <>
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        lead={t('hero.lead')}
        tone="onDark"
        background={
          /* Projeler: "canlı sistem" yeşili (--live ailesi). */
          <Vortex baseHue={135} rangeHue={45} />
        }
      />

      <Section rule={false} className="pt-0">
        <div className="shell border-t border-rule">
          <div className="grid gap-5 py-12 md:grid-cols-2 md:py-16">
            {items.map((item, i) => (
              <Reveal key={item.slug} delay={i * 0.08}>
                <Link
                  href={`/cases/${item.slug}`}
                  className="card group relative flex h-full flex-col overflow-hidden transition-colors duration-500 hover:border-signal/50"
                >
                  <div className="bg-stripes relative aspect-[16/10] overflow-hidden border-b border-rule bg-paper opacity-70 transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="flex flex-1 flex-col p-7 md:p-9">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="border border-rule px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-muted"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-7">
                      <div className="font-display text-[clamp(2.5rem,5vw,3.5rem)] font-extrabold leading-none tracking-[-0.05em] transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-hover:text-signal">
                        {item.metric}
                      </div>
                      <p className="mt-3 max-w-[26ch] text-sm leading-snug">
                        {item.metricLabel}
                      </p>
                    </div>

                    <div className="mt-7 flex-1">
                      <span className="label">{item.sector}</span>
                      <h2 className="mt-3 font-display text-xl font-bold tracking-[-0.03em] md:text-2xl">
                        {item.client} — {item.headline}
                      </h2>
                      <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
                        {item.summary}
                      </p>
                    </div>

                    <span className="link-underline mt-7 inline-flex w-fit items-center gap-2 border-t border-rule pt-5 font-mono text-[0.72rem] uppercase tracking-[0.14em] transition-colors duration-300 group-hover:text-signal">
                      {t('detail.readMore')} <span aria-hidden>→</span>
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section rule={false} className="pt-0">
        <div className="shell text-center">
          <Reveal>
            <h2 className="display-md mx-auto max-w-xl font-display font-extrabold">
              {t('cta.title')}
            </h2>
            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-muted">
              {t('cta.body')}
            </p>
            <div className="mt-9">
              <Magnetic>
                <ButtonLink href="/contact" size="lg" arrow>
                  {t('cta.cta')}
                </ButtonLink>
              </Magnetic>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
