import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Hero } from '@/components/sections/hero';
import { StatsBar } from '@/components/sections/stats-bar';
import { LogoMarquee } from '@/components/sections/logo-marquee';
import { TwoTracks } from '@/components/sections/two-tracks';
import { ServicesGrid } from '@/components/sections/services-grid';
import { CaseCards } from '@/components/sections/case-cards';
import { ComparisonTable } from '@/components/sections/comparison-table';
import { ProcessSteps } from '@/components/sections/process-steps';
import { FounderCard } from '@/components/sections/founder-card';
import { BlogTeaser } from '@/components/sections/blog-teaser';
import { DualCta } from '@/components/sections/dual-cta';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.home' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}`,
      languages: { tr: '/tr', en: '/en', 'x-default': '/tr' },
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <StatsBar />
      <LogoMarquee />
      <TwoTracks />
      <ServicesGrid />
      <CaseCards />
      <ComparisonTable />
      <ProcessSteps />
      <FounderCard />
      <BlogTeaser />
      <DualCta />
    </>
  );
}
