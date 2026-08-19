import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';

import Image from 'next/image';
import { routing } from '@/i18n/routing';
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
  client: string;
  sector: string;
  metric: string;
  metricLabel: string;
  duration: string;
  body: string;
  stack: string[];
  tags: string[];
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
          {items.map((item, i) => (
            <Reveal key={item.client} delay={i * 0.06}>
              <article className="grid gap-8 border-b border-rule py-12 md:grid-cols-12 md:gap-10 md:py-16">
                {/* Sol: metrik */}
                <div className="md:col-span-4">
                  <span className="label text-rule">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="mt-5 font-display text-[clamp(3rem,7vw,4.5rem)] font-extrabold leading-none tracking-[-0.05em] text-signal">
                    {item.metric}
                  </div>
                  <p className="mt-4 max-w-[22ch] text-sm leading-snug">
                    {item.metricLabel}
                  </p>
                </div>

                {/* Sağ: anlatı */}
                <div className="md:col-span-7 md:col-start-6">
                  <h2 className="font-display text-2xl font-bold tracking-[-0.03em] md:text-3xl">
                    {item.client}
                  </h2>

                  <dl className="mt-5 flex flex-wrap gap-x-10 gap-y-3">
                    <div>
                      <dt className="label">{t('sectorLabel')}</dt>
                      <dd className="mt-1 text-sm">{item.sector}</dd>
                    </div>
                    <div>
                      <dt className="label">{t('durationLabel')}</dt>
                      <dd className="mt-1 text-sm">{item.duration}</dd>
                    </div>
                  </dl>

                  <p className="mt-6 max-w-xl text-base leading-relaxed text-muted">
                    {item.body}
                  </p>

                  <div className="mt-8">
                    <p className="label mb-3">{t('stackLabel')}</p>
                    <div className="flex flex-wrap gap-2">
                      {item.stack.map((tech) => (
                        <span
                          key={tech}
                          className="border border-rule px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-muted"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Kurulumun şematik gösterimi */}
                  <div className="relative mt-9 aspect-[16/9] overflow-hidden border border-rule bg-surface">
                    <Image
                      src={`/images/cases/case-${i + 1}.webp`}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 58vw"
                      className="object-cover dark:opacity-80 dark:invert"
                    />
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
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
