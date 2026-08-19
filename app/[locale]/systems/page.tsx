import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';

import { routing } from '@/i18n/routing';
import { PageHero } from '@/components/ui/page-hero';
import { Vortex } from '@/components/ui/vortex';
import { Section, SectionHeader } from '@/components/ui/section';
import { PricingCards, type Package } from '@/components/ui/pricing-cards';
import { FaqAccordion, type FaqItem } from '@/components/ui/faq-accordion';
import { Reveal } from '@/components/motion/reveal';
import { Marquee } from '@/components/motion/marquee';
import { ButtonLink } from '@/components/ui/button';
import { Magnetic } from '@/components/motion/magnetic';
import { cn } from '@/lib/utils';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.systems' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}/systems`,
      languages: { tr: '/tr/systems', en: '/en/systems' },
    },
  };
}

export default async function SystemsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SystemsContent />;
}

// Kurulumda kullandığımız teknolojiler — logo değil, mono metin şerit
const stack = [
  'Next.js',
  'Anthropic Claude',
  'OpenAI',
  'Supabase',
  'Vercel',
  'n8n',
  'Shopify',
  'HubSpot',
  'PostgreSQL',
];

type SystemPackage = {
  name: string;
  duration: string;
  price: string;
  body: string;
  features: string[];
  featured?: boolean;
};

type Retainer = { name: string; price: string; features: string[]; featured?: boolean };

function SystemsContent() {
  const t = useTranslations('systems');
  const nav = useTranslations('nav');

  const items = t.raw('packages.items') as SystemPackage[];
  const retainers = t.raw('retainers.items') as Retainer[];
  const faq = t.raw('faq.items') as FaqItem[];

  const packages: Package[] = items.map((p) => ({
    name: p.name,
    price: p.price,
    duration: p.duration,
    body: p.body,
    items: p.features,
    featured: p.featured,
  }));

  return (
    <>
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        lead={t('hero.lead')}
        tone="onDark"
        background={
          /* Sistemler: marka vermilyonundan kehribara. */
          <Vortex baseHue={12} rangeHue={40} />
        }
      >
        <Magnetic>
          <ButtonLink href="/contact" size="lg" arrow>
            {t('hero.cta')}
          </ButtonLink>
        </Magnetic>
      </PageHero>

      {/* Teknoloji şeridi */}
      <div className="border-y border-rule py-8">
        <p className="label shell mb-6">{t('hero.builtOn')}</p>
        <Marquee duration={32}>
          {stack.map((tech) => (
            <span
              key={tech}
              className="whitespace-nowrap px-7 font-mono text-sm tracking-[0.06em] text-muted md:px-10"
            >
              {tech}
            </span>
          ))}
        </Marquee>
      </div>

      {/* Paketler */}
      <Section rule={false}>
        <div className="shell">
          <SectionHeader
            index={t('packages.index')}
            eyebrow={t('packages.eyebrow')}
            title={t('packages.title')}
            description={t('packages.description')}
          />
          <PricingCards
            packages={packages}
            itemsLabel={t('packages.featuresLabel')}
            priceLabel={t('packages.fromLabel')}
            cta={nav('cta')}
          />
        </div>
      </Section>

      {/* Aylık bakım */}
      <Section className="bg-surface">
        <div className="shell">
          <SectionHeader
            index={t('retainers.index')}
            eyebrow={t('retainers.eyebrow')}
            title={t('retainers.title')}
            description={t('retainers.description')}
          />

          <div className="grid gap-5 md:grid-cols-3">
            {retainers.map((tier, i) => (
              <Reveal key={tier.name} delay={i * 0.08}>
                <article
                  className={cn(
                    'card flex h-full flex-col p-7',
                    tier.featured && 'border-signal/60 bg-signal/[0.04]',
                  )}
                >
                  <h3 className="label text-signal">{tier.name}</h3>
                  <p className="mt-4 font-display text-2xl font-extrabold tracking-[-0.035em]">
                    {tier.price}
                  </p>
                  <ul className="mt-6 flex-1 space-y-2.5 border-t border-rule pt-5">
                    {tier.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2.5 text-sm"
                      >
                        <span
                          aria-hidden
                          className="mt-[0.4em] text-[0.55rem] text-signal"
                        >
                          ◆
                        </span>
                        <span className="text-muted">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* SSS */}
      <Section>
        <div className="shell grid gap-10 lg:grid-cols-12">
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
