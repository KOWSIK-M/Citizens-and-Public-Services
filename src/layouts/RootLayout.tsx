import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { SampleProfileBanner } from '@/components/common/SampleProfileBanner';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useLanguage } from '@/store/useLanguageStore';
import { cn } from '@/utils/cn';

export const RootLayout: React.FC = () => {
  const { pick, getFontClass } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Keyboard-accessible Skip Link (WCAG 2.4.1) */}
      <a
        href="#main-content"
        className={cn(
          'sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:inline-flex focus:items-center focus:min-h-[44px] focus:px-4 focus:py-2.5 focus:rounded-lg focus:bg-primary focus:text-white focus:text-sm focus:font-semibold focus:shadow-lg focus:ring-2 focus:ring-focus focus:ring-offset-2',
          getFontClass()
        )}
      >
        {pick(
          'Skip to main content',
          'ప్రధాన విషయానికి వెళ్లండి',
          'मुख्य सामग्री पर जाएं'
        )}
      </a>

      <DisclaimerBanner />
      <SampleProfileBanner />
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
};
