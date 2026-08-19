'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { locales } from '@/i18n/routing';
import { cn } from '@/lib/utils';

/**
 * TR | EN geçişi. Mevcut yolu koruyarak diğer locale'e geçer:
 * /tr/systems -> /en/systems
 */
export function LangSwitcher({ className }: { className?: string }) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function switchTo(next: string) {
    if (next === locale) return;
    startTransition(() => {
      // params, dinamik segmentli sayfalarda ([slug] gibi) yolu doğru kurmak için gerekli
      router.replace(
        // @ts-expect-error -- pathname ve params birlikte tip olarak eşleşmiyor
        { pathname, params },
        { locale: next, scroll: false },
      );
    });
  }

  return (
    <div
      className={cn(
        'flex items-center font-mono text-[0.68rem] uppercase tracking-[0.12em]',
        pending && 'opacity-50',
        className,
      )}
      role="group"
      aria-label={t('switchLanguage')}
    >
      {locales.map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && <span className="mx-1.5 text-rule">/</span>}
          <button
            type="button"
            onClick={() => switchTo(l)}
            aria-current={l === locale ? 'true' : undefined}
            className={cn(
              'transition-colors duration-300 hover:text-signal',
              l === locale ? 'text-ink' : 'text-muted',
            )}
          >
            {l}
          </button>
        </span>
      ))}
    </div>
  );
}
