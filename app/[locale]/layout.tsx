import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import { AuraBackground } from '@/components/ui/aura-background';
import { OrganizationSchema } from '@/components/seo/organization-schema';

import { routing } from '@/i18n/routing';
import { fontVariables } from '@/lib/fonts';
import { siteConfig } from '@/lib/site-config';

import { ThemeProvider } from '@/components/layout/theme-provider';
import { LenisProvider } from '@/components/layout/lenis-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { IntroOverlay } from '@/components/layout/intro-overlay';
import { DeferredWidgets } from '@/components/layout/deferred-widgets';

/**
 * Açılış ekranını oturumda bir kez göstermek için. Boyamadan önce çalışır,
 * next-themes'in kullandığı desenin aynısı — render sırasında sessionStorage
 * okunmadığı için hidrasyon uyuşmazlığı oluşmuyor.
 */
const INTRO_SESSION_SCRIPT = `try{if(sessionStorage.getItem('nf-intro'))document.documentElement.classList.add('intro-seen')}catch(e){}`;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.home' });

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: t('title'),
      template: `%s`,
    },
    description: t('description'),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        tr: '/tr',
        en: '/en',
        'x-default': '/tr',
      },
    },
    openGraph: {
      type: 'website',
      siteName: siteConfig.name,
      locale: locale === 'tr' ? 'tr_TR' : 'en_US',
      title: t('title'),
      description: t('description'),
      images: [
        {
          url: '/images/og.jpg',
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['/images/og.jpg'],
    },
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/icon.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: '/apple-icon.png',
    },
    manifest: '/site.webmanifest',
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'a11y' });

  return (
    <html lang={locale} suppressHydrationWarning className={fontVariables}>
      <body className="grain antialiased">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[10001] focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:text-paper"
        >
          {t('skipToContent')}
        </a>
        <OrganizationSchema />
        {/* Site geneli düşük yoğunluklu atmosfer katmanı. Animasyonlu hero'ların
            arkasında (-z-10, opak) kaybolur; sadece düz içerik bölümlerinde görünür. */}
        <AuraBackground ambient className="fixed inset-0 -z-20" />
        <script dangerouslySetInnerHTML={{ __html: INTRO_SESSION_SCRIPT }} />
        <ThemeProvider>
          <NextIntlClientProvider>
            <LenisProvider>
              {/* Açılış ekranı. Kaldırmak için bu satırı silmek yeterli. */}
              <IntroOverlay />
              <Header />
              <main id="content">{children}</main>
              <Footer />
              <DeferredWidgets />
            </LenisProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
