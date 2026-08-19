'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, useReducedMotion, useSpring, useTransform, type SpringOptions } from 'motion/react';
import { cn } from '@/lib/utils';

type SpotlightProps = {
  className?: string;
  /** Işık dairesinin çapı (px). */
  size?: number;
  /** Merkez rengi. Varsayılan: tema sinyal rengi (vermilyon). */
  fill?: string;
  springOptions?: SpringOptions;
};

/**
 * İmleci takip eden yumuşak ışık dairesi. Kendisini saran elemanın
 * içinde konumlanır — o eleman `relative overflow-hidden` olmalı.
 *
 * ibelick/spotlight'tan uyarlandı, üç değişiklikle:
 *  1. `framer-motion` yerine `motion/react` (projede zaten kurulu olan paket).
 *  2. Parent'ı `useEffect` yerine ref callback ile yakalıyoruz —
 *     `react-hooks/set-state-in-effect` kuralı bu projede build'i durduruyor.
 *  3. Dinleyiciler adlandırılmış fonksiyonlarla kaldırılıyor; orijinalde
 *     `removeEventListener`'a yeni arrow function veriliyordu, yani
 *     mouseenter/mouseleave hiçbir zaman temizlenmiyordu.
 */
export function Spotlight({
  className,
  size = 200,
  fill = 'var(--signal)',
  springOptions = { bounce: 0 },
}: SpotlightProps) {
  const reduce = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const [parentElement, setParentElement] = useState<HTMLElement | null>(null);

  const mouseX = useSpring(0, springOptions);
  const mouseY = useSpring(0, springOptions);

  const spotlightLeft = useTransform(mouseX, (x) => `${x - size / 2}px`);
  const spotlightTop = useTransform(mouseY, (y) => `${y - size / 2}px`);

  // Ref callback commit sırasında çalışır; effect değil, dolayısıyla
  // setState burada serbest.
  const captureParent = useCallback((node: HTMLDivElement | null) => {
    setParentElement(node?.parentElement ?? null);
  }, []);

  useEffect(() => {
    if (!parentElement || reduce) return;

    const handleMove = (event: MouseEvent) => {
      const { left, top } = parentElement.getBoundingClientRect();
      mouseX.set(event.clientX - left);
      mouseY.set(event.clientY - top);
    };
    const handleEnter = () => setIsHovered(true);
    const handleLeave = () => setIsHovered(false);

    parentElement.addEventListener('mousemove', handleMove);
    parentElement.addEventListener('mouseenter', handleEnter);
    parentElement.addEventListener('mouseleave', handleLeave);

    return () => {
      parentElement.removeEventListener('mousemove', handleMove);
      parentElement.removeEventListener('mouseenter', handleEnter);
      parentElement.removeEventListener('mouseleave', handleLeave);
    };
  }, [parentElement, reduce, mouseX, mouseY]);

  // Hareket azaltma tercihinde imleç takibi yapılmaz.
  if (reduce) return null;

  return (
    <motion.div
      ref={captureParent}
      aria-hidden
      className={cn(
        'pointer-events-none absolute rounded-full blur-xl transition-opacity duration-300',
        isHovered ? 'opacity-100' : 'opacity-0',
        className,
      )}
      style={{
        width: size,
        height: size,
        left: spotlightLeft,
        top: spotlightTop,
        background: `radial-gradient(circle at center, ${fill}, transparent 80%)`,
      }}
    />
  );
}
