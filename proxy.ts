import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Next.js 16'da bu dosya "proxy" olarak adlandırılıyor (eski adı: middleware.ts).
// Görevi: '/' isteğini tarayıcı diline göre /tr veya /en'e yönlendirmek.
export default createMiddleware(routing);

export const config = {
  // api, _next, _vercel ve nokta içeren dosya yolları hariç her şey
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};
