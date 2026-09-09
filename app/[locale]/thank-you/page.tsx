import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';

import { routing } from '@/i18n/routing';
import { ButtonLink } from '@/components/ui/button';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.thankYou' });
  return {
    title: t('title'),
    description: t('description'),
    robots: { index: false, follow: false },
  };
}

export default async function ThankYouPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ThankYouContent />;
}

function ThankYouContent() {
  const t = useTranslations('thankYou');

  return (
    <section className="relative flex min-h-[70svh] items-center overflow-hidden py-32">
      <div className="bg-grid absolute inset-0 -z-10" aria-hidden />
      <div className="shell text-center">
        <span className="live-dot" aria-hidden />
        <h1 className="display-md mt-6 font-display font-extrabold">
          {t('title')}
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-muted">
          {t('body')}
        </p>
        <div className="mt-10">
          <ButtonLink href="/" size="lg" arrow>
            {t('cta')}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
