import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';

import { routing } from '@/i18n/routing';
import { PageHero } from '@/components/ui/page-hero';
import { Vortex } from '@/components/ui/vortex';
import { Section, SectionHeader } from '@/components/ui/section';
import { PricingCards, type Package } from '@/components/ui/pricing-cards';
import { FaqAccordion, type FaqItem } from '@/components/ui/faq-accordion';
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
  const t = await getTranslations({ locale, namespace: 'meta.programs' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}/programs`,
      languages: { tr: '/tr/programs', en: '/en/programs' },
    },
  };
}

export default async function ProgramsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ProgramsContent />;
}

type Track = { code: string; title: string; body: string };

type ProgramPackage = {
  name: string;
  tool: string;
  duration: string;
  price: string;
  body: string;
  features: string[];
  featured: boolean;
};

function ProgramsContent() {
  const t = useTranslations('programs');
  const nav = useTranslations('nav');

  const tracks = t.raw('tracks.items') as Track[];
  const items = t.raw('packages.items') as ProgramPackage[];
  const faq = t.raw('faq.items') as FaqItem[];

  // Araç adı (Claude Code / n8n) kart başlığının üstünde kod rozeti olarak duruyor.
  const packages: Package[] = items.map((p) => ({
    code: p.tool,
    name: p.name,
    price: p.price,
    duration: p.duration,
    body: p.body,
    items: p.features,
    featured: p.featured,
  }));

  return (
    <>
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        lead={t('hero.lead')}
        tone="onDark"
        background={
          /* Programlar: altın-yeşil — mevcut sayfa paletiyle çakışmayan tek boşluk. */
          <Vortex baseHue={75} rangeHue={40} />
        }
      >
        <Magnetic>
          <ButtonLink href="/contact" size="lg" arrow>
            {t('hero.cta')}
          </ButtonLink>
        </Magnetic>
      </PageHero>

      {/* Üç patika */}
      <Section rule={false}>
        <div className="shell">
          <SectionHeader
            index={t('tracks.index')}
            eyebrow={t('tracks.eyebrow')}
            title={t('tracks.title')}
            description={t('tracks.description')}
          />

          <div className="grid gap-5 md:grid-cols-3">
            {tracks.map((track, i) => (
              <Reveal key={track.code} delay={i * 0.08}>
                <article className="card flex h-full flex-col p-7">
                  <span className="label text-signal">{track.code}</span>
                  <h3 className="mt-3 font-display text-xl font-bold tracking-[-0.03em]">
                    {track.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-muted">
                    {track.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* Açık kohortlar */}
      <Section className="bg-surface">
        <div className="shell">
          <SectionHeader
            index={t('packages.index')}
            eyebrow={t('packages.eyebrow')}
            title={t('packages.title')}
            description={t('packages.description')}
          />
          <PricingCards
            packages={packages}
            itemsLabel={t('packages.featuresLabel')}
            priceLabel={t('packages.fromLabel')}
            cta={nav('cta')}
          />
        </div>
      </Section>

      <ProcessSteps namespace="programs.format" />

      {/* SSS */}
      <Section className="bg-surface">
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
