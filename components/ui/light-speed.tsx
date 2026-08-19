'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

/*
 * Shader: Matthias Hurrle (@atzedent) — tunnel efekti.
 * Tek değişiklik hue() satırında: orijinal tam spektrumda dönüyordu,
 * burada vermilyon → kehribar → kemik kağıt aralığına daraltıldı.
 * Orijinal renkleri denemek istersen `fragmentSource` prop'una
 * eski satırı içeren shader'ı geçebilirsin.
 */
const DEFAULT_FRAG = `#version 300 es
precision highp float;
out vec4 O;
uniform float time;
uniform vec2 resolution;

#define FC gl_FragCoord.xy
#define R  resolution
#define T  time
#define hue(a) (.5+.5*cos(6.28318*(a)*.18+vec3(.7,1.15,2.1)))

float rnd(float a) {
  vec2 p = fract(a * vec2(12.9898, 78.233));
  p += dot(p, p*345.);
  return fract(p.x * p.y);
}
vec3 pattern(vec2 uv) {
  vec3 col = vec3(0.);
  for (float i=.0; i++<20.;) {
    float a = rnd(i);
    vec2 n = vec2(a, fract(a*34.56));
    vec2 p = sin(n*(T+7.) + T*.5);
    float d = dot(uv-p, uv-p);
    col += .00125/d * hue(dot(uv,uv) + i*.125 + T);
  }
  return col;
}
void main(void) {
  vec2 uv = (FC - .5 * R) / min(R.x, R.y);
  vec3 col = vec3(0.);
  float s = 2.4;
  float a = atan(uv.x, uv.y);
  float b = length(uv);
  uv = vec2(a * 5. / 6.28318, .05 / tan(b) + T);
  uv = fract(uv) - .5;
  col += pattern(uv * s);
  O = vec4(col, 1.);
}`;

/** Tam ekran dörtgeni çizen minimal vertex shader. */
const DEFAULT_VERT = `#version 300 es
precision highp float;
in vec2 position;
void main(){
  gl_Position = vec4(position, 0.0, 1.0);
}`;

function errMessage(err: unknown) {
  return err instanceof Error ? err.message : String(err);
}

type Props = {
  /** Boyut/yerleşim sınıfları. */
  className?: string;
  /** Animasyonu durdur. */
  paused?: boolean;
  /** Zaman çarpanı (1 = normal hız). */
  speed?: number;
  /** Fragment shader'ı değiştir. */
  fragmentSource?: string;
  /** Derleme hatalarını yakala. */
  onShaderError?: (err: string) => void;
};

/**
 * WebGL2 shader arka planı.
 *
 * Verilen orijinale göre dört değişiklik:
 *  1. `setWebglOk` state'i kaldırıldı — `react-hooks/set-state-in-effect`
 *     bu projede `error`. Hata katmanı JSX'te `hidden` duruyor, effect
 *     sadece başarısızlıkta ref üzerinden açıyor.
 *  2. `paused` / `speed` / `onShaderError` ref'e taşındı. Orijinalde bunlar
 *     effect bağımlılığıydı, yani her değişimde tüm WebGL context'i
 *     yıkılıp yeniden kuruluyordu (satır içi arrow verilirse her render'da).
 *  3. Ekranda değilken ve sekme gizliyken kare çizilmiyor. Danışmanlık
 *     sayfasında bunun altında Spline var; iki WebGL context'i aynı anda
 *     GPU yakmasın diye.
 *  4. `webglcontextlost` yakalanıyor — yoksa context düşerse canvas
 *     kalıcı olarak siyah kalırdı.
 */
