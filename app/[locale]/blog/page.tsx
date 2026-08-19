import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { useLocale, useTranslations } from 'next-intl';

import { routing } from '@/i18n/routing';
import { PageHero } from '@/components/ui/page-hero';
import { Vortex } from '@/components/ui/vortex';
import { Section } from '@/components/ui/section';
import { RevealGroup, RevealItem } from '@/components/motion/reveal';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.blog' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}/blog`,
      languages: { tr: '/tr/blog', en: '/en/blog' },
    },
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <BlogContent />;
}

type Post = {
  title: string;
  excerpt: string;
  category: string;
  readTime: number;
  date: string;
};

function BlogContent() {
  const t = useTranslations('blog');
  const locale = useLocale();
  const posts = t.raw('items') as Post[];

  const fmt = new Intl.DateTimeFormat(locale === 'tr' ? 'tr-TR' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        lead={t('hero.lead')}
        tone="onDark"
        background={
          /* Blog: mor–indigo. */
          <Vortex baseHue={262} rangeHue={45} />
        }
      />

      <Section rule={false} className="pt-0">
        <div className="shell">
          <RevealGroup className="border-t border-rule">
            {posts.map((post) => (
              <RevealItem key={post.title}>
                {/* Yazı detay sayfaları henüz yok — kart şimdilik pasif.
                    Yazılar eklenince <Link href={`/blog/${slug}`}> ile sarmalanır. */}
                <article className="group grid gap-4 border-b border-rule py-8 md:grid-cols-12 md:items-baseline md:gap-6">
                  <div className="label md:col-span-2">
                    {post.category}
                    <span className="mt-1.5 block text-rule">
                      {fmt.format(new Date(post.date))}
                    </span>
                  </div>

                  <h2 className="font-display text-2xl font-bold tracking-[-0.03em] md:col-span-5 md:text-3xl">
                    {post.title}
                  </h2>

                  <p className="text-sm leading-relaxed text-muted md:col-span-4">
                    {post.excerpt}
                  </p>

                  <span className="label md:col-span-1 md:text-right">
                    {post.readTime} {t('readTime')}
                    <span className="mt-1.5 block text-signal">{t('soon')}</span>
                  </span>
                </article>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </Section>
    </>
  );
}
