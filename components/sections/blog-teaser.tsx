'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Section, SectionHeader } from '@/components/ui/section';
import { RevealGroup, RevealItem, Reveal } from '@/components/motion/reveal';

type Post = {
  title: string;
  excerpt: string;
  category: string;
  readTime: number;
  date: string;
};

export function BlogTeaser() {
  const t = useTranslations('home.blog');
  const tb = useTranslations('blog');
  const locale = useLocale();
  const posts = tb.raw('items') as Post[];

  const fmt = new Intl.DateTimeFormat(locale === 'tr' ? 'tr-TR' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Section id="blog">
      <div className="shell">
        <SectionHeader
          index={t('index')}
          eyebrow={t('eyebrow')}
          title={t('title')}
        />

        <RevealGroup className="border-t border-rule">
          {posts.map((post) => (
            <RevealItem key={post.title}>
              <Link
                href="/blog"
                className="group grid gap-3 border-b border-rule py-7 transition-colors duration-500 hover:bg-surface md:grid-cols-12 md:items-baseline md:gap-6 md:px-4"
              >
                <span className="label md:col-span-2">{post.category}</span>

                <h3 className="font-display text-xl font-bold tracking-[-0.03em] transition-colors duration-400 group-hover:text-signal md:col-span-5 md:text-2xl">
                  {post.title}
                </h3>

                <p className="text-sm leading-relaxed text-muted md:col-span-4">
                  {post.excerpt}
                </p>

                <span className="label md:col-span-1 md:text-right">
                  {post.readTime} {t('readTime')}
                  <span className="mt-1 block text-rule">
                    {fmt.format(new Date(post.date))}
                  </span>
                </span>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal delay={0.15}>
          <Link
            href="/blog"
            className="link-underline mt-10 inline-flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.14em] transition-colors duration-300 hover:text-signal"
          >
            {t('cta')} <span aria-hidden>→</span>
          </Link>
        </Reveal>
      </div>
    </Section>
  );
}