export function LightSpeed({
  className,
  paused = false,
  speed = 1,
  fragmentSource = DEFAULT_FRAG,
  onShaderError,
}: Props) {
  const reduce = useReducedMotion();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fallbackRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef(0);

  // Effect'i yeniden kurmadan güncellenebilsin diye ref'te tutuluyorlar.
  const pausedRef = useRef(paused);
  const speedRef = useRef(speed);
  const reduceRef = useRef(reduce);
  const errorRef = useRef(onShaderError);

  useEffect(() => {
    pausedRef.current = paused;
    speedRef.current = speed;
    reduceRef.current = reduce;
    errorRef.current = onShaderError;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const showFallback = () => {
      if (fallbackRef.current) fallbackRef.current.hidden = false;
    };

    const gl = canvas.getContext('webgl2', {
      antialias: false,
      powerPreference: 'low-power',
    });

    if (!gl) {
      showFallback();
      return;
    }

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(sh) || 'Shader compile error';
        gl.deleteShader(sh);
        throw new Error(info);
      }
      return sh;
    };

    const link = (vs: WebGLShader, fs: WebGLShader) => {
      const prog = gl.createProgram()!;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(prog) || 'Program link error';
        gl.deleteProgram(prog);
        throw new Error(info);
      }
      return prog;
    };

    let vs: WebGLShader | null = null;
    let fs: WebGLShader | null = null;
    let prog: WebGLProgram | null = null;

    try {
      vs = compile(gl.VERTEX_SHADER, DEFAULT_VERT);
      fs = compile(gl.FRAGMENT_SHADER, fragmentSource);
      prog = link(vs, fs);
    } catch (err: unknown) {
      errorRef.current?.(errMessage(err));
      // Özel shader patladıysa varsayılana düş.
      if (fragmentSource !== DEFAULT_FRAG && vs) {
        try {
          fs = compile(gl.FRAGMENT_SHADER, DEFAULT_FRAG);
          prog = link(vs, fs);
        } catch (err2: unknown) {
          errorRef.current?.(errMessage(err2));
          showFallback();
          return;
        }
      } else {
        showFallback();
        return;
      }
    }

    const program = prog!;
    gl.useProgram(program);

    // Ekranı kaplayan dörtgen
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]),
      gl.STATIC_DRAW,
    );

    const locPos = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(locPos);
    gl.vertexAttribPointer(locPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, 'time');
    const uResolution = gl.getUniformLocation(program, 'resolution');

    const resize = () => {
      const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
      const cssW = canvas.clientWidth || canvas.parentElement?.clientWidth || window.innerWidth;
      const cssH = canvas.clientHeight || canvas.parentElement?.clientHeight || window.innerHeight;

      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener('resize', resize);
    resize();

    const draw = (seconds: number) => {
      gl.useProgram(program);
      gl.uniform1f(uTime, seconds);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    // Ekranda mı? Kare harcamamak için.
    let onScreen = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    // Hareket azaltma: tek kare çiz, döngüye hiç girme.
    if (reduceRef.current) {
      draw(0);
      return () => {
        ro.disconnect();
        io.disconnect();
        window.removeEventListener('resize', resize);
        gl.deleteBuffer(vbo);
        gl.deleteProgram(program);
        if (vs) gl.deleteShader(vs);
        if (fs) gl.deleteShader(fs);
      };
    }

    const start = performance.now();
    let elapsed = 0;
    let last = start;

    const loop = (t: number) => {
      rafRef.current = requestAnimationFrame(loop);

      const frameDelta = t - last;
      last = t;

      if (pausedRef.current || !onScreen || document.hidden) return;

      // Duraklatılan süre zamana eklenmesin ki dönünce sıçrama olmasın.
      elapsed += frameDelta * 0.001 * (speedRef.current || 1);
      draw(elapsed);
    };
    rafRef.current = requestAnimationFrame(loop);

    // Sekme geri gelince delta patlamasın.
    const onVisibility = () => {
      last = performance.now();
    };
    document.addEventListener('visibilitychange', onVisibility);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(rafRef.current);
      showFallback();
    };
    canvas.addEventListener('webglcontextlost', onContextLost);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onContextLost);

      gl.deleteBuffer(vbo);
      gl.deleteProgram(program);
      if (vs) gl.deleteShader(vs);
      if (fs) gl.deleteShader(fs);
    };
  }, [fragmentSource]);

  return (
    <div className={cn('relative h-full w-full overflow-hidden bg-black', className)}>
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />

      {/* WebGL yoksa ya da shader derlenmezse açılır. */}
      <div
        ref={fallbackRef}
        hidden
        className="bg-dots absolute inset-0 grid place-items-center text-center opacity-40"
        aria-hidden
      />
    </div>
  );
}
