'use client';

import { useTranslations } from 'next-intl';
import { Marquee } from '@/components/motion/marquee';

/**
 * Gerçek müşteriler (bkz. /cases). Gerçek logolar geldiğinde bu diziyi
 * <Image src="/images/logos/..."/> ile değiştir.
 */
// Şerit çok az öğeyle boş görünmesin diye aynı iki gerçek müşteri tekrarlanıyor.
const clients = ['RMD KİMYA', 'ALESTATRADE', 'RMD KİMYA', 'ALESTATRADE', 'RMD KİMYA', 'ALESTATRADE'];

export function LogoMarquee() {
  const t = useTranslations('home.logos');

  return (
    <section className="border-t border-rule py-10 md:py-12">
      <p className="label shell mb-7">{t('eyebrow')}</p>

      <Marquee duration={38}>
        {clients.map((name, i) => (
          <span
            key={`${name}-${i}`}
            className="whitespace-nowrap px-8 font-mono text-sm uppercase tracking-[0.2em] text-muted transition-colors duration-500 hover:text-ink md:px-12 md:text-base"
          >
            {name}
          </span>
        ))}
      </Marquee>
    </section>
  );
}
