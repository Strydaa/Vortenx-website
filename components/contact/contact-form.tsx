'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Status = 'idle' | 'sending' | 'success' | 'error' | 'notConfigured';
type Errors = Partial<Record<'name' | 'email' | 'message', string>>;

export function ContactForm() {
  const t = useTranslations('contact.form');
  const locale = useLocale() as 'tr' | 'en';

  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Errors>({});

  const budgetOptions = t.raw('budgetOptions') as string[];
  const topicOptions = t.raw('topicOptions') as string[];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    const payload = {
      name: String(fd.get('name') ?? '').trim(),
      email: String(fd.get('email') ?? '').trim(),
      company: String(fd.get('company') ?? '').trim(),
      budget: String(fd.get('budget') ?? ''),
      topic: String(fd.get('topic') ?? ''),
      message: String(fd.get('message') ?? '').trim(),
      website: String(fd.get('website') ?? ''),
      locale,
    };

    // İstemci tarafı doğrulama — sunucu zaten zod ile tekrar doğruluyor
    const next: Errors = {};
    if (payload.name.length < 2) next.name = t('required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(payload.email))
      next.email = t('invalidEmail');
    if (payload.message.length < 20) next.message = t('tooShort');

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 503) return setStatus('notConfigured');
      if (res.status === 429) {
        setErrors({ message: t('rateLimited') });
        return setStatus('idle');
      }
      if (!res.ok) return setStatus('error');

      form.reset();
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="card crosshair p-8 md:p-10">
        <span className="live-dot" aria-hidden />
        <h2 className="mt-5 font-display text-2xl font-bold tracking-[-0.03em]">
          {t('successTitle')}
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
          {t('successBody')}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {/* Bot tuzağı — ekran okuyuculardan ve görünümden gizli */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          name="name"
          label={t('name')}
          placeholder={t('namePlaceholder')}
          error={errors.name}
          required
          autoComplete="name"
        />
        <Field
          name="email"
          type="email"
          label={t('email')}
          placeholder={t('emailPlaceholder')}
          error={errors.email}
          required
          autoComplete="email"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          name="company"
          label={t('company')}
          placeholder={t('companyPlaceholder')}
          autoComplete="organization"
        />
        <Select name="topic" label={t('topic')} options={topicOptions} />
      </div>

      <Select
        name="budget"
        label={t('budget')}
        placeholder={t('budgetPlaceholder')}
        options={budgetOptions}
      />

      <div>
        <label htmlFor="message" className="label mb-2.5 block">
          {t('message')} <span className="text-signal">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          placeholder={t('messagePlaceholder')}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'message-error' : undefined}
          className={cn(
            'w-full resize-y border bg-surface px-4 py-3 text-sm leading-relaxed outline-none transition-colors duration-300 placeholder:text-muted/60 focus:border-signal',
            errors.message ? 'border-signal' : 'border-rule',
          )}
        />
        {errors.message && (
          <p id="message-error" className="mt-2 text-xs text-signal">
            {errors.message}
          </p>
        )}
      </div>

      {status === 'error' && (
        <p className="border border-signal/40 bg-signal/5 px-4 py-3 text-sm text-signal">
          <strong className="font-semibold">{t('errorTitle')}</strong>{' '}
          {t('errorBody')}
        </p>
      )}

      {status === 'notConfigured' && (
        <p className="border border-rule bg-surface px-4 py-3 text-sm text-muted">
          <strong className="font-semibold text-ink">
            {t('notConfiguredTitle')}
          </strong>{' '}
          {t('notConfiguredBody')}
        </p>
      )}

      <Button type="submit" size="lg" disabled={status === 'sending'} arrow>
        {status === 'sending' ? t('submitting') : t('submit')}
      </Button>
    </form>
  );
}

function Field({
  name,
  label,
  placeholder,
  error,
  type = 'text',
  required,
  autoComplete,
}: {
  name: string;
  label: string;
  placeholder?: string;
  error?: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="label mb-2.5 block">
        {label} {required && <span className="text-signal">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={cn(
          'h-12 w-full border bg-surface px-4 text-sm outline-none transition-colors duration-300 placeholder:text-muted/60 focus:border-signal',
          error ? 'border-signal' : 'border-rule',
        )}
      />
      {error && (
        <p id={`${name}-error`} className="mt-2 text-xs text-signal">
          {error}
        </p>
      )}
    </div>
  );
}

function Select({
  name,
  label,
  options,
  placeholder,
}: {
  name: string;
  label: string;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="label mb-2.5 block">
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue=""
        className="h-12 w-full border border-rule bg-surface px-4 text-sm outline-none transition-colors duration-300 focus:border-signal"
      >
        <option value="">{placeholder ?? '—'}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
