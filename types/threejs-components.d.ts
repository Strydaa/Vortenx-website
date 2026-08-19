/**
 * `threejs-components` kendi tip tanımlarını getirmiyor ve `exports` alanı da
 * yok. tsconfig'de `strict` açık olduğu için tanımsız modül import etmek
 * TS7016 ile derlemeyi durdurur — bu dosya o boşluğu dolduruyor.
 *
 * İmzalar 0.0.19'daki `build/cursors/tubes1.min.js` paketinin içi okunarak
 * yazıldı; tahmin yok. Paketi yükseltirsen burayı da doğrula.
 */
declare module 'threejs-components/build/cursors/tubes1.min.js' {
  type TubesScene = {
    /** Tüp gövdelerini soldan sağa bu renkler arasında interpolasyonla boyar. */
    setColors(colors: string[]): void;
    /** Sahnedeki ışık sayısı sabit 4 — dizi daha kısaysa `undefined` okunur. */
    setLightsColors(colors: string[]): void;
    setLightsIntensity(intensity: number): void;
  };

  type ThreeWrapper = {
    /**
     * Kütüphane bunları kurulumda 2'ye sabitliyor, yani 1x ekranda bile
     * 4 kat piksel işleniyor. Kurulumdan sonra düşürüp `resize()` çağırmak
     * görüntüyü bozmadan yükü azaltıyor.
     */
    minPixelRatio: number;
    maxPixelRatio: number;
    resize(): void;
    dispose(): void;
  };

  export type TubesCursorOptions = {
    tubes?: {
      colors?: string[];
      lights?: { intensity?: number; colors?: string[] };
    };
    /** Post-processing bloom. Varsayılan açık; `false` ile kapatılabilir. */
    bloom?: false | { threshold?: number; strength?: number; radius?: number };
    /** İmleç alanın dışındayken tüplerin çizdiği boşta gezinme elipsi. */
    sleepRadiusX?: number;
    sleepRadiusY?: number;
    sleepTimeScale1?: number;
    sleepTimeScale2?: number;
  };

  export type TubesCursorInstance = {
    three: ThreeWrapper;
    tubes: TubesScene;
    dispose(): void;
  };

  export default function TubesCursor(
    canvas: HTMLCanvasElement,
    options?: TubesCursorOptions,
  ): TubesCursorInstance;
}
