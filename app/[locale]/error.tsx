'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import * as Sentry from '@sentry/nextjs';
import { Button, ButtonLink } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('error');

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <section className="relative flex min-h-[70svh] items-center overflow-hidden py-32">
      <div className="bg-grid absolute inset-0 -z-10" aria-hidden />
      <div className="shell text-center">
        <h1 className="display-md font-display font-extrabold">{t('title')}</h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-muted">
          {t('body')}
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" onClick={reset}>
            {t('retry')}
          </Button>
          <ButtonLink href="/" variant="outline" size="lg">
            {t('home')}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
