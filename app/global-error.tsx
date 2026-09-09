'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

/**
 * Root layout'un kendisi çökerse devreye girer — next-intl provider'a,
 * globals.css'e ya da başka hiçbir app/ altyapısına erişemez, bu yüzden
 * kendi <html>/<body>'sini ve inline stillerini tanımlamak zorunda
 * (Next.js'in dokümante ettiği standart pattern).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="tr">
      <body
        style={{
          margin: 0,
          minHeight: '100svh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          background: '#0a0a0a',
          color: '#f2efe7',
        }}
      >
        <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '28rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
            Bir şeyler ters gitti
          </h1>
          <p style={{ marginTop: '1rem', lineHeight: 1.6, color: '#a8a29a' }}>
            Beklenmedik bir hata oluştu. Sayfayı yeniden yüklemeyi deneyin.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: '2rem',
              padding: '0.75rem 1.5rem',
              background: '#ff5426',
              color: '#0a0a0a',
              border: 'none',
              borderRadius: '2px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Tekrar dene
          </button>
        </div>
      </body>
    </html>
  );
}
