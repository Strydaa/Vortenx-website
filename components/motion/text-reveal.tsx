'use client';

import { motion, useReducedMotion } from 'motion/react';
import { Fragment } from 'react';

type Props = {
  text: string;
  className?: string;
  delay?: number;
  /** '\n' ile satır kırılabilir */
  as?: 'h1' | 'h2' | 'h3' | 'p';
};

/**
 * Kelime kelime aşağıdan yukarı açılan başlık.
 * Her kelime kendi overflow-hidden maskesinin içinden çıkar.
 */
export function TextReveal({ text, className, delay = 0, as = 'h2' }: Props) {
  const reduced = useReducedMotion();
  const Tag = as;

  if (reduced) {
    return (
      <Tag className={className}>
        {text.split('\n').map((line, i) => (
          <Fragment key={i}>
            {i > 0 && <br />}
            {line}
          </Fragment>
        ))}
      </Tag>
    );
  }

  const lines = text.split('\n');
  let wordIndex = 0;

  return (
    <Tag className={className}>
      {lines.map((line, li) => (
        <span key={li} className="block">
          {line.split(' ').map((word) => {
            const i = wordIndex++;
            return (
              <span
                key={`${li}-${i}`}
                className="inline-block overflow-hidden align-bottom pb-[0.12em]"
              >
                <motion.span
                  className="inline-block"
                  initial={{ y: '110%' }}
                  whileInView={{ y: '0%' }}
                  viewport={{ once: true, margin: '0px 0px -8% 0px' }}
                  transition={{
                    duration: 0.9,
                    delay: delay + i * 0.055,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {word}
                  {' '}
                </motion.span>
              </span>
            );
          })}
        </span>
      ))}
    </Tag>
  );
}
