import { cn } from '@/lib/utils';

/*
 * "Crimson Veil" aura — katmanlı mix-blend-mode gradyanlarıyla atmosferik
 * arka plan. Statik (canvas/WebGL yok, requestAnimationFrame yok) — bu
 * yüzden "animasyonlu olmayan yerler" için uygun, GPU/CPU maliyeti sıfıra
 * yakın.
 *
 * Taban rengi ayrı bir global `body` kuralı yerine bileşenin kendi ilk
 * katmanı: sitenin `--paper` token'ı zaten koyu temada spesifikasyondaki
 * `#100e0b`'ye neredeyse birebir (`#0c0b0a`), açık temada `#f2efe7`. Blend
 * modu temaya göre değişiyor — spesifikasyonun kendi dönüşüm tablosu:
 * koyu temada hard-light/soft-light, açık temada ikisi de multiply
 * (aksi halde açık zeminde renk "yıkanıp" kayboluyor).
 */

const GRADIENT =
  'linear-gradient(rgba(0,0,0,0) 0%, rgba(220,38,38,0.9) 40%, rgb(255,255,255) 70%, rgb(251,146,60) 82%, rgb(250,204,21) 100%)';

type Props = {
  className?: string;
  /** Site geneli düşük yoğunluklu atmosfer modu — hero'daki tam güç yerine. */
  ambient?: boolean;
};

export function AuraBackground({ className, ambient = false }: Props) {
  return (
    <div
      className={cn('relative h-full w-full overflow-hidden bg-paper', className)}
      aria-hidden
    >
      <div
        className={cn(
          'absolute inset-0 mix-blend-multiply dark:mix-blend-hard-light',
          'blur-[63px] md:blur-[90px]',
          'pointer-events-none [transform:translateZ(0)] [will-change:transform]',
        )}
        style={{ background: GRADIENT, opacity: ambient ? 0.15 : 0.6 }}
      />
      <div
        className={cn(
          'absolute inset-0 mix-blend-multiply dark:mix-blend-soft-light',
          'blur-[88px] md:blur-[126px]',
          'pointer-events-none [transform:translateZ(0)] [will-change:transform]',
        )}
        style={{ background: GRADIENT, opacity: ambient ? 0.22 : 0.9 }}
      />
    </div>
  );
}

export default AuraBackground;
