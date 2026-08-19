import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Reveal } from '@/components/motion/reveal';

/** Bölüm sarmalayıcı — üstte kılcal çizgi, dikey ritim. */
export function Section({
  children,
  className,
  id,
  rule = true,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  rule?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(
        'relative py-20 md:py-28 lg:py-36',
        rule && 'border-t border-rule',
        className,
      )}
    >
      {children}
    </section>
  );
}

/** Mono numara + başlık: "01 / Hizmetler" */
export function SectionHeader({
  index,
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}: {
  index?: string;
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mb-14 md:mb-20',
        align === 'center' && 'mx-auto max-w-2xl text-center',
        className,
      )}
    >
      <Reveal>
        <div
          className={cn(
            'label mb-6 flex items-center gap-3',
            align === 'center' && 'justify-center',
          )}
        >
          {index && (
            <>
              <span className="text-signal">{index}</span>
              <span className="h-px w-8 bg-rule" />
            </>
          )}
          <span>{eyebrow}</span>
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <h2 className="display-lg max-w-3xl">{title}</h2>
      </Reveal>

      {description && (
        <Reveal delay={0.16}>
          <p
            className={cn(
              'mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg',
              align === 'center' && 'mx-auto',
            )}
          >
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
