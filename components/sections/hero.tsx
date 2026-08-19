'use client';

import { useTranslations } from 'next-intl';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import dynamic from 'next/dynamic';
import { useRef } from 'react';
import { TextReveal } from '@/components/motion/text-reveal';
import { Reveal } from '@/components/motion/reveal';
import { Magnetic } from '@/components/motion/magnetic';
import { ButtonLink } from '@/components/ui/button';
import { siteConfig } from '@/lib/site-config';

/*
 * three + @react-three/fiber + drei toplamda ~700 KB. Hero sayfanın ilk
 * ekranı olduğu için sunucuda hiç render edilmiyor (WebGL zaten tarayıcı
 * API'si) ve ana paketten ayrı bir chunk olarak, hidrasyondan sonra iniyor.
 */
const LunarGravity = dynamic(
  () => import('@/components/ui/lunar-gravity').then((m) => m.LunarGravity),
  { ssr: false },
);

export function Hero() {
  const t = useTranslations('home.hero');
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  // Scroll ettikçe hero içeriği hafifçe yukarı süzülür
  const y = useTransform(scrollYProgress, [0, 1], ['0%', reduced ? '0%' : '18%']);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, reduced ? 1 : 0]);

  return (
    <section
      ref={ref}
      className="tone-dark relative flex min-h-[92svh] items-end overflow-hidden bg-paper pb-14 pt-32 md:pb-20 md:pt-40"
    >
      {/*
        Dikkat: bu katmanların hiçbiri `-z-10` KULLANMIYOR. Section
        `position: relative` + `z-index: auto` olduğu için yığın bağlamı
        kurmuyor; negatif z-index'li çocuklar kök bağlamın negatif katmanına
        düşüyor ve section'ın kendi `bg-paper`'ı onların üstüne boyanıyor.
        Sıralama DOM sırasıyla, içerik de `z-10` ile en üstte.
      */}
      <div className="bg-grid absolute inset-0" aria-hidden />

      {/*
        Ay sahnesi. Sürüklenebilmesi gerektiği için `pointer-events-none`
        YOK — üstündeki metin katmanı geçirgen, tıklamalar buraya iniyor.
        Dokunmatikte devre dışı: OrbitControls tek parmak sürüklemeyi
        yakalıyor, o da hero'da sayfayı kaydırmayı imkânsız kılardı.
      */}
      {!reduced && (
        <div className="absolute inset-y-0 right-0 w-full opacity-65 lg:w-[72%] lg:opacity-100 [@media(pointer:coarse)]:pointer-events-none">
          <LunarGravity className="h-full w-full" />
        </div>
      )}

      {/* Metnin arkasını karartan perde — sahne soldan sağa açılıyor. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-paper via-paper/85 to-transparent lg:via-paper/55"
      />

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-paper to-transparent"
        aria-hidden
      />

      {/* Yavaş sürüklenen vurgu bulutu */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[18%] -top-[12%] h-[38rem] w-[38rem] rounded-full opacity-[0.16] blur-[110px]"
        style={{
          background:
            'radial-gradient(circle, var(--signal) 0%, transparent 68%)',
          animation: reduced ? undefined : 'drift 22s ease-in-out infinite',
        }}
      />

      {/*
        Sarmalayıcı tıklamaları geçiriyor, içindeki metin blokları kendi
        üstlerinde geri açıyor: boşluklara denk gelen sürüklemeler aya
        ulaşıyor, başlık seçilebilir ve butonlar tıklanabilir kalıyor.
      */}
      <motion.div
        style={{ y, opacity }}
        className="shell pointer-events-none relative z-10 w-full"
      >
        {/* Durum satırı */}
        <Reveal from="none">
          <div className="label pointer-events-auto mb-9 flex w-fit items-center gap-2.5">
            <span className="live-dot" aria-hidden />
            <span>{t('status')}</span>
          </div>
        </Reveal>

        <TextReveal
          as="h1"
          text={t('title')}
          className="display-xl font-display pointer-events-auto max-w-[15ch] font-extrabold"
        />

        <div className="mt-12 grid gap-10 border-t border-rule pt-9 md:grid-cols-12 md:items-start">
          <Reveal
            delay={0.35}
            className="pointer-events-auto md:col-span-6 lg:col-span-5"
          >
            <p className="text-lg leading-relaxed text-muted md:text-xl">
              {t('lead')}
            </p>
          </Reveal>

          <Reveal
            delay={0.45}
            className="pointer-events-auto flex flex-wrap items-center gap-3 md:col-span-6 md:justify-end lg:col-span-7"
          >
            <Magnetic>
              <ButtonLink href="/contact" size="lg" arrow>
                {t('ctaPrimary')}
              </ButtonLink>
            </Magnetic>
            <Magnetic strength={0.2}>
              <ButtonLink href="/systems" size="lg" variant="outline">
                {t('ctaSecondary')}
              </ButtonLink>
            </Magnetic>
          </Reveal>
        </div>

        {/* Konumlar + kaydırma ipucu */}
        <Reveal delay={0.55}>
          <div className="label pointer-events-auto mt-14 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              {siteConfig.offices.map((office) => (
                <span key={office.city}>
                  {office.city}
                  <span className="ml-2 text-rule">{office.coords}</span>
                </span>
              ))}
            </div>
            <span className="hidden items-center gap-2 md:flex">
              {t('scroll')}
              <motion.span
                aria-hidden
                animate={reduced ? undefined : { y: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                ↓
              </motion.span>
            </span>
          </div>
        </Reveal>
      </motion.div>
    </section>
  );
}
