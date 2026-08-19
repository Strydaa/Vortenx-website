import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';

import { routing } from '@/i18n/routing';
import { PageHero } from '@/components/ui/page-hero';
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
  const t = await getTranslations({ locale, namespace: 'meta.companyDoctor' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}/kurum-ici/sirket-doktoru`,
      languages: {
        tr: '/tr/kurum-ici/sirket-doktoru',
        en: '/en/kurum-ici/sirket-doktoru',
      },
    },
  };
}

export default async function CompanyDoctorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CompanyDoctorContent />;
}

type Deliverable = { title: string; body: string };

function CompanyDoctorContent() {
  const t = useTranslations('companyDoctor');
  const deliverables = t.raw('deliverables.items') as Deliverable[];

  return (
    <>
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        lead={t('hero.lead')}
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

      <ProcessSteps namespace="companyDoctor.phases" />

      {/* Teslimatlar */}
      <Section className="bg-surface">
        <div className="shell">
          <SectionHeader
            index={t('deliverables.index')}
            eyebrow={t('deliverables.eyebrow')}
            title={t('deliverables.title')}
          />

          <div className="grid gap-5 md:grid-cols-2">
            {deliverables.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.08}>
                <article className="card flex h-full flex-col p-7 md:p-8">
                  <h3 className="font-display text-xl font-bold tracking-[-0.03em]">
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

      {/* Çalışma modeli */}
      <Section>
        <div className="shell grid gap-10 md:grid-cols-12">
          <Reveal className="md:col-span-4">
            <p className="label">{t('model.eyebrow')}</p>
            <h2 className="display-md mt-5 font-display font-extrabold">
              {t('model.title')}
            </h2>
          </Reveal>
          <Reveal delay={0.12} className="md:col-span-7 md:col-start-6">
            <p className="text-lg leading-relaxed text-muted">
              {t('model.body')}
            </p>
          </Reveal>
        </div>
      </Section>

      {/* Kapanış */}
      <Section className="bg-surface">
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
