import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';

import { routing } from '@/i18n/routing';
import { PageHero } from '@/components/ui/page-hero';
import { Section, SectionHeader } from '@/components/ui/section';
import { PricingCards, type Package } from '@/components/ui/pricing-cards';
import { FaqAccordion, type FaqItem } from '@/components/ui/faq-accordion';
import { Reveal } from '@/components/motion/reveal';
import { ButtonLink } from '@/components/ui/button';
import { Magnetic } from '@/components/motion/magnetic';
import { AdvisorySpline } from '@/components/sections/advisory-spline';
import { LightSpeed } from '@/components/ui/light-speed';
import { TubesCursor } from '@/components/ui/tubes-cursor';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.advisory' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}/advisory`,
      languages: { tr: '/tr/advisory', en: '/en/advisory' },
    },
  };
}

export default async function AdvisoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AdvisoryContent />;
}

type MainPackage = {
  code: string;
  name: string;
  price: string;
  duration: string;
  body: string;
  includes: string[];
  featured: boolean;
};

type ShortItem = {
  name: string;
  price: string;
  duration: string;
  body: string;
};

function AdvisoryContent() {
  const t = useTranslations('advisory');
  const nav = useTranslations('nav');

  const main = t.raw('packages.items') as MainPackage[];
  const short = t.raw('short.items') as ShortItem[];
  const faq = t.raw('faq.items') as FaqItem[];

  const packages: Package[] = main.map((p) => ({
    code: p.code,
    name: p.name,
    price: p.price,
    duration: p.duration,
    body: p.body,
    items: p.includes,
    featured: p.featured,
  }));

  return (
    <>
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        lead={t('hero.lead')}
        fullScreen
        tone="onDark"
        background={<LightSpeed className="h-full w-full" />}
      >
        <Magnetic>
          <ButtonLink href="/contact" size="lg" arrow>
            {t('hero.cta')}
          </ButtonLink>
        </Magnetic>
      </PageHero>

      {/* Etkileşimli 3B panel */}
      <Section rule={false} className="pt-0 md:pt-0 lg:pt-0">
        <div className="shell">
          <AdvisorySpline
            eyebrow={t('spline.eyebrow')}
            title={t('spline.title')}
            body={t('spline.body')}
            loadingLabel={t('spline.loading')}
          />
        </div>
      </Section>

      {/* Ana paketler */}
      <Section>
        <div className="shell">
          <SectionHeader
            index={t('packages.index')}
            eyebrow={t('packages.eyebrow')}
            title={t('packages.title')}
            description={t('packages.description')}
          />
          <PricingCards
            packages={packages}
            itemsLabel={t('packages.includesLabel')}
            cta={nav('cta')}
          />
        </div>
      </Section>

      {/* Kısa format */}
      <Section className="bg-surface">
        <div className="shell">
          <SectionHeader
            index={t('short.index')}
            eyebrow={t('short.eyebrow')}
            title={t('short.title')}
          />

          <div className="grid gap-5 md:grid-cols-3">
            {short.map((item, i) => (
              <Reveal key={item.name} delay={i * 0.08}>
                <article className="card flex h-full flex-col p-7">
                  <h3 className="font-display text-xl font-bold tracking-[-0.03em]">
                    {item.name}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                    {item.body}
                  </p>
                  <div className="mt-7 border-t border-rule pt-5">
                    <p className="font-display text-xl font-extrabold tracking-[-0.03em]">
                      {item.price}
                    </p>
                    <p className="label mt-1.5 normal-case tracking-normal">
                      {item.duration}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* Fiyatlandırma felsefesi */}
      <Section>
        <div className="shell grid gap-10 md:grid-cols-12">
          <Reveal className="md:col-span-4">
            <p className="label">{t('philosophy.eyebrow')}</p>
            <h2 className="display-md mt-5 font-display font-extrabold">
              {t('philosophy.title')}
            </h2>
          </Reveal>
          <Reveal delay={0.12} className="md:col-span-7 md:col-start-6">
            <p className="text-lg leading-relaxed text-muted">
              {t('philosophy.body')}
            </p>
          </Reveal>
        </div>
      </Section>

      {/* SSS — arkada tubes animasyonu; bölüm her iki temada da koyu kalıyor */}
      <Section className="tone-dark overflow-hidden bg-paper">
        <TubesCursor />

        {/* Animasyon parlak noktalar üretiyor; metin okunsun diye karartma.
            Düz siyah yerine koyu lacivert — turuncu tüpler daha sıcak durur. */}
        <div className="absolute inset-0 bg-[#060c1a]/60" aria-hidden />

        <div className="shell relative z-10 grid gap-10 lg:grid-cols-12">
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
