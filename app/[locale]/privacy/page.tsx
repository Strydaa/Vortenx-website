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
  const t = await getTranslations({ locale, namespace: 'meta.privacy' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}/privacy`,
      languages: { tr: '/tr/privacy', en: '/en/privacy' },
    },
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PrivacyContent />;
}

function PrivacyContent() {
  const t = useTranslations('privacy');
  const sections = t.raw('sections') as {
    title: string;
    body: string;
    points?: string[];
  }[];

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
                {section.points && (
                  <ul className="mt-4 space-y-2.5">
                    {section.points.map((point) => (
                      <li key={point} className="flex items-start gap-3 text-sm">
                        <span
                          aria-hidden
                          className="mt-[0.4em] text-[0.55rem] text-signal"
                        >
                          ◆
                        </span>
                        <span className="text-muted">{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
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
