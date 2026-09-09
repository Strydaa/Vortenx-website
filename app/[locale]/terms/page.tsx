import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';

import { routing } from '@/i18n/routing';
import { siteConfig, formatAddress } from '@/lib/site-config';
import { PageHero } from '@/components/ui/page-hero';
import { Section } from '@/components/ui/section';
import { Reveal } from '@/components/motion/reveal';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.terms' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}/terms`,
      languages: { tr: '/tr/terms', en: '/en/terms' },
    },
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <TermsContent />;
}

function TermsContent() {
  const t = useTranslations('terms');
  const sections = t.raw('sections') as { title: string; body: string }[];

  return (
    <>
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        lead={t('hero.lead')}
      />

      <Section>
        <div className="shell max-w-2xl">
          {sections.map((section, i) => (
            <Reveal key={section.title} delay={i * 0.06}>
              <div className="border-t border-rule pt-6 first:border-t-0 first:pt-0">
                <h2 className="font-display text-lg font-bold tracking-[-0.02em]">
                  {section.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {section.body}
                </p>
              </div>
              <div className="mt-8" />
            </Reveal>
          ))}

          <Reveal delay={sections.length * 0.06}>
            <p className="border-t border-rule pt-6 text-sm leading-relaxed text-muted">
              {t('contactLabel')}
              <br />
              <a
                href={`mailto:${siteConfig.email}`}
                className="link-underline text-ink transition-colors duration-300 hover:text-signal"
              >
                {siteConfig.email}
              </a>
              <br />
              {formatAddress(siteConfig.address)}
            </p>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
