import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
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
    <div className="py-5 sm:py-6 md:py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Accessible Progress Stepper Bar (360px+ wrap-safe, high contrast) */}
        <nav
          className="mb-8"
          aria-label={pick(
            'Assessment Progress',
            'అర్హత తనిఖీ పురోగతి',
            'पात्रता जांच प्रगति'
          )}
        >
          <ol className="grid grid-cols-3 gap-2 relative">
            {/* Connecting track aligned to circle center (h-11 = 44px -> top-[22px], md:h-12 = 48px -> md:top-6) */}
            <div
              className="absolute top-[22px] md:top-6 left-[16.67%] right-[16.67%] h-0.5 bg-slate-300 z-0"
              aria-hidden="true"
            />
            <div
              className="absolute top-[22px] md:top-6 left-[16.67%] h-0.5 bg-primary z-0 transition-all duration-300"
              style={{
                width: `${((currentStep - 1) / (steps.length - 1)) * 66.66}%`,
              }}
              aria-hidden="true"
            />

            {steps.map((step) => {
              const isCompleted = step.id < currentStep;
              const isCurrent = step.id === currentStep;
              const Icon = step.icon;
              const stepLabel = pick(step.labelEn, step.labelTe, step.labelHi);

              const circleEl = (
                <span
                  className={cn(
                    'w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm md:text-base transition-colors border-2 shadow-sm shrink-0',
                    isCompleted
                      ? 'bg-primary border-primary text-white group-hover:bg-primary-hover'
                      : isCurrent
                      ? 'bg-white border-primary text-primary ring-4 ring-primary/20'
                      : 'bg-white border-slate-400 text-slate-600'
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5 md:h-6 md:w-6" aria-hidden="true" />
                  ) : (
                    <Icon className="h-5 w-5 md:h-6 md:w-6" aria-hidden="true" />
                  )}
                </span>
              );

              const labelEl = (
                <span
                  className={cn(
                    'mt-2 text-xs md:text-sm font-semibold text-center leading-snug break-words px-0.5',
                    isCurrent
                      ? 'text-primary'
                      : isCompleted
                      ? 'text-slate-800 group-hover:text-primary group-hover:underline underline-offset-2'
                      : 'text-slate-600',
                    getFontClass()
                  )}
                >
                  {stepLabel}
                </span>
              );

              return (
                <li key={step.id} className="relative z-10 flex flex-col items-center min-w-0">
                  {isCompleted ? (
                    <Link
                      to={step.path}
                      className="group flex flex-col items-center rounded-lg p-1 -m-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 touch-target"
                      aria-label={`${stepLabel} — ${pick(
                        'Completed, click to go back',
                        'పూర్తయింది, వెనుకకు వెళ్లడానికి నొక్కండి',
                        'पूर्ण, वापस जाने के लिए क्लिक करें'
                      )}`}
                    >
                      {circleEl}
                      {labelEl}
                    </Link>
                  ) : (
                    <div className="flex flex-col items-center">
                      {circleEl}
                      {labelEl}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Content Outlet */}
        <Outlet />
      </div>
    </div>
  );
};
