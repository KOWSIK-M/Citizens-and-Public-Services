import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/store/useLanguageStore';
import { LanguageToggle } from './LanguageToggle';
import { ROUTES } from '@/config/routes';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/utils/cn';

export const Header: React.FC = () => {
  const { pick, getFontClass } = useLanguage();
  const location = useLocation();

  const navLinks = [
    {
      to: ROUTES.HOME,
      labelEn: 'Home',
      labelTe: 'హోమ్',
      labelHi: 'मुख्य पृष्ठ',
    },
    {
      to: ROUTES.DESCRIBE,
      labelEn: 'Check Eligibility',
      labelTe: 'అర్హత తనిఖీ',
      labelHi: 'पात्रता जांचें',
    },
    {
      to: ROUTES.ABOUT,
      labelEn: 'About & Sources',
      labelTe: 'గురించి & వనరులు',
      labelHi: 'बारे में और स्रोत',
    },
    {
      to: ROUTES.DISCLAIMER,
      labelEn: 'Disclaimer',
      labelTe: 'నిరాకరణ',
      labelHi: 'अस्वीकरण',
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link
          to={ROUTES.HOME}
          className="flex items-center gap-2.5 focus-visible:ring-2 focus-visible:ring-focus rounded-md p-1"
          aria-label="ClaimSaathi Home"
        >
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-white shadow-xs">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg md:text-xl text-primary leading-tight tracking-tight">
              ClaimSaathi
            </span>
            <span className="text-[11px] text-muted leading-tight font-medium hidden sm:inline-block">
              {pick(
                'Plain-Language Welfare Navigator',
                'సంక్షేమ పథకాల మార్గదర్శి',
                'कल्याणकारी योजना मार्गदर्शक'
              )}
            </span>
          </div>
        </Link>

        {/* Navigation links & Language Switcher */}
        <div className="flex items-center gap-3 md:gap-6">
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    'px-3 py-2 text-sm font-semibold rounded-md transition-colors',
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-muted hover:text-primary hover:bg-slate-100',
                    getFontClass()
                  )}
                >
                  {pick(link.labelEn, link.labelTe, link.labelHi)}
                </Link>
              );
            })}
          </nav>

          <LanguageToggle />
        </div>
      </div>
    </header>
  );
};
