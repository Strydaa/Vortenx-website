import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';

import { routing } from '@/i18n/routing';
import { PageHero } from '@/components/ui/page-hero';
import { AuraBackground } from '@/components/ui/aura-background';
import { Section, SectionHeader } from '@/components/ui/section';
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
  const t = await getTranslations({ locale, namespace: 'meta.aiLiteracy' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}/kurum-ici/ai-okur-yazarligi`,
      languages: {
        tr: '/tr/kurum-ici/ai-okur-yazarligi',
        en: '/en/kurum-ici/ai-okur-yazarligi',
      },
    },
  };
}

export default async function AiLiteracyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AiLiteracyContent />;
}

type Outcome = { title: string; body: string };

function AiLiteracyContent() {
  const t = useTranslations('aiLiteracy');
  const outcomes = t.raw('outcomes.items') as Outcome[];

  return (
    <>
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        lead={t('hero.lead')}
        tone="onDark"
        background={<AuraBackground />}
      >
        <div className="flex flex-wrap items-center gap-4">
          <Magnetic>
            <ButtonLink href="/contact" size="lg" arrow>
              {t('hero.cta')}
            </ButtonLink>
          </Magnetic>
          <ButtonLink href="/kurum-ici" variant="ghost">
            ← {t('hero.back')}
          </ButtonLink>
        </div>
      </PageHero>

      {/* Çıktılar */}
      <Section>
        <div className="shell">
          <SectionHeader
            index={t('outcomes.index')}
            eyebrow={t('outcomes.eyebrow')}
            title={t('outcomes.title')}
          />

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {outcomes.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.08}>
                <article className="card flex h-full flex-col p-7">
                  <h3 className="font-display text-lg font-bold tracking-[-0.03em]">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-muted">
                    {item.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <ProcessSteps namespace="aiLiteracy.modules" />

      {/* Uyum bloğu */}
      <Section className="bg-surface">
        <div className="shell grid gap-10 md:grid-cols-12">
          <Reveal className="md:col-span-4">
            <p className="label">{t('compliance.eyebrow')}</p>
            <h2 className="display-md mt-5 font-display font-extrabold">
              {t('compliance.title')}
            </h2>
          </Reveal>
          <Reveal delay={0.12} className="md:col-span-7 md:col-start-6">
            <p className="text-lg leading-relaxed text-muted">
              {t('compliance.body')}
            </p>
          </Reveal>
        </div>
      </Section>

      {/* Kapanış */}
      <Section>
        <div className="shell">
          <Reveal>
            <h2 className="display-md max-w-[20ch] font-display font-extrabold">
              {t('cta.title')}
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              {t('cta.body')}
            </p>
            <div className="mt-10">
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
