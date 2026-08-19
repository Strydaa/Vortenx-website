import type { ReactNode } from 'react';
import './globals.css';

// html/body app/[locale]/layout.tsx içinde render ediliyor (lang attribute locale'e bağlı).
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
