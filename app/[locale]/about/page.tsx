import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';

import { routing } from '@/i18n/routing';
import { siteConfig } from '@/lib/site-config';
import { PageHero } from '@/components/ui/page-hero';
import { Vortex } from '@/components/ui/vortex';
import { Section, SectionHeader } from '@/components/ui/section';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/reveal';
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
  const t = await getTranslations({ locale, namespace: 'meta.about' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}/about`,
      languages: { tr: '/tr/about', en: '/en/about' },
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AboutContent />;
}

type Value = { title: string; body: string };

function AboutContent() {
  const t = useTranslations('about');
  const values = t.raw('values.items') as Value[];
  const highlights = t.raw('founder.highlights') as string[];

  return (
    <>
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        lead={t('hero.lead')}
        tone="onDark"
        background={
          /* Hakkımızda: camgöbeği–mavi. */
          <Vortex baseHue={190} rangeHue={45} />
        }
      />

      {/* İlkeler */}
      <Section>
        <div className="shell">
          <SectionHeader
            index={t('values.index')}
            eyebrow={t('values.eyebrow')}
            title={t('values.title')}
          />

          <RevealGroup className="grid border-l border-t border-rule md:grid-cols-2">
            {values.map((value, i) => (
              <RevealItem
                key={value.title}
                className="group border-b border-r border-rule p-8 transition-colors duration-500 hover:bg-surface md:p-10"
              >
                <span className="label text-signal">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-6 font-display text-xl font-bold tracking-[-0.03em] md:text-2xl">
                  {value.title}
                </h3>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
                  {value.body}
                </p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </Section>

      {/* Kurucu */}
      <Section className="bg-surface">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal>
              <div className="label mb-6 flex items-center gap-3">
                <span className="text-signal">{t('founder.index')}</span>
                <span className="h-px w-8 bg-rule" />
                <span>{t('founder.eyebrow')}</span>
              </div>

              {/* Gerçek portre gelince buradaki blok next/image ile değiştirilir */}
              <div
                aria-hidden
                className="bg-dots crosshair relative flex aspect-[4/5] max-w-sm items-end border border-rule bg-paper p-6"
              >
                <span className="font-display text-6xl font-extrabold tracking-[-0.05em] text-rule">
                  NF
                </span>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal delay={0.12}>
              <blockquote className="font-display text-2xl font-medium leading-snug tracking-[-0.025em] md:text-3xl">
                &ldquo;{t('founder.quote')}&rdquo;
              </blockquote>

              <div className="mt-8 border-t border-rule pt-6">
                <p className="font-display text-lg font-bold tracking-[-0.02em]">
                  {t('founder.name')}
                </p>
                <p className="label mt-1">{t('founder.role')}</p>
              </div>

              <p className="mt-8 max-w-xl text-base leading-relaxed text-muted">
                {t('founder.bio')}
              </p>

              <ul className="mt-8 space-y-3 border-t border-rule pt-6">
                {highlights.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
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
            </Reveal>
          </div>
        </div>
      </Section>

      {/* Ofisler */}
      <Section>
        <div className="shell">
          <SectionHeader
            index={t('offices.index')}
            eyebrow={t('offices.eyebrow')}
            title={t('offices.title')}
            description={t('offices.body')}
          />

          <div className="grid gap-5 md:grid-cols-2">
            {siteConfig.offices.map((office, i) => (
              <Reveal key={office.city} delay={i * 0.08}>
                <div className="card crosshair p-8 md:p-10">
                  <span className="label">{office.coords}</span>
                  <p className="mt-5 font-display text-3xl font-extrabold tracking-[-0.04em] md:text-4xl">
                    {office.city}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section className="bg-surface">
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
