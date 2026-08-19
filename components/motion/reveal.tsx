'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  /** Sıralı görünme için gecikme (saniye) */
  delay?: number;
  /** Nereden gelsin */
  from?: 'bottom' | 'left' | 'right' | 'none';
  distance?: number;
  className?: string;
  as?: 'div' | 'section' | 'li' | 'span' | 'article';
};

const offsets = {
  bottom: (d: number) => ({ y: d, x: 0 }),
  left: (d: number) => ({ x: -d, y: 0 }),
  right: (d: number) => ({ x: d, y: 0 }),
  none: () => ({ x: 0, y: 0 }),
};

export function Reveal({
  children,
  delay = 0,
  from = 'bottom',
  distance = 28,
  className,
  as = 'div',
}: Props) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as];
  const offset = offsets[from](distance);

  if (reduced) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </MotionTag>
  );
}

/** Çocuklarını sırayla açan kapsayıcı. Çocuklar <RevealItem> olmalı. */
export function RevealGroup({
  children,
  className,
  stagger = 0.06,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 24 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
