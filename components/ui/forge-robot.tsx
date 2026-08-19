'use client';

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { cn } from '@/lib/utils';

/*
 * "Forge" sahnesi — dökümhaneden yeni çıkmış bronz robot büstü.
 *
 * Verilen "Bronze and Time" tek dosyalık sayfasının sahne katmanı. O sayfa
 * kendi başına duran 900vh'lik bir deneyimdi; burada gerçek bir içerik
 * sayfasının (/industries) hero arka planı olarak duruyor. Spec'e göre yapılan
 * değişiklikler ve gerekçeleri:
 *
 *  1. CDN importmap + ham three.module.js yerine kurulu @react-three/fiber.
 *     İkinci bir three kopyası dev log'undaki "Multiple instances of Three.js"
 *     uyarısını gerçek bir hataya çevirirdi.
 *  2. bronze_horse.glb yerine prosedürel büst. Spec modeli üçüncü taraf bir
 *     bucket'tan indiriyordu; bu projede dış varlık bağımlılıkları bilerek
 *     temizlenmiş durumda (bkz. lunar-gravity.tsx'in başındaki not).
 *  3. Arka plan düzlemi spec'te kameranın çocuğu. R3F'in varsayılan kamerası
 *     sahne grafiğinde olmadığı için çocukları hiç çizilmezdi; düzlem her
 *     karede kameranın dönüşümüne kilitleniyor — aynı sonuç, bağımlılık yok.
 *  4. uResolution'a CSS pikseli değil çizim tamponu boyutu veriliyor. Shader
 *     gl_FragCoord ile karşılaştırıyor; dpr 1.5'te CSS pikseli dalga alanını
 *     yatayda eziyordu.
 *  5. Scroll ile 360 derece yerine üçte biri. Spec'in yörüngesi 900vh'ye
 *     yayılıyordu, burada tek hero var; tamamını bir ekrana sıkıştırmak baş
 *     döndürüyor. Yerine sürekli çok yavaş bir kendiliğinden dönüş eklendi.
 *  6. İç scroll lerp'i 0.025 yerine 0.08. Sayfada zaten lenis (lerp 0.09) var;
 *     üstüne bir de 0.025 koymak sahneyi imlecin belirgin şekilde gerisinde
 *     bırakıyordu.
 *  7. Gölgeler kapalı. lunar-gravity.tsx aynı kararı aynı gerekçeyle veriyor:
 *     metnin arkasındaki sahnede gölge görünmüyor, shadow map maliyeti gerçek.
 *  8. Spec'in özel imleci ve cursor:none kuralı alınmadı — sitenin tamamını
 *     etkilerdi ve bu bileşenin işi değil.
 *
 * Kıvılcım renkleri siteye uyarlandı: spec'in jenerik turuncusu yerine
 * --signal vermilyonu ve kehribar, azınlıkta kenar ışığını yankılayan buz
 * mavisi. Değiştirmek için SPARK_PALETTE yeterli.
 */

export type ForgeSector = { code: string; name: string };

/** Normalize edilmiş figür yüksekliği (dünya birimi). */
const FIGURE_SIZE = 3.2;

/** Sektör düğümlerinin oturduğu halkanın yarıçapı. */
const RING_RADIUS = 2.65;

/** Sayfa hiç kaydırılmasa da sahne ölü durmasın diye (radyan/saniye). */
const IDLE_ORBIT_SPEED = 0.045;

/** Scroll'un süpürdüğü toplam açı — spec'teki tam turun üçte biri. */
const ORBIT_SWEEP = (Math.PI * 2) / 3;

const BRONZE = '#7c4a22';
const EMBER = '#ff5426';

/**
 * Kıvılcım paleti. `weight` kümülatif değil; oranlar toplandığında 1 ediyor.
 * Spec 60/40 turuncu-mavi ayrımı yapıyordu; buradaki sıcak yarı markanın
 * vermilyon + kehribar ikilisine bölündü.
 */
const SPARK_PALETTE: { weight: number; rgb: [number, number, number] }[] = [
  { weight: 0.45, rgb: [1.0, 0.33, 0.15] }, // vermilyon
  { weight: 0.2, rgb: [1.0, 0.63, 0.12] }, // kehribar
  { weight: 0.35, rgb: [0.6, 0.85, 1.0] }, // buz mavisi
];

