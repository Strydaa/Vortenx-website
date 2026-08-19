'use client';

import { useInView, useMotionValue, useSpring, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

type Props = {
  to: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  locale?: string;
  className?: string;
};

/** Görünüme girince 0'dan hedefe sayan rakam. */
export function CountUp({
  to,
  suffix = '',
  prefix = '',
  decimals = 0,
  locale = 'tr-TR',
  className,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' });
  const reduced = useReducedMotion();

  const value = useMotionValue(0);
  const spring = useSpring(value, { stiffness: 60, damping: 20, mass: 0.8 });
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (inView) value.set(to);
  }, [inView, to, value]);

  useEffect(() => spring.on('change', (v) => setShown(v)), [spring]);

  const display = reduced || !inView ? (reduced ? to : 0) : shown;

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toLocaleString(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
