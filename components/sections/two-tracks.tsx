'use client';

import { useTranslations } from 'next-intl';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'motion/react';
import { useRef } from 'react';
import { Link } from '@/i18n/navigation';
import { Section, SectionHeader } from '@/components/ui/section';
import { Reveal } from '@/components/motion/reveal';

type Track = {
  tag: string;
  title: string;
  body: string;
  meta: string;
  href: string;
  cta: string;
  points: string[];
};

export function TwoTracks({ namespace = 'home.tracks' }: { namespace?: string }) {
  const t = useTranslations(namespace);
  const items = t.raw('items') as Track[];

  return (
    <Section id="tracks">
      <div className="shell">
        <SectionHeader
          index={t('index')}
          eyebrow={t('eyebrow')}
          title={t('title')}
          description={t('description')}
        />

        <div className="grid gap-5 lg:grid-cols-2">
          {items.map((track, i) => (
            <Reveal key={track.tag} delay={i * 0.1}>
              <TrackCard track={track} />
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

function TrackCard({ track }: { track: Track }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // İmleç konumuna göre hafif 3B eğilme
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 140, damping: 20 });
  const sry = useSpring(ry, { stiffness: 140, damping: 20 });

  function onMove(e: React.PointerEvent) {
    if (reduced || e.pointerType !== 'mouse' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 6);
    rx.set(-py * 6);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
      style={
        reduced
          ? undefined
          : { rotateX: srx, rotateY: sry, transformPerspective: 1200 }
      }
      className="group h-full"
    >
      <Link
        href={track.href}
        className="card crosshair relative flex h-full flex-col overflow-hidden p-7 transition-colors duration-500 hover:border-signal/50 md:p-10"
      >
        {/* Hover'da beliren vurgu ışığı */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full opacity-0 blur-[70px] transition-opacity duration-700 group-hover:opacity-40"
          style={{
            background:
              'radial-gradient(circle, var(--signal) 0%, transparent 70%)',
          }}
        />

        <div className="relative flex items-center justify-between">
          <span className="label text-signal">{track.tag}</span>
          <span className="label">{track.meta}</span>
        </div>

        <h3 className="display-md relative mt-8 max-w-[16ch] font-display font-extrabold">
          {track.title}
        </h3>

        <p className="relative mt-5 max-w-md text-base leading-relaxed text-muted">
          {track.body}
        </p>

        <ul className="relative mt-8 grid grid-cols-2 gap-x-6 gap-y-2.5 border-t border-rule pt-6">
          {track.points.map((point) => (
            <li key={point} className="flex items-start gap-2 text-sm">
              <span aria-hidden className="mt-[0.35em] text-[0.6rem] text-signal">
                ◆
              </span>
              <span className="text-muted">{point}</span>
            </li>
          ))}
        </ul>

        <span className="relative mt-10 inline-flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.14em] transition-colors duration-400 group-hover:text-signal">
          {track.cta}
          <span
            aria-hidden
            className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5"
          >
            →
          </span>
        </span>
      </Link>
    </motion.div>
  );
}
