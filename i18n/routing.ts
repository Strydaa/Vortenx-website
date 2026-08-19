import { defineRouting } from 'next-intl/routing';

export const locales = ['tr', 'en'] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: 'tr',
  // Her zaman /tr veya /en öneki kullan — leftflow.ai ile aynı URL yapısı.
  localePrefix: 'always',
  localeDetection: true,
});
