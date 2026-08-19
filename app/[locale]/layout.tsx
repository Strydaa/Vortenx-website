import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { AuraBackground } from '@/components/ui/aura-background';

import { routing } from '@/i18n/routing';
import { fontVariables } from '@/lib/fonts';
import { siteConfig } from '@/lib/site-config';

import { ThemeProvider } from '@/components/layout/theme-provider';
import { LenisProvider } from '@/components/layout/lenis-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ScrollProgress } from '@/components/motion/scroll-progress';
import { ChatWidget } from '@/components/chat/chat-widget';
import { IntroOverlay } from '@/components/layout/intro-overlay';

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
    icons: { icon: '/favicon.svg' },
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

  return (
    <html lang={locale} suppressHydrationWarning className={fontVariables}>
      <body className="grain antialiased">
        {/* Site geneli düşük yoğunluklu atmosfer katmanı. Animasyonlu hero'ların
            arkasında (-z-10, opak) kaybolur; sadece düz içerik bölümlerinde görünür. */}
        <AuraBackground ambient className="fixed inset-0 -z-20" />
        <script dangerouslySetInnerHTML={{ __html: INTRO_SESSION_SCRIPT }} />
        <ThemeProvider>
          <NextIntlClientProvider>
            <LenisProvider>
              {/* Açılış ekranı. Kaldırmak için bu satırı silmek yeterli. */}
              <IntroOverlay />
              <ScrollProgress />
              <Header />
              <main id="content">{children}</main>
              <Footer />
              <ChatWidget />
            </LenisProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
