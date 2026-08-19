/**
 * Marka ve iletişim bilgileri — TEK DÜZENLEME NOKTASI.
 * Sitedeki metinler için messages/tr.json ve messages/en.json dosyalarına bak.
 */
export const siteConfig = {
  name: 'Vortenxflow',
  domain: 'vortenxflow.ai',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',

  email: 'merhaba@vortenxflow.ai',
  phone: '+90 501 048 80 80',
  whatsapp: '+905010488080',

  // Görüşme takvimi. Calendly linkin varsa buraya yapıştır, buton otomatik aktifleşir.
  calendly: '',

  /**
   * Danışmanlık sayfasındaki 3B panelin Spline sahnesi.
   * DİKKAT: Şu anki değer Spline'ın herkese açık demo sahnesi — Vortenxflow'a ait değil.
   * spline.design'da kendi sahneni yapıp "Export → Code Export" ile aldığın
   * .splinecode URL'sini buraya yapıştır. Boş bırakırsan panel hiç çizilmez.
   */
  splineScene: 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode',

  offices: [{ city: 'İstanbul', coords: '41.0082° N, 28.9784° E' }],

  social: {
    linkedin: 'https://linkedin.com/company/vortenxflow',
    x: 'https://x.com/vortenxflow',
    github: 'https://github.com/vortenxflow',
    instagram: 'https://instagram.com/vortenxflow',
  },
} as const;

/** Header ve footer navigasyonu. href'ler locale önekini next-intl'den alır. */
export const navLinks = [
  { key: 'advisory', href: '/advisory' },
  { key: 'systems', href: '/systems' },
  { key: 'programs', href: '/programs' },
  { key: 'kurumIci', href: '/kurum-ici' },
  { key: 'cases', href: '/cases' },
  { key: 'industries', href: '/industries' },
  { key: 'about', href: '/about' },
] as const;
