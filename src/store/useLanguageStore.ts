import { useState, useEffect } from 'react';
import { SupportedLanguage } from '../types/i18n';
import enDict from '../locales/en/common.json';
import teDict from '../locales/te/common.json';
import hiDict from '../locales/hi/common.json';

const STORAGE_KEY = 'claimsaathi_lang';

const dictionaries: Record<SupportedLanguage, Record<string, any>> = {
  en: enDict,
  te: teDict,
  hi: hiDict,
};

// Global language state listener
let currentLanguage: SupportedLanguage = (() => {
  const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
  if (saved && (saved === 'en' || saved === 'te' || saved === 'hi')) {
    return saved;
  }
  return 'en';
})();

const listeners = new Set<(lang: SupportedLanguage) => void>();

export function setLanguage(lang: SupportedLanguage) {
  currentLanguage = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang;
  listeners.forEach((listener) => listener(lang));
}

export function useLanguage() {
  const [lang, setLangState] = useState<SupportedLanguage>(currentLanguage);

  useEffect(() => {
    const handler = (newLang: SupportedLanguage) => setLangState(newLang);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  // Helper to pick the appropriate localized string
  const pick = <T>(en: T, te?: T, hi?: T): T => {
    if (lang === 'te' && te) return te;
    if (lang === 'hi' && hi) return hi;
    return en;
  };

  // Translation lookup helper
  const t = (path: string, params?: Record<string, string>): string => {
    const keys = path.split('.');
    let val: any = dictionaries[lang];
    for (const k of keys) {
      if (val && typeof val === 'object' && k in val) {
        val = val[k];
      } else {
        // Fallback to English
        val = dictionaries['en'];
        for (const fallbackKey of keys) {
          if (val && typeof val === 'object' && fallbackKey in val) {
            val = val[fallbackKey];
          } else {
            return path;
          }
        }
      }
    }

    if (typeof val === 'string' && params) {
      let result = val;
      for (const [pKey, pVal] of Object.entries(params)) {
        result = result.replace(`{{${pKey}}}`, pVal);
      }
      return result;
    }

    return typeof val === 'string' ? val : path;
  };

  const getFontClass = () => {
    if (lang === 'te') return 'font-telugu';
    if (lang === 'hi') return 'font-hindi';
    return 'font-sans';
  };

  return {
    language: lang,
    setLanguage,
    t,
    pick,
    getFontClass,
  };
}
