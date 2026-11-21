import React from 'react';
import { useLanguage } from '@/store/useLanguageStore';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/types/i18n';
import { cn } from '@/utils/cn';
import { Globe } from 'lucide-react';

export interface LanguageToggleProps {
  className?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ className }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full bg-slate-100 p-1 border border-border/80 shadow-inner',
        className
      )}
      role="group"
      aria-label="Language selection"
    >
      <Globe className="h-4 w-4 ml-2 mr-1 text-muted" aria-hidden="true" />
      {SUPPORTED_LANGUAGES.map((lang) => {
        const isActive = language === lang.code;
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => setLanguage(lang.code as SupportedLanguage)}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-full transition-all touch-target flex items-center justify-center',
              isActive
                ? 'bg-primary text-white shadow-sm'
                : 'text-body hover:text-primary hover:bg-slate-200/60'
            )}
            aria-pressed={isActive}
            lang={lang.code}
          >
            {lang.nativeName}
          </button>
        );
      })}
    </div>
  );
};
