import { siteConfig } from '@/lib/site-config';

/** Google zengin sonuçları / knowledge panel için Organization + LocalBusiness şeması. */
export function OrganizationSchema() {
  const address = siteConfig.address;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/icon.png`,
    image: `${siteConfig.url}/icon.png`,
    email: siteConfig.email,
    telephone: siteConfig.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: [address.street, address.building].filter(Boolean).join(' '),
      addressLocality: address.district,
      addressRegion: address.city,
      postalCode: address.postalCode || undefined,
      addressCountry: 'TR',
    },
    sameAs: Object.values(siteConfig.social),
  };

  return (
    <script
      type="application/ld+json"
      // Sabit, kullanıcı girdisi içermeyen yapılandırılmış veri — XSS riski yok.
      // "<" karakterleri escape'leniyor ki değer içinde yanlışlıkla </script> oluşup
      // script etiketinin erken kapanmasına yol açmasın.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
    />
  );
}
