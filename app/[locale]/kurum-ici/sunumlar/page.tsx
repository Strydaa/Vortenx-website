import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';

import { routing } from '@/i18n/routing';
import { PageHero } from '@/components/ui/page-hero';
import { AuraBackground } from '@/components/ui/aura-background';
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
  const t = await getTranslations({ locale, namespace: 'meta.presentations' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}/kurum-ici/sunumlar`,
      languages: {
        tr: '/tr/kurum-ici/sunumlar',
        en: '/en/kurum-ici/sunumlar',
      },
    },
  };
}

export default async function PresentationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PresentationsContent />;
}

type Deck = { code: string; title: string; body: string; slides: number };

function PresentationsContent() {
  const t = useTranslations('presentations');
  const decks = t.raw('list.items') as Deck[];

  return (
    <>
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        lead={t('hero.lead')}
        tone="onDark"
        background={<AuraBackground />}
      >
        <ButtonLink href="/kurum-ici" variant="ghost">
          ← {t('hero.back')}
        </ButtonLink>
      </PageHero>

      {/* Desteler */}
      <Section>
        <div className="shell">
          <SectionHeader
            index={t('list.index')}
            eyebrow={t('list.eyebrow')}
            title={t('list.title')}
            description={t('list.description')}
          />

          <ul className="border-t border-rule">
            {decks.map((deck, i) => (
              <li key={deck.code}>
                <Reveal delay={i * 0.06} from="left" distance={20}>
                  <article className="grid gap-4 border-b border-rule py-7 md:grid-cols-12 md:items-baseline md:gap-8">
                    <span className="label text-signal md:col-span-1">
                      {deck.code}
                    </span>

                    <div className="md:col-span-6">
                      <h3 className="font-display text-xl font-bold tracking-[-0.03em] md:text-2xl">
                        {deck.title}
                      </h3>
                      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
                        {deck.body}
                      </p>
                    </div>

                    <p className="label md:col-span-2">
                      {deck.slides} {t('list.slidesLabel')}
                    </p>

                    {/* Dosyalar yüklenene kadar indirme yok — ölü link bırakmıyoruz. */}
                    <p className="label md:col-span-3 md:text-right">
                      {t('list.soonLabel')}
                    </p>
                  </article>
                </Reveal>
              </li>
            ))}
          </ul>
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
