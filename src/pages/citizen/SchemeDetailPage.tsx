import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/store/useLanguageStore';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useSchemeStore } from '@/store/useSchemeStore';
import { useTrackerStore } from '@/store/useTrackerStore';
import { VerificationBadge } from '@/components/common/VerificationBadge';
import { DocumentChecklist } from '@/components/scheme/DocumentChecklist';
import { ApplicationStepList } from '@/components/scheme/ApplicationStepList';
import { formatRuleCondition } from '@/config/bands';
import { downloadSchemeReminderIcs } from '@/utils/calendarReminder';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/config/routes';
import {
  ArrowLeft,
  FileCheck,
  Navigation,
  Info,
  ExternalLink,
  IndianRupee,
  Building,
  CheckCircle2,
  BookmarkPlus,
  BookmarkCheck,
  CalendarPlus,
  CalendarClock,
  GitBranch,
  MapPin,
} from 'lucide-react';

type DetailTab = 'overview' | 'documents' | 'steps';

const CATEGORY_LABELS: Record<string, { en: string; te: string; hi: string }> = {
  scholarship: { en: 'Education & Scholarship', te: 'విద్య & స్కాలర్‌షిప్', hi: 'शिक्षा व छात्रवृत्ति' },
  pension: { en: 'Social Security Pension', te: 'సామాజిక భద్రతా పెన్షన్', hi: 'सामाजिक सुरक्षा पेंशन' },
  farm: { en: 'Agriculture & Farmer Support', te: 'వ్యవసాయ పెట్టుబడి సాయం', hi: 'कृषि सहायता' },
  health: { en: 'Universal Healthcare', te: 'ఆరోగ్య రక్షణ', hi: 'स्वास्थ्य सुरक्षा' },
  women_child: { en: 'Household & Women Welfare', te: 'మహిళా & గృహ సంక్షేమం', hi: 'महिला व घरेलू कल्याण' },
};

