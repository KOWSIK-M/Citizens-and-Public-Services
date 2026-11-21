import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { SampleProfileBanner } from '@/components/common/SampleProfileBanner';

export const RootLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <DisclaimerBanner />
      <SampleProfileBanner />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