/**
 * Sahne bileşenleri arasında paylaşılan, React render'ı tetiklemeyen durum.
 *
 * lunar-gravity.tsx'teki SceneApi ile aynı gerekçe: `react-hooks/immutability`
 * prop olarak gelen bir nesnenin değiştirilmesine izin vermiyor. Demeti kuran
 * bileşen kendi ref'ini yazıyor, çocuklar yalnızca çağırıyor.
 */
type SceneApi = {
  /** Yumuşatılmış scroll'u bir kare ilerletir; yalnızca CameraRig çağırıyor. */
  advance(): void;
  /** Hero'nun ekrandan çıkma ilerlemesi, 0 -> 1. */
  scroll(): number;
  /** Hedefle güncel değer arasındaki açıklık; kıvılcım türbülansını besliyor. */
  velocity(): number;
};

/** R3F desteklenmeyen bağlamda render sırasında patlar; önden bakıyoruz. */
function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ figür */

function Arm({ side }: { side: 1 | -1 }) {
  return (
    <group position={[0.6 * side, 0.1, 0]} rotation={[0, 0, -0.3 * side]}>
      <mesh>
        <sphereGeometry args={[0.25, 24, 24]} />
        <meshStandardMaterial color={BRONZE} roughness={0.42} metalness={0.92} />
      </mesh>

      <mesh position={[0, -0.31, 0]}>
        <cylinderGeometry args={[0.125, 0.105, 0.62, 12]} />
        <meshStandardMaterial color={BRONZE} roughness={0.42} metalness={0.92} />
      </mesh>

      {/* Dirsek ve ön kol içe kırılıyor — eller göğüs çekirdeğine dönük. */}
      <group position={[0, -0.62, 0]} rotation={[0, 0, 0.55 * side]}>
        <mesh>
          <sphereGeometry args={[0.115, 20, 20]} />
          <meshStandardMaterial color={BRONZE} roughness={0.42} metalness={0.92} />
        </mesh>
        <mesh position={[0, -0.28, 0]}>
          <cylinderGeometry args={[0.105, 0.085, 0.55, 12]} />
          <meshStandardMaterial color={BRONZE} roughness={0.42} metalness={0.92} />
        </mesh>
        <RoundedBox
          args={[0.17, 0.2, 0.14]}
          radius={0.045}
          smoothness={3}
          position={[0, -0.62, 0]}
        >
          <meshStandardMaterial color={BRONZE} roughness={0.42} metalness={0.92} />
        </RoundedBox>
      </group>
    </group>
  );
}

