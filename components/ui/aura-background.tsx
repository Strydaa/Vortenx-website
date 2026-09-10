import { cn } from '@/lib/utils';

/*
 * "Crimson Veil" aura — katmanlı mix-blend-mode gradyanlarıyla atmosferik
 * arka plan. Statik (canvas/WebGL yok, requestAnimationFrame yok) — bu
 * yüzden "animasyonlu olmayan yerler" için uygun.
 *
 * Taban rengi ayrı bir global `body` kuralı yerine bileşenin kendi ilk
 * katmanı: sitenin `--paper` token'ı zaten koyu temada spesifikasyondaki
 * `#100e0b`'ye neredeyse birebir (`#0c0b0a`), açık temada `#f2efe7`. Blend
 * modu temaya göre değişiyor — spesifikasyonun kendi dönüşüm tablosu:
 * koyu temada hard-light/soft-light, açık temada ikisi de multiply
 * (aksi halde açık zeminde renk "yıkanıp" kayboluyor).
 *
 * İki gradyan katmanı (`public/images/aura-layer-1/2.webp`), aynı sabit
 * renk geçişinin `sharp` ile önceden blur uygulanmış (sigma 45/63, CSS'teki
 * eski blur-[90px]/blur-[126px] karşılığı) WebP çıktısı — canlı
 * `filter: blur(...)` her sayfada tam ekran boyutunda, her boyama turunda
 * yeniden hesaplanan pahalı bir işlemdi (Lighthouse'ta mobilde Style &
 * Layout/Rendering'in büyük kısmı buradan geliyordu). Sabit bir gradyanı
 * her ziyaretçinin cihazında yeniden bulanıklaştırmak yerine bir kere
 * üretip statik görsel olarak sunuyoruz; mix-blend-mode + opacity
 * (tema/ambient mantığı) aynen çalışmaya devam ediyor.
 */

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
          'pointer-events-none [transform:translateZ(0)] [will-change:transform]',
        )}
        style={{
          backgroundImage: "url('/images/aura-layer-1.webp')",
          backgroundSize: '100% 100%',
          opacity: ambient ? 0.15 : 0.6,
        }}
      />
      <div
        className={cn(
          'absolute inset-0 mix-blend-multiply dark:mix-blend-soft-light',
          'pointer-events-none [transform:translateZ(0)] [will-change:transform]',
        )}
        style={{
          backgroundImage: "url('/images/aura-layer-2.webp')",
          backgroundSize: '100% 100%',
          opacity: ambient ? 0.22 : 0.9,
        }}
      />
    </div>
  );
}

export default AuraBackground;
