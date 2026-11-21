import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/store/useLanguageStore';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useSchemeStore } from '@/store/useSchemeStore';
import { useTrackerStore } from '@/store/useTrackerStore';
import { buildMasterDocumentPack } from '@/services/deterministicEngine';
import { SchemeResultCard } from '@/components/eligibility/SchemeResultCard';
import { MasterDocumentPackCard } from '@/components/scheme/MasterDocumentPackCard';
import { RaiseGapModal } from '@/components/community/RaiseGapModal';
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
  IndianRupee,
  HeartPulse,
  CalendarClock,
  Megaphone,
  Users,
} from 'lucide-react';

export const ResultsPage: React.FC = () => {
  const { pick, getFontClass } = useLanguage();
  const { assessment, selectedCategory, setSelectedCategory, selectedLevel, setSelectedLevel } =
    useAssessmentStore();
  const { confirmedProfile } = useProfileStore();
  const { schemes } = useSchemeStore();
  const { trackedApplications } = useTrackerStore();
  const navigate = useNavigate();

  const [showIneligible, setShowIneligible] = useState(false);
  const [raiseGapOpen, setRaiseGapOpen] = useState(false);

  if (!assessment) {
    return (
      <div className="text-center py-12 space-y-4">
        <h1 className={`text-2xl font-bold text-primary ${getFontClass()}`}>
          {pick(
            'No Active Eligibility Assessment',
            'ప్రస్తుతం అర్హత ఫలితాలు లేవు',
            'कोई सक्रिय पात्रता मूल्यांकन नहीं है'
          )}
        </h1>
        <p className={`text-sm md:text-base text-muted max-w-md mx-auto ${getFontClass()}`}>
          {pick(
            'Describe your family’s situation in plain language to check likely-eligible Andhra Pradesh and Central schemes.',
            'మీకు సరిపోయే సంక్షేమ పథకాలను తెలుసుకోవడానికి మీ పరిస్థితిని సరళమైన భాషలో వివరించండి.',
            'संभावित पात्र योजनाओं की जांच के लिए कृपया अपनी पारिवारिक स्थिति बताएं।'
          )}
        </p>
        <Button
          onClick={() => navigate(ROUTES.DESCRIBE)}
          className={`min-h-[44px] ${getFontClass()}`}
        >
          {pick('Start Assessment', 'అర్హత తనిఖీని ప్రారంభించండి', 'मूल्यांकन शुरू करें')}
        </Button>
      </div>
    );
  }

  const { likely_eligible, needs_more_info, not_likely_eligible } = assessment.results;
  const { total_annual_dbt_inr = 0, max_health_cover_lakhs = 0 } = assessment.summary_metrics || {};

  const masterDocPack = buildMasterDocumentPack(likely_eligible, schemes, confirmedProfile);

  const handleAddMissingDetail = (fieldName: string) => {
    navigate(`${ROUTES.CONFIRM_PROFILE}?focus=${encodeURIComponent(fieldName)}`);
  };

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
    { id: 'scholarship', labelEn: 'Education', labelTe: 'విద్య / స్కాలర్‌షిప్', labelHi: 'शिक्षा' },
    { id: 'pension', labelEn: 'Pensions', labelTe: 'పెన్షన్లు', labelHi: 'पेंशन' },
    { id: 'farm', labelEn: 'Agriculture', labelTe: 'వ్యవసాయం', labelHi: 'कृषि' },
    { id: 'health', labelEn: 'Health', labelTe: 'ఆరోగ్యం', labelHi: 'स्वास्थ्य' },
    { id: 'women_child', labelEn: 'Household / LPG', labelTe: 'గృహ / మహిళా', labelHi: 'घरेलू / महिला' },
  ];

  return (
    <div className="space-y-7">
      {/* Header Summary */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h1
          className={`text-2xl md:text-3xl font-extrabold text-primary flex items-center justify-center gap-2 ${getFontClass()}`}
        >
          <Award className="h-7 w-7 text-amber-600 shrink-0" aria-hidden="true" />
          <span>
            {pick(
              'Your Welfare Eligibility Results',
              'మీ సంక్షేమ పథకాల అర్హత ఫలితాలు',
              'आपके कल्याणकारी योजना पात्रता परिणाम'
            )}
          </span>
        </h1>
        <p className={`text-sm md:text-base text-muted ${getFontClass()}`}>
          {pick(
            'These results use sample rules for Andhra Pradesh and Central schemes. Check the official portal for current criteria.',
            'ఈ ఫలితాలు ఆంధ్రప్రదేశ్, కేంద్ర పథకాల నమూనా నిబంధనల ఆధారంగా చూపబడ్డాయి. తాజా నిబంధనల కోసం అధికారిక పోర్టల్ చూడండి.',
            'ये परिणाम आंध्र प्रदेश और केंद्र की योजनाओं के नमूना नियमों पर आधारित हैं। मौजूदा मानदंड आधिकारिक पोर्टल पर देखें।'
          )}
        </p>

        {/* Summary Count Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <Badge variant="success" className={`px-3.5 py-1 text-sm font-bold ${getFontClass()}`}>
            {likely_eligible.length} {pick('Likely Eligible', 'అర్హత ఉండే అవకాశం', 'संभावित पात्र')}
          </Badge>
          {needs_more_info.length > 0 && (
            <Badge variant="warning" className={`px-3.5 py-1 text-sm font-bold ${getFontClass()}`}>
              {needs_more_info.length}{' '}
              {pick('Need Info / Pending Verify', 'మరిన్ని వివరాలు / పెండింగ్', 'अतिरिक्त जानकारी / लंबित')}
            </Badge>
          )}
          <Badge variant="secondary" className={`px-3.5 py-1 text-sm font-semibold ${getFontClass()}`}>
            {not_likely_eligible.length} {pick('Not Matching', 'సరిపోలనివి', 'अपात्र')}
          </Badge>
        </div>
      </div>

      {/* Estimated household benefits */}
      {likely_eligible.length > 0 && (total_annual_dbt_inr > 0 || max_health_cover_lakhs > 0) && (
        <Card className="border-2 border-emerald-400 bg-gradient-to-r from-emerald-50 via-white to-blue-50 shadow-sm">
          <CardContent className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className={`text-sm font-bold text-emerald-900 block ${getFontClass()}`}>
                {pick(
                  'Estimated annual household support if approved',
                  'ఆమోదం లభిస్తే కుటుంబానికి అంచనా వార్షిక సహాయం',
                  'स्वीकृति मिलने पर अनुमानित वार्षिक पारिवारिक सहायता'
                )}
              </span>
              <div className="flex flex-wrap items-center gap-4 pt-1">
                {total_annual_dbt_inr > 0 && (
                  <div className="inline-flex items-center gap-1.5 text-xl md:text-2xl font-extrabold text-emerald-800">
                    <IndianRupee className="h-6 w-6 shrink-0" aria-hidden="true" />
                    <span>
                      ₹{total_annual_dbt_inr.toLocaleString('en-IN')}{' '}
                      <span className={`text-sm font-semibold text-slate-700 ${getFontClass()}`}>
                        {pick('/ year DBT', '/ సం. ప్రత్యక్ష నగదు', '/ वर्ष डीबीटी')}
                      </span>
                    </span>
                  </div>
                )}
                {max_health_cover_lakhs > 0 && (
                  <div className="inline-flex items-center gap-1.5 text-lg md:text-xl font-extrabold text-primary">
                    <HeartPulse className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <span className={getFontClass()}>
                      + ₹{max_health_cover_lakhs}{' '}
                      {pick('Lakh Health Cover', 'లక్షల ఆరోగ్య బీమా', 'लाख स्वास्थ्य बीमा')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Button
              type="button"
              variant="default"
              onClick={() => navigate(ROUTES.MY_SCHEMES)}
              className={`min-h-[44px] text-sm inline-flex items-center gap-2 shrink-0 ${getFontClass()}`}
            >
              <CalendarClock className="h-4 w-4 text-amber-300" aria-hidden="true" />
              <span>
                {pick(
                  `My Tracker & Reminders (${trackedApplications.length})`,
                  `నా దరఖాస్తు ట్రాకర్ (${trackedApplications.length})`,
                  `मेरा ट्रैकर व रिमाइंडर (${trackedApplications.length})`
                )}
              </span>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Single Sachivalayam Visit Master Document Pack */}
      {likely_eligible.length > 0 && (
        <MasterDocumentPackCard items={masterDocPack} schemeCount={likely_eligible.length} />
      )}

      {/* Filter Toolbar */}
      <Card className="border border-border bg-white shadow-sm">
        <CardContent className="p-3.5 md:p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto" role="group" aria-label="Scheme categories">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                aria-pressed={selectedCategory === cat.id}
                className={`min-h-[44px] px-3.5 py-2 text-sm font-semibold rounded-md transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-body hover:bg-slate-100 border border-slate-200'
                } ${getFontClass()}`}
              >
                {pick(cat.labelEn, cat.labelTe, cat.labelHi)}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-sm" role="group" aria-label="Government level">
            <span className={`text-muted mr-1 font-semibold ${getFontClass()}`}>
              {pick('Level:', 'స్థాయి:', 'स्तर:')}
            </span>
            {(
              [
                { id: 'all', en: 'All', te: 'అన్నీ', hi: 'सभी' },
                { id: 'state', en: 'AP State', te: 'ఆంధ్రప్రదేశ్', hi: 'आंध्र प्रदेश' },
                { id: 'central', en: 'Central', te: 'కేంద్రం', hi: 'केंद्रीय' },
              ] as const
            ).map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setSelectedLevel(lvl.id)}
                aria-pressed={selectedLevel === lvl.id}
                className={`min-h-[44px] px-3 py-1.5 rounded-md border text-sm font-semibold transition-colors ${
                  selectedLevel === lvl.id
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-body border-slate-300 hover:bg-slate-100'
                } ${getFontClass()}`}
              >
                {pick(lvl.en, lvl.te, lvl.hi)}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Results Container */}
      <div className="space-y-8" aria-live="polite">
        {/* Section 1: Likely Eligible Schemes */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <CheckCircle2 className="h-5 w-5 text-success shrink-0" aria-hidden="true" />
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
            <div className={`p-8 text-center bg-white rounded-lg border border-slate-200 text-muted text-sm ${getFontClass()}`}>
              {pick(
                'No likely-eligible schemes in this filter view. Select "All Schemes" or add missing details below.',
                'ఈ ఫిల్టర్‌లో పథకాలు లేవు. "అన్ని పథకాలు" ఎంచుకోండి లేదా క్రింది అదనపు వివరాలను జోడించండి.',
                'इस फ़िल्टर में कोई योजना नहीं है। "सभी योजनाएं" चुनें या नीचे छूटे हुए विवरण जोड़ें।'
              )}
            </div>
          ) : (
            filteredLikely.map((res) => (
              <SchemeResultCard
                key={res.scheme_id}
                result={res}
                onAddMissingField={handleAddMissingDetail}
              />
            ))
          )}
        </section>

        {/* Section 2: Need More Information / Pending Verification */}
        {filteredNeedsMore.length > 0 && (
          <section className="space-y-4 pt-2">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <HelpCircle className="h-5 w-5 text-warning shrink-0" aria-hidden="true" />
              <h2 className={`text-lg md:text-xl font-bold text-body ${getFontClass()}`}>
                {pick(
                  'Requires Confirmation or Official Source Sign-Off',
                  'మరిన్ని వివరాలు / ప్రభుత్వ ధృవీకరణ పెండింగ్ పథకాలు',
                  'अतिरिक्त जानकारी या आधिकारिक स्रोत सत्यापन आवश्यक'
                )}{' '}
                <span className="text-sm font-normal text-muted">({filteredNeedsMore.length})</span>
              </h2>
            </div>

            {filteredNeedsMore.map((res) => (
              <SchemeResultCard
                key={res.scheme_id}
                result={res}
                onAddMissingField={handleAddMissingDetail}
              />
            ))}
          </section>
        )}

        {/* Section 3: Ineligible Schemes (Collapsed by default) */}
        {filteredIneligible.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-slate-600 shrink-0" aria-hidden="true" />
                <h2 className={`text-base md:text-lg font-bold text-slate-700 ${getFontClass()}`}>
                  {pick(
                    'Schemes Not Matching Current Profile',
                    'ప్రస్తుత వివరాలకు సరిపోలని పథకాలు',
                    'वर्तमान प्रोफ़ाइल से मेल नहीं खाने वाली योजनाएं'
                  )}{' '}
                  <span className="text-sm font-normal">({filteredIneligible.length})</span>
                </h2>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowIneligible(!showIneligible)}
                aria-expanded={showIneligible}
                className={`min-h-[44px] text-sm bg-white ${getFontClass()}`}
              >
                <span>
                  {showIneligible
                    ? pick('Hide', 'దాచు', 'छुपाएं')
                    : pick('Show Reasons', 'కారణాలు చూడండి', 'कारण दिखाएं')}
                </span>
                {showIneligible ? (
                  <ChevronUp className="h-4 w-4 ml-1" aria-hidden="true" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-1" aria-hidden="true" />
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
      </div>

      {/* Missing-Scheme / Welfare Gap Escalation Card (Prominent on 0 matches & always accessible) */}
      <Card
        className={`border-2 ${
          filteredLikely.length === 0
            ? 'border-amber-400 bg-amber-50/70 shadow-sm'
            : 'border-indigo-200 bg-indigo-50/40'
        }`}
      >
        <CardContent className="p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2
              className={`text-base sm:text-lg font-extrabold text-primary flex items-center gap-2 ${getFontClass()}`}
            >
              <Megaphone className="h-5 w-5 text-amber-600 shrink-0" aria-hidden="true" />
              <span>
                {filteredLikely.length === 0
                  ? pick(
                      'No Matching Scheme Found? Request a New Welfare Scheme',
                      'సరైన పథకం కనిపించలేదా? కొత్త సంక్షేమ పథకం కోసం అభ్యర్థించండి',
                      'कोई उपयुक्त योजना नहीं मिली? नई योजना का अनुरोध दर्ज करें'
                    )
                  : pick(
                      'Still Missing Support for Your Occupation or Family? Propose a Scheme',
                      'మీ వృత్తి లేదా కుటుంబానికి ఇంకా తగిన పథకం లేదా? కొత్త పథకాన్ని ప్రతిపాదించండి',
                      'क्या आपके व्यवसाय या परिवार के लिए कोई योजना छूटी है? नया प्रस्ताव रखें'
                    )}
              </span>
            </h2>
            <p className={`text-xs sm:text-sm text-muted max-w-2xl ${getFontClass()}`}>
              {pick(
                'Raise a non-PII Welfare Gap Request. Once validated with 10+ local citizen votes, ClaimSaathi generates an official AP Collectorate / 1902 & NGO escalation dossier.',
                'ఆధార్/ఫోన్ అవసరం లేకుండా కొత్త పథకం అభ్యర్థన పెట్టండి. 10+ ప్రజల ఓట్లు రాగానే ప్రభుత్వ (1902 / కలెక్టరేట్) & NGO ఎస్కలేషన్ నివేదిక సిద్ధమవుతుంది.',
                'बिना व्यक्तिगत आईडी के नई योजना अनुरोध दर्ज करें। 10+ नागरिक वोट मिलने पर सरकारी (1902 / कलेक्टरेट) और NGO एस्केलेशन डोज़ियर तैयार हो जाता है।'
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <Button
              type="button"
              onClick={() => setRaiseGapOpen(true)}
              className={`min-h-[44px] bg-amber-600 hover:bg-amber-700 text-white font-bold ${getFontClass()}`}
            >
              <Megaphone className="h-4 w-4 mr-1.5" aria-hidden="true" />
              {pick('Raise Scheme Request', 'కొత్త పథకం కోరండి', 'नई योजना का अनुरोध करें')}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(ROUTES.COMMUNITY)}
              className={`min-h-[44px] bg-white font-semibold ${getFontClass()}`}
            >
              <Users className="h-4 w-4 mr-1.5 text-indigo-700" aria-hidden="true" />
              {pick('Community & Voting', 'ప్రజా వేదిక & ఓటింగ్', 'समुदाय व मतदान')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <RaiseGapModal
        open={raiseGapOpen}
        onOpenChange={setRaiseGapOpen}
        onCreated={() => navigate(ROUTES.COMMUNITY)}
      />

      {/* Action Footer */}
      <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={() => navigate(ROUTES.CONFIRM_PROFILE)}
          className={`w-full sm:w-auto min-h-[44px] bg-white ${getFontClass()}`}
        >
          <RotateCcw className="h-4 w-4 mr-2" aria-hidden="true" />
          <span>{pick('Adjust Profile Details', 'వివరాలను సవరించండి', 'प्रोफ़ाइल विवरण बदलें')}</span>
        </Button>

        <Button
          variant="default"
          onClick={() => navigate(ROUTES.DESCRIBE)}
          className={`w-full sm:w-auto min-h-[44px] ${getFontClass()}`}
        >
          <Sparkles className="h-4 w-4 mr-2 text-amber-300" aria-hidden="true" />
          <span>{pick('Check Another Situation', 'మరొక పరిస్థితిని తనిఖీ చేయండి', 'अन्य स्थिति की जांच करें')}</span>
        </Button>
      </div>
    </div>
  );
};
