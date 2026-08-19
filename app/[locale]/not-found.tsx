import { useTranslations } from 'next-intl';
import { ButtonLink } from '@/components/ui/button';

export default function NotFound() {
  const t = useTranslations('notFound');

  return (
    <section className="relative flex min-h-[70svh] items-center overflow-hidden py-32">
      <div className="bg-grid absolute inset-0 -z-10" aria-hidden />
      <div className="shell text-center">
        <p className="font-display text-[clamp(5rem,18vw,12rem)] font-extrabold leading-none tracking-[-0.06em] text-signal">
          404
        </p>
        <h1 className="display-md mt-6 font-display font-extrabold">
          {t('title')}
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-muted">
          {t('body')}
        </p>
        <div className="mt-10">
          <ButtonLink href="/" size="lg" arrow>
            {t('cta')}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
