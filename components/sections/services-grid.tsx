'use client';

import { useTranslations } from 'next-intl';
import { Section, SectionHeader } from '@/components/ui/section';
import { RevealGroup, RevealItem } from '@/components/motion/reveal';
import { cn } from '@/lib/utils';

type Service = { title: string; body: string };

export function ServicesGrid() {
  const t = useTranslations('home.services');
  const items = t.raw('items') as Service[];

  return (
    <Section id="services">
      <div className="shell">
        <SectionHeader
          index={t('index')}
          eyebrow={t('eyebrow')}
          title={t('title')}
          description={t('description')}
        />

        <RevealGroup
          stagger={0.05}
          className="grid border-l border-t border-rule sm:grid-cols-2 lg:grid-cols-4"
        >
          {items.map((service, i) => (
            <RevealItem
              key={service.title}
              className={cn(
                'group relative border-b border-r border-rule p-7 transition-colors duration-500 hover:bg-surface md:p-8',
                // İlk kart iki kolon kaplasın — bento ritmi
                i === 0 && 'lg:col-span-2',
              )}
            >
              <span className="label text-signal">
                {String(i + 1).padStart(2, '0')}
              </span>

              <h3 className="mt-6 font-display text-xl font-bold tracking-[-0.03em] md:text-2xl">
                {service.title}
              </h3>

              <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
                {service.body}
              </p>

              {/* Alt kenarda hover'da soldan sağa çizilen vurgu */}
              <span
                aria-hidden
                className="absolute bottom-0 left-0 h-px w-0 bg-signal transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full"
              />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </Section>
  );
}
