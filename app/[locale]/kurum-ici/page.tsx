import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';

import { routing } from '@/i18n/routing';
import { PageHero } from '@/components/ui/page-hero';
import { Vortex } from '@/components/ui/vortex';
import { Section, SectionHeader } from '@/components/ui/section';
import { FaqAccordion, type FaqItem } from '@/components/ui/faq-accordion';
import { StatsBar } from '@/components/sections/stats-bar';
import { TwoTracks } from '@/components/sections/two-tracks';
import { ProcessSteps } from '@/components/sections/process-steps';
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
  const t = await getTranslations({ locale, namespace: 'meta.kurumIci' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}/kurum-ici`,
      languages: { tr: '/tr/kurum-ici', en: '/en/kurum-ici' },
    },
  };
}

export default async function KurumIciPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <KurumIciContent />;
}

type Format = { name: string; duration: string; audience: string };

function KurumIciContent() {
  const t = useTranslations('kurumIci');

  const formats = t.raw('formats.items') as Format[];
  const faq = t.raw('faq.items') as FaqItem[];

  return (
    <>
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        lead={t('hero.lead')}
        tone="onDark"
        background={
          /* Kurum İçi: macenta-mor — sistemler(vermilyon)/hakkımızda(camgöbeği) ile çakışmıyor. */
          <Vortex baseHue={315} rangeHue={40} />
        }
      >
        <Magnetic>
          <ButtonLink href="/contact" size="lg" arrow>
            {t('hero.cta')}
          </ButtonLink>
        </Magnetic>
      </PageHero>

      <StatsBar namespace="kurumIci.stats" />

      <TwoTracks namespace="kurumIci.flagship" />

      <ProcessSteps namespace="kurumIci.curriculum" />

      {/* Format ve süre */}
      <Section className="bg-surface">
        <div className="shell">
          <SectionHeader
            index={t('formats.index')}
            eyebrow={t('formats.eyebrow')}
            title={t('formats.title')}
            description={t('formats.description')}
          />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-left">
              <thead>
                <tr className="border-y border-rule">
                  <th className="label py-4 pr-6 font-normal">
                    {t('formats.formatLabel')}
                  </th>
                  <th className="label py-4 pr-6 font-normal">
                    {t('formats.durationLabel')}
                  </th>
                  <th className="label py-4 font-normal">
                    {t('formats.audienceLabel')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {formats.map((row) => (
                  <tr key={row.name} className="border-b border-rule">
                    <td className="py-5 pr-6 font-display text-base font-bold tracking-[-0.02em]">
                      {row.name}
                    </td>
                    <td className="py-5 pr-6 font-mono text-sm text-signal">
                      {row.duration}
                    </td>
                    <td className="py-5 text-sm text-muted">{row.audience}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Reveal delay={0.1}>
            <div className="mt-12">
              <ButtonLink href="/kurum-ici/sunumlar" variant="outline" arrow>
                {t('formats.presentationsCta')}
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* SSS */}
      <Section>
        <div className="shell grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeader
              index={t('faq.index')}
              eyebrow={t('faq.eyebrow')}
              title={t('faq.title')}
              className="mb-0"
            />
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <FaqAccordion items={faq} />
          </div>
        </div>
      </Section>
    </>
  );
}
