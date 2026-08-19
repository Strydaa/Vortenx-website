import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';

import { routing } from '@/i18n/routing';
import { siteConfig } from '@/lib/site-config';
import { PageHero } from '@/components/ui/page-hero';
import { Section } from '@/components/ui/section';
import { Reveal } from '@/components/motion/reveal';
import { ContactForm } from '@/components/contact/contact-form';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.contact' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}/contact`,
      languages: { tr: '/tr/contact', en: '/en/contact' },
    },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ContactContent />;
}

function ContactContent() {
  const t = useTranslations('contact');

  const social = [
    { label: 'LinkedIn', href: siteConfig.social.linkedin },
    { label: 'X', href: siteConfig.social.x },
    { label: 'Instagram', href: siteConfig.social.instagram },
  ];

  return (
    <>
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        lead={t('hero.lead')}
      />

      <Section rule={false} className="pt-0">
        <div className="shell grid gap-14 border-t border-rule pt-14 lg:grid-cols-12 lg:gap-16 lg:pt-20">
          {/* Form */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>

          {/* Doğrudan iletişim */}
          <aside className="lg:col-span-4 lg:col-start-9">
            <Reveal delay={0.1}>
              <p className="label mb-8">{t('direct.eyebrow')}</p>

              <dl className="space-y-8">
                <div>
                  <dt className="label mb-2">{t('direct.emailLabel')}</dt>
                  <dd>
                    <a
                      href={`mailto:${siteConfig.email}`}
                      className="link-underline font-display text-lg font-bold tracking-[-0.02em] transition-colors duration-300 hover:text-signal"
                    >
                      {siteConfig.email}
                    </a>
                  </dd>
                </div>

                <div>
                  <dt className="label mb-2">{t('direct.phoneLabel')}</dt>
                  <dd>
                    <a
                      href={`tel:${siteConfig.phone.replace(/\s/g, '')}`}
                      className="link-underline font-display text-lg font-bold tracking-[-0.02em] transition-colors duration-300 hover:text-signal"
                    >
                      {siteConfig.phone}
                    </a>
                  </dd>
                </div>

                <div>
                  <dt className="label mb-3">{t('direct.officesLabel')}</dt>
                  <dd className="space-y-2.5">
                    {siteConfig.offices.map((office) => (
                      <p key={office.city} className="text-sm">
                        <span className="font-medium">{office.city}</span>
                        <span className="label ml-2">{office.coords}</span>
                      </p>
                    ))}
                  </dd>
                </div>

                <div>
                  <dt className="label mb-3">{t('direct.socialLabel')}</dt>
                  <dd className="flex flex-wrap gap-x-5 gap-y-2">
                    {social.map((item) => (
                      <a
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="link-underline text-sm text-muted transition-colors duration-300 hover:text-ink"
                      >
                        {item.label}
                      </a>
                    ))}
                  </dd>
                </div>
              </dl>
            </Reveal>
          </aside>
        </div>
      </Section>
    </>
  );
}
