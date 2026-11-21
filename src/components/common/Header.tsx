import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { useLanguage } from '@/store/useLanguageStore';
import { useTrackerStore } from '@/store/useTrackerStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationsStore } from '@/store/useNotificationsStore';
import { LanguageToggle } from './LanguageToggle';
import { ROUTES } from '@/config/routes';
import { cn } from '@/utils/cn';
import {
  ShieldCheck,
  Menu,
  X,
  Home,
  Sparkles,
  BookOpen,
  BookmarkCheck,
  Info,
  Scale,
  PhoneCall,
  MapPin,
  Users,
  Bell,
  UserCircle2,
  LogIn,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { pick, getFontClass } = useLanguage();
  const { trackedApplications } = useTrackerStore();
  const { user, isAuthenticated } = useAuthStore();
  const { unreadCount } = useNotificationsStore();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const trackerCount = trackedApplications.length;

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isRouteActive = (target: string) => {
    if (target === ROUTES.HOME) {
      return location.pathname === ROUTES.HOME;
    }
    if (target === ROUTES.DESCRIBE) {
      return (
        location.pathname.startsWith(ROUTES.DESCRIBE) ||
        location.pathname.startsWith(ROUTES.CONFIRM_PROFILE) ||
        location.pathname.startsWith(ROUTES.RESULTS)
      );
    }
    return location.pathname === target || location.pathname.startsWith(`${target}/`);
  };

  const desktopLinks = [
    {
      to: ROUTES.DESCRIBE,
      labelEn: 'Eligibility',
      labelTe: 'అర్హత తనిఖీ',
      labelHi: 'पात्रता जांचें',
      showBadge: false,
      highlightCall: false,
    },
    {
      to: ROUTES.VOICE_CALL,
      labelEn: 'Live Call',
      labelTe: 'లైవ్ కాల్',
      labelHi: 'लाइव कॉल',
      showBadge: false,
      highlightCall: true,
    },
    {
      to: ROUTES.SCHEMES_BROWSE,
      labelEn: 'Schemes',
      labelTe: 'పథకాలు',
      labelHi: 'योजनाएं',
      showBadge: false,
      highlightCall: false,
    },
    {
      to: ROUTES.SERVICE_CENTRES,
      labelEn: 'Centres',
      labelTe: 'సచివాలయాలు',
      labelHi: 'सेवा केंद्र',
      showBadge: false,
      highlightCall: false,
    },
    {
      to: ROUTES.COMMUNITY,
      labelEn: 'Community',
      labelTe: 'ప్రజా వేదిక',
      labelHi: 'समुदाय',
      showBadge: false,
      highlightCall: false,
    },
    {
      to: ROUTES.MY_SCHEMES,
      labelEn: 'My Tracker',
      labelTe: 'ట్రాకర్',
      labelHi: 'ट्रैकर',
      showBadge: true,
      highlightCall: false,
    },
  ];

  const mobileLinks = [
    {
      to: ROUTES.HOME,
      icon: Home,
      labelEn: 'Home',
      labelTe: 'హోమ్ పేజీ',
      labelHi: 'मुख्य पृष्ठ',
      showBadge: false,
    },
    {
      to: ROUTES.VOICE_CALL,
      icon: PhoneCall,
      labelEn: 'Saathi Live Voice Call',
      labelTe: 'సాథీ లైవ్ వాయిస్ కాల్',
      labelHi: 'साथी लाइव वॉइस कॉल',
      showBadge: false,
    },
    {
      to: ROUTES.DESCRIBE,
      icon: Sparkles,
      labelEn: 'Check Eligibility',
      labelTe: 'అర్హత తనిఖీ చేయండి',
      labelHi: 'पात्रता की जांच करें',
      showBadge: false,
    },
    {
      to: ROUTES.SCHEMES_BROWSE,
      icon: BookOpen,
      labelEn: 'Browse All Schemes',
      labelTe: 'అన్ని పథకాలను చూడండి',
      labelHi: 'सभी योजनाएं देखें',
      showBadge: false,
    },
    {
      to: ROUTES.SERVICE_CENTRES,
      icon: MapPin,
      labelEn: 'Sachivalayam & MeeSeva Locator',
      labelTe: 'సచివాలయం & మీసేవ లొకేటర్',
      labelHi: 'सचिवालय और मीसेवा लोकेटर',
      showBadge: false,
    },
    {
      to: ROUTES.COMMUNITY,
      icon: Users,
      labelEn: 'Community Chat & Scheme Voting',
      labelTe: 'ప్రజా వేదిక & పథకాల ఓటింగ్',
      labelHi: 'नागरिक चैट और योजना मतदान',
      showBadge: false,
    },
    {
      to: ROUTES.MY_SCHEMES,
      icon: BookmarkCheck,
      labelEn: 'My Applications & Claim Doctor',
      labelTe: 'నా దరఖాస్తులు & క్లెయిమ్ డాక్టర్',
      labelHi: 'मेरे आवेदन और क्लेम डॉक्टर',
      showBadge: true,
    },
    {
      to: ROUTES.NOTIFICATIONS,
      icon: Bell,
      labelEn: 'Notifications & Recent Govt Schemes',
      labelTe: 'నోటిఫికేషన్లు & కొత్త పథకాలు',
      labelHi: 'सूचनाएं और ताज़ा योजनाएं',
      showBadge: false,
    },
    {
      to: isAuthenticated ? ROUTES.PROFILE : ROUTES.AUTH,
      icon: isAuthenticated ? UserCircle2 : LogIn,
      labelEn: isAuthenticated
        ? `My Profile & Sector Insights (${user?.display_name})`
        : 'Sign In / Personalised Profile',
      labelTe: isAuthenticated ? 'నా ప్రొఫైల్ & రంగాల విశ్లేషణ' : 'లాగిన్ / వ్యక్తిగత ప్రొఫైల్',
      labelHi: isAuthenticated ? 'मेरी प्रोफ़ाइल व सेक्टर विश्लेषण' : 'साइन इन / व्यक्तिगत प्रोफ़ाइल',
      showBadge: false,
    },
    {
      to: ROUTES.ABOUT,
      icon: Info,
      labelEn: 'About & Sources',
      labelTe: 'మా గురించి & అధికారిక వనరులు',
      labelHi: 'परिचय और आधिकारिक स्रोत',
      showBadge: false,
    },
    {
      to: ROUTES.DISCLAIMER,
      icon: Scale,
      labelEn: 'Disclaimer',
      labelTe: 'చట్టపరమైన నిరాకరణ',
      labelHi: 'वैधानिक अस्वीकरण',
      showBadge: false,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 min-h-[64px] md:min-h-[76px] py-2 flex items-center justify-between gap-1 sm:gap-4">
        {/* Brand Logo (compact on 360px even with 16px scrollbar so zero overflow occurs) */}
        <Link
          to={ROUTES.HOME}
          className="flex items-center gap-1.5 sm:gap-2.5 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-md px-0.5 sm:px-1 shrink-0"
          aria-label={pick(
            'ClaimSaathi Home',
            'క్లెయిమ్ సాథీ హోమ్ పేజీ',
            'क्लेम साथी मुख्य पृष्ठ'
          )}
        >
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm shrink-0">
            <ShieldCheck className="h-4 w-4 sm:h-6 sm:w-6" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm sm:text-lg md:text-xl text-primary leading-snug tracking-tight">
              ClaimSaathi
            </span>
            <span
              className={cn(
                'text-xs text-muted leading-snug font-medium hidden 2xl:inline-block',
                getFontClass()
              )}
            >
              {pick(
                'Plain-Language Welfare Navigator',
                'సంక్షేమ పథకాల మార్గదర్శి',
                'कल्याणकारी योजना मार्गदर्शक'
              )}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation + Language Toggle + Mobile Drawer Trigger */}
        <div className="flex items-center gap-1.5 sm:gap-3 lg:gap-4">
          <nav
            className="hidden lg:flex items-center gap-1"
            aria-label={pick(
              'Primary navigation',
              'ప్రధాన నావిగేషన్',
              'मुख्य नेविगेशन'
            )}
          >
            {desktopLinks.map((link) => {
              const isActive = isRouteActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'min-h-[40px] px-2 py-1.5 text-[13px] xl:text-sm font-semibold rounded-md transition-colors inline-flex items-center gap-1 whitespace-nowrap',
                    link.highlightCall
                      ? isActive
                        ? 'bg-emerald-700 text-white'
                        : 'bg-emerald-50 text-emerald-900 border border-emerald-300 hover:bg-emerald-100'
                      : isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-slate-700 hover:text-primary hover:bg-slate-100',
                    getFontClass()
                  )}
                >
                  {link.highlightCall && (
                    <PhoneCall className="h-3.5 w-3.5 text-emerald-700 shrink-0" aria-hidden="true" />
                  )}
                  <span>{pick(link.labelEn, link.labelTe, link.labelHi)}</span>
                  {link.showBadge && (
                    <span
                      className={cn(
                        'inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-xs font-bold leading-none',
                        trackerCount > 0
                          ? 'bg-accent text-white'
                          : 'bg-slate-200 text-slate-700'
                      )}
                      aria-label={pick(
                        `${trackerCount} tracked applications`,
                        `${trackerCount} ట్రాక్ చేసిన దరఖాస్తులు`,
                        `${trackerCount} ट्रैक किए गए आवेदन`
                      )}
                    >
                      {trackerCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <Link
            to={ROUTES.NOTIFICATIONS}
            className="hidden sm:inline-flex relative items-center justify-center min-h-[40px] min-w-[40px] rounded-lg border border-slate-300 bg-white text-slate-700 hover:text-primary hover:bg-slate-50 transition-colors shrink-0"
            aria-label={pick('Notifications & Recent Schemes', 'నోటిఫికేషన్లు', 'सूचनाएं')}
          >
            <Bell className="h-4 w-4" aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          <Link
            to={isAuthenticated ? ROUTES.PROFILE : ROUTES.AUTH}
            className="hidden lg:inline-flex items-center gap-1.5 min-h-[40px] px-2.5 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-bold whitespace-nowrap shrink-0"
          >
            {isAuthenticated ? (
              <>
                <UserCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="max-w-[90px] truncate">{user?.display_name}</span>
              </>
            ) : (
              <>
                <LogIn className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{pick('Sign In', 'లాగిన్', 'साइन इन')}</span>
              </>
            )}
          </Link>

          <LanguageToggle />

          {/* Mobile Hamburger Menu Drawer (< lg) built with @radix-ui/react-dialog */}
          <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
            <Dialog.Trigger asChild>
              <button
                type="button"
                className="lg:hidden relative inline-flex items-center justify-center min-h-[44px] min-w-[44px] h-11 w-11 rounded-lg border border-slate-400 bg-white text-slate-800 hover:bg-slate-100 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus shrink-0 touch-target"
                aria-label={pick(
                  'Open navigation menu',
                  'నావిగేషన్ మెనూ తెరవండి',
                  'नेविगेशन मेनू खोलें'
                )}
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
                {trackerCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center leading-none shadow-sm"
                    aria-hidden="true"
                  >
                    {trackerCount}
                  </span>
                )}
              </button>
            </Dialog.Trigger>

            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm" />
              <Dialog.Content className="fixed inset-y-0 right-0 z-50 w-full max-w-xs sm:max-w-sm bg-white shadow-2xl border-l border-slate-200 flex flex-col focus:outline-none">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-white">
                      <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <Dialog.Title className="font-bold text-base text-primary leading-snug">
                        ClaimSaathi
                      </Dialog.Title>
                      <Dialog.Description
                        className={cn('text-xs text-muted leading-snug', getFontClass())}
                      >
                        {pick(
                          'Navigation & Tools',
                          'పేజీలు & సాధనాలు',
                          'पृष्ठ और सुविधाएं'
                        )}
                      </Dialog.Description>
                    </div>
                  </div>

                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="min-h-[44px] min-w-[44px] h-11 w-11 rounded-full inline-flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus touch-target"
                      aria-label={pick('Close menu', 'మెనూ మూసివేయండి', 'मेनू बंद करें')}
                    >
                      <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </Dialog.Close>
                </div>

                <nav
                  className="flex-1 overflow-y-auto p-4 space-y-1.5"
                  aria-label={pick(
                    'Mobile navigation',
                    'మొబైల్ నావిగేషన్',
                    'मोबाइल नेविगेशन'
                  )}
                >
                  {mobileLinks.map((item) => {
                    const isActive = isRouteActive(item.to);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          'w-full min-h-[48px] px-3.5 py-2.5 rounded-lg text-base font-semibold flex items-center justify-between gap-3 transition-colors touch-target',
                          isActive
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-slate-800 hover:bg-slate-100 hover:text-primary',
                          getFontClass()
                        )}
                      >
                        <span className="flex items-center gap-3 min-w-0">
                          <Icon
                            className={cn(
                              'h-5 w-5 shrink-0',
                              isActive ? 'text-white' : 'text-primary'
                            )}
                            aria-hidden="true"
                          />
                          <span className="leading-snug">
                            {pick(item.labelEn, item.labelTe, item.labelHi)}
                          </span>
                        </span>

                        {item.showBadge && (
                          <span
                            className={cn(
                              'inline-flex items-center justify-center min-w-[26px] h-[26px] px-2 rounded-full text-xs font-bold shrink-0',
                              isActive
                                ? 'bg-white text-primary'
                                : trackerCount > 0
                                ? 'bg-accent text-white'
                                : 'bg-slate-200 text-slate-700'
                            )}
                          >
                            {trackerCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>

                <div className="p-4 border-t border-slate-200 bg-slate-50">
                  <p className={cn('text-xs text-slate-600 leading-relaxed', getFontClass())}>
                    {pick(
                      'Privacy first: No Aadhaar, PAN, or phone numbers are ever collected.',
                      'గోప్యతకు ప్రాధాన్యత: ఆధార్, పాన్ లేదా ఫోన్ నంబర్లు ఎప్పుడూ సేకరించబడవు.',
                      'गोपनीयता सर्वप्रथम: आधार, पैन या फ़ोन नंबर कभी एकत्र नहीं किए जाते।'
                    )}
                  </p>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </header>
  );
};
