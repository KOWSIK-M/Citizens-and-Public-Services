import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/store/useLanguageStore';
import { ROUTES } from '@/config/routes';
import { cn } from '@/utils/cn';
import { ExternalLink, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  const { language, pick, getFontClass } = useLanguage();

  const officialPortals = [
    {
      nameEn: 'myScheme Official Portal',
      nameTe: 'మై-స్కీమ్ అధికారిక పోర్టల్ (myScheme)',
      nameHi: 'माय-स्कीम आधिकारिक पोर्टल (myScheme)',
      url: 'https://www.myscheme.gov.in/',
    },
    {
      nameEn: 'AP GSWS / Navasakam Welfare Portal',
      nameTe: 'ఆంధ్రప్రదేశ్ గ్రామ/వార్డు సచివాలయ పోర్టల్ (GSWS)',
      nameHi: 'आंध्र प्रदेश ग्राम/वार्ड सचिवालय पोर्टल (GSWS)',
      url: 'https://gsws-nbm.ap.gov.in/',
    },
    {
      nameEn: 'National Scholarships Portal (NSP)',
      nameTe: 'జాతీయ స్కాలర్‌షిప్ పోర్టల్ (NSP)',
      nameHi: 'राष्ट्रीय छात्रवृत्ति पोर्टल (NSP)',
      url: 'https://scholarships.gov.in/',
    },
    {
      nameEn: 'DBT Bharat Dashboard',
      nameTe: 'డిబిటి భారత్ పోర్టల్ (DBT Bharat)',
      nameHi: 'डीबीटी भारत पोर्टल (DBT Bharat)',
      url: 'https://dbtbharat.gov.in/',
    },
  ];

  // Never apply uppercase or tracking-wider on Telugu ('te') or Hindi ('hi') script
  const headingCaseClass = language === 'en' ? 'uppercase tracking-wider' : '';
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-200 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Mission & Guardrails */}
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <Shield className="h-5 w-5 text-amber-400 shrink-0" aria-hidden="true" />
              <span>ClaimSaathi</span>
            </div>
            <p className={cn('text-sm text-slate-300 leading-relaxed', getFontClass())}>
              {pick(
                'Built for Problem Statement 5: Claim What’s Yours. Helping citizens in Andhra Pradesh navigate central and state welfare benefits with transparent, rule-based reasoning.',
                'సమస్య ప్రకటన 5 కోసం రూపొందించబడింది: ఆంధ్రప్రదేశ్‌లోని పౌరులకు కేంద్ర మరియు రాష్ట్ర సంక్షేమ పథకాల అర్హతలను పారదర్శకంగా తెలియజేసే వేదిక.',
                'समस्या विवरण 5 के लिए निर्मित: आंध्र प्रदेश के नागरिकों को केंद्रीय और राज्य कल्याणकारी योजनाओं की पारदर्शी पात्रता समझने में मदद करता है।'
              )}
            </p>
            <p className={cn('text-xs text-slate-300 mt-3 font-medium leading-relaxed', getFontClass())}>
              {pick(
                'Zero sensitive data collected. No Aadhaar, PAN, phone, or bank numbers stored.',
                'సున్నితమైన వ్యక్తిగత డేటా సేకరించబడదు. ఆధార్, పాన్, ఫోన్ లేదా బ్యాంక్ నంబర్లు నిల్వ చేయబడవు.',
                'कोई संवेदनशील डेटा एकत्र नहीं किया जाता। आधार, पैन, फ़ोन या बैंक नंबर कभी संग्रहीत नहीं किए जाते।'
              )}
            </p>
          </div>

          {/* Official Government Portals */}
          <div>
            <h4
              className={cn(
                'text-white font-semibold text-sm mb-3',
                headingCaseClass,
                getFontClass()
              )}
            >
              {pick('Official Portals', 'అధికారిక పోర్టల్స్', 'आधिकारिक पोर्टल')}
            </h4>
            <ul className="space-y-1 text-sm">
              {officialPortals.map((portal) => (
                <li key={portal.url}>
                  <a
                    href={portal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'inline-flex items-center gap-2 min-h-[44px] py-2 text-slate-300 hover:text-white underline-offset-4 hover:underline transition-colors rounded-sm',
                      getFontClass()
                    )}
                  >
                    <span>{pick(portal.nameEn, portal.nameTe, portal.nameHi)}</span>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-300 shrink-0" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links, Citizen Tools & Staff Governance */}
          <div>
            <h4
              className={cn(
                'text-white font-semibold text-sm mb-3',
                headingCaseClass,
                getFontClass()
              )}
            >
              {pick('Transparency & Links', 'పారదర్శకత & లింకులు', 'पारदर्शिता और लिंक')}
            </h4>
            <ul className="space-y-1 text-sm">
              <li>
                <Link
                  to={ROUTES.SCHEMES_BROWSE}
                  className={cn(
                    'inline-flex items-center min-h-[44px] py-2 text-slate-300 hover:text-white underline-offset-4 hover:underline transition-colors rounded-sm',
                    getFontClass()
                  )}
                >
                  {pick('Browse All Schemes', 'అన్ని పథకాలను చూడండి', 'सभी योजनाएं देखें')}
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.DISCLAIMER}
                  className={cn(
                    'inline-flex items-center min-h-[44px] py-2 text-slate-300 hover:text-white underline-offset-4 hover:underline transition-colors rounded-sm',
                    getFontClass()
                  )}
                >
                  {pick('Statutory Disclaimer', 'చట్టపరమైన నిరాకరణ', 'वैधानिक अस्वीकरण')}
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.ABOUT}
                  className={cn(
                    'inline-flex items-center min-h-[44px] py-2 text-slate-300 hover:text-white underline-offset-4 hover:underline transition-colors rounded-sm',
                    getFontClass()
                  )}
                >
                  {pick('Data Sources & Methodology', 'డేటా వనరులు & విధానం', 'डेटा स्रोत और कार्यप्रणाली')}
                </Link>
              </li>
              {import.meta.env.DEV && <li>
                <Link
                  to={ROUTES.ADMIN}
                  className={cn(
                    'inline-flex items-center min-h-[44px] py-2 text-slate-300 hover:text-white underline-offset-4 hover:underline transition-colors rounded-sm',
                    getFontClass()
                  )}
                >
                  {pick(
                    'Rule Governance Demo',
                    'నిబంధనల నిర్వహణ నమూనా',
                    'नियम प्रबंधन डेमो'
                  )}
                </Link>
              </li>}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 text-center text-xs text-slate-300">
          <p className={cn('leading-relaxed', getFontClass())}>
            {pick(
              `© ${currentYear} ClaimSaathi. A demo for Public Services & Citizen Welfare.`,
              `© ${currentYear} క్లెయిమ్ సాథీ. ప్రజా సేవలు, పౌర సంక్షేమం కోసం రూపొందించిన నమూనా.`,
              `© ${currentYear} क्लेम साथी। लोक सेवा और नागरिक कल्याण के लिए एक डेमो।`
            )}
          </p>
        </div>
      </div>
    </footer>
  );
};
