import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { withSentryConfig } from '@sentry/nextjs/config';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const CSP = [
  "default-src 'self'",
  // Next.js App Router, her sayfada RSC flight payload'ını inline <script> etiketleriyle
  // (self.__next_f.push(...)) enjekte ediyor; içerik her istekte değiştiği için sabit bir
  // SHA-256 hash ile allowlist'lenemiyor — script-src'ta unsafe-inline kaçınılmaz.
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://app.cal.com https://va.vercel-scripts.com",
  // Framer Motion (motion/react) ve scroll-bağlı bileşenler runtime'da inline style yazıyor — style-src'ta unsafe-inline kaçınılmaz.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.spline.design",
  "font-src 'self' data:",
  "connect-src 'self' https://*.spline.design https://app.cal.com https://va.vercel-scripts.com https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://*.ingest.de.sentry.io",
  "worker-src 'self' blob:",
  'frame-src https://app.cal.com https://cal.com',
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: CSP },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default withSentryConfig(withNextIntl(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  widenClientFileUpload: true,
});