export const SchemeDetailPage: React.FC = () => {
  const { schemeId } = useParams<{ schemeId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { pick, getFontClass, language } = useLanguage();
  const { schemes } = useSchemeStore();
  const { assessment } = useAssessmentStore();
  const { confirmedProfile } = useProfileStore();
  const { isSchemeTracked, trackSchemeFromResult, markReminderDownloaded } = useTrackerStore();

  const deriveTabFromPath = (pathname: string): DetailTab => {
    if (pathname.endsWith('/documents')) return 'documents';
    if (pathname.endsWith('/apply')) return 'steps';
    return 'overview';
  };

  const activeTab = deriveTabFromPath(location.pathname);

  const scheme = schemes.find((s) => s.id === schemeId && s.is_published);

  if (!scheme) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center space-y-4">
        <h1 className={`text-2xl font-bold text-body ${getFontClass()}`}>
          {pick('Scheme Not Found', 'పథకం కనుగొనబడలేదు', 'योजना नहीं मिली')}
        </h1>
        <Button onClick={() => navigate(ROUTES.SCHEMES_BROWSE)} className="min-h-[44px]">
          {pick('Browse All Schemes', 'అన్ని పథకాలను చూడండి', 'सभी योजनाएं देखें')}
        </Button>
      </div>
    );
  }

  const tracked = isSchemeTracked(scheme.id);
  const categoryLabel = CATEGORY_LABELS[scheme.category] || {
    en: scheme.category,
    te: scheme.category,
    hi: scheme.category,
  };

  const handleTabChange = (nextVal: string) => {
    if (nextVal === 'documents') {
      navigate(ROUTES.DOCUMENT_CHECKLIST(scheme.id), { replace: true });
    } else if (nextVal === 'steps') {
      navigate(ROUTES.APPLICATION_GUIDE(scheme.id), { replace: true });
    } else {
      navigate(ROUTES.SCHEME_DETAIL(scheme.id), { replace: true });
    }
  };

  const handleDownloadCalendar = () => {
    trackSchemeFromResult(scheme);
    downloadSchemeReminderIcs(
      {
        scheme_id: scheme.id,
        scheme_code: scheme.scheme_code,
        name_en: scheme.name_en,
        name_te: scheme.name_te,
        name_hi: scheme.name_hi,
        benefit_summary_en: scheme.benefit_summary_en,
        benefit_summary_te: scheme.benefit_summary_te,
        benefit_summary_hi: scheme.benefit_summary_hi,
        official_source_url: scheme.source.source_url,
        application_close_on: scheme.application_close_on,
        deadline_label_en: scheme.deadline_label_en,
        deadline_label_te: scheme.deadline_label_te,
        deadline_label_hi: scheme.deadline_label_hi,
      },
      language
    );
    markReminderDownloaded(scheme.id);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 md:py-10 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2 no-print">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(assessment ? ROUTES.RESULTS : ROUTES.SCHEMES_BROWSE)}
          className={`min-h-[44px] text-sm text-muted hover:text-body inline-flex items-center gap-1.5 ${getFontClass()}`}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>
            {assessment
              ? pick('Back to Results', 'ఫలితాలకు వెనుకకు', 'परिणामों पर वापस')
              : pick('Back to Browse Schemes', 'పథకాల జాబితాకు వెళ్లండి', 'योजनाओं की सूची पर वापस')}
          </span>
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownloadCalendar}
            className={`min-h-[44px] text-sm bg-white inline-flex items-center gap-1.5 ${getFontClass()}`}
          >
            <CalendarPlus className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>{pick('Add Deadline Alert (.ics)', 'క్యాలెండర్ రిమైండర్ (.ics)', 'कैलेंडर अलर्ट (.ics)')}</span>
          </Button>

          <Button
            type="button"
            variant={tracked ? 'secondary' : 'default'}
            size="sm"
            onClick={() => {
              trackSchemeFromResult(scheme);
              navigate(ROUTES.MY_SCHEMES);
            }}
            className={`min-h-[44px] text-sm inline-flex items-center gap-1.5 ${getFontClass()}`}
          >
            {tracked ? (
              <BookmarkCheck className="h-4 w-4 text-emerald-700" aria-hidden="true" />
            ) : (
              <BookmarkPlus className="h-4 w-4 text-amber-300" aria-hidden="true" />
            )}
            <span>
              {tracked
                ? pick('Open in My Tracker', 'ట్రాకర్‌లో చూడండి', 'ट्रैकर में खोलें')
                : pick('Track Application', 'దరఖాస్తును ట్రాక్ చేయండి', 'आवेदन ट्रैक करें')}
            </span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const distParam =
                confirmedProfile?.district_code && confirmedProfile.district_code !== 'unknown'
                  ? `?district=${encodeURIComponent(confirmedProfile.district_code)}`
                  : '';
              navigate(`${ROUTES.SERVICE_CENTRES}${distParam}`);
            }}
            className={`min-h-[44px] bg-white gap-1.5 ${getFontClass()}`}
          >
            <MapPin className="h-4 w-4 text-emerald-700" aria-hidden="true" />
            <span>
              {pick(
                'Find Sachivalayam / MeeSeva',
                'సమీప సచివాలయం / మీసేవ',
                'नजदीकी सचिवालय / मीसेवा'
              )}
            </span>
          </Button>
        </div>
      </div>

      {/* Scheme Hero Card + Accessible WAI-ARIA Radix Tabs */}
      <Tabs.Root value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <Card className="border border-border shadow-sm bg-white">
          <CardHeader className="p-6 md:p-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={`border-primary/40 text-primary font-semibold text-sm ${getFontClass()}`}
                >
                  {scheme.level === 'state'
                    ? pick('Andhra Pradesh State Scheme', 'ఆంధ్రప్రదేశ్ రాష్ట్ర పథకం', 'आंध्र प्रदेश राज्य योजना')
                    : pick('Central Government Scheme', 'కేంద్ర ప్రభుత్వ పథకం', 'केंद्रीय योजना')}
                </Badge>
                <Badge variant="secondary" className={`text-sm ${getFontClass()}`}>
                  {pick(categoryLabel.en, categoryLabel.te, categoryLabel.hi)}
                </Badge>
              </div>
              <VerificationBadge
                isVerified={Boolean(scheme.source.verified_at)}
                verifiedAt={scheme.source.verified_at}
              />
            </div>

            <h1 className={`text-2xl md:text-3xl font-extrabold text-body leading-tight ${getFontClass()}`}>
              {pick(scheme.name_en, scheme.name_te, scheme.name_hi)}
            </h1>

            <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-md p-4 text-sm md:text-base font-semibold text-slate-800">
              <IndianRupee className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
              <span className={getFontClass()}>
                {pick(scheme.benefit_summary_en, scheme.benefit_summary_te, scheme.benefit_summary_hi)}
              </span>
            </div>

            {scheme.deadline_label_en && (
              <div className={`flex items-center gap-2 text-sm text-amber-950 bg-amber-50 border border-amber-200 rounded-md px-3.5 py-2.5 font-medium ${getFontClass()}`}>
                <CalendarClock className="h-4 w-4 text-amber-800 shrink-0" aria-hidden="true" />
                <span>
                  {pick(scheme.deadline_label_en, scheme.deadline_label_te, scheme.deadline_label_hi)}
                </span>
              </div>
            )}
          </CardHeader>

          <Tabs.List
            aria-label={pick('Scheme sections', 'పథకం విభాగాలు', 'योजना अनुभाग')}
            className="border-t border-slate-200 px-4 sm:px-6 flex flex-wrap items-center gap-1 bg-slate-50/70 no-print"
          >
            <Tabs.Trigger
              value="overview"
              className={`min-h-[48px] py-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap inline-flex items-center gap-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=inactive]:border-transparent data-[state=inactive]:text-muted hover:text-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${getFontClass()}`}
            >
              <Info className="h-4 w-4" aria-hidden="true" />
              <span>{pick('Overview & Rules', 'సమీక్ష & నిబంధనలు', 'अवलोकन और नियम')}</span>
            </Tabs.Trigger>

            <Tabs.Trigger
              value="documents"
              className={`min-h-[48px] py-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap inline-flex items-center gap-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=inactive]:border-transparent data-[state=inactive]:text-muted hover:text-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${getFontClass()}`}
            >
              <FileCheck className="h-4 w-4" aria-hidden="true" />
              <span>{pick('Documents Checklist', 'పత్రాల జాబితా', 'दस्तावेज़ सूची')}</span>
            </Tabs.Trigger>

            <Tabs.Trigger
              value="steps"
              className={`min-h-[48px] py-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap inline-flex items-center gap-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=inactive]:border-transparent data-[state=inactive]:text-muted hover:text-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${getFontClass()}`}
            >
              <Navigation className="h-4 w-4" aria-hidden="true" />
              <span>{pick('How to Apply & Follow Up', 'దరఖాస్తు & తదుపరి చర్యలు', 'आवेदन व फॉलो-अप')}</span>
            </Tabs.Trigger>
          </Tabs.List>
        </Card>

        {/* Tab 1: Overview & Humanized Rules */}
        <Tabs.Content value="overview" className="space-y-6 focus:outline-none">
          <Card className="border border-border shadow-sm">
            <CardHeader className="p-6 pb-3">
              <CardTitle className={`text-lg font-bold ${getFontClass()}`}>
                {pick('Scheme Purpose & Coverage', 'పథకం ఉద్దేశ్యం & ప్రయోజనాలు', 'योजना का उद्देश्य और लाभ')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-0 text-sm md:text-base text-slate-700 leading-relaxed">
              <p className={getFontClass()}>
                {pick(scheme.description_en, scheme.description_te, scheme.description_hi)}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-sm">
            <CardHeader className="p-6 pb-3">
              <CardTitle className={`text-lg font-bold ${getFontClass()}`}>
                {pick('Public Eligibility Rules (Plain-Language View)', 'అర్హత నిబంధనలు (సరళమైన వివరణ)', 'पात्रता मानदंड और शर्तें')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-0 space-y-3">
              {scheme.rules.map((rule) => (
                <div
                  key={rule.rule_id}
                  className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex items-start gap-3"
                >
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="text-sm space-y-1 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className={`font-bold text-body ${getFontClass()}`}>
                        {formatRuleCondition(rule.field_name, rule.operator, rule.value, language)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {rule.condition_group && (
                          <Badge variant="info" className={`text-sm inline-flex items-center gap-1 ${getFontClass()}`}>
                            <GitBranch className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>{pick('Alternative Category (OR)', 'ప్రత్యామ్నాయ అర్హత (OR)', 'वैकल्पिक शर्त (OR)')}</span>
                          </Badge>
                        )}
                        <span className="text-sm font-mono text-muted">v{rule.rule_version}</span>
                      </div>
                    </div>
                    <p className={`text-slate-700 leading-relaxed ${getFontClass()}`}>
                      {pick(rule.reason_en, rule.reason_te, rule.reason_hi)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Official Source Metadata */}
          <Card className="bg-slate-50 border-slate-300 shadow-sm">
            <CardHeader className="p-6 pb-3">
              <CardTitle
                className={`text-sm font-bold text-slate-700 flex items-center gap-1.5 ${
                  language === 'en' ? 'uppercase tracking-wider' : ''
                } ${getFontClass()}`}
              >
                <Building className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                <span>{pick('Official Source Provenance', 'అధికారిక ప్రభుత్వ ఆధారాలు', 'आधिकारिक सरकारी स्रोत विवरण')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className={`p-6 pt-0 text-sm text-slate-700 space-y-1.5 ${getFontClass()}`}>
              <p>
                <strong>{pick('Issuing Department:', 'జారీ చేసిన శాఖ:', 'जारीकर्ता विभाग:')}</strong>{' '}
                {scheme.source.publisher}
              </p>
              {scheme.source.go_reference && (
                <p>
                  <strong>{pick('Reference / G.O.:', 'ఉత్తర్వు / ఆధారం:', 'संदर्भ / आदेश:')}</strong>{' '}
                  {scheme.source.go_reference}
                </p>
              )}
              <p>
                <strong>{pick('Verification Status:', 'ధృవీకరణ స్థితి:', 'सत्यापन स्थिति:')}</strong>{' '}
                {scheme.source.verified_at
                  ? `${scheme.source.verified_by} (${scheme.source.verified_at})`
                  : pick(
                      'PENDING PRIMARY G.O. VERIFICATION',
                      'అధికారిక ఉత్తర్వుల ధృవీకరణ పెండింగ్‌లో ఉంది',
                      'प्राथमिक सरकारी आदेश सत्यापन लंबित'
                    )}
              </p>
              <div className="pt-2">
                <a
                  href={scheme.source.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] text-primary hover:underline inline-flex items-center gap-1.5 font-semibold break-all"
                >
                  <span>{scheme.source.source_url}</span>
                  <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
                </a>
              </div>
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* Tab 2: Personalised Document Checklist */}
        <Tabs.Content value="documents" className="focus:outline-none">
          <DocumentChecklist
            schemeId={scheme.id}
            schemeCode={scheme.scheme_code}
            schemeNameEn={scheme.name_en}
            schemeNameTe={scheme.name_te}
            schemeNameHi={scheme.name_hi}
            benefitSummaryEn={scheme.benefit_summary_en}
            benefitSummaryTe={scheme.benefit_summary_te}
            benefitSummaryHi={scheme.benefit_summary_hi}
            officialPortalUrl={scheme.source.source_url}
            deadlineLabelEn={scheme.deadline_label_en}
            deadlineLabelTe={scheme.deadline_label_te}
            deadlineLabelHi={scheme.deadline_label_hi}
            documents={scheme.documents}
          />
        </Tabs.Content>

        {/* Tab 3: Step-by-Step Guide & Follow-Up */}
        <Tabs.Content value="steps" className="focus:outline-none">
          <ApplicationStepList
            schemeId={scheme.id}
            steps={scheme.steps}
            officialPortalUrl={scheme.source.source_url}
            statusCheckUrl={scheme.status_check_url}
            slaDays={scheme.sla_days}
            grievanceHelpline={scheme.grievance_helpline}
            followupEn={scheme.followup_en}
            followupTe={scheme.followup_te}
            followupHi={scheme.followup_hi}
          />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
};
