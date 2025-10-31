
import { Language, Translations } from '../types';
import { en } from './en';
import { es } from './es';
import { pt } from './pt';
import { fr } from './fr';

const translations: Record<Language, Translations> = {
  en,
  es,
  pt,
  fr,
};

export const getTranslations = (lang: Language): Translations => {
  return translations[lang] || en;
};

// Helper function to navigate nested translation keys and handle replacements
export const t = (translations: Translations, key: string, replacements?: Record<string, string | number>): string => {
  const keys = key.split('.');
  let current: string | Translations = translations;
  for (const k of keys) {
    if (typeof current === 'object' && current !== null && k in current) {
      current = current[k];
    } else {
      return key; // Return key if not found
    }
  }

  if (typeof current === 'string') {
    if (replacements) {
      return Object.entries(replacements).reduce(
        (acc, [placeholder, value]) => acc.replace(`{${placeholder}}`, String(value)),
        current
      );
    }
    return current;
  }
  
  return key;
};
