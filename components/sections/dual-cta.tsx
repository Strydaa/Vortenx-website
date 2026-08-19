'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Section } from '@/components/ui/section';
import { Reveal } from '@/components/motion/reveal';
import { TextReveal } from '@/components/motion/text-reveal';

type Option = {
  tag: string;
  title: string;
  body: string;
  href: string;
  cta: string;
};

export function DualCta() {
  const t = useTranslations('home.cta');
  const options = t.raw('options') as Option[];

  return (
    <Section id="cta" className="relative overflow-hidden">
      <div className="bg-dots absolute inset-0 -z-10 opacity-60" aria-hidden />

      <div className="shell">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="label mb-6">{t('eyebrow')}</p>
          </Reveal>

          <TextReveal
            as="h2"
            text={t('title')}
            className="display-lg font-display font-extrabold"
          />

          <Reveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-muted md:text-lg">
              {t('description')}
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-2">
          {options.map((option, i) => (
            <Reveal key={option.tag} delay={0.1 + i * 0.09}>
              <Link
                href={option.href}
                className="card group flex h-full flex-col p-8 transition-colors duration-500 hover:border-signal/50 md:p-10"
              >
                <span className="label text-signal">{option.tag}</span>

                <h3 className="mt-6 font-display text-2xl font-bold tracking-[-0.03em] md:text-3xl">
                  {option.title}
                </h3>

                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">
                  {option.body}
                </p>

                <span className="mt-9 inline-flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.14em] transition-colors duration-400 group-hover:text-signal">
                  {option.cta}
                  <span
                    aria-hidden
                    className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5"
                  >
                    →
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.28}>
          <p className="mt-12 text-center font-mono text-[0.72rem] uppercase tracking-[0.13em] text-muted">
            {t('contactPrompt')}{' '}
            <Link
              href="/contact"
              className="link-underline text-ink transition-colors duration-300 hover:text-signal"
            >
              {t('contactCta')}
            </Link>
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
