import type { ComponentProps, ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

type Variant = 'solid' | 'outline' | 'ghost';
type Size = 'md' | 'lg';

const base =
  'group relative inline-flex items-center justify-center gap-2.5 font-mono text-[0.72rem] uppercase tracking-[0.14em] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] disabled:opacity-45 disabled:pointer-events-none';

const sizes: Record<Size, string> = {
  md: 'h-11 px-5',
  lg: 'h-14 px-7 text-[0.78rem]',
};

const variants: Record<Variant, string> = {
  solid:
    'bg-ink text-paper hover:bg-signal hover:text-[color:var(--signal-ink)]',
  outline:
    'border border-ink/25 text-ink hover:border-signal hover:text-signal',
  ghost: 'text-ink hover:text-signal',
};

function Arrow() {
  return (
    <span
      aria-hidden
      className="inline-block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
    >
      →
    </span>
  );
}

type CommonProps = {
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  className?: string;
  children: ReactNode;
};

export function Button({
  variant = 'solid',
  size = 'md',
  arrow = false,
  className,
  children,
  ...props
}: CommonProps & ComponentProps<'button'>) {
  return (
    <button className={cn(base, sizes[size], variants[variant], className)} {...props}>
      {children}
      {arrow && <Arrow />}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = 'solid',
  size = 'md',
  arrow = false,
  className,
  children,
  external,
}: CommonProps & { href: string; external?: boolean }) {
  const classes = cn(base, sizes[size], variants[variant], className);

  if (external) {
    return (
      <a href={href} className={classes} target="_blank" rel="noreferrer noopener">
        {children}
        {arrow && <Arrow />}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
      {arrow && <Arrow />}
    </Link>
  );
}