function Robot({ api }: { api: SceneApi }) {
  const tilt = useRef<THREE.Group>(null);
  const fitted = useRef<THREE.Group>(null);
  const float = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const visor = useRef<THREE.MeshStandardMaterial>(null);
  const core = useRef<THREE.MeshStandardMaterial>(null);

  /*
   * Spec'in çerçeveleme mantığı: en büyük boyut sabit bir birime normalize
   * edilip figür pivot'un merkezine oturtuluyor. Geometriyi kendim yazdığım
   * için ölçüleri sabitleyebilirdim; ölçmek, gövde oranlarını değiştirdiğimde
   * kamera çerçevesinin kaymamasını sağlıyor.
   *
   * Üç iç içe grup, her biri tek işten sorumlu: `tilt` fare eğimi, `fitted`
   * ölçek + merkezleme, `float` nefes salınımı. Tek grupta toplansaydı
   * merkezleme her karede salınımın üstüne yazardı.
   */
  useLayoutEffect(() => {
    const group = fitted.current;
    if (!group) return;

    group.scale.setScalar(1);
    group.position.set(0, 0, 0);
    group.updateMatrixWorld(true);

    const size = new THREE.Box3()
      .setFromObject(group)
      .getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    group.scale.setScalar(FIGURE_SIZE / (maxDim > 0.0001 ? maxDim : 1));
    group.updateMatrixWorld(true);

    const center = new THREE.Box3()
      .setFromObject(group)
      .getCenter(new THREE.Vector3());
    group.position.sub(center);
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (tilt.current) {
      // Spec'teki fare eğimi. R3F işaretçiyi zaten -1..1 aralığında veriyor,
      // ama y'si yukarı pozitif; spec'in işaretini korumak için ters çevriliyor.
      tilt.current.rotation.y = THREE.MathUtils.lerp(
        tilt.current.rotation.y,
        state.pointer.x * 0.25,
        0.05,
      );
      tilt.current.rotation.x = THREE.MathUtils.lerp(
        tilt.current.rotation.x,
        -state.pointer.y * 0.15,
        0.05,
      );
    }

    if (float.current) float.current.position.y = Math.sin(t * 0.6) * 0.045;

    // Kafa gövdeden biraz daha fazla dönüyor; bakış takip ediyormuş gibi.
    if (head.current) {
      head.current.rotation.y = THREE.MathUtils.lerp(
        head.current.rotation.y,
        state.pointer.x * 0.3,
        0.04,
      );
    }

    // Vizör ve çekirdek nefesle parlıyor; scroll hızlandıkça közleniyor.
    const surge = 1 + api.velocity() * 6;
    if (visor.current) {
      visor.current.emissiveIntensity = (2.4 + Math.sin(t * 1.4) * 0.5) * surge;
    }
    if (core.current) {
      core.current.emissiveIntensity =
        (3.2 + Math.sin(t * 0.9 + 1.2) * 0.9) * surge;
    }
  });

  return (
    <group ref={tilt} position={[0, -0.4, 0]}>
      <group ref={fitted}>
        <group ref={float}>
          {/* Kaide */}
          <mesh position={[0, -1.3, 0]}>
            <cylinderGeometry args={[0.55, 0.95, 0.55, 6]} />
            <meshStandardMaterial color={BRONZE} roughness={0.55} metalness={0.9} />
          </mesh>
          <mesh position={[0, -1.0, 0]}>
            <cylinderGeometry args={[0.42, 0.55, 0.12, 6]} />
            <meshStandardMaterial color={BRONZE} roughness={0.42} metalness={0.92} />
          </mesh>

          {/* Gövde */}
          <mesh position={[0, -0.32, 0]}>
            <cylinderGeometry args={[0.48, 0.6, 1.15, 8]} />
            <meshStandardMaterial color={BRONZE} roughness={0.42} metalness={0.92} />
          </mesh>
          <RoundedBox
            args={[0.72, 0.62, 0.3]}
            radius={0.06}
            smoothness={3}
            position={[0, -0.15, 0.22]}
          >
            <meshStandardMaterial color={BRONZE} roughness={0.42} metalness={0.92} />
          </RoundedBox>

          {/* Göğüs çekirdeği — sahnenin tek sıcak ışık kaynağı gibi duruyor. */}
          <mesh position={[0, -0.12, 0.4]}>
            <sphereGeometry args={[0.15, 32, 32]} />
            <meshStandardMaterial
              ref={core}
              color="#1a0d06"
              emissive={EMBER}
              emissiveIntensity={3.2}
              roughness={0.3}
              metalness={0.1}
            />
          </mesh>
          <mesh position={[0, -0.12, 0.4]}>
            <torusGeometry args={[0.24, 0.018, 10, 32]} />
            <meshStandardMaterial color={BRONZE} roughness={0.35} metalness={0.95} />
          </mesh>

          <Arm side={1} />
          <Arm side={-1} />

          {/* Boyun ve kafa */}
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.15, 0.19, 0.2, 12]} />
            <meshStandardMaterial color={BRONZE} roughness={0.42} metalness={0.92} />
          </mesh>

          <group ref={head} position={[0, 0.7, 0]}>
            <RoundedBox args={[0.46, 0.5, 0.44]} radius={0.09} smoothness={4}>
              <meshStandardMaterial color={BRONZE} roughness={0.42} metalness={0.92} />
            </RoundedBox>
            <RoundedBox
              args={[0.4, 0.11, 0.06]}
              radius={0.03}
              smoothness={3}
              position={[0, 0.02, 0.21]}
            >
              <meshStandardMaterial
                ref={visor}
                color="#140803"
                emissive={EMBER}
                emissiveIntensity={2.4}
                roughness={0.25}
                metalness={0.2}
              />
            </RoundedBox>
            <mesh position={[0, 0.29, -0.02]}>
              <boxGeometry args={[0.06, 0.16, 0.34]} />
              <meshStandardMaterial color={BRONZE} roughness={0.42} metalness={0.92} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------- kıvılcımlar */

/** Beyaz çekirdekten saydama giden radyal gradyan — spec'ten birebir. */
function createSparkTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.25, 'rgba(255, 255, 255, 0.85)');
  gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.3)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 16, 16);

  return new THREE.CanvasTexture(canvas);
}

