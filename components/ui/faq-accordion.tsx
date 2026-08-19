'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export type FaqItem = { q: string; a: string };

/**
 * Klavye erişilebilir SSS akordeonu.
 * <button> + aria-expanded kullanır; details/summary yerine tercih edildi
 * çünkü açılma animasyonu kontrol edilebiliyor.
 */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const reduced = useReducedMotion();

  return (
    <div className="border-t border-rule">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="border-b border-rule">
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                id={`faq-trigger-${i}`}
                className="flex w-full items-start justify-between gap-6 py-5 text-left transition-colors duration-300 hover:text-signal"
              >
                <span className="font-display text-lg font-bold tracking-[-0.025em] md:text-xl">
                  {item.q}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    'relative mt-1.5 grid h-4 w-4 shrink-0 place-items-center transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
                    isOpen && 'rotate-45',
                  )}
                >
                  <span className="absolute h-px w-full bg-current" />
                  <span className="absolute h-full w-px bg-current" />
                </span>
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`faq-trigger-${i}`}
                  initial={reduced ? false : { height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-6 pr-10 text-sm leading-relaxed text-muted md:text-base">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
