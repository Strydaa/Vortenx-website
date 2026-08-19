'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { createNoise3D } from 'simplex-noise';
import { cn } from '@/lib/utils';

/*
 * Vortex — simplex gürültüsüyle sürüklenen parçacık akıntısı (Aceternity).
 *
 * Verilen koda göre değişiklikler ve gerekçeleri:
 *
 *  1. `framer-motion` → `motion/react`. Proje motion 12 kullanıyor; eski paket
 *     adı kurulu değil, import build'i durdururdu.
 *  2. Tuval artık pencereyi değil **kapsayıcıyı** ölçüyor. Orijinal
 *     `window.innerWidth/innerHeight` yazıyordu; bölüm arka planı olarak bu,
 *     hero'dan taşan ve yeniden boyutlandırmada kayan bir tuval demekti.
 *     `ResizeObserver` ile kapsayıcıya bağlandı.
 *  3. Döngü temizleniyor. Orijinalde `requestAnimationFrame` kendi kendini
 *     sonsuza kadar çağırıyor, `resize` dinleyicisi hiç kaldırılmıyordu:
 *     sayfa değiştirildiğinde döngü arkada dönmeye devam ederdi ve her
 *     ziyarette bir tane daha eklenirdi.
 *  4. Ekran dışındayken ve sekme arkadayken çizim duruyor. Bu bileşenin en
 *     pahalı kısmı her karedeki iki tam tuval bulanıklığı; hero yukarı
 *     kayınca bunu ödemenin anlamı yok.
 *  5. Hareket azaltma tercihinde tek kare çizilip duruluyor.
 *  6. Değişkenler (`tick`, `particleProps`, `center`) bileşen gövdesinden
 *     effect'in içine alındı. Render sırasında oluşturulan değerleri sonradan
 *     değiştirmek `react-hooks/immutability` kuralına takılıyor (bu projede
 *     `error`), ayrıca her render'da gürültü üreteci yeniden kuruluyordu.
 *  7. `children?: any` → `ReactNode` (`no-explicit-any` da `error`).
 *  8. `rangeHue` prop'a çıkarıldı; orijinalde 100'e sabitti ve her sayfada
 *     farklı bir palet istendiği için dar aralık gerekiyor.
 *
 * Piksel oranı bilerek 1'de tutuldu (orijinal de öyleydi): maliyet doğrudan
 * piksel sayısıyla artıyor ve zaten bulanık çizilen bir efektte retina
 * keskinliğinin görsel karşılığı yok.
 */

const PARTICLE_PROP_COUNT = 9;
const BASE_TTL = 50;
const RANGE_TTL = 150;
const NOISE_STEPS = 3;
const X_OFF = 0.00125;
const Y_OFF = 0.00125;
const Z_OFF = 0.0005;
const TAU = 2 * Math.PI;

const rand = (n: number) => n * Math.random();
const randRange = (n: number) => n - rand(2 * n);
const lerp = (a: number, b: number, t: number) => (1 - t) * a + t * b;

/** Ömrün başında ve sonunda 0, ortasında 1 — parçacıklar belirip sönüyor. */
const fadeInOut = (t: number, m: number) => {
  const hm = 0.5 * m;
  return Math.abs(((t + hm) % m) - hm) / hm;
};

export type VortexProps = {
  children?: ReactNode;
  className?: string;
  containerClassName?: string;
  particleCount?: number;
  /** Parçacıkların doğduğu dikey bant (merkezden ± piksel). */
  rangeY?: number;
  baseHue?: number;
  /** Ton aralığı; küçük değer tek renkli, büyük değer gökkuşağı. */
  rangeHue?: number;
  baseSpeed?: number;
  rangeSpeed?: number;
  baseRadius?: number;
  rangeRadius?: number;
  backgroundColor?: string;
};

