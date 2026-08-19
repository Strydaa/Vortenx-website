import { Resend } from 'resend';
import { z } from 'zod';
import { siteConfig } from '@/lib/site-config';

export const runtime = 'nodejs';

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(200),
  company: z.string().trim().max(160).optional().or(z.literal('')),
  budget: z.string().trim().max(80).optional().or(z.literal('')),
  topic: z.string().trim().max(80).optional().or(z.literal('')),
  message: z.string().trim().min(20).max(4000),
  locale: z.enum(['tr', 'en']),
  // Bot tuzağı: gerçek kullanıcı bu gizli alanı doldurmaz
  website: z.string().max(0).optional().or(z.literal('')),
});

// Bellek içi hız sınırı (chat route'undakiyle aynı desen).
// Çok sunuculu kurulumda Upstash Redis gibi paylaşımlı bir sayaca taşınmalı.
const hits = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip: string) {
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    if (hits.size > 500) {
      for (const [key, value] of hits) if (now > value.resetAt) hits.delete(key);
    }
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

/** E-posta gövdesine giren metni HTML'e karşı nötrle. */
function esc(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL ?? 'Vortenxflow <onboarding@resend.dev>';

  if (!apiKey || !to) {
    return Response.json({ error: 'not_configured' }, { status: 503 });
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  if (rateLimited(ip)) {
    return Response.json({ error: 'rate_limited' }, { status: 429 });
  }

  let data;
  try {
    data = schema.parse(await req.json());
  } catch {
    return Response.json({ error: 'invalid_request' }, { status: 400 });
  }

  // Honeypot doldurulmuşsa sessizce başarılı dön — bota sinyal verme
  if (data.website) {
    return Response.json({ ok: true });
  }

  const resend = new Resend(apiKey);
  const tr = data.locale === 'tr';

  const rows: Array<[string, string]> = [
    [tr ? 'Ad' : 'Name', data.name],
    ['E-posta', data.email],
    [tr ? 'Şirket' : 'Company', data.company || '—'],
    [tr ? 'Bütçe' : 'Budget', data.budget || '—'],
    [tr ? 'İlgi alanı' : 'Topic', data.topic || '—'],
  ];

  try {
    // 1) Sana bildirim
    const notify = await resend.emails.send({
      from,
      to,
      replyTo: data.email,
      subject: `${tr ? 'Yeni talep' : 'New enquiry'} — ${data.name}${
        data.company ? ` (${data.company})` : ''
      }`,
      html: `
        <div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:600px">
          <h2 style="margin:0 0 16px">${tr ? 'Yeni form talebi' : 'New form enquiry'}</h2>
          <table style="border-collapse:collapse;width:100%;font-size:14px">
            ${rows
              .map(
                ([label, value]) =>
                  `<tr><td style="padding:6px 12px 6px 0;color:#666;white-space:nowrap">${esc(
                    label,
                  )}</td><td style="padding:6px 0">${esc(value)}</td></tr>`,
              )
              .join('')}
          </table>
          <p style="margin:20px 0 6px;color:#666;font-size:13px">${
            tr ? 'Mesaj' : 'Message'
          }</p>
          <div style="white-space:pre-wrap;border-left:3px solid #e33a12;padding-left:14px;font-size:14px;line-height:1.6">${esc(
            data.message,
          )}</div>
        </div>`,
    });

    if (notify.error) {
      console.error('[contact] notify failed', notify.error);
      return Response.json({ error: 'send_failed' }, { status: 502 });
    }

    // 2) Gönderene otomatik teşekkür — başarısız olsa da form başarılı sayılır
    const ack = await resend.emails.send({
      from,
      to: data.email,
      subject: tr
        ? 'Talebinizi aldık — Vortenxflow'
        : 'We received your message — Vortenxflow',
      html: `
        <div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:600px;font-size:14px;line-height:1.7">
          <p>${tr ? `Merhaba ${esc(data.name)},` : `Hi ${esc(data.name)},`}</p>
          <p>${
            tr
              ? 'Mesajınız bize ulaştı. 1 iş günü içinde dönüş yapacağız.'
              : 'Your message reached us. We will get back to you within one business day.'
          }</p>
          <p style="color:#666">${
            tr ? 'Gönderdiğiniz mesaj:' : 'Your message:'
          }</p>
          <div style="white-space:pre-wrap;border-left:3px solid #ddd;padding-left:14px;color:#666">${esc(
            data.message,
          )}</div>
          <p style="margin-top:24px">— Vortenxflow<br><span style="color:#666">${
            siteConfig.email
          }</span></p>
        </div>`,
    });

    if (ack.error) {
      console.error('[contact] ack failed', ack.error);
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error('[contact]', error);
    return Response.json({ error: 'send_failed' }, { status: 502 });
  }
}
