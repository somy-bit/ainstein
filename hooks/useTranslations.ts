

import { useLanguage } from '../contexts/LanguageContext';

export const useTranslations = () => {
  const { t } = useLanguage();
  return t;
};
