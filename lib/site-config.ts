/**
 * Marka ve iletişim bilgileri — TEK DÜZENLEME NOKTASI.
 * Sitedeki metinler için messages/tr.json ve messages/en.json dosyalarına bak.
 */
export const siteConfig = {
  name: 'NextFlow',
  domain: 'nextflow.ai',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',

  email: 'merhaba@nextflow.ai',
  phone: '+90 000 000 00 00',
  whatsapp: '+900000000000',

  // Görüşme takvimi. Calendly linkin varsa buraya yapıştır, buton otomatik aktifleşir.
  calendly: '',

  /**
   * Danışmanlık sayfasındaki 3B panelin Spline sahnesi.
   * DİKKAT: Şu anki değer Spline'ın herkese açık demo sahnesi — NextFlow'a ait değil.
   * spline.design'da kendi sahneni yapıp "Export → Code Export" ile aldığın
   * .splinecode URL'sini buraya yapıştır. Boş bırakırsan panel hiç çizilmez.
   */
  splineScene: 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode',

  offices: [
    { city: 'İstanbul', coords: '41.0082° N, 28.9784° E' },
    { city: 'Amsterdam', coords: '52.3676° N, 4.9041° E' },
  ],

  social: {
    linkedin: 'https://linkedin.com/company/nextflow',
    x: 'https://x.com/nextflow',
    github: 'https://github.com/nextflow',
    instagram: 'https://instagram.com/nextflow',
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
