import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';

import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { PageHero } from '@/components/ui/page-hero';
import { Section } from '@/components/ui/section';
import { Reveal } from '@/components/motion/reveal';
import { ButtonLink } from '@/components/ui/button';
import { Magnetic } from '@/components/motion/magnetic';

const SLUGS = ['rmd-kimya', 'alestatrade'] as const;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    SLUGS.map((slug) => ({ locale, slug })),
  );
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
  challenge: string;
  solution: string;
  result: string;
};

async function getCase(locale: string, slug: string) {
  const t = await getTranslations({ locale, namespace: 'cases' });
  const items = t.raw('items') as CaseItem[];
  return items.find((item) => item.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const item = await getCase(locale, slug);
  if (!item) return {};

  return {
    title: `${item.client} — ${item.headline} | Vortenxflow`,
    description: item.summary,
    alternates: {
      canonical: `/${locale}/cases/${slug}`,
      languages: { tr: `/tr/cases/${slug}`, en: `/en/cases/${slug}` },
    },
  };
}

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const item = await getCase(locale, slug);
  if (!item) notFound();

  return <CaseDetailContent slug={slug} />;
}

function CaseDetailContent({ slug }: { slug: string }) {
  const t = useTranslations('cases');
  const items = t.raw('items') as CaseItem[];
  const item = items.find((i) => i.slug === slug)!;
  const other = items.find((i) => i.slug !== slug);

  return (
    <>
      <PageHero eyebrow={item.sector} title={item.headline} lead={item.summary}>
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-display text-lg font-bold tracking-[-0.02em]">
            {item.client}
          </span>
          <span className="h-px w-8 bg-rule" />
          <div className="flex flex-wrap gap-2">
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
      </PageHero>

      <Section rule={false} className="pt-0">
        <div className="shell border-t border-rule pt-16 md:pt-20">
          <Reveal>
            <div className="card max-w-sm p-8 md:p-10">
              <span className="label">{t('detail.resultLabel')}</span>
              <div className="mt-4 font-display text-[clamp(2.75rem,6vw,4rem)] font-extrabold leading-none tracking-[-0.05em] text-signal">
                {item.metric}
              </div>
              <p className="mt-3 max-w-[26ch] text-sm leading-snug">
                {item.metricLabel}
              </p>
            </div>
          </Reveal>

          <div className="mt-16 grid gap-10 border-t border-rule pt-16 md:grid-cols-3 md:gap-8">
            {[
              { label: t('detail.challengeLabel'), body: item.challenge },
              { label: t('detail.solutionLabel'), body: item.solution },
              { label: t('detail.resultLabel'), body: item.result },
            ].map((block, i) => (
              <Reveal key={block.label} delay={i * 0.1}>
                <span className="label text-signal">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h2 className="mt-4 font-display text-xl font-bold tracking-[-0.02em]">
                  {block.label}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  {block.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section rule={false} className="pt-0">
        <div className="shell text-center">
          <Reveal>
            <h2 className="display-md mx-auto max-w-xl font-display font-extrabold">
              {t('detail.ctaTitle')}
            </h2>
            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-muted">
              {t('detail.ctaBody')}
            </p>
            <div className="mt-9">
              <Magnetic>
                <ButtonLink href="/contact" size="lg" arrow>
                  {t('detail.ctaButton')}
                </ButtonLink>
              </Magnetic>
            </div>
          </Reveal>

          {other && (
            <Reveal delay={0.15}>
              <div className="mt-16 border-t border-rule pt-10">
                <p className="label mb-4">{t('detail.moreCasesLabel')}</p>
                <Link
                  href={`/cases/${other.slug}`}
                  className="link-underline inline-flex items-center gap-2 font-display text-xl font-bold tracking-[-0.02em] hover:text-signal"
                >
                  {other.client} — {other.headline} <span aria-hidden>→</span>
                </Link>
              </div>
            </Reveal>
          )}
        </div>
      </Section>
    </>
  );
}
