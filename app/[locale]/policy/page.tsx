import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';

import { routing } from '@/i18n/routing';
import { siteConfig } from '@/lib/site-config';
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
  const t = await getTranslations({ locale, namespace: 'meta.policy' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}/policy`,
      languages: { tr: '/tr/policy', en: '/en/policy' },
    },
  };
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PolicyContent />;
}

function PolicyContent() {
  const t = useTranslations('policy');
  const points = t.raw('points') as string[];

  return (
    <>
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        lead={t('hero.lead')}
      />

      <Section>
        <div className="shell max-w-2xl">
          <Reveal>
            <p className="text-base leading-relaxed text-muted">{t('body')}</p>
          </Reveal>

          <Reveal delay={0.08}>
            <ul className="mt-8 space-y-3 border-t border-rule pt-6">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm">
                  <span aria-hidden className="mt-[0.4em] text-[0.55rem] text-signal">
                    ◆
                  </span>
                  <span className="text-muted">{point}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-8 border-t border-rule pt-6 text-sm leading-relaxed text-muted">
              {t('contactLabel')}
              <br />
              <a
                href={`mailto:${siteConfig.email}`}
                className="link-underline text-ink transition-colors duration-300 hover:text-signal"
              >
                {siteConfig.email}
              </a>
            </p>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
