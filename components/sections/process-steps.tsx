'use client';

import { useTranslations } from 'next-intl';
import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react';
import { useRef } from 'react';
import { Section, SectionHeader } from '@/components/ui/section';
import { Reveal } from '@/components/motion/reveal';

type Step = { step: string; title: string; body: string; meta: string };

export function ProcessSteps({ namespace = 'home.process' }: { namespace?: string }) {
  const t = useTranslations(namespace);
  const items = t.raw('items') as Step[];
  const listRef = useRef<HTMLOListElement>(null);
  const reduced = useReducedMotion();

  // Liste ekrandan geçerken dikey çizgi yukarıdan aşağı dolar
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ['start 75%', 'end 55%'],
  });
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001,
  });

  return (
    <Section id="process">
      <div className="shell">
        <SectionHeader
          index={t('index')}
          eyebrow={t('eyebrow')}
          title={t('title')}
          description={t('description')}
        />

        <ol ref={listRef} className="relative ml-[1.1rem] md:ml-0">
          {/* Ray */}
          <span
            aria-hidden
            className="absolute bottom-0 left-0 top-0 w-px bg-rule md:left-[7.5rem]"
          />
          {/* Dolan kısım */}
          <motion.span
            aria-hidden
            style={reduced ? { scaleY: 1 } : { scaleY }}
            className="absolute bottom-0 left-0 top-0 w-px origin-top bg-signal md:left-[7.5rem]"
          />

          {items.map((item, i) => (
            <li key={item.step} className="relative pb-14 last:pb-0">
              <Reveal delay={i * 0.06} from="left" distance={20}>
                <div className="grid gap-x-10 gap-y-3 pl-8 md:grid-cols-[7.5rem_1fr] md:pl-0">
                  {/* Adım numarası — çizginin solunda */}
                  <div className="md:pr-10 md:text-right">
                    <span className="font-display text-3xl font-extrabold leading-none tracking-[-0.04em] text-signal md:text-4xl">
                      {item.step}
                    </span>
                    <p className="label mt-2">{item.meta}</p>
                  </div>

                  {/* Çizgi üstündeki nokta */}
                  <span
                    aria-hidden
                    className="absolute left-0 top-[0.55rem] h-2 w-2 -translate-x-1/2 rounded-full bg-signal md:left-[7.5rem]"
                  />

                  <div className="md:pl-10">
                    <h3 className="font-display text-2xl font-bold tracking-[-0.03em] md:text-3xl">
                      {item.title}
                    </h3>
                    <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
                      {item.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
