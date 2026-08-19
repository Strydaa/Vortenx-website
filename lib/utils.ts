import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge'ün varsayılan hâli `bg-grid` / `bg-dots` sınıflarımızı
 * arka plan *rengi* sanıp `bg-paper`, `bg-ink` gibi gerçek renklerle
 * çakıştırıyor ve birini eliyor. Oysa bunlar globals.css'teki desen
 * (background-image) sınıflarımız — renkle birlikte kullanılabilmeliler.
 * Kendi gruplarına alıyoruz: birbirleriyle çakışsınlar, renklerle çakışmasınlar.
 */
const twMerge = extendTailwindMerge<'bg-pattern'>({
  extend: {
    classGroups: {
      'bg-pattern': ['bg-grid', 'bg-dots'],
    },
  },
});

/**
 * Sınıf birleştirici. Çakışan Tailwind sınıflarında sonuncusu kazanır —
 * shadcn tarzı bileşenlerin `className` ile varsayılanı ezebilmesi buna bağlı.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
