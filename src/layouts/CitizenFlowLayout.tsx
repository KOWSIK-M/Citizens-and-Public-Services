import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useLanguage } from '@/store/useLanguageStore';
import { ROUTES } from '@/config/routes';
import { cn } from '@/utils/cn';
import { Check, Edit3, UserCheck, Award } from 'lucide-react';

export const CitizenFlowLayout: React.FC = () => {
  const { pick, getFontClass } = useLanguage();
  const location = useLocation();

  const steps = [
    {
      id: 1,
      path: ROUTES.DESCRIBE,
      icon: Edit3,
      labelEn: '1. Describe Situation',
      labelTe: '1. పరిస్థితిని వివరించండి',
      labelHi: '1. स्थिति का विवरण',
    },
    {
      id: 2,
      path: ROUTES.CONFIRM_PROFILE,
      icon: UserCheck,
      labelEn: '2. Review Details',
      labelTe: '2. వివరాల సమీక్ష',
      labelHi: '2. विवरण की समीक्षा',
    },
    {
      id: 3,
      path: ROUTES.RESULTS,
      icon: Award,
      labelEn: '3. Scheme Results',
      labelTe: '3. పథకాల ఫలితాలు',
      labelHi: '3. योजना परिणाम',
    },
  ];

  const getCurrentStepIndex = () => {
    if (location.pathname.startsWith(ROUTES.DESCRIBE)) return 1;
    if (location.pathname.startsWith(ROUTES.CONFIRM_PROFILE)) return 2;
    if (location.pathname.startsWith(ROUTES.RESULTS)) return 3;
    return 1;
  };

  const currentStep = getCurrentStepIndex();

  return (
    <div className="py-6 md:py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Stepper Bar */}
        <div className="mb-8" role="navigation" aria-label="Assessment Progress">
          <div className="flex items-center justify-between relative">
            {/* Connecting line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((step) => {
              const isCompleted = step.id < currentStep;
              const isCurrent = step.id === currentStep;
              const Icon = step.icon;

              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center">
                  <div
                    className={cn(
                      'w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm md:text-base transition-colors border-2 shadow-xs',
                      isCompleted
                        ? 'bg-primary border-primary text-white'
                        : isCurrent
                        ? 'bg-white border-primary text-primary ring-4 ring-primary/20'
                        : 'bg-white border-slate-300 text-slate-400'
                    )}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5 md:h-6 md:w-6" aria-hidden="true" />
                    ) : (
                      <Icon className="h-5 w-5 md:h-6 md:w-6" aria-hidden="true" />
                    )}
                  </div>
                  <span
                    className={cn(
                      'mt-2 text-xs md:text-sm font-semibold text-center whitespace-nowrap',
                      isCurrent
                        ? 'text-primary'
                        : isCompleted
                        ? 'text-slate-700'
                        : 'text-slate-400',
                      getFontClass()
                    )}
                  >
                    {pick(step.labelEn, step.labelTe, step.labelHi)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Outlet */}
        <Outlet />
      </div>
    </div>
  );
};
