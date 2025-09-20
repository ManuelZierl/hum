import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import de from './locales/de/common.json';
import en from './locales/en/common.json';

type DetectorPlugin = {
  type: 'languageDetector';
  init: () => void;
  detect: () => string;
  cacheUserLanguage: () => void;
};

const isBrowser =
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.navigator !== 'undefined';

declare const require: undefined | ((module: string) => unknown);

function detectFromNativeApis(): string {
  try {
    if (typeof require === 'function') {
      // expo-localization is only available on native targets. Requiring it in
      // non-native environments (tests, SSR) throws, so we guard it.

      const localization = require('expo-localization') as {
        getLocales?: () => Array<{
          languageCode?: string;
          languageTag?: string;
        }>;
      };
      const getLocales = localization?.getLocales;
      if (typeof getLocales === 'function') {
        const locales = getLocales();
        if (Array.isArray(locales) && locales.length > 0) {
          const primary = locales[0];
          if (primary?.languageCode) {
            return primary.languageCode;
          }
          if (primary?.languageTag) {
            const [language] = primary.languageTag.split('-');
            if (language) {
              return language;
            }
          }
        }
      }
    }
  } catch {
    // expo-localization isn't available (e.g. jest or browser). Fall back to
    // the Intl logic below.
  }

  if (typeof navigator !== 'undefined' && navigator.language) {
    const [language] = navigator.language.split('-');
    if (language) {
      return language;
    }
  }

  if (typeof Intl !== 'undefined') {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    if (locale) {
      const [language] = locale.split('-');
      if (language) {
        return language;
      }
    }
  }

  return 'en';
}

const nativeDetector: DetectorPlugin = {
  type: 'languageDetector',
  init: () => {},
  detect: detectFromNativeApis,
  cacheUserLanguage: () => {},
};

const detector = isBrowser ? new LanguageDetector() : nativeDetector;

const detectionConfig = isBrowser
  ? {
      order: ['htmlTag', 'navigator', 'querystring', 'cookie', 'localStorage'],
    }
  : undefined;

void i18n
  .use(detector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'de'],
    resources: {
      en: { common: en },
      de: { common: de },
    },
    ns: ['common'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: detectionConfig,
  });

export const __testing__ = {
  detectFromNativeApis,
  nativeDetector,
  isBrowser,
};

export default i18n;
