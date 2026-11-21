import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { TRANSLATIONS, type Language, type TranslationDictionary } from './translations';

interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDictionary;
}

const STORAGE_KEY = 'kavo_lang';

const I18nContext = createContext<I18nContextValue | null>(null);

function detectInitialLanguage(): Language {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'ru' || saved === 'uz') {
      return saved;
    }
  } catch {
    // Ignore storage access restrictions
  }
  return 'en';
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectInitialLanguage);

  const setLanguage = (nextLang: Language) => {
    setLanguageState(nextLang);
    try {
      window.localStorage.setItem(STORAGE_KEY, nextLang);
    } catch {
      // Ignore storage access restrictions
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      t: TRANSLATIONS[language],
    }),
    [language],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return ctx;
}
