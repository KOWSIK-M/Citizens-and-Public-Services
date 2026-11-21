import React from 'react';
import { useLanguage } from '@/store/useLanguageStore';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/types/i18n';
import { cn } from '@/utils/cn';
import { Globe } from 'lucide-react';

export interface LanguageToggleProps {
  className?: string;
}

const COMPACT_LABELS: Record<SupportedLanguage, string> = {
  en: 'EN',
  te: 'తె',
  hi: 'हि',
};

const ARIA_LABELS: Record<SupportedLanguage, string> = {
  en: 'Switch language to English',
  te: 'తెలుగు భాషను ఎంచుకోండి (Switch to Telugu)',
  hi: 'हिन्दी भाषा चुनें (Switch to Hindi)',
};

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ className }) => {
  const { language, setLanguage, pick } = useLanguage();

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full bg-slate-100 p-0.5 sm:p-1 border border-slate-300 shadow-inner shrink-0',
        className
      )}
      role="group"
      aria-label={pick(
        'Language selection',
        'భాషా ఎంపిక',
        'भाषा चयन'
      )}
    >
      <Globe
        className="hidden 2xl:block h-4 w-4 ml-2 mr-1 text-slate-600 shrink-0"
        aria-hidden="true"
      />
      {SUPPORTED_LANGUAGES.map((lang) => {
        const isActive = language === lang.code;
        const scriptClass =
          lang.code === 'te'
            ? 'font-telugu'
            : lang.code === 'hi'
            ? 'font-hindi'
            : 'font-sans';

        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => setLanguage(lang.code as SupportedLanguage)}
            className={cn(
              'min-h-[44px] min-w-[44px] px-2 2xl:px-3 py-1.5 text-xs font-semibold rounded-full transition-colors touch-target flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1',
              scriptClass,
              isActive
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-800 hover:text-primary hover:bg-slate-200/80'
            )}
            aria-pressed={isActive}
            aria-label={ARIA_LABELS[lang.code]}
            lang={lang.code}
          >
            <span className="2xl:hidden">{COMPACT_LABELS[lang.code]}</span>
            <span className="hidden 2xl:inline">{lang.nativeName}</span>
          </button>
        );
      })}
    </div>
  );
};
