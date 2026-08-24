'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Section } from '@/components/ui/section';
import { Reveal } from '@/components/motion/reveal';
import { TextReveal } from '@/components/motion/text-reveal';

type TeamMember = { name: string; role: string; initials: string };

const AVATARS: Record<string, string> = {
  YD: '/founders/yusuf.png',
  MK: '/founders/mirhan.jpg',
};

export function FounderCard() {
  const t = useTranslations('home.founder');
  const team = t.raw('team') as TeamMember[];

  return (
    <Section id="founder" className="bg-surface">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <Reveal>
            <div className="label mb-6 flex items-center gap-3">
              <span className="text-signal">{t('index')}</span>
              <span className="h-px w-8 bg-rule" />
              <span>{t('eyebrow')}</span>
            </div>
          </Reveal>

          <TextReveal
            as="h2"
            text={t('title')}
            className="display-md font-display font-extrabold"
          />

          <Reveal delay={0.2}>
            <p className="mt-7 max-w-md text-base leading-relaxed text-muted">
              {t('bio')}
            </p>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <Reveal delay={0.15} from="right" distance={24}>
            <figure className="card crosshair p-8 md:p-12">
              <span
                aria-hidden
                className="block font-display text-6xl leading-none text-signal"
              >
                &ldquo;
              </span>

              <blockquote className="mt-4 font-display text-xl font-medium leading-snug tracking-[-0.02em] md:text-2xl">
                {t('quote')}
              </blockquote>

              <figcaption className="mt-10 grid gap-6 border-t border-rule pt-6 sm:grid-cols-2">
                {team.map((person) => (
                  <div key={person.name} className="flex items-center gap-4">
                    {AVATARS[person.initials] ? (
                      <span className="relative h-12 w-12 shrink-0 overflow-hidden border border-rule">
                        <Image
                          src={AVATARS[person.initials]}
                          alt={person.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </span>
                    ) : (
                      <span
                        aria-hidden
                        className="grid h-12 w-12 shrink-0 place-items-center border border-rule bg-paper font-mono text-sm"
                      >
                        {person.initials}
                      </span>
                    )}
                    <span>
                      <span className="block font-display text-base font-bold tracking-[-0.02em]">
                        {person.name}
                      </span>
                      <span className="label mt-0.5 block">{person.role}</span>
                    </span>
                  </div>
                ))}
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