type SparkMotion = {
  speedX: number;
  speedY: number;
  speedZ: number;
  swaySpeed: number;
  swayRadius: number;
  phase: number;
};

function buildSparks(count: number) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const motion: SparkMotion[] = [];

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 6.5;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 5.0 - 0.5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 6.5;

    let pick = Math.random();
    let entry = SPARK_PALETTE[0];
    for (const candidate of SPARK_PALETTE) {
      if (pick < candidate.weight) {
        entry = candidate;
        break;
      }
      pick -= candidate.weight;
    }

    for (let c = 0; c < 3; c++) {
      const jittered = entry.rgb[c] + (Math.random() - 0.5) * 0.12;
      colors[i * 3 + c] = Math.min(1, Math.max(0, jittered));
    }

    motion.push({
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: 0.15 + Math.random() * 0.3,
      speedZ: (Math.random() - 0.5) * 0.4,
      swaySpeed: 0.5 + Math.random() * 1.5,
      swayRadius: 0.05 + Math.random() * 0.15,
      phase: Math.random() * Math.PI * 2,
    });
  }

  return { positions, colors, motion };
}

function Sparks({ api, count }: { api: SceneApi; count: number }) {
  const points = useRef<THREE.Points>(null);
  const data = useMemo(() => buildSparks(count), [count]);
  const texture = useMemo(() => createSparkTexture(), []);

  useFrame((state, delta) => {
    const mesh = points.current;
    if (!mesh) return;

    const attribute = mesh.geometry.attributes.position as THREE.BufferAttribute;
    const array = attribute.array as Float32Array;
    const time = state.clock.elapsedTime;

    // Sekme arkaya alınıp geri gelince delta saniyeler mertebesine çıkabiliyor;
    // sınırlamazsak tek karede bütün kıvılcımlar sınırın dışına fırlıyor.
    const dt = Math.min(delta, 1 / 20);

    const velocity = api.velocity();
    const speedMultiplier = 1 + velocity * 9;
    const turbulence = velocity * 0.8;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const m = data.motion[i];

      array[idx] += m.speedX * dt * speedMultiplier;
      array[idx + 1] += m.speedY * dt * speedMultiplier;
      array[idx + 2] += m.speedZ * dt * speedMultiplier;

      const sway = m.swayRadius * (1 + turbulence * 4);
      array[idx] += Math.sin(time * m.swaySpeed + m.phase) * sway * dt;
      array[idx + 2] += Math.cos(time * m.swaySpeed + m.phase) * sway * dt;

      if (
        array[idx + 1] > 3.0 ||
        Math.abs(array[idx]) > 3.5 ||
        Math.abs(array[idx + 2]) > 3.5
      ) {
        array[idx] = (Math.random() - 0.5) * 3.0;
        array[idx + 1] = -2.5;
        array[idx + 2] = (Math.random() - 0.5) * 3.0;
      }
    }

    attribute.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[data.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        vertexColors
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        map={texture}
      />
    </points>
  );
}

/* ---------------------------------------------------------------- arka plan */

const BACKDROP_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/** Spec'teki sıvı bronz dalga shader'ı, birebir. */
const BACKDROP_FRAGMENT = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform float uScroll;

  float hash(float n) { return fract(sin(n) * 43758.5453123); }
  float noise(in vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f*f*(3.0-2.0*f);
    float n = p.x + p.y*57.0 + 113.0*p.z;
    return mix(mix(mix(hash(n+  0.0), hash(n+  1.0), f.x),
                   mix(hash(n+ 57.0), hash(n+ 58.0), f.x), f.y),
               mix(mix(hash(n+113.0), hash(n+114.0), f.x),
                   mix(hash(n+170.0), hash(n+171.0), f.x), f.y), f.z);
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;
    float aspect = uResolution.x / uResolution.y;

    float time = uTime * 0.08;
    float scroll = uScroll;

    float angle1 = 0.6;
    float angle2 = -0.7;
    float angle3 = 1.2;

    float freq1 = 2.4;
    float freq2 = 3.2;
    float freq3 = 4.0;

    vec2 warpedUv = uv;

    float scrollDeform = scroll * 5.0;

    warpedUv.x += sin(uv.y * 2.5 + time * 0.2 + scrollDeform) * 0.35;
    warpedUv.y += cos(uv.x * 2.5 - time * 0.15 - scrollDeform * 0.8) * 0.35;

    warpedUv.x += sin(uv.y * 1.2 - time * 0.1 - scrollDeform * 1.5) * 0.25;
    warpedUv.y += cos(uv.x * 1.2 + time * 0.18 + scrollDeform * 1.2) * 0.25;

    vec2 scrollDrift = vec2(scroll * 0.04, -scroll * 0.02);
    vec2 mouseShift = vec2(uMouse.x * aspect * 0.05, uMouse.y * 0.05);
    warpedUv += scrollDrift + mouseShift;

    vec2 dir1 = vec2(cos(angle1), sin(angle1));
    vec2 dir2 = vec2(cos(angle2), sin(angle2));
    vec2 dir3 = vec2(cos(angle3), sin(angle3));

    float w1 = sin(dot(warpedUv, dir1) * freq1 + time * 1.0);
    float w2 = cos(dot(warpedUv, dir2) * freq2 - time * 1.4 + w1 * 0.4);
    float w3 = sin(dot(warpedUv, dir3) * freq3 + time * 1.8 + w2 * 0.5);

    float waveField = w1 * 0.50 + w2 * 0.35 + w3 * 0.15;

    float wideSheen = pow(max(0.0, 1.0 - abs(waveField - 0.1)), 2.5);
    float crispSpecular = pow(max(0.0, 1.0 - abs(waveField - 0.15)), 8.0);
    float crest = wideSheen * 0.5 + crispSpecular * 0.9;

    vec3 c0_shadow = vec3(0.0010, 0.0006, 0.0004);
    vec3 c0_wave1  = vec3(0.085, 0.040, 0.015);
    vec3 c0_wave2  = vec3(0.050, 0.022, 0.008);
    vec3 c0_crest  = vec3(0.45, 0.30, 0.18);

    vec3 c1_shadow = vec3(0.0004, 0.0006, 0.0012);
    vec3 c1_wave1  = vec3(0.015, 0.035, 0.065);
    vec3 c1_wave2  = vec3(0.008, 0.020, 0.045);
    vec3 c1_crest  = vec3(0.18, 0.35, 0.55);

    float t = smoothstep(0.0, 1.0, scroll);
    vec3 colShadow = mix(c0_shadow, c1_shadow, t);
    vec3 colWave1  = mix(c0_wave1, c1_wave1, t);
    vec3 colWave2  = mix(c0_wave2, c1_wave2, t);
    vec3 colCrest  = mix(c0_crest, c1_crest, t);

    vec3 color = colShadow;
    color = mix(color, colWave2, smoothstep(-0.6, 0.2, waveField));
    color = mix(color, colWave1, smoothstep(0.0, 0.8, waveField));

    color += colCrest * crest * 1.4;

    float vignette = 1.0 - dot(uv, uv) * 0.12;
    color *= vignette;

    gl_FragColor = vec4(color, 1.0);
  }
`;

function Backdrop({ api }: { api: SceneApi }) {
  const mesh = useRef<THREE.Mesh>(null);

  /*
   * Uniform'lar ref'te ve materyale render prop'u olarak değil, ref geri
   * çağrısıyla veriliyor. İki kural birbirini kesiyor: `react-hooks/refs`
   * ref'i render sırasında okumayı, `react-hooks/immutability` de useMemo
   * çıktısını render'dan sonra değiştirmeyi yasaklıyor. lunar-gravity.tsx
   * aynı çıkmazı aynı şekilde çözüyor — uniform demeti ref'te durur, materyale
   * render dışında bir geri çağrıda bağlanır, her karede yerinde güncellenir.
   */
  const uniforms = useRef({
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uScroll: { value: 0 },
  });

  useFrame((state) => {
    const plane = mesh.current;
    if (!plane) return;

    // Spec'te bu düzlem kameranın çocuğu. R3F'in varsayılan kamerası sahne
    // grafiğinde olmadığı için orada çizilmezdi; kilitlemek aynı sonucu veriyor.
    plane.position.copy(state.camera.position);
    plane.quaternion.copy(state.camera.quaternion);
    plane.translateZ(-8);

    const u = uniforms.current;
    u.uTime.value = state.clock.elapsedTime;
    // gl_FragCoord cihaz pikseli; CSS pikseli verilirse dalga alanı eziliyor.
    state.gl.getDrawingBufferSize(u.uResolution.value);
    u.uMouse.value.set(state.pointer.x, state.pointer.y);
    u.uScroll.value = api.scroll();
  });

  return (
    // Her karede elle taşındığı için küre sınırı güvenilmez; kırpma kapalı.
    <mesh ref={mesh} renderOrder={-10} frustumCulled={false}>
      <planeGeometry args={[30, 30]} />
      <shaderMaterial
        ref={(material) => {
          // Program ilk çizimde derleniyor; ref geri çağrısı ondan önce
          // çalıştığı için uniform'lar yerinde oluyor. Koşul, ref yeniden
          // bağlandığında demetin sıfırlanmasını engelliyor.
          if (material && !material.uniforms.uTime) {
            material.uniforms = uniforms.current;
          }
        }}
        vertexShader={BACKDROP_VERTEX}
        fragmentShader={BACKDROP_FRAGMENT}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

/* --------------------------------------------------------- sektör halkası */

/**
 * Robotun çevresinde eşit açıyla duran dokuz düğüm — sayfadaki dokuz sektör.
 *
 * Etiketler drei'nin `Html`'i ile DOM olarak çiziliyor; alternatif olan
 * `Text` (troika) varsayılan yazı tipini bir CDN'den indiriyor ve bu projede
 * dış varlık bağımlılıkları bilerek temizlenmiş durumda.
 */
function SectorRing({ sectors }: { sectors: ForgeSector[] }) {
  const nodes = useRef<(THREE.Group | null)[]>([]);
  const labels = useRef<(HTMLDivElement | null)[]>([]);
  const worldPosition = useRef(new THREE.Vector3());

  const layout = useMemo(
    () =>
      sectors.map((sector, i) => {
        const angle = (i / sectors.length) * Math.PI * 2;
        return {
          sector,
          position: [
            Math.cos(angle) * RING_RADIUS,
            // Hafif dalgalı halka; düz bir daireden daha derin duruyor.
            -0.35 + Math.sin(angle * 2) * 0.22,
            Math.sin(angle) * RING_RADIUS,
          ] as [number, number, number],
        };
      }),
    [sectors],
  );

  useFrame((state) => {
    const cameraRadius = state.camera.position.length();

    for (let i = 0; i < layout.length; i++) {
      const node = nodes.current[i];
      if (!node) continue;

      node.getWorldPosition(worldPosition.current);
      const distance = worldPosition.current.distanceTo(state.camera.position);

      // Halkanın arka yarısındaki düğümler sönüyor: en yakın nokta kameraya
      // (yarıçap - halka yarıçapı) kadar, en uzak nokta toplamları kadar uzak.
      const depth = THREE.MathUtils.clamp(
        THREE.MathUtils.inverseLerp(
          cameraRadius + RING_RADIUS,
          cameraRadius - RING_RADIUS,
          distance,
        ),
        0,
        1,
      );

      const emphasis = Math.pow(depth, 2.2);
      node.scale.setScalar(0.6 + emphasis * 0.8);
      node.rotation.y += 0.004;

      const label = labels.current[i];
      if (label) label.style.opacity = String(0.12 + emphasis * 0.88);
    }
  });

  return (
    <group rotation={[-0.12, 0, 0]}>
      {layout.map((item, i) => (
        <group
          key={item.sector.code}
          position={item.position}
          ref={(node) => {
            nodes.current[i] = node;
          }}
        >
          <mesh>
            <octahedronGeometry args={[0.075, 0]} />
            <meshStandardMaterial
              color="#2a1408"
              emissive={EMBER}
              emissiveIntensity={2.2}
              roughness={0.3}
              metalness={0.4}
            />
          </mesh>

          <Html
            center
            distanceFactor={7}
            zIndexRange={[2, 0]}
            style={{ pointerEvents: 'none' }}
          >
            <div
              ref={(node) => {
                labels.current[i] = node;
              }}
              className="flex select-none items-center gap-2 whitespace-nowrap font-mono text-[0.62rem] uppercase tracking-[0.18em] text-paper/80"
            >
              <span className="text-signal">{item.sector.code}</span>
              {item.sector.name}
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}

/* -------------------------------------------------------------------- rig */

function CameraRig({ api }: { api: SceneApi }) {
  const target = useRef(new THREE.Vector3());
  const lookAt = useRef(new THREE.Vector3());

  useFrame((state) => {
    // Yumuşatmayı burada ilerletiyoruz: useFrame geri çağrıları kayıt sırasına
    // göre çalışıyor ve bu bileşen sahnedeki ilk tüketici. Diğerleri aynı
    // karede güncellenmiş değeri okuyor.
    api.advance();

    const scroll = api.scroll();
    const phi =
      state.clock.elapsedTime * IDLE_ORBIT_SPEED + scroll * ORBIT_SWEEP;
    const radius = 4.2 - Math.sin(scroll * Math.PI) * 0.6;

    target.current.set(
      Math.sin(phi) * radius,
      0.35 + Math.sin(scroll * Math.PI) * 0.8,
      Math.cos(phi) * radius,
    );
    state.camera.position.lerp(target.current, 0.05);

    // Figür sola değil sağa oturuyor: hero metni solda ve PageHero perdesi de
    // soldan karartıyor. Dar ekranda metin tam genişlik, itmenin anlamı yok.
    lookAt.current.set(state.size.width < 768 ? -0.2 : -0.9, -0.15, 0);
    state.camera.lookAt(lookAt.current);
  });

  return null;
}

/** Spec'teki chiaroscuro rigi — anahtar, kenar ve dolgu. */
function Lights() {
  return (
    <>
      <ambientLight color="#ffffff" intensity={0.1} />
      <spotLight
        color="#ffffff"
        intensity={18}
        position={[4, 6, 3]}
        angle={Math.PI / 4}
        penumbra={0.9}
      />
      <directionalLight color="#e3f2ff" intensity={10} position={[-5, 3, -4]} />
      <directionalLight color="#fff3e6" intensity={0.8} position={[-2, -4, 2]} />
    </>
  );
}

/* ---------------------------------------------------------------- bileşen */

type Props = {
  sectors: ForgeSector[];
  className?: string;
  /** Arka planda görünmeyen kıvılcımları kısmak için. */
  sparkCount?: number;
};

export function ForgeRobot({ sectors, className, sparkCount }: Props) {
  const [supported] = useState(hasWebGL);
  const [count] = useState(
    () => sparkCount ?? (window.innerWidth < 768 ? 180 : 450),
  );
  const [running, setRunning] = useState(true);

  const wrap = useRef<HTMLDivElement>(null);
  const scroll = useRef({ target: 0, current: 0, velocity: 0 });

  const api = useMemo<SceneApi>(
    () => ({
      advance() {
        const s = scroll.current;
        s.velocity = Math.abs(s.target - s.current);
        // 0.08: sayfada zaten lenis var, spec'in 0.025'i üstüne binince
        // sahne imlecin belirgin şekilde gerisinde kalıyordu.
        s.current += (s.target - s.current) * 0.08;
      },
      scroll: () => scroll.current.current,
      velocity: () => scroll.current.velocity,
    }),
    [],
  );

  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;

    // Hero'nun ekrandan çıkma ilerlemesi: üst kenarı görüntü alanının üstüne
    // değdiğinde 0, alt kenarı değdiğinde 1.
    const read = () => {
      const rect = el.getBoundingClientRect();
      const span = rect.height || 1;
      scroll.current.target = Math.min(1, Math.max(0, -rect.top / span));
    };
    read();

    window.addEventListener('scroll', read, { passive: true });
    window.addEventListener('resize', read);

    // Hero yukarı kayınca sahneyi çizmenin anlamı yok; sekme arkadayken de.
    const io = new IntersectionObserver(
      ([entry]) => setRunning(entry.isIntersecting && !document.hidden),
      { threshold: 0 },
    );
    io.observe(el);

    const onVisibility = () => setRunning(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('scroll', read);
      window.removeEventListener('resize', read);
      document.removeEventListener('visibilitychange', onVisibility);
      io.disconnect();
    };
  }, []);

  // WebGL yoksa sarmalayıcının altındaki durağan katman görünür kalıyor.
  if (!supported) return null;

  return (
    // Sahne sürüklenebilir değil: hero'daki CTA'nın tıklanabilir kalması gerek.
    <div ref={wrap} className={cn('pointer-events-none h-full w-full', className)}>
      <Canvas
        camera={{ position: [0, 0.2, 3.0], fov: 50, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        frameloop={running ? 'always' : 'never'}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 2.2;
        }}
      >
        <CameraRig api={api} />
        <Backdrop api={api} />
        <Lights />
        <Robot api={api} />
        <Sparks api={api} count={count} />
        <SectorRing sectors={sectors} />
      </Canvas>
    </div>
  );
}

export default ForgeRobot;
