import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';

import { routing } from '@/i18n/routing';
import { PageHero } from '@/components/ui/page-hero';
import { ForgeRobotScene } from '@/components/ui/forge-robot-scene';
import { Section, SectionHeader } from '@/components/ui/section';
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
  const t = await getTranslations({ locale, namespace: 'meta.industries' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}/industries`,
      languages: { tr: '/tr/industries', en: '/en/industries' },
    },
  };
}

export default async function IndustriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <IndustriesContent />;
}

type Industry = {
  code: string;
  name: string;
  body: string;
  automations: string[];
};

function IndustriesContent() {
  const t = useTranslations('industries');
  const items = t.raw('list.items') as Industry[];

  return (
    <>
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        lead={t('hero.lead')}
        tone="onDark"
        fullScreen
        background={
          /* Kartlardaki dokuz sektör sahnedeki halkanın da içeriği. */
          <ForgeRobotScene sectors={items} />
        }
      >
        <Magnetic>
          <ButtonLink href="/contact" size="lg" arrow>
            {t('hero.cta')}
          </ButtonLink>
        </Magnetic>
      </PageHero>

      <Section>
        <div className="shell">
          <SectionHeader
            index={t('list.index')}
            eyebrow={t('list.eyebrow')}
            title={t('list.title')}
            description={t('list.description')}
          />

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <Reveal key={item.code} delay={(i % 3) * 0.08}>
                {/* id, footer'daki /industries#i-01 bağlantılarının hedefi */}
                <article
                  id={`i-${item.code}`}
                  className="card flex h-full scroll-mt-28 flex-col p-7 transition-colors duration-500 hover:border-signal/40"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-xl font-bold tracking-[-0.03em]">
                      {item.name}
                    </h3>
                    <span className="label text-signal">{item.code}</span>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-muted">
                    {item.body}
                  </p>

                  <div className="mt-7 flex-1 border-t border-rule pt-5">
                    <p className="label mb-4">{t('list.automationsLabel')}</p>
                    <ul className="space-y-2.5">
                      {item.automations.map((automation) => (
                        <li
                          key={automation}
                          className="flex items-start gap-2.5 text-sm"
                        >
                          <span
                            aria-hidden
                            className="mt-[0.4em] text-[0.55rem] text-signal"
                          >
                            ◆
                          </span>
                          <span className="text-muted">{automation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
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
