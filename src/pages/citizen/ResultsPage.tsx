import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/store/useLanguageStore';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { SchemeResultCard } from '@/components/eligibility/SchemeResultCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ROUTES } from '@/config/routes';
import {
  Award,
  CheckCircle2,
  HelpCircle,
  XCircle,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const ResultsPage: React.FC = () => {
  const { pick, getFontClass } = useLanguage();
  const { assessment, selectedCategory, setSelectedCategory, selectedLevel, setSelectedLevel } =
    useAssessmentStore();
  const navigate = useNavigate();

  const [showIneligible, setShowIneligible] = useState(false);

  // If no assessment run, offer quick start
  if (!assessment) {
    return (
      <div className="text-center py-12 space-y-4">
        <h2 className="text-xl font-bold text-body">
          {pick('No assessment active', 'ఫలితాలు అందుబాటులో లేవు', 'कोई मूल्यांकन सक्रिय नहीं है')}
        </h2>
        <p className="text-sm text-muted">
          {pick(
            'Please describe your situation to check matching welfare schemes.',
            'పథకాల అర్హతను పరిశీలించడానికి మీ పరిస్థితిని వివరించండి.',
            'पात्र योजनाओं की जांच के लिए कृपया अपनी स्थिति का विवरण दें।'
          )}
        </p>
        <Button onClick={() => navigate(ROUTES.DESCRIBE)}>
          {pick('Start Assessment', 'అర్హత తనిఖీని ప్రారంభించండి', 'मूल्यांकन शुरू करें')}
        </Button>
      </div>
    );
  }

  const { likely_eligible, needs_more_info, not_likely_eligible } = assessment.results;

  // Filter logic
  const filterList = (list: typeof likely_eligible) => {
    return list.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchLevel = selectedLevel === 'all' || item.level === selectedLevel;
      return matchCat && matchLevel;
    });
  };

  const filteredLikely = filterList(likely_eligible);
  const filteredNeedsMore = filterList(needs_more_info);
  const filteredIneligible = filterList(not_likely_eligible);

  const categories = [
    { id: 'all', labelEn: 'All Schemes', labelTe: 'అన్ని పథకాలు', labelHi: 'सभी योजनाएं' },
    { id: 'scholarship', labelEn: 'Scholarships', labelTe: 'స్కాలర్‌షిప్‌లు', labelHi: 'छात्रवृत्ति' },
    { id: 'pension', labelEn: 'Pensions', labelTe: 'పెన్షన్లు', labelHi: 'पेंशन' },
    { id: 'farm', labelEn: 'Agriculture', labelTe: 'వ్యవసాయం', labelHi: 'कृषि' },
    { id: 'health', labelEn: 'Health', labelTe: 'ఆరోగ్యం', labelHi: 'स्वास्थ्य' },
  ];

  return (
    <div className="space-y-8">
      {/* Header Summary */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <h1 className={`text-2xl md:text-3xl font-extrabold text-primary flex items-center justify-center gap-2 ${getFontClass()}`}>
          <Award className="h-7 w-7 text-amber-500" aria-hidden="true" />
          <span>
            {pick(
              'Your Welfare Eligibility Results',
              'మీ సంక్షేమ పథకాల అర్హత ఫలితాలు',
              'आपके कल्याणकारी योजना परिणाम'
            )}
          </span>
        </h1>
        <p className="text-sm md:text-base text-muted">
          {pick(
            'Evaluated deterministically against official Andhra Pradesh state and central government rules.',
            'ఆంధ్రప్రదేశ్ ప్రభుత్వం మరియు కేంద్ర ప్రభుత్వ అధికారిక నిబంధనల ఆధారంగా నిర్ణయించబడింది.',
            'आंध्र प्रदेश राज्य और केंद्र सरकार के आधिकारिक नियमों के आधार पर पारदर्शी मूल्यांकन किया गया।'
          )}
        </p>

        {/* Counts summary pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <Badge variant="success" className="px-3 py-1 text-xs md:text-sm font-semibold">
            {likely_eligible.length} {pick('Likely Eligible', 'అర్హత ఉండే అవకాశం', 'संभावित पात्र')}
          </Badge>
          {needs_more_info.length > 0 && (
            <Badge variant="warning" className="px-3 py-1 text-xs md:text-sm font-semibold">
              {needs_more_info.length} {pick('Need More Info', 'మరిన్ని వివరాలు అవసరం', 'अधिक जानकारी आवश्यक')}
            </Badge>
          )}
          <Badge variant="secondary" className="px-3 py-1 text-xs md:text-sm font-semibold">
            {not_likely_eligible.length} {pick('Ineligible', 'అర్హత లేనివి', 'अपात्र')}
          </Badge>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="border border-border/80 shadow-xs bg-white">
        <CardContent className="p-3 md:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-body hover:bg-slate-100'
                } ${getFontClass()}`}
              >
                {pick(cat.labelEn, cat.labelTe, cat.labelHi)}
              </button>
            ))}
          </div>

          {/* Level Filter (All / State / Central) */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-muted mr-1 font-medium">{pick('Level:', 'స్థాయి:', 'स्तर:')}</span>
            <button
              type="button"
              onClick={() => setSelectedLevel('all')}
              className={`px-2 py-1 rounded border text-xs font-medium ${
                selectedLevel === 'all' ? 'bg-primary text-white border-primary' : 'bg-white text-body border-slate-200'
              }`}
            >
              {pick('All', 'అన్నీ', 'सभी')}
            </button>
            <button
              type="button"
              onClick={() => setSelectedLevel('state')}
              className={`px-2 py-1 rounded border text-xs font-medium ${
                selectedLevel === 'state' ? 'bg-primary text-white border-primary' : 'bg-white text-body border-slate-200'
              }`}
            >
              {pick('AP State', 'ఆంధ్రప్రదేశ్', 'आंध्र प्रदेश')}
            </button>
            <button
              type="button"
              onClick={() => setSelectedLevel('central')}
              className={`px-2 py-1 rounded border text-xs font-medium ${
                selectedLevel === 'central' ? 'bg-primary text-white border-primary' : 'bg-white text-body border-slate-200'
              }`}
            >
              {pick('Central', 'కేంద్రం', 'केंद्रीय')}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Section 1: Likely Eligible Schemes */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
          <h2 className={`text-lg md:text-xl font-bold text-body ${getFontClass()}`}>
            {pick(
              'Likely Eligible Schemes',
              'అర్హత ఉండే అవకాశమున్న పథకాలు',
              'संभावित रूप से पात्र योजनाएं'
            )}{' '}
            <span className="text-sm font-normal text-muted">({filteredLikely.length})</span>
          </h2>
        </div>

        {filteredLikely.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-lg border border-slate-200 text-muted text-sm">
            {pick(
              'No schemes match this category currently. Try selecting "All Schemes" or adjusting your profile.',
              'ఎంచుకున్న కేటగిరీలో పథకాలు లేవు. "అన్ని పథకాలు" ఎంచుకోండి.',
              'इस श्रेणी में वर्तमान में कोई योजना नहीं है।'
            )}
          </div>
        ) : (
          filteredLikely.map((res) => (
            <SchemeResultCard
              key={res.scheme_id}
              result={res}
              onAddMissingField={() => navigate(ROUTES.CONFIRM_PROFILE)}
            />
          ))
        )}
      </section>

      {/* Section 2: Need More Information */}
      {filteredNeedsMore.length > 0 && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <HelpCircle className="h-5 w-5 text-warning" aria-hidden="true" />
            <h2 className={`text-lg md:text-xl font-bold text-body ${getFontClass()}`}>
              {pick(
                'Requires More Information',
                'మరిన్ని వివరాలు అవసరమైన పథకాలు',
                'जिनके लिए अधिक जानकारी आवश्यक है'
              )}{' '}
              <span className="text-sm font-normal text-muted">({filteredNeedsMore.length})</span>
            </h2>
          </div>

          {filteredNeedsMore.map((res) => (
            <SchemeResultCard
              key={res.scheme_id}
              result={res}
              onAddMissingField={() => navigate(ROUTES.CONFIRM_PROFILE)}
            />
          ))}
        </section>
      )}

      {/* Section 3: Ineligible Schemes (Collapsed by default) */}
      {filteredIneligible.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-slate-400" aria-hidden="true" />
              <h2 className={`text-base md:text-lg font-bold text-muted ${getFontClass()}`}>
                {pick(
                  'Schemes Not Matching Current Profile',
                  'ప్రస్తుత వివరాలకు సరిపోలని పథకాలు',
                  'वर्तमान प्रोफ़ाइल से मेल नहीं खाने वाली योजनाएं'
                )}{' '}
                <span className="text-sm font-normal">({filteredIneligible.length})</span>
              </h2>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowIneligible(!showIneligible)}
              className="text-xs text-muted"
            >
              <span>{showIneligible ? pick('Hide', 'దాచు', 'छुपाएं') : pick('Show', 'చూపుము', 'दिखाएं')}</span>
              {showIneligible ? (
                <ChevronUp className="h-4 w-4 ml-1" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-1" />
              )}
            </Button>
          </div>

          {showIneligible && (
            <div className="space-y-4">
              {filteredIneligible.map((res) => (
                <SchemeResultCard key={res.scheme_id} result={res} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Action Footer */}
      <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={() => navigate(ROUTES.CONFIRM_PROFILE)}
          className="w-full sm:w-auto"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          <span>{pick('Adjust Profile Details', 'వివరాలను సవరించండి', 'प्रोफ़ाइल विवरण बदलें')}</span>
        </Button>

        <Button
          variant="default"
          onClick={() => navigate(ROUTES.DESCRIBE)}
          className="w-full sm:w-auto"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          <span>{pick('Check Another Situation', 'మరొక పరిస్థితిని తనిఖీ చేయండి', 'अन्य स्थिति की जांच करें')}</span>
        </Button>
      </div>
    </div>
  );
};
