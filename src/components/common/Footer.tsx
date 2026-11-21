import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/store/useLanguageStore';
import { ROUTES } from '@/config/routes';
import { ExternalLink, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  const { pick, getFontClass } = useLanguage();

  const officialPortals = [
    { name: 'myScheme Portal', url: 'https://www.myscheme.gov.in/' },
    { name: 'AP SGSW Welfare Portal', url: 'https://sgsw.ap.gov.in/' },
    { name: 'National Scholarships Portal (NSP)', url: 'https://scholarships.gov.in/' },
    { name: 'DBT Bharat Dashboard', url: 'https://dbtbharat.gov.in/' },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Mission & Guardrails */}
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <Shield className="h-5 w-5 text-amber-400" aria-hidden="true" />
              <span>ClaimSaathi</span>
            </div>
            <p className={`text-sm text-slate-400 leading-relaxed ${getFontClass()}`}>
              {pick(
                'Built for Problem Statement 5: Claim What’s Yours. Helping citizens in Andhra Pradesh navigate central and state welfare benefits with transparent, rule-based reasoning.',
                'సమస్య ప్రకటన 5 కోసం రూపొందించబడింది: ఆంధ్రప్రదేశ్‌లోని పౌరులకు కేంద్ర మరియు రాష్ట్ర సంక్షేమ పథకాల అర్హతలను పారదర్శకంగా తెలియజేసే వేదిక.',
                'समस्या विवरण 5 के लिए निर्मित: आंध्र प्रदेश के नागरिकों को केंद्रीय और राज्य कल्याणकारी योजनाओं की पारदर्शी पात्रता समझने में मदद करता है।'
              )}
            </p>
            <p className="text-xs text-slate-500 mt-3">
              Zero sensitive data collected. No Aadhaar or personal IDs stored.
            </p>
          </div>

          {/* Verified Government Sources */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">
              {pick('Official Portals', 'అధికారిక పోర్టల్స్', 'आधिकारिक पोर्टल')}
            </h4>
            <ul className="space-y-2 text-sm">
              {officialPortals.map((portal) => (
                <li key={portal.name}>
                  <a
                    href={portal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
                  >
                    <span>{portal.name}</span>
                    <ExternalLink className="h-3 w-3 text-slate-500" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links & Legal */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">
              {pick('Transparency', 'పారదర్శకత', 'पारदर्शिता')}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to={ROUTES.DISCLAIMER} className="text-slate-400 hover:text-white transition-colors">
                  {pick('Statutory Disclaimer', 'చట్టపరమైన నిరాకరణ', 'वैधानिक अस्वीकरण')}
                </Link>
              </li>
              <li>
                <Link to={ROUTES.ABOUT} className="text-slate-400 hover:text-white transition-colors">
                  {pick('Data Sources & Methodology', 'డేటా వనరులు & విధానం', 'डेटा स्रोत और कार्यप्रणाली')}
                </Link>
              </li>
              <li>
                <Link to={ROUTES.ADMIN} className="text-slate-400 hover:text-white transition-colors">
                  {pick('Admin Rule Registry', 'నిర్వాహక రిజిస్ట్రీ', 'प्रशासक नियम रजिस्ट्री')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 text-center text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} ClaimSaathi. Developed for Public Services & Citizen Welfare. All scheme rules cite verified government orders and official portals.
          </p>
        </div>
      </div>
    </footer>
  );
};
