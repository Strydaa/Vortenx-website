'use client';

import { Suspense, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { cn } from '@/lib/utils';

/*
 * "Lunar Gravity" sahnesi — ay + parçacık halkası + asteroit kuşağı.
 *
 * Verilen `LunarGravityCard` bileşeninden alınan sahne kısmı. Kartın kendi
 * başlık/açıklama paneli ve siyah yuvarlak kutusu alınmadı: bu sahne hero'nun
 * arkasına giriyor, metni hero'nun kendi bileşeni yazıyor.
 *
 * Verilen koda göre yapılan değişiklikler ve gerekçeleri:
 *
 *  1. Dokular raw.githubusercontent.com yerine `public/textures/` altından.
 *     GitHub raw bir CDN değil; hız sınırı uygular, canlıda her ziyaretçinin
 *     isteği oraya gider ve erişilemezse ay dokusuz kalır.
 *  2. `<Environment preset="city" />` kaldırıldı (kodda iki kez vardı). Bu
 *     bileşen HDRI'yi pmndrs CDN'inden indiriyor — yine dış bağımlılık, üstelik
 *     ~1 MB. Yerine sahneye iki dolgu ışığı eklendi; arka planda fark edilmiyor.
 *  3. Gölgeler kapatıldı (`shadows`, `castShadow`, 2048'lik shadow map).
 *     Metnin arkasındaki bir sahnede gölgeler görünmüyor, GPU maliyeti gerçek.
 *  4. `ringState` React state'i kaldırıldı, yerine `useFrame` içinde ilerleyen
 *     bir ref geçti. Hem her karede React render'ı tetiklenmiyor hem de
 *     `react-hooks/set-state-in-effect` (bu projede `error`) kuralına takılan
 *     bir kurulum ortaya çıkmıyor. Halka artık tıklama beklemeden açılıyor;
 *     aya tıklamak animasyonu baştan oynatıyor.
 *  5. Parçacık tamponları modül seviyesinde değil, ekran genişliğine göre
 *     üretiliyor. Orijinal 60.000 parçacığı sabitliyordu; mobilde 18.000.
 *  6. `onBeforeCompile(shader: any)` tiplendi — `no-explicit-any` da `error`.
 *  7. `document.body.style.cursor` ataması kaldırıldı. İmleç, sarmalayıcıdaki
 *     `cursor-grab` sınıfıyla veriliyor; sahne sürüklenebilir olduğunu da
 *     böylece kendiliğinden anlatıyor.
 *  8. WebGL yoksa Canvas hiç kurulmuyor — R3F desteklenmeyen cihazda render
 *     sırasında hata fırlatıyor ve bu, arkasında durduğu hero'yu komple
 *     düşürürdü.
 *
 * Renkler siteye uyarlandı: orijinal halka mavi/mor kıvılcımlıydı, burada
 * kemik tozu + vermilyon + kehribar. Değiştirmek için RING_PALETTE yeterli.
 */

const MOON_RADIUS = 2.0;
const MOON_TEXTURE = '/textures/moon_1024.jpg';

/** Shader'daki `uniform vec4 uAsteroids[75]` ile aynı olmak zorunda. */
const ASTEROID_COUNT = 75;

/** Halka açılmadan önceki bekleme (saniye) ve açılma hızı. */
const REVEAL_DELAY = 0.9;
const REVEAL_SPEED = 0.35;

/**
 * Parçacık renkleri: ağırlık kemik grisi tozda, aralara marka vurgusu.
 * `weight` kümülatif değil, oranlar toplandığında 1 ediyor.
 */
const RING_PALETTE: { weight: number; rgb: [number, number, number] }[] = [
  { weight: 0.8, rgb: [0.3, 0.27, 0.24] }, // kemik tozu
  { weight: 0.12, rgb: [1.0, 0.33, 0.15] }, // vermilyon
  { weight: 0.08, rgb: [1.0, 0.63, 0.12] }, // kehribar
];

/**
 * Sahne bileşenleri arasında paylaşılan, React render'ı tetiklemeyen durum.
 *
 * Neden düz bir ref değil de fonksiyon demeti: `react-hooks/immutability`
 * (bu projede `error`) prop olarak gelen bir nesnenin değiştirilmesine izin
 * vermiyor. Demeti kuran bileşen kendi ref'ini değiştiriyor, çocuklar sadece
 * çağırıyor — hem kural sağlanıyor hem de kimin neyi yazdığı belli oluyor.
 */
type SceneApi = {
  /**
   * Sahne saatine göre halka ilerlemesini hesaplar (0 → 1).
   *
   * Kare farkını (`delta`) biriktirmiyoruz bilerek: sekme arkaya alınıp geri
   * gelince, ilk karede ya da tarayıcı kareleri kısarken delta saniyeler
   * mertebesine çıkabiliyor ve biriktiren her hesap sıçrıyor. Mutlak zaman
   * bundan etkilenmiyor.
   */
  progressAt(elapsed: number): number;
  /** Son hesaplanan ilerleme; yazan taraf ParticleRing. */
  progress(): number;
  /** Halkayı baştan oynatır. */
  replay(): void;
  /** Asteroit kuşağının o karedeki konumlarını yazdığı yer. */
  writeAsteroid(
    index: number,
    x: number,
    y: number,
    z: number,
    scale: number,
  ): void;
  /** Aynı tamponun okuma ucu: [x, y, z, scale] × ASTEROID_COUNT. */
  asteroids(): Float32Array;
};

function buildRing(count: number) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const randoms = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;

    // Üsse alma parçacıkları içe doğru yığıyor — halka içeride yoğun.
    const rDist = Math.pow(Math.random(), 1.5);
    const radius = 2.2 + rDist * 2.2;

    // Dışa doğru incelen disk; üç rastgele sayının toplamı kabaca normal dağılım.
    const thickness = 0.4 - rDist * 0.2;
    const y = (Math.random() + Math.random() + Math.random() - 1.5) * thickness;

    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = Math.sin(angle) * radius;

    const intensity = 1 - rDist;

    let pick = Math.random();
    let entry = RING_PALETTE[0];
    for (const candidate of RING_PALETTE) {
      if (pick < candidate.weight) {
        entry = candidate;
        break;
      }
      pick -= candidate.weight;
    }

    // Her 20 parçacıktan biri kıvılcım: aynı renk, aşırı parlak.
    const sparkle = Math.random() > 0.95 ? 2.5 : 1;

    for (let c = 0; c < 3; c++) {
      const jittered = entry.rgb[c] + (Math.random() - 0.5) * 0.1;
      colors[i * 3 + c] =
        Math.min(1, Math.max(0, jittered)) * intensity * sparkle;
    }

    randoms[i] = Math.random();
  }

  return { positions, colors, randoms };
}

