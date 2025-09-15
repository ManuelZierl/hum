import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en/common.json';
import de from './locales/de/common.json';

// Simple native detector using Intl APIs
const nativeDetector = {
  type: 'languageDetector' as const,
  init: () => {},
  detect: () =>
    Intl?.DateTimeFormat().resolvedOptions().locale.split('-')[0] ?? 'en',
  cacheUserLanguage: () => {},
};

const detector =
  typeof window !== 'undefined' ? new LanguageDetector() : nativeDetector;

void i18n
  .use(detector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    resources: {
      en: { common: en },
      de: { common: de },
    },
    ns: ['common'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: {
      order: ['navigator', 'querystring', 'cookie', 'localStorage'],
    },
  });

export default i18n;
