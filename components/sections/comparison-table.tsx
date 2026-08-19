'use client';

import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'motion/react';
import { Section, SectionHeader } from '@/components/ui/section';
import { cn } from '@/lib/utils';

type Row = { criterion: string; values: boolean[] };

export function ComparisonTable() {
  const t = useTranslations('home.comparison');
  const reduced = useReducedMotion();
  const columns = t.raw('columns') as string[];
  const rows = t.raw('rows') as Row[];

  return (
    <Section id="comparison">
      <div className="shell">
        <SectionHeader
          index={t('index')}
          eyebrow={t('eyebrow')}
          title={t('title')}
          description={t('description')}
        />

        {/* Dar ekranda tablo kendi içinde kayar — sayfa yatay taşmaz */}
        <div className="-mx-5 overflow-x-auto px-5 md:mx-0 md:px-0">
          <table className="w-full min-w-[46rem] border-collapse text-left">
            <caption className="sr-only">{t('title')}</caption>
            <thead>
              <tr className="border-b border-rule">
                <th scope="col" className="label w-[30%] pb-4 pr-4 font-normal">
                  {t('eyebrow')}
                </th>
                {columns.map((col, i) => (
                  <th
                    key={col}
                    scope="col"
                    className={cn(
                      'pb-4 pr-4 font-mono text-[0.7rem] uppercase tracking-[0.12em]',
                      i === 0 ? 'text-signal' : 'font-normal text-muted',
                    )}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, ri) => (
                <motion.tr
                  key={row.criterion}
                  className="border-b border-rule"
                  initial={reduced ? false : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '0px 0px -8% 0px' }}
                  transition={{
                    duration: 0.55,
                    delay: ri * 0.05,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <th
                    scope="row"
                    className="py-4 pr-4 text-sm font-normal leading-snug"
                  >
                    {row.criterion}
                  </th>
                  {row.values.map((value, ci) => (
                    <td
                      key={ci}
                      className={cn('py-4 pr-4', ci === 0 && 'bg-signal/[0.05]')}
                    >
                      <Mark value={value} highlight={ci === 0} />
                      <span className="sr-only">
                        {value ? t('yes') : t('no')}
                      </span>
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  );
}

function Mark({ value, highlight }: { value: boolean; highlight: boolean }) {
  if (!value) {
    return <span aria-hidden className="block h-px w-4 bg-rule" />;
  }
  return (
    <svg
      aria-hidden
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      className={highlight ? 'text-signal' : 'text-muted'}
    >
      <path
        d="M2.5 8.5l4 4 7-9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="square"
      />
    </svg>
  );
}
