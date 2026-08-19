import { Bricolage_Grotesque, Geist, Geist_Mono } from 'next/font/google';

/**
 * latin-ext altkümesi Türkçe karakterler (ğ ş ı İ ç ö ü) için ZORUNLU.
 * Kaldırılırsa Türkçe metinlerde fallback font devreye girer.
 */
export const display = Bricolage_Grotesque({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-display',
  display: 'swap',
  axes: ['opsz'],
});

export const sans = Geist({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  display: 'swap',
});

export const mono = Geist_Mono({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-mono',
  display: 'swap',
});

export const fontVariables = `${display.variable} ${sans.variable} ${mono.variable}`;
