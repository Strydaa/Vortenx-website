'use client';

import dynamic from 'next/dynamic';

/*
 * İlk hydration'a dahil değiller (kritik içerik değil, kullanıcı etkileşimi
 * bekliyorlar) — ssr:false ile ayrı chunk'a alınıp ana thread'den erteleniyor.
 * `ssr: false` sadece Client Component içinden çağrılabildiği için bu
 * sarmalayıcı gerekiyor.
 */
const ScrollProgress = dynamic(
  () => import('@/components/motion/scroll-progress').then((m) => m.ScrollProgress),
  { ssr: false },
);
const ChatWidget = dynamic(
  () => import('@/components/chat/chat-widget').then((m) => m.ChatWidget),
  { ssr: false },
);

export function DeferredWidgets() {
  return (
    <>
      <ScrollProgress />
      <ChatWidget />
    </>
  );
}
