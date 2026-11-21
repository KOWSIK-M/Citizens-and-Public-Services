import { useSyncExternalStore } from 'react';
import { SupportedLanguage } from '../types/i18n';
import enDict from '../locales/en/common.json';
import teDict from '../locales/te/common.json';
import hiDict from '../locales/hi/common.json';

const STORAGE_KEY = 'claimsaathi_lang';

type NestedDictionary = { [key: string]: string | NestedDictionary };

const dictionaries: Record<SupportedLanguage, NestedDictionary> = {
  en: enDict as NestedDictionary,
  te: teDict as NestedDictionary,
  hi: hiDict as NestedDictionary,
};

function readInitialLanguage(): SupportedLanguage {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'te' || saved === 'hi') {
        return saved;
      }
    }
  } catch {
    // Restricted WebView / private iframe / SSR environment
  }
  return 'en';
}

let currentLanguage: SupportedLanguage = readInitialLanguage();

// Immediately sync `<html lang="...">` on module initialization for screen readers & CSS Indic rules
if (typeof document !== 'undefined' && document.documentElement) {
  document.documentElement.lang = currentLanguage;
}

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): SupportedLanguage {
  return currentLanguage;
}

export function setLanguage(lang: SupportedLanguage) {
  currentLanguage = lang;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, lang);
    }
  } catch {
    // Ignore storage quota / privacy errors
  }
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.lang = lang;
  }
  listeners.forEach((listener) => listener());
}

function resolvePath(dict: NestedDictionary, keys: string[]): string | undefined {
  let cursor: string | NestedDictionary = dict;
  for (const k of keys) {
    if (cursor && typeof cursor === 'object' && k in cursor) {
      cursor = cursor[k];
    } else {
      return undefined;
    }
  }
  return typeof cursor === 'string' ? cursor : undefined;
}

export function useLanguage() {
  const lang = useSyncExternalStore(subscribe, getSnapshot, () => 'en' as SupportedLanguage);

  const pick = <T>(en: T, te?: T, hi?: T): T => {
    if (lang === 'te' && te !== undefined && te !== '') return te;
    if (lang === 'hi' && hi !== undefined && hi !== '') return hi;
    return en;
  };

  const t = (path: string, params?: Record<string, string>): string => {
    const keys = path.split('.');
    let resolved = resolvePath(dictionaries[lang], keys);
    if (resolved === undefined) {
      resolved = resolvePath(dictionaries.en, keys);
    }
    if (resolved === undefined) {
      return path;
    }

    if (params) {
      let result = resolved;
      for (const [pKey, pVal] of Object.entries(params)) {
        result = result.split(`{{${pKey}}}`).join(pVal);
      }
      return result;
    }
    return resolved;
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
