import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import enCommon from './locales/en/common.json';
import plCommon from './locales/pl/common.json';

export const SUPPORTED_LANGUAGES = ['pl', 'en'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const I18N_STORAGE_KEY = 'language';

export function isSupportedLanguage(value: unknown): value is SupportedLanguage {
  return typeof value === 'string' && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'pl',
    supportedLngs: SUPPORTED_LANGUAGES,
    ns: ['common'],
    defaultNS: 'common',
    resources: {
      pl: { common: plCommon },
      en: { common: enCommon },
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: I18N_STORAGE_KEY,
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false, // React already escapes
    },
    returnNull: false,
  });

export default i18n;