function Moon({ onReplay }: { onReplay: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const colorMap = useTexture(MOON_TEXTURE, (texture) => {
    const map = Array.isArray(texture) ? texture[0] : texture;
    map.colorSpace = THREE.SRGBColorSpace;
  });

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.05;
  });

  return (
    <mesh ref={meshRef} onClick={onReplay}>
      <sphereGeometry args={[MOON_RADIUS, 64, 64]} />
      <meshStandardMaterial
        map={colorMap}
        bumpMap={colorMap}
        bumpScale={0.02}
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  );
}

function ParticleRing({
  api,
  particleCount,
}: {
  api: SceneApi;
  particleCount: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => buildRing(particleCount), [particleCount]);

  const uniforms = useRef({
    uProgress: { value: 0 },
    uAsteroids: { value: new Float32Array(ASTEROID_COUNT * 4) },
    time: { value: 0 },
  });

  // Her karede yeniden ayırmamak için tek sefer.
  const scratch = useRef({
    inverse: new THREE.Matrix4(),
    point: new THREE.Vector3(),
    local: new Float32Array(ASTEROID_COUNT * 4),
  });

  useFrame((state, delta) => {
    uniforms.current.uProgress.value = api.progressAt(state.clock.elapsedTime);
    uniforms.current.time.value = state.clock.elapsedTime;

    const points = pointsRef.current;
    if (!points) return;

    points.rotation.y -= delta * 0.02;
    points.updateMatrix();

    // Asteroitler dünya uzayında hesaplanıyor, parçacıklar halkanın kendi
    // uzayında duruyor. İtme kuvvetini shader'da uygulayabilmek için
    // konumları halkanın uzayına çeviriyoruz.
    const { inverse, point, local } = scratch.current;
    inverse.copy(points.matrix).invert();

    const world = api.asteroids();
    for (let i = 0; i < ASTEROID_COUNT; i++) {
      point
        .set(world[i * 4], world[i * 4 + 1], world[i * 4 + 2])
        .applyMatrix4(inverse);

      local[i * 4] = point.x;
      local[i * 4 + 1] = point.y;
      local[i * 4 + 2] = point.z;
      local[i * 4 + 3] = world[i * 4 + 3];
    }

    uniforms.current.uAsteroids.value = local;
  });

  const onBeforeCompile = (
    shader: THREE.WebGLProgramParametersWithUniforms,
  ) => {
    shader.uniforms.uProgress = uniforms.current.uProgress;
    shader.uniforms.uAsteroids = uniforms.current.uAsteroids;
    shader.uniforms.time = uniforms.current.time;

    shader.vertexShader = `
      uniform float uProgress;
      uniform vec4 uAsteroids[${ASTEROID_COUNT}];
      uniform float time;
      attribute float aRandom;
      varying float vProgress;
      ${shader.vertexShader}
    `;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      vec3 transformed = vec3(position);

      // Açıya göre eşik: halka bir yandan başlayıp çepeçevre yayılıyor.
      float angle = atan(transformed.x, transformed.z);
      float normalizedAngle = abs(angle) / 3.14159265359;
      float spawnThreshold = 1.0 - normalizedAngle;

      float progressValue = (uProgress * 1.4) - spawnThreshold;
      float particleProgress = smoothstep(0.0, 0.4, progressValue);
      vProgress = particleProgress;

      transformed.y += sin(angle * 10.0 + time) * 0.05 * aRandom;

      // Halka yerine oturmadan asteroit itmesini hesaplamanın anlamı yok.
      if (uProgress > 0.5) {
        for(int i = 0; i < ${ASTEROID_COUNT}; i++) {
          vec4 astData = uAsteroids[i];
          vec3 delta = transformed - astData.xyz;
          float dist = length(delta);

          float rad = astData.w * 2.0 + 0.15;

          if (dist < rad) {
             float force = pow((rad - dist) / rad, 2.0);
             transformed += normalize(delta) * force * 0.4;
             transformed.y += force * 0.20 * (aRandom - 0.5);
          }
        }
      }

      // Açılırken parçacıklar ayın yüzeyinden burgu çizerek savruluyor.
      float swirl = (1.0 - particleProgress) * 4.0;
      float s = sin(swirl);
      float c = cos(swirl);
      transformed.xz = mat2(c, -s, s, c) * transformed.xz;

      transformed.y += (1.0 - particleProgress) * (transformed.y >= 0.0 ? 1.0 : -1.0);

      vec3 moonSurface = normalize(transformed) * 2.1;
      transformed = mix(moonSurface, transformed, particleProgress);
      `,
    );

    shader.fragmentShader = `
      varying float vProgress;
      ${shader.fragmentShader}
    `;

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <color_fragment>',
      `
      #include <color_fragment>

      diffuseColor.a *= vProgress;
      `,
    );
  };

  return (
    <points ref={pointsRef} rotation={[-Math.PI / 2, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[geometry.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[geometry.colors, 3]}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          args={[geometry.randoms, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.008}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        onBeforeCompile={onBeforeCompile}
      />
    </points>
  );
}

type Asteroid = {
  angle: number;
  baseRadius: number;
  radialAmplitude: number;
  radialSpeed: number;
  phase: number;
  zOffset: number;
  speed: number;
  rx: number;
  ry: number;
  rz: number;
  rsx: number;
  rsy: number;
  rsz: number;
  scale: number;
};

function generateAsteroids(count: number): Asteroid[] {
  const data: Asteroid[] = [];

  for (let i = 0; i < count; i++) {
    data.push({
      angle: Math.random() * Math.PI * 2,
      baseRadius: 2.8 + Math.random() * 2.0,
      // Yarıçap salınımı: taşlar halkaya girip çıkıyor, iz bırakıyor.
      radialAmplitude: 0.5 + Math.random() * 1.5,
      radialSpeed: 0.15 + Math.random() * 0.25,
      phase: Math.random() * Math.PI * 2,
      zOffset: (Math.random() - 0.5) * 0.8,
      speed: (0.04 + Math.random() * 0.08) * (Math.random() > 0.5 ? 1 : -1),
      rx: Math.random() * Math.PI,
      ry: Math.random() * Math.PI,
      rz: Math.random() * Math.PI,
      rsx: (Math.random() - 0.5) * 0.05,
      rsy: (Math.random() - 0.5) * 0.05,
      rsz: (Math.random() - 0.5) * 0.05,
      // Dördüncü kuvvet: çoğu taş ufak, birkaçı iri.
      scale: 0.02 + Math.pow(Math.random(), 4) * 0.18,
    });
  }

  return data.sort((a, b) => b.scale - a.scale);
}

function AsteroidBelt({ api }: { api: SceneApi }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const colorMap = useTexture(MOON_TEXTURE, (texture) => {
    const map = Array.isArray(texture) ? texture[0] : texture;
    map.colorSpace = THREE.SRGBColorSpace;
  });

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const [asteroids] = useState(() => generateAsteroids(ASTEROID_COUNT));
  const scaleRef = useRef(0);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const target = api.progress() > 0.001 ? 1 : 0;
    // Katsayı 1'i aşarsa lerp hedefi aşar ve salınarak büyür — tek bir uzun
    // kare (sekme geri geldiğinde delta saniyelerce olabiliyor) taşları
    // ekranı kaplayacak boyuta çıkarıyordu. Sınır şart.
    const step = Math.min(1, delta * (target === 0 ? 5 : 2));
    scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, target, step);

    if (scaleRef.current < 0.01) {
      mesh.visible = false;
      return;
    }
    mesh.visible = true;

    // Uzun karelerde taşların ışınlanmaması için adım sınırlı.
    const dt = Math.min(delta, 1 / 20);

    asteroids.forEach((ast, i) => {
      ast.angle += ast.speed * dt;
      ast.phase += ast.radialSpeed * dt;

      let radius = ast.baseRadius + Math.sin(ast.phase) * ast.radialAmplitude;
      // Ayın içine girmesinler; yaklaşanı yumuşakça sektiriyoruz.
      if (radius < 2.15) radius = 2.15 + (2.15 - radius) * 0.85;

      const x = Math.cos(ast.angle) * radius;
      const y = Math.sin(ast.angle) * radius;

      api.writeAsteroid(i, x, y, ast.zOffset, ast.scale);

      ast.rx += ast.rsx;
      ast.ry += ast.rsy;
      ast.rz += ast.rsz;

      dummy.position.set(x, y, ast.zOffset);
      dummy.rotation.set(ast.rx, ast.ry, ast.rz);
      dummy.scale.setScalar(ast.scale * scaleRef.current);
      dummy.updateMatrix();

      mesh.setMatrixAt(i, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh args={[undefined, undefined, ASTEROID_COUNT]} ref={meshRef}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        map={colorMap}
        bumpMap={colorMap}
        bumpScale={0.08}
        roughness={0.7}
        metalness={0.1}
      />
    </instancedMesh>
  );
}

/** R3F desteklenmeyen bağlamda render sırasında patlar; önden bakıyoruz. */
function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      canvas.getContext('webgl2') ?? canvas.getContext('webgl'),
    );
  } catch {
    return false;
  }
}

type Props = {
  className?: string;
  /** Kalabalık, arka planda görünmeyen parçacıkları kısmak için. */
  particleCount?: number;
};

export function LunarGravity({ className, particleCount }: Props) {
  const [supported] = useState(hasWebGL);
  const [count] = useState(
    () =>
      particleCount ?? (window.innerWidth < 768 ? 18_000 : 60_000),
  );

  const state = useRef({
    /** Açılmanın başladığı sahne zamanı; ilk karede sabitleniyor. */
    startedAt: null as number | null,
    /** İlk açılışta sahne biraz nefes alsın; tekrar oynatmada beklemesin. */
    firstRun: true,
    progress: 0,
    asteroids: new Float32Array(ASTEROID_COUNT * 4),
  });

  const api = useMemo<SceneApi>(
    () => ({
      progressAt(elapsed) {
        const s = state.current;
        s.startedAt ??= elapsed;
        const since =
          elapsed - s.startedAt - (s.firstRun ? REVEAL_DELAY : 0.15);
        s.progress = Math.min(1, Math.max(0, since * REVEAL_SPEED));
        return s.progress;
      },
      progress: () => state.current.progress,
      replay() {
        // Bir sonraki karede o anki zamana yeniden sabitlensin.
        state.current.startedAt = null;
        state.current.firstRun = false;
        state.current.progress = 0;
      },
      writeAsteroid(index, x, y, z, scale) {
        const buffer = state.current.asteroids;
        buffer[index * 4] = x;
        buffer[index * 4 + 1] = y;
        buffer[index * 4 + 2] = z;
        buffer[index * 4 + 3] = scale;
      },
      asteroids: () => state.current.asteroids,
    }),
    [],
  );

  if (!supported) return null;

  return (
    <div className={cn('cursor-grab active:cursor-grabbing', className)}>
      <Canvas
        camera={{ position: [0, 4, 10], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.12} />
        <directionalLight position={[8, 5, 5]} intensity={1.6} />
        <directionalLight position={[-5, -3, -5]} intensity={0.2} color="#4a90e2" />
        {/* Environment yerine: aya arkadan sıcak bir kenar ışığı. */}
        <directionalLight position={[-6, 2, -4]} intensity={0.35} color="#ff7a3d" />

        {/* Dikey sürüklemede tur atmasın diye açı sınırlı. */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.4}
          minPolarAngle={Math.PI * 0.2}
          maxPolarAngle={Math.PI * 0.8}
        />

        <group rotation={[Math.PI / 8, 0, 0]}>
          <Suspense fallback={null}>
            <Moon onReplay={api.replay} />
            <ParticleRing api={api} particleCount={count} />
            <AsteroidBelt api={api} />
          </Suspense>
        </group>
      </Canvas>
    </div>
  );
}

export default LunarGravity;
