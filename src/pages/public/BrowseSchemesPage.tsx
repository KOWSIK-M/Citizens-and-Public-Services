import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/store/useLanguageStore';
import { useSchemeStore } from '@/store/useSchemeStore';
import { useTrackerStore } from '@/store/useTrackerStore';
import { VerificationBadge } from '@/components/common/VerificationBadge';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/config/routes';
import {
  BookOpen,
  Search,
  IndianRupee,
  CalendarClock,
  ExternalLink,
  FileText,
  BookmarkPlus,
  BookmarkCheck,
  Sparkles,
} from 'lucide-react';

export const BrowseSchemesPage: React.FC = () => {
  const { pick, getFontClass } = useLanguage();
  const { schemes } = useSchemeStore();
  const { isSchemeTracked, trackSchemeFromResult } = useTrackerStore();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const publishedSchemes = schemes.filter((s) => s.is_published);

  const filtered = publishedSchemes.filter((s) => {
    const matchesCat = category === 'all' || s.category === category;
    if (!matchesCat) return false;
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return (
      s.name_en.toLowerCase().includes(q) ||
      s.name_te.toLowerCase().includes(q) ||
      s.name_hi.toLowerCase().includes(q) ||
      s.benefit_summary_en.toLowerCase().includes(q) ||
      s.scheme_code.toLowerCase().includes(q)
    );
  });

  const categories = [
    { id: 'all', en: 'All', te: 'అన్నీ', hi: 'सभी' },
    { id: 'scholarship', en: 'Education & Scholarships', te: 'విద్య & స్కాలర్‌షిప్‌లు', hi: 'शिक्षा व छात्रवृत्ति' },
    { id: 'pension', en: 'Social Pensions', te: 'పెన్షన్లు', hi: 'पेंशन' },
    { id: 'farm', en: 'Agriculture & Tenant Farmers', te: 'వ్యవసాయం & కౌలు రైతులు', hi: 'कृषि व किसान' },
    { id: 'health', en: 'Healthcare', te: 'ఆరోగ్యం', hi: 'स्वास्थ्य' },
    { id: 'women_child', en: 'Household & Women', te: 'మహిళా & గృహ సంక్షేమం', hi: 'महिला व घरेलू' },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 md:py-12 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-2">
          <h1 className={`text-2xl md:text-3xl font-extrabold text-primary flex items-center gap-2.5 ${getFontClass()}`}>
            <BookOpen className="h-7 w-7 text-primary shrink-0" aria-hidden="true" />
            <span>
              {pick(
                'Andhra Pradesh & Central Scheme Directory',
                'ఆంధ్రప్రదేశ్ & కేంద్ర సంక్షేమ పథకాల జాబితా',
                'आंध्र प्रदेश और केंद्रीय कल्याणकारी योजना निर्देशिका'
              )}
            </span>
          </h1>
          <p className={`text-sm md:text-base text-muted ${getFontClass()}`}>
            {pick(
              'Explore public scheme rules, verification dates, official portals, and required documents—or run a personalised plain-language check.',
              'అన్ని ప్రభుత్వ పథకాల నిబంధనలు, అధికారిక వెబ్‌సైట్లు, గడువు తేదీలు మరియు అవసరమైన పత్రాలను ఇక్కడ చూడండి.',
              'सभी सार्वजनिक योजनाओं के नियम, सत्यापन तिथियां, आधिकारिक पोर्टल और आवश्यक दस्तावेज़ देखें।'
            )}
          </p>
        </div>

        <Button
          onClick={() => navigate(ROUTES.DESCRIBE)}
          className={`min-h-[44px] inline-flex items-center gap-2 shrink-0 ${getFontClass()}`}
        >
          <Sparkles className="h-4 w-4 text-amber-300" aria-hidden="true" />
          <span>{pick('Check My Eligibility', 'నా అర్హతను తనిఖీ చేయండి', 'मेरी पात्रता जांचें')}</span>
        </Button>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-4">
        <div className="relative max-w-xl">
          <label htmlFor="scheme-search" className="sr-only">
            {pick('Search schemes', 'పథకాలను వెతకండి', 'योजनाएं खोजें')}
          </label>
          <Search className="h-4 w-4 text-muted absolute left-3.5 top-3.5" aria-hidden="true" />
          <Input
            id="scheme-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={pick(
              'Search by scheme name (e.g. Talliki Vandanam, Pension, PM-KISAN)…',
              'పథకం పేరుతో వెతకండి (ఉదా: తల్లికి వందనం, పెన్షన్, రైతు)…',
              'योजना के नाम से खोजें (जैसे: तल्लिकी वंदनम, पेंशन, किसान)…'
            )}
            className={`pl-10 ${getFontClass()}`}
          />
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              aria-pressed={category === cat.id}
              className={`min-h-[44px] px-3.5 py-2 rounded-md text-sm font-semibold border transition-colors ${
                category === cat.id
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-body border-slate-300 hover:bg-slate-100'
              } ${getFontClass()}`}
            >
              {pick(cat.en, cat.te, cat.hi)}
            </button>
          ))}
        </div>
      </div>

      {/* Scheme Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-live="polite">
        {filtered.map((scheme) => {
          const tracked = isSchemeTracked(scheme.id);
          return (
            <Card key={scheme.id} className="border border-border shadow-sm flex flex-col justify-between">
              <CardHeader className="p-5 pb-3 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="outline" className={`border-primary/40 text-primary font-semibold text-sm ${getFontClass()}`}>
                    {scheme.level === 'state'
                      ? pick('AP State', 'ఆంధ్రప్రదేశ్ రాష్ట్రం', 'आंध्र प्रदेश राज्य')
                      : pick('Central Govt', 'కేంద్ర ప్రభుత్వం', 'केंद्र सरकार')}
                  </Badge>
                  <VerificationBadge
                    isVerified={Boolean(scheme.source.verified_at)}
                    verifiedAt={scheme.source.verified_at}
                  />
                </div>

                <CardTitle className={`text-lg font-bold leading-snug ${getFontClass()}`}>
                  <Link
                    to={ROUTES.SCHEME_DETAIL(scheme.id)}
                    className="hover:text-primary hover:underline"
                  >
                    {pick(scheme.name_en, scheme.name_te, scheme.name_hi)}
                  </Link>
                </CardTitle>
              </CardHeader>

              <CardContent className="px-5 py-2 space-y-3 flex-1">
                <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-md p-3 text-sm text-slate-800 font-medium">
                  <IndianRupee className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                  <span className={getFontClass()}>
                    {pick(scheme.benefit_summary_en, scheme.benefit_summary_te, scheme.benefit_summary_hi)}
                  </span>
                </div>

                <p className={`text-sm text-slate-700 leading-relaxed ${getFontClass()}`}>
                  {pick(scheme.description_en, scheme.description_te, scheme.description_hi)}
                </p>

                {scheme.deadline_label_en && (
                  <div className={`flex items-center gap-1.5 text-sm text-amber-900 font-medium ${getFontClass()}`}>
                    <CalendarClock className="h-4 w-4 text-amber-700 shrink-0" aria-hidden="true" />
                    <span>
                      {pick(scheme.deadline_label_en, scheme.deadline_label_te, scheme.deadline_label_hi)}
                    </span>
                  </div>
                )}
              </CardContent>

              <CardFooter className="p-5 pt-3 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2 mt-3">
                <a
                  href={scheme.source.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`min-h-[44px] inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline ${getFontClass()}`}
                >
                  <span>{pick('Official Portal', 'అధికారిక పోర్టల్', 'आधिकारिक पोर्टल')}</span>
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      trackSchemeFromResult(scheme);
                      navigate(ROUTES.MY_SCHEMES);
                    }}
                    className={`min-h-[44px] text-sm px-3 inline-flex items-center gap-1.5 ${getFontClass()}`}
                  >
                    {tracked ? (
                      <BookmarkCheck className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                    ) : (
                      <BookmarkPlus className="h-4 w-4 text-amber-700" aria-hidden="true" />
                    )}
                    <span>{tracked ? pick('Tracked', 'ట్రాక్‌లో ఉంది', 'ट्रैक किया गया') : pick('Track', 'ట్రాక్ చేయండి', 'ट्रैक करें')}</span>
                  </Button>

                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => navigate(ROUTES.SCHEME_DETAIL(scheme.id))}
                    className={`min-h-[44px] text-sm px-3.5 inline-flex items-center gap-1.5 ${getFontClass()}`}
                  >
                    <FileText className="h-4 w-4" aria-hidden="true" />
                    <span>{pick('Rules & Checklist', 'నిబంధనలు & పత్రాలు', 'नियम व दस्तावेज़')}</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
