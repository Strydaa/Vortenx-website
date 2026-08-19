import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site-config';
import { locales } from '@/i18n/routing';

const paths = [
  '',
  '/advisory',
  '/systems',
  '/programs',
  '/kurum-ici',
  '/kurum-ici/ai-okur-yazarligi',
  '/kurum-ici/sirket-doktoru',
  '/kurum-ici/sunumlar',
  '/cases',
  '/industries',
  '/blog',
  '/about',
  '/contact',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return locales.flatMap((locale) =>
    paths.map((path) => ({
      url: `${siteConfig.url}/${locale}${path}`,
      lastModified: now,
      changeFrequency: path === '' ? ('weekly' as const) : ('monthly' as const),
      priority: path === '' ? 1 : 0.7,
      // Her URL için diğer dildeki karşılığını bildir
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${siteConfig.url}/${l}${path}`]),
        ),
      },
    })),
  );
}
