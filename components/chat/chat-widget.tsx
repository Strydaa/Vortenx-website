'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type Message = { role: 'user' | 'assistant'; content: string };

export function ChatWidget() {
  const t = useTranslations('chat');
  const locale = useLocale() as 'tr' | 'en';
  const reduced = useReducedMotion();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Yeni içerik geldikçe en alta kaydır
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, streaming]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Esc ile kapat
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || streaming) return;

    const next: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setNotice(null);
    setStreaming(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Son 12 mesajı gönder — API 20'de sınırlıyor
        body: JSON.stringify({ locale, messages: next.slice(-12) }),
      });

      if (res.status === 503) {
        setNotice(t('notConfigured'));
        return;
      }
      if (!res.ok || !res.body) {
        setNotice(t('error'));
        return;
      }

      // Boş assistant mesajı ekle, gelen parçaları içine yaz
      setMessages((m) => [...m, { role: 'assistant', content: '' }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = {
            role: 'assistant',
            content: copy[copy.length - 1].content + chunk,
          };
          return copy;
        });
      }
    } catch {
      setNotice(t('error'));
    } finally {
      setStreaming(false);
    }
  }

  const visible = messages.length > 0;

  return (
    <>
      {/* Açma butonu */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? t('close') : t('open')}
        className={cn(
          'fixed bottom-5 right-5 z-[70] flex h-12 items-center gap-2.5 border border-ink/15 bg-ink px-4 font-mono text-[0.68rem] uppercase tracking-[0.13em] text-paper shadow-lg transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-signal hover:text-[color:var(--signal-ink)] md:bottom-7 md:right-7',
          open && 'pointer-events-none opacity-0',
        )}
      >
        <span className="live-dot" aria-hidden />
        {t('open')}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label={t('title')}
            initial={reduced ? false : { opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-3 bottom-3 z-[70] flex max-h-[min(34rem,80vh)] flex-col border border-rule bg-surface shadow-2xl sm:inset-x-auto sm:right-7 sm:bottom-7 sm:w-[24rem]"
          >
            {/* Başlık */}
            <div className="flex items-start justify-between border-b border-rule px-4 py-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="live-dot" aria-hidden />
                  <span className="font-display text-sm font-bold tracking-[-0.02em]">
                    {t('title')}
                  </span>
                </div>
                <p className="label mt-1 normal-case tracking-normal">
                  {t('subtitle')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t('close')}
                className="-mr-1 -mt-1 grid h-7 w-7 place-items-center text-muted transition-colors duration-300 hover:text-signal"
              >
                <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden>
                  <path
                    d="M1 1l12 12M13 1L1 13"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </button>
            </div>

            {/* Mesajlar */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-3.5 overflow-y-auto px-4 py-4 text-sm leading-relaxed"
            >
              <p className="text-muted">{t('greeting')}</p>

              {visible &&
                messages.map((m, i) => (
                  <div
                    key={i}
                    className={cn(
                      'max-w-[88%] px-3 py-2',
                      m.role === 'user'
                        ? 'ml-auto bg-ink text-paper'
                        : 'border border-rule bg-paper',
                    )}
                  >
                    {m.content || (
                      <span className="inline-flex gap-1" aria-label="…">
                        {[0, 1, 2].map((d) => (
                          <span
                            key={d}
                            className="h-1 w-1 rounded-full bg-muted"
                            style={{
                              animation: 'pulse-dot 1.2s ease-in-out infinite',
                              animationDelay: `${d * 0.15}s`,
                            }}
                          />
                        ))}
                      </span>
                    )}
                  </div>
                ))}

              {notice && (
                <p className="border border-signal/40 bg-signal/5 px-3 py-2 text-[0.8rem] text-signal">
                  {notice}
                </p>
              )}
            </div>

            {/* Giriş */}
            <form
              onSubmit={send}
              className="flex items-center gap-2 border-t border-rule px-3 py-2.5"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('placeholder')}
                maxLength={2000}
                className="min-w-0 flex-1 bg-transparent py-1.5 text-sm outline-none placeholder:text-muted/70"
              />
              <button
                type="submit"
                disabled={streaming || !input.trim()}
                aria-label={t('send')}
                className="shrink-0 px-2 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-ink transition-colors duration-300 hover:text-signal disabled:opacity-35"
              >
                {t('send')} →
              </button>
            </form>

            <p className="label border-t border-rule px-4 py-2 text-[0.6rem]">
              {t('disclaimer')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
