/**
 * Marka ve iletişim bilgileri — TEK DÜZENLEME NOKTASI.
 * Sitedeki metinler için messages/tr.json ve messages/en.json dosyalarına bak.
 */
export const siteConfig = {
  name: 'Vortenx',
  domain: 'vortenxflow.ai',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',

  email: 'yusuf@vortenx.com',
  phone: '+90 501 048 80 80',
  whatsapp: '+905010488080',

  /**
   * Görüşme takvimi. Cal.com kullanıcı adın/etkinlik linkin (ör. "yusuf-vortenxflow/30dk").
   * cal.com'da ücretsiz hesap açıp bir etkinlik türü oluşturduktan sonra buraya yapıştır.
   * Boş bırakırsan /contact sayfasında takvim widget'ı hiç çizilmez, sadece form görünür.
   */
  calCom: 'yusuf-ibrahim-demir-ilkygg/30min',

  /**
   * Danışmanlık sayfasındaki 3B panelin Spline sahnesi.
   * DİKKAT: Şu anki değer Spline'ın herkese açık demo sahnesi — Vortenx'e ait değil.
   * spline.design'da kendi sahneni yapıp "Export → Code Export" ile aldığın
   * .splinecode URL'sini buraya yapıştır. Boş bırakırsan panel hiç çizilmez.
   */
  splineScene: 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode',

  offices: [{ city: 'İstanbul', coords: '41.0082° N, 28.9784° E' }],

  /**
   * Yasal/iletişim posta adresi (footer, privacy, terms, cold-email opt-out
   * uyumluluğu için gerekli). Bina no ve posta kodu henüz eksik — kullanıcı
   * sağladığında `building` ve `postalCode` alanlarını doldur.
   */
  address: {
    street: 'Beyaz Yelken Sokak',
    building: '',
    district: 'Üsküdar',
    city: 'İstanbul',
    postalCode: '',
    country: 'Türkiye',
  },

  social: {
    linkedin: 'https://linkedin.com/company/vortenx',
    x: 'https://x.com/vortenx',
    github: 'https://github.com/vortenx',
    instagram: 'https://instagram.com/vortenx',
  },
} as const;

/** Adresi tek satırlık gösterim metnine çevirir, doldurulmamış alanları atlar. */
export function formatAddress(address: typeof siteConfig.address): string {
  const { street, building, district, city, postalCode, country } = address;
  return [
    [street, building].filter(Boolean).join(' '),
    [postalCode, district].filter(Boolean).join(' '),
    [city, country].filter(Boolean).join(', '),
  ]
    .filter(Boolean)
    .join(', ');
}

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
