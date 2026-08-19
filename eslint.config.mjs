import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

// eslint-config-next 16 flat config'i doğrudan dışa aktarıyor —
// FlatCompat gerekmiyor (ESLint 10 ile uyumsuz zaten).
const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'] },
];

export default eslintConfig;
