'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { siteConfig } from '@/lib/site-config';
import { Marquee } from '@/components/motion/marquee';

export function Footer() {
  const t = useTranslations('footer');
  const nav = useTranslations('nav');
  const industriesT = useTranslations('industries');
  const year = new Date().getFullYear();

  const industries = industriesT.raw('list.items') as { code: string; name: string }[];

  const social = [
    { label: 'LinkedIn', href: siteConfig.social.linkedin },
    { label: 'X', href: siteConfig.social.x },
    { label: 'Instagram', href: siteConfig.social.instagram },
    { label: 'GitHub', href: siteConfig.social.github },
  ];

  return (
    <footer className="relative border-t border-rule bg-surface">
      {/* Dev marka şeridi */}
      <div className="border-b border-rule py-6">
        <Marquee duration={34}>
          <span
            className="font-display text-[clamp(2.5rem,7vw,5.5rem)] font-extrabold tracking-[-0.05em] text-ink/[0.07]"
            aria-hidden
          >
            NEXTFLOW · OTOMASYON · AI SYSTEMS · WEB · NEXTFLOW · AUTOMATION ·&nbsp;
          </span>
        </Marquee>
      </div>

      <div className="shell py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="font-display text-xl font-extrabold tracking-[-0.04em]">
              NextFlow
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              {t('tagline')}
            </p>
            <div className="label mt-6 flex items-center gap-2">
              <span className="live-dot" aria-hidden />
              <span>{siteConfig.offices.map((o) => o.city).join(' · ')}</span>
            </div>
          </div>

          <div className="md:col-span-8 grid grid-cols-2 gap-8 lg:grid-cols-4">
            <FooterCol title={t('servicesTitle')}>
              <FooterLink href="/advisory">{nav('advisory')}</FooterLink>
              <FooterLink href="/systems">{nav('systems')}</FooterLink>
              <FooterLink href="/programs">{nav('programs')}</FooterLink>
              <FooterLink href="/kurum-ici">{nav('kurumIci')}</FooterLink>
              <FooterLink href="/cases">{nav('cases')}</FooterLink>
            </FooterCol>

            <FooterCol title={t('industriesTitle')}>
              {industries.slice(0, 5).map((item) => (
                <FooterLink key={item.code} href={`/industries#i-${item.code}`}>
                  {item.name}
                </FooterLink>
              ))}
              <FooterLink href="/industries">{nav('industries')} →</FooterLink>
            </FooterCol>

            <FooterCol title={t('companyTitle')}>
              <FooterLink href="/about">{nav('about')}</FooterLink>
              <FooterLink href="/blog">{nav('blog')}</FooterLink>
              <FooterLink href="/contact">{nav('contact')}</FooterLink>
            </FooterCol>

            <FooterCol title={t('socialTitle')}>
              {social.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="link-underline text-sm text-muted transition-colors duration-300 hover:text-ink"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </FooterCol>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-rule pt-8 sm:flex-row sm:items-center">
          <p className="label">
            © {year} NextFlow. {t('rights')}
          </p>
          <div className="label flex items-center gap-6">
            <a
              href={`mailto:${siteConfig.email}`}
              className="transition-colors duration-300 hover:text-signal"
            >
              {siteConfig.email}
            </a>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="transition-colors duration-300 hover:text-signal"
            >
              {t('backToTop')} ↑
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="label mb-4">{title}</h3>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="link-underline text-sm text-muted transition-colors duration-300 hover:text-ink"
      >
        {children}
      </Link>
    </li>
  );
}
