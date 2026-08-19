'use client';

import { useTranslations } from 'next-intl';
import { Marquee } from '@/components/motion/marquee';

/**
 * Müşteri logoları. Gerçek logolar geldiğinde bu diziyi
 * <Image src="/images/logos/..."/> ile değiştir.
 */
const clients = [
  'ATLASKARGO',
  'MERİDYEN',
  'FORMLAB',
  'KIVILCIM',
  'NORTHBOUND',
  'SERAMİKA',
  'BLOKZİNCİR',
  'YALIN OPS',
];

export function LogoMarquee() {
  const t = useTranslations('home.logos');

  return (
    <section className="border-t border-rule py-10 md:py-12">
      <p className="label shell mb-7">{t('eyebrow')}</p>

      <Marquee duration={38}>
        {clients.map((name) => (
          <span
            key={name}
            className="whitespace-nowrap px-8 font-mono text-sm uppercase tracking-[0.2em] text-muted transition-colors duration-500 hover:text-ink md:px-12 md:text-base"
          >
            {name}
          </span>
        ))}
      </Marquee>
    </section>
  );
}