export function Vortex({
  children,
  className,
  containerClassName,
  // Orijinal varsayılan 700'dü ve ~1000×500'lük bir kart içindi. Hero bunun
  // iki katından geniş; aynı sayı burada seyrek bir serpinti gibi duruyor.
  particleCount = 1100,
  // Orijinal 100'dü ve tam ekran hero içindi; bölüm arka planında parçacıklar
  // ince bir şerit hâlinde kalıyordu. 400 kabaca hero yüksekliğinin yarısı.
  rangeY = 400,
  baseHue = 220,
  rangeHue = 100,
  baseSpeed = 0,
  rangeSpeed = 1.5,
  baseRadius = 1,
  rangeRadius = 3,
  /*
   * Siyah bilerek varsayılan: parlama, tuvali kendi üstüne `lighter` ile üç
   * kez çizerek yapılıyor, yani zemin rengi de her geçişte toplanıyor. Siyah
   * dışında herhangi bir renk verildiğinde zemin katlanarak açılıyor ve
   * efektin üstünü kaplayan bir sis oluşuyor. Renk farkı `baseHue` ile.
   */
  backgroundColor = '#000000',
}: VortexProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  // Effect'i yeniden kurmadan okunabilsinler diye ref'te.
  const cfg = useRef({
    particleCount,
    rangeY,
    baseHue,
    rangeHue,
    baseSpeed,
    rangeSpeed,
    baseRadius,
    rangeRadius,
    backgroundColor,
    reduce,
  });

  useEffect(() => {
    cfg.current = {
      particleCount,
      rangeY,
      baseHue,
      rangeHue,
      baseSpeed,
      rangeSpeed,
      baseRadius,
      rangeRadius,
      backgroundColor,
      reduce,
    };
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Kurulum anındaki değerler; renkler parçacık doğarken okunuyor.
    const opts = cfg.current;
    const total = opts.particleCount * PARTICLE_PROP_COUNT;

    const noise3D = createNoise3D();
    const props = new Float32Array(total);
    const center: [number, number] = [0, 0];
    let tick = 0;

    const initParticle = (i: number) => {
      props.set(
        [
          rand(canvas.width), // x
          center[1] + randRange(opts.rangeY), // y
          0, // vx
          0, // vy
          0, // yaş
          BASE_TTL + rand(RANGE_TTL), // ömür
          opts.baseSpeed + rand(opts.rangeSpeed),
          opts.baseRadius + rand(opts.rangeRadius),
          opts.baseHue + rand(opts.rangeHue),
        ],
        i,
      );
    };

    const resize = () => {
      const width = canvas.clientWidth || canvas.parentElement?.clientWidth || 0;
      const height =
        canvas.clientHeight || canvas.parentElement?.clientHeight || 0;
      if (!width || !height) return;

      canvas.width = width;
      canvas.height = height;
      center[0] = 0.5 * width;
      center[1] = 0.5 * height;
    };

    const drawParticle = (
      x: number,
      y: number,
      x2: number,
      y2: number,
      life: number,
      ttl: number,
      radius: number,
      hue: number,
    ) => {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineWidth = radius;
      ctx.strokeStyle = `hsla(${hue},100%,60%,${fadeInOut(life, ttl)})`;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.closePath();
      ctx.restore();
    };

    const updateParticle = (i: number) => {
      const x = props[i];
      const y = props[i + 1];

      // Gürültü alanı hız vektörünü döndürüyor — akıntı buradan çıkıyor.
      const n = noise3D(x * X_OFF, y * Y_OFF, tick * Z_OFF) * NOISE_STEPS * TAU;
      const vx = lerp(props[i + 2], Math.cos(n), 0.5);
      const vy = lerp(props[i + 3], Math.sin(n), 0.5);

      const life = props[i + 4];
      const ttl = props[i + 5];
      const speed = props[i + 6];
      const x2 = x + vx * speed;
      const y2 = y + vy * speed;

      drawParticle(x, y, x2, y2, life, ttl, props[i + 7], props[i + 8]);

      props[i] = x2;
      props[i + 1] = y2;
      props[i + 2] = vx;
      props[i + 3] = vy;
      props[i + 4] = life + 1;

      const out =
        x2 > canvas.width || x2 < 0 || y2 > canvas.height || y2 < 0;
      if (out || life + 1 > ttl) initParticle(i);
    };

    /*
     * Tuvali kendi üstüne bulanık çizerek parlama. Karenin pahalı kısmı —
     * canvas 2D `filter: blur()` CSS blur gibi GPU hızlandırmalı değil,
     * yazılımda çalışıyor. Tek geçiş, iki geçişin yarı maliyetiyle görsel
     * olarak neredeyse ayırt edilemez bir sonuç veriyor.
     */
    const renderGlow = () => {
      ctx.save();
      ctx.filter = 'blur(6px) brightness(200%)';
      ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(canvas, 0, 0);
      ctx.restore();
    };

    const draw = () => {
      tick++;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = opts.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < total; i += PARTICLE_PROP_COUNT) updateParticle(i);

      renderGlow();

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(canvas, 0, 0);
      ctx.restore();
    };

    resize();
    for (let i = 0; i < total; i += PARTICLE_PROP_COUNT) initParticle(i);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Hareket azaltma: tek kare, döngü yok.
    if (opts.reduce) {
      draw();
      return () => ro.disconnect();
    }

    let onScreen = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    // Akan bir parçacık dokusu 30fps'te 60fps'ten ayırt edilemiyor;
    // her ikinci karede çizip CPU maliyetini yarıya indiriyoruz.
    const FRAME_INTERVAL = 1000 / 30;
    let lastDraw = 0;
    let raf = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!onScreen || document.hidden) return;
      if (now - lastDraw < FRAME_INTERVAL) return;
      lastDraw = now;
      draw();
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <div className={cn('relative h-full w-full', containerClassName)}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0"
      >
        <canvas ref={canvasRef} className="block h-full w-full" />
      </motion.div>

      {children && <div className={cn('relative z-10', className)}>{children}</div>}
    </div>
  );
}

export default Vortex;
