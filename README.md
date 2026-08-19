# Vortenxflow — Çift Dilli Funnel Web Sitesi

Otomasyon, AI sistemleri ve web kurulumu satan bir ajans sitesi. Türkçe ve İngilizce tek sitede, header'daki `TR / EN` butonuyla geçiş yapılır.

**Teknoloji:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · next-intl · Motion (Framer Motion) · Lenis · next-themes · Resend · Google Gemini SDK

---

## Hızlı Başlangıç

```bash
npm install
cp .env.example .env.local     # sonra anahtarları doldur
npm run dev                    # http://localhost:3000
```

`/` adresi tarayıcı diline göre `/tr` veya `/en`'e yönlendirir.

| Komut | Ne yapar |
|---|---|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Üretim derlemesi (tip hataları burada yakalanır) |
| `npm start` | Derlenmiş siteyi çalıştırır |
| `npm run lint` | ESLint |

---

## API Anahtarları

`.env.local` dosyasına yaz. Bu dosya `.gitignore`'da — asla repoya girmez.

| Değişken | Ne için | Nereden |
|---|---|---|
| `RESEND_API_KEY` | İletişim formunun mail göndermesi | [resend.com](https://resend.com) → API Keys (ücretsiz 3.000 mail/ay) |
| `CONTACT_TO_EMAIL` | Form taleplerinin düşeceği adres | Kendi e-postan |
| `CONTACT_FROM_EMAIL` | Gönderen adresi | Domain doğrulayana kadar `Vortenxflow <onboarding@resend.dev>` |
| `GEMINI_API_KEY` | Sitedeki AI sohbet botu (ücretsiz kota) | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| `NEXT_PUBLIC_SITE_URL` | Canonical / sitemap / OG adresleri | Canlıda `https://alanadin.com` |

**Anahtarsız da çalışır.** Anahtar yoksa site tamamen açılır; sadece form ve sohbet botu "henüz yapılandırılmadı" mesajı gösterir. Hiçbir yer çökmez.

> Animasyonlar, tema, dil geçişi ve tüm sayfalar için **hiçbir API anahtarı gerekmez.**

---

## İçeriği Nasıl Düzenlerim

**Sitedeki tüm metinler iki dosyada:**

```
messages/tr.json     ← Türkçe
messages/en.json     ← İngilizce
```

Kodda tek bir sabit metin yok. Bir cümleyi değiştirmek için ilgili anahtarı bul ve düzenle — sayfa otomatik güncellenir.

> ⚠️ **İki dosya aynı anahtar setine sahip olmalı.** Birine anahtar eklerken diğerine de ekle, yoksa o dilde metin görünmez.

**Marka bilgileri (e-posta, telefon, sosyal medya, ofisler, menü) için:**

```
lib/site-config.ts
```

### Yer tutucuları gerçek bilgilerle değiştir

Site şu an gerçekçi ama **uydurma** verilerle dolu. Yayına almadan önce şunları düzelt:

| Ne | Nerede |
|---|---|
| `[Kurucu Adı]`, kurucu biyografisi, öne çıkanlar | `messages/*.json` → `home.founder`, `about.founder` |
| `₺ [tutar]` / `$ [amount]` fiyatlar | `messages/*.json` → `advisory.packages`, `advisory.short`, `systems.packages`, `systems.retainers` |
| "Örnek Müşteri A/B/C" vakaları ve metrikleri | `messages/*.json` → `home.cases.items`, `cases.items` |
| İstatistikler (60+ proje, 12 yıl vb.) | `messages/*.json` → `home.stats.items` |
| Müşteri logo şeridindeki isimler | `components/sections/logo-marquee.tsx` |
| E-posta, telefon, sosyal medya, ofisler | `lib/site-config.ts` |
| Kurucu fotoğrafı (şu an "NF" monogramı) | `app/[locale]/about/page.tsx`, `components/sections/founder-card.tsx` |
| Danışmanlık sayfasındaki 3B sahne — şu anki değer **Spline'ın public demo robotu**, Vortenxflow'a ait değil | `lib/site-config.ts` → `splineScene` |

Bu rakamlar Vortenxflow adına gerçek olmayan iddialar; kendi verilerinle değiştirilmeden yayına alınmamalı.

---

## Yapı

```
app/
  [locale]/              # /tr ve /en altındaki tüm sayfalar
    page.tsx             # ana sayfa (11 bölüm)
    advisory/ systems/ cases/ blog/ about/ contact/
    layout.tsx           # html, tema, dil, header, footer, sohbet botu
    not-found.tsx
  api/
    contact/route.ts     # form → Resend
    chat/route.ts        # sohbet botu → Gemini (streaming)
  globals.css            # tasarım sistemi (renkler, tipografi, animasyonlar)
  sitemap.ts  robots.ts

components/
  layout/    header, footer, dil butonu, tema butonu, akıcı scroll
  motion/    Reveal, TextReveal, CountUp, Marquee, Magnetic, ScrollProgress
  sections/  ana sayfanın 11 bölümü
  ui/        Button, Section, PageHero, PricingCards, FaqAccordion
  chat/      sohbet widget'ı
  contact/   iletişim formu

i18n/        dil yönlendirmesi ve mesaj yükleme
lib/         site-config, fontlar, yardımcılar
messages/    tr.json, en.json  ← İÇERİK BURADA
proxy.ts     / → /tr veya /en yönlendirmesi
```

---

## Tasarım Sistemi

Renkler, tipografi ölçeği ve animasyon zamanlaması `app/globals.css` içinde CSS değişkeni olarak. Tek yerden değiştirilir:

```css
:root {
  --paper: #f2efe7;    /* zemin */
  --ink: #12100e;      /* metin */
  --signal: #e33a12;   /* vurgu */
}
:root.dark { ... }     /* koyu tema karşılıkları */
```

**Fontlar:** Bricolage Grotesque (başlıklar) + Geist (gövde) + Geist Mono (etiketler). Hepsi `latin-ext` altkümesiyle yükleniyor — Türkçe karakterler (ğ ş ı İ ç ö ü) için **zorunlu**, `lib/fonts.ts` içinden kaldırılmamalı.

**Hareket:** Tüm animasyonlar `prefers-reduced-motion` tercihini dinler. İşletim sisteminde animasyonlar kapalıysa her şey anında son duruma geçer.

---

## Sohbet Botu

`app/api/chat/route.ts` — Gemini ile streaming yanıt. System prompt içinde Vortenxflow'un hizmetleri, süreci ve kuralları var: fiyat vermez, uydurma müşteri/vaka anlatmaz, konu dışına çıkmaz.

**Modeli değiştirmek** (maliyet için): dosyanın başındaki tek satır —

```ts
const MODEL = 'claude-opus-5';   // 'claude-sonnet-5' daha ucuz
```

Koruma: IP başına dakikada 8 istek, mesaj başına 2000 karakter, konuşma başına 20 mesaj.

---

## Yayına Alma (Vercel)

1. Projeyi GitHub'a push et
2. [vercel.com](https://vercel.com) → **New Project** → repoyu seç
3. **Environment Variables** bölümüne `.env.local`'daki değişkenleri gir
4. `NEXT_PUBLIC_SITE_URL`'i gerçek alan adın yap
5. Deploy

Resend'de kendi alan adını doğrulayıp `CONTACT_FROM_EMAIL`'i `Vortenxflow <merhaba@alanadin.com>` yapmayı unutma — `onboarding@resend.dev` sadece test içindir.

---

## Yayın Öncesi Kontrol Listesi

- [ ] `messages/*.json` içindeki tüm yer tutucular gerçek bilgiyle değiştirildi
- [ ] `lib/site-config.ts` → e-posta, telefon, sosyal medya, ofisler güncel
- [ ] Fiyatlar ya gerçek ya da tamamen kaldırıldı
- [ ] Vaka çalışmaları gerçek projelerle değiştirildi (ya da bölüm kaldırıldı)
- [ ] Kurucu adı, biyografisi ve fotoğrafı eklendi
- [ ] `lib/site-config.ts` → `splineScene` kendi Spline sahnenle değiştirildi (şu anki değer Spline'ın demosu)
- [ ] `NEXT_PUBLIC_SITE_URL` gerçek alan adı
- [ ] Resend'de alan adı doğrulandı
- [ ] Form test edildi — mail geliyor mu
- [ ] `npm run build` hatasız
