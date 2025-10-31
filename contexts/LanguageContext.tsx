

import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';
import { Language, Translations } from '../types';
import { DEFAULT_LANGUAGE } from '../constants';
import { getTranslations, t as translateHelper } from '../translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translations: Translations;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  
  const translations = useMemo(() => getTranslations(language), [language]);
  const t = useMemo(() => (key: string, replacements?: Record<string, string | number>) => translateHelper(translations, key, replacements), [translations]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translations, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
