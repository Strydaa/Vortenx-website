'use client';

import { useTranslations } from 'next-intl';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { useEffect, useState } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { navLinks } from '@/lib/site-config';
import { cn } from '@/lib/utils';
import { LangSwitcher } from './lang-switcher';
import { ThemeToggle } from './theme-toggle';

/*
 * Hero'su her iki temada da koyu kalan rotalar. Header sayfanın en üstündeyken
 * şeffaf duruyor ve `text-ink` kullanıyor; açık temada bu koyu mürekkep demek,
 * yani koyu hero'nun üstünde logo ve menü okunmaz oluyor. Bu rotalarda header
 * `.tone-dark` alıyor — sayfa kaydırılıp arkasına kağıt rengi geldiğinde
 * otomatik olarak normale dönüyor.
 *
 * İletişim sayfası listede yok: hero'su hâlâ açık kağıt zeminde.
 */
const DARK_HERO_ROUTES = [
  '/', // ay sahnesi
  '/advisory', // LightSpeed shader
  '/systems', // Vortex
  '/programs', // Vortex
  '/kurum-ici', // Vortex
  '/industries', // Forge robot
  '/cases',
  '/blog',
  '/about',
];

export function Header() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 24));

  // Rota değişince menüyü kapat.
  // React'in "prop değişince state'i render sırasında düzelt" deseni —
  // useEffect içinde setState çağırmaktan daha ucuz, ekstra render turu yok.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  // Menü açıkken arka planın kaymasını engelle
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
          scrolled
            ? 'border-b border-rule backdrop-blur-xl'
            : 'border-b border-transparent',
          !scrolled && DARK_HERO_ROUTES.includes(pathname) && 'tone-dark',
        )}
        style={
          scrolled
            ? { backgroundColor: 'color-mix(in srgb, var(--paper) 72%, transparent)' }
            : undefined
        }
      >
        <div
          className={cn(
            'shell flex items-center justify-between transition-all duration-500',
            scrolled ? 'h-14' : 'h-20',
          )}
        >
          <Link href="/" className="group flex items-center gap-2.5" aria-label="NextFlow">
            <Logomark />
            <span className="font-display text-[1.05rem] font-extrabold tracking-[-0.04em]">
              NextFlow
            </span>
          </Link>

          {/* Masaüstü navigasyon. 7 öğe lg'de sığmıyor — xl'e kadar mobil menü açık kalıyor. */}
          <nav className="hidden items-center gap-5 xl:flex xl:gap-7" aria-label="Primary">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.key}
                  href={link.href}
                  className={cn(
                    'link-underline font-mono text-[0.72rem] uppercase tracking-[0.13em] transition-colors duration-300',
                    active ? 'text-signal' : 'text-ink/80 hover:text-ink',
                  )}
                >
                  {t(link.key)}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 md:gap-4">
            <LangSwitcher className="hidden sm:flex" />
            <span className="hidden h-4 w-px bg-rule sm:block" />
            <ThemeToggle />

            <Link
              href="/contact"
              className="hidden h-9 items-center bg-ink px-4 font-mono text-[0.68rem] uppercase tracking-[0.13em] text-paper transition-colors duration-400 hover:bg-signal hover:text-[color:var(--signal-ink)] xl:inline-flex"
            >
              {t('cta')}
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? t('closeMenu') : t('openMenu')}
              className="relative grid h-9 w-9 place-items-center xl:hidden"
            >
              <span
                className={cn(
                  'absolute h-px w-5 bg-ink transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]',
                  open ? 'rotate-45' : '-translate-y-1',
                )}
              />
              <span
                className={cn(
                  'absolute h-px w-5 bg-ink transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]',
                  open ? '-rotate-45' : 'translate-y-1',
                )}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobil menü */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-paper xl:hidden"
          >
            <div className="bg-grid absolute inset-0" aria-hidden />
            <nav
              className="shell relative flex h-full flex-col justify-center gap-1 pb-16"
              aria-label="Mobile"
            >
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.key}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.06 + i * 0.06,
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <Link
                    href={link.href}
                    className="flex items-baseline gap-4 border-b border-rule py-3.5"
                  >
                    <span className="label text-signal">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="display-md font-display">{t(link.key)}</span>
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="mt-8 flex items-center justify-between"
              >
                <Link
                  href="/contact"
                  className="inline-flex h-12 items-center bg-ink px-6 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-paper"
                >
                  {t('cta')} →
                </Link>
                <LangSwitcher />
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Logomark() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <rect x="0.75" y="0.75" width="22.5" height="22.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M6 17V7l12 10V7"
        stroke="var(--signal)"
        strokeWidth="2"
        strokeLinecap="square"
      />
    </svg>
  );
}
