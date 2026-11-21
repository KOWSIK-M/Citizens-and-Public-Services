import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/store/useLanguageStore';
import { useTrackerStore } from '@/store/useTrackerStore';
import { useSchemeStore } from '@/store/useSchemeStore';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { useProfileStore } from '@/store/useProfileStore';
import { ApplicationStage, TrackedApplication } from '@/types/tracker';
import { personaliseSchemeDocuments } from '@/services/deterministicEngine';
import {
  downloadSchemeReminderIcs,
  downloadSchemeOpeningIcs,
  downloadAnnualRenewalIcs,
  evaluateFollowUpStatus,
  buildWhatsAppReminderUrl,
  getDaysUntilDeadline,
} from '@/utils/calendarReminder';
import { AP_REJECTION_DIAGNOSTICS } from '@/config/rejectionDiagnostics';
import { ClaimDoctorModal } from '@/components/tracker/ClaimDoctorModal';
import { SectorCoverageVisualizer } from '@/components/insights/SectorCoverageVisualizer';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/config/routes';
import {
  CalendarClock,
  CalendarPlus,
  Share2,
  Trash2,
  ExternalLink,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  PhoneCall,
  BellRing,
  Stethoscope,
  RefreshCw,
} from 'lucide-react';

const STAGES: Array<{
  id: ApplicationStage;
  step: number;
  en: string;
  te: string;
  hi: string;
}> = [
  { id: 'documents_prep', step: 1, en: '1. Preparing Docs', te: '1. పత్రాల సేకరణ', hi: '1. दस्तावेज़ तैयारी' },
  { id: 'submitted', step: 2, en: '2. Submitted at Sachivalayam', te: '2. సచివాలయంలో సమర్పణ', hi: '2. सचिवालय में जमा' },
  { id: 'receipt_saved', step: 3, en: '3. Ack Receipt Taken', te: '3. రసీదు తీసుకున్నాము', hi: '3. रसीद प्राप्त' },
  { id: 'verification_pending', step: 4, en: '4. Social Audit / Field Check', te: '4. క్షేత్ర పరిశీలన', hi: '4. फील्ड सत्यापन' },
  { id: 'sanctioned', step: 5, en: '5. Benefit Sanctioned', te: '5. ప్రయోజనం మంజూరు', hi: '5. लाभ स्वीकृत' },
];

export const MySchemesPage: React.FC = () => {
  const { pick, getFontClass, language } = useLanguage();
  const {
    trackedApplications,
    untrackScheme,
    updateApplicationStage,
    toggleOpeningAlert,
    setRejectionReason,
    updateReferenceNote,
    markReminderDownloaded,
    getCheckedDocuments,
  } = useTrackerStore();
  const { schemes } = useSchemeStore();
  const { assessment } = useAssessmentStore();
  const { confirmedProfile } = useProfileStore();
  const navigate = useNavigate();

  const [piiWarningSchemeId, setPiiWarningSchemeId] = useState<string | null>(null);
  const [claimDoctorApp, setClaimDoctorApp] = useState<TrackedApplication | null>(null);
  const [browserAlertMsg, setBrowserAlertMsg] = useState<string | null>(null);

  const urgentApps = trackedApplications.filter((app) => {
    const days = getDaysUntilDeadline(app.application_close_on);
    return days !== null && days >= 0 && days <= 20 && app.stage === 'documents_prep';
  });

  const handleDownloadIcs = (app: TrackedApplication) => {
    downloadSchemeReminderIcs(app, language);
    markReminderDownloaded(app.scheme_id);
  };

  const handleEnableOpeningNotification = async (app: TrackedApplication) => {
    toggleOpeningAlert(app.scheme_id);
    downloadSchemeOpeningIcs(app, language);
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await window.Notification.requestPermission();
        if (perm === 'granted') {
          setBrowserAlertMsg(
            pick(
              `Opening alert & calendar reminder enabled for ${app.name_en}!`,
              `${app.name_te} ప్రారంభ అలర్ట్ & క్యాలెండర్ రిమైండర్ ఆన్ చేయబడింది!`,
              `${app.name_hi} के लिए प्रारंभ अलर्ट और कैलेंडर रिमाइंडर सक्रिय!`
            )
          );
          return;
        }
      } catch {
        // Ignore Notification API restrictions
      }
    }
    setBrowserAlertMsg(
      pick(
        `Downloaded opening-date calendar alert (.ics) for ${app.name_en}.`,
        `${app.name_te} ప్రారంభ తేదీ క్యాలెండర్ అలర్ట్ (.ics) డౌన్‌లోడ్ అయింది.`,
        `${app.name_hi} के लिए कैलेंडर अलर्ट (.ics) डाउनलोड किया गया।`
      )
    );
  };

  const handleNoteChange = (schemeId: string, rawVal: string) => {
    const { hadPii } = updateReferenceNote(schemeId, rawVal);
    if (hadPii) {
      setPiiWarningSchemeId(schemeId);
    } else if (piiWarningSchemeId === schemeId) {
      setPiiWarningSchemeId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 md:py-12 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-2">
          <h1 className={`text-2xl md:text-3xl font-extrabold text-primary flex items-center gap-2.5 ${getFontClass()}`}>
            <CalendarClock className="h-8 w-8 text-amber-600 shrink-0" aria-hidden="true" />
            <span>
              {pick(
                'My Application Tracker, Follow-Ups & Claim Doctor',
                'నా దరఖాస్తుల ట్రాకర్, ఫాలో-అప్ & క్లెయిమ్ డాక్టర్',
                'मेरा आवेदन ट्रैकर, फॉलो-अप और क्लेम डॉक्टर'
              )}
            </span>
          </h1>
          <p className={`text-sm md:text-base text-muted leading-relaxed ${getFontClass()}`}>
            {pick(
              'Stored 100% privately on your device (no login or Aadhaar required). Get scheme-opening alerts, check whether benefits were availed, or diagnose rejections with Claim Doctor.',
              'ఇది పూర్తిగా మీ ఫోన్‌లోనే గోప్యంగా ఉంటుంది (ఆధార్ అవసరం లేదు). పథకం ఎప్పుడు మొదలవుతుందో అలర్ట్ పొందండి, లబ్ధి అందిందో లేదో తనిఖీ చేయండి, లేదా తిరస్కరణకు క్లెయిమ్ డాక్టర్ వాడండి.',
              'यह 100% आपके डिवाइस पर सुरक्षित है (कोई आधार आवश्यक नहीं)। योजना खुलने का अलर्ट पाएं, लाभ की स्थिति जांचें या क्लेम डॉक्टर से अस्वीकृति सुलझाएं।'
            )}
          </p>
        </div>

        <Button
          onClick={() => navigate(assessment ? ROUTES.RESULTS : ROUTES.SCHEMES_BROWSE)}
          variant="outline"
          className={`min-h-[44px] bg-white shrink-0 ${getFontClass()}`}
        >
          {assessment
            ? pick('Back to Scheme Results', 'ఫలితాలకు వెళ్ళండి', 'योजना परिणामों पर जाएं')
            : pick('Browse Schemes', 'పథకాలు చూడండి', 'योजनाएं देखें')}
        </Button>
      </div>

      {browserAlertMsg && (
        <div
          role="status"
          className={`rounded-lg border border-emerald-400 bg-emerald-50 p-3.5 text-sm font-semibold text-emerald-950 ${getFontClass()}`}
        >
          {browserAlertMsg}
        </div>
      )}

      {/* Urgent Deadlines Banner */}
      {urgentApps.length > 0 && (
        <div
          role="alert"
          className={`rounded-lg border-2 border-amber-400 bg-amber-50 p-4 flex items-start gap-3 text-amber-950 ${getFontClass()}`}
        >
          <AlertTriangle className="h-6 w-6 text-amber-800 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1 text-sm">
            <p className="font-bold">
              {pick(
                `Action Needed Soon: ${urgentApps.length} tracked scheme(s) have upcoming deadlines within 20 days!`,
                `ముఖ్య గమనిక: మీరు ఎంచుకున్న ${urgentApps.length} పథకాల గడువు 20 రోజుల్లో ముగుస్తుంది!`,
                `ध्यान दें: आपकी ${urgentApps.length} ट्रैक की गई योजनाओं की अंतिम तिथि 20 दिनों के भीतर है!`
              )}
            </p>
            <p>
              {pick(
                'Tap "Calendar Alert (.ics)" or "WhatsApp Reminder" on each card below so your family submits before the window closes.',
                'గడువు దాటిపోకుండా ఉండేందుకు క్రింది కార్డులపై "క్యాలెండర్ అలర్ట్" లేదా "వాట్సాప్ రిమైండర్" నొక్కండి.',
                'समय निकलने से पहले नीचे दिए गए कार्ड पर कैलेंडर अलर्ट या व्हाट्सएप रिमाइंडर सेट करें।'
              )}
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {trackedApplications.length === 0 ? (
        <Card className="border border-border bg-white shadow-sm p-8 md:p-12 text-center space-y-4">
          <CalendarClock className="h-12 w-12 text-primary/60 mx-auto" aria-hidden="true" />
          <h2 className={`text-xl font-bold text-body ${getFontClass()}`}>
            {pick(
              'No Schemes Tracked Yet',
              'ఇంకా ఏ పథకాన్ని ట్రాక్ చేయలేదు',
              'अभी तक कोई योजना ट्रैक नहीं की गई है'
            )}
          </h2>
          <p className={`text-sm md:text-base text-muted max-w-lg mx-auto ${getFontClass()}`}>
            {pick(
              'Check your eligibility or browse the scheme directory and tap "Track Application" on any scheme to unlock opening alerts, SLA reminders, and rejection troubleshooting.',
              'అర్హత ఫలితాలలో "ట్రాక్ చేయండి" నొక్కి పథకం ప్రారంభ అలర్ట్‌లు, SLA ఫాలో-అప్ మరియు తిరస్కరణ పరిష్కారాలను పొందండి.',
              'पात्रता परिणामों में "आवेदन ट्रैक करें" पर टैप करके प्रारंभ अलर्ट, SLA फॉलो-अप और अस्वीकृति सहायता पाएं।'
            )}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              onClick={() => navigate(ROUTES.DESCRIBE)}
              className={`min-h-[44px] inline-flex items-center gap-2 ${getFontClass()}`}
            >
              <Sparkles className="h-4 w-4 text-amber-300" aria-hidden="true" />
              <span>{pick('Check Eligibility Now', 'అర్హత తనిఖీ చేయండి', 'पात्रता जांचें')}</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.SCHEMES_BROWSE)}
              className={`min-h-[44px] bg-white ${getFontClass()}`}
            >
              {pick('Browse Schemes', 'అన్ని పథకాలు చూడండి', 'योजनाएं देखें')}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {trackedApplications.map((app) => {
            const schemeObj = schemes.find((s) => s.id === app.scheme_id);
            const personalisedDocs = schemeObj
              ? personaliseSchemeDocuments(schemeObj.documents, confirmedProfile)
              : [];
            const mandatoryDocs = personalisedDocs.filter(
              (d) => d.effective_requirement === 'mandatory'
            );
            const checkedMap = getCheckedDocuments(app.scheme_id);
            const checkedCount = mandatoryDocs.filter((d) => checkedMap[d.id]).length;
            const daysLeft = getDaysUntilDeadline(app.application_close_on);
            const whatsappUrl = buildWhatsAppReminderUrl(app, mandatoryDocs, language);
            const followUpEval = evaluateFollowUpStatus(app);
            const savedRejectionDiag = app.rejection_reason_code
              ? AP_REJECTION_DIAGNOSTICS.find((d) => d.code === app.rejection_reason_code)
              : null;

            return (
              <Card key={app.scheme_id} className="border border-border bg-white shadow-sm">
                <CardHeader className="p-5 md:p-6 pb-4 border-b border-slate-100">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={
                            app.stage === 'sanctioned'
                              ? 'success'
                              : app.stage === 'rejected'
                              ? 'warning'
                              : 'info'
                          }
                          className={`text-sm font-bold ${getFontClass()}`}
                        >
                          {app.stage === 'rejected'
                            ? pick('Rejected / Action Needed', 'తిరస్కరించబడింది / చర్య అవసరం', 'अस्वीकृत / सुधार आवश्यक')
                            : app.stage === 'upcoming_notify'
                            ? pick('Watching for Opening', 'ప్రారంభం కోసం నిరీక్షణ', 'खुलने की प्रतीक्षा')
                            : (() => {
                                const st = STAGES.find((s) => s.id === app.stage) || STAGES[0];
                                return pick(st.en, st.te, st.hi);
                              })()}
                        </Badge>

                        {daysLeft !== null && daysLeft >= 0 && (
                          <Badge
                            variant={daysLeft <= 15 ? 'warning' : 'secondary'}
                            className={`text-sm font-bold ${getFontClass()}`}
                          >
                            {pick(
                              `${daysLeft} days until deadline`,
                              `గడువుకు ${daysLeft} రోజులు`,
                              `अंतिम तिथि में ${daysLeft} दिन`
                            )}
                          </Badge>
                        )}

                        {app.reminder_downloaded && (
                          <Badge variant="success" className={`text-sm ${getFontClass()}`}>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                            {pick('Reminder Saved', 'రిమైండర్ సేవ్ అయింది', 'रिमाइंडर सहेजा गया')}
                          </Badge>
                        )}
                      </div>

                      <CardTitle className={`text-lg md:text-xl font-bold pt-1 ${getFontClass()}`}>
                        <Link
                          to={ROUTES.SCHEME_DETAIL(app.scheme_id)}
                          className="hover:text-primary hover:underline"
                        >
                          {pick(app.name_en, app.name_te, app.name_hi)}
                        </Link>
                      </CardTitle>

                      <p className={`text-sm text-slate-700 ${getFontClass()}`}>
                        {pick(app.benefit_summary_en, app.benefit_summary_te, app.benefit_summary_hi)}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => untrackScheme(app.scheme_id)}
                      className="min-h-[44px] text-slate-600 hover:text-danger"
                      aria-label={pick('Remove from tracker', 'ట్రాకర్ నుండి తొలగించు', 'ट्रैकर से हटाएं')}
                    >
                      <Trash2 className="h-4 w-4 mr-1" aria-hidden="true" />
                      <span>{pick('Remove', 'తొలగించు', 'हटाएं')}</span>
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-5 md:p-6 space-y-5">
                  {/* 5-Stage Progress Selector */}
                  <div className="space-y-2">
                    <span className={`text-sm font-bold text-body block ${getFontClass()}`}>
                      {pick(
                        'Update Application Stage:',
                        'మీ దరఖాస్తు ప్రస్తుత దశను ఎంచుకోండి:',
                        'आवेदन का वर्तमान चरण चुनें:'
                      )}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2" role="group" aria-label="Application progress stages">
                      {STAGES.map((st) => {
                        const isCurrent = app.stage === st.id;
                        const currentStepNum =
                          STAGES.find((x) => x.id === app.stage)?.step || 0;
                        const isDone = currentStepNum > 0 && st.step < currentStepNum;

                        return (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => updateApplicationStage(app.scheme_id, st.id)}
                            aria-pressed={isCurrent}
                            className={`min-h-[44px] px-3 py-2 rounded-md border text-sm font-semibold text-left transition-colors ${
                              isCurrent
                                ? 'bg-primary text-white border-primary shadow-sm'
                                : isDone
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-400'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            } ${getFontClass()}`}
                          >
                            {pick(st.en, st.te, st.hi)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* v3.0 Full Lifecycle Follow-Up & Outcome Check-In Panel */}
                  <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className={`text-sm font-extrabold text-primary flex items-center gap-2 ${getFontClass()}`}>
                        <BellRing className="h-4 w-4 text-indigo-700 shrink-0" aria-hidden="true" />
                        <span>
                          {pick(
                            'Lifecycle Follow-Up: Opening Window, Outcome & Rejection Help',
                            'ఫాలో-అప్: పథకం ప్రారంభం, మంజూరు స్థితి & తిరస్కరణ సహాయం',
                            'फॉलो-अप: योजना प्रारंभ, लाभ की स्थिति और अस्वीकृति सहायता'
                          )}
                        </span>
                      </h3>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleEnableOpeningNotification(app)}
                        className={`min-h-[38px] bg-white text-xs font-semibold ${getFontClass()}`}
                      >
                        <BellRing className="h-3.5 w-3.5 mr-1.5 text-amber-600" aria-hidden="true" />
                        {app.notify_when_opens
                          ? pick('Opening Alert Active (.ics)', 'ప్రారంభ అలర్ట్ ఆన్ ఉంది', 'प्रारंभ अलर्ट सक्रिय')
                          : pick('Notify When Scheme Starts', 'పథకం మొదలైనప్పుడు అలర్ట్ ఇవ్వు', 'योजना शुरू होने पर सूचित करें')}
                      </Button>
                    </div>

                    {followUpEval.state === 'sla_overdue' && (
                      <div className={`rounded-lg bg-amber-100/80 border border-amber-300 p-3 text-xs text-amber-950 font-semibold ${getFontClass()}`}>
                        {pick(
                          `SLA Overdue (${followUpEval.daysSinceSubmission} days since submission vs ${followUpEval.slaDays}-day SLA). Call 1902 with your Sachivalayam acknowledgement receipt to request an officer status update.`,
                          `SLA గడువు దాటింది (దరఖాస్తు చేసి ${followUpEval.daysSinceSubmission} రోజులైంది). మీ రసీదుతో 1902 కి కాల్ చేసి స్థితి తెలుసుకోండి.`,
                          `SLA समय सीमा पार (${followUpEval.daysSinceSubmission} दिन बीत चुके हैं)। अपनी रसीद के साथ 1902 पर कॉल करें।`
                        )}
                      </div>
                    )}

                    {/* Outcome Check-In Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-xs font-semibold text-muted mr-1 ${getFontClass()}`}>
                        {pick('Did you avail this scheme?', 'మీకు ఈ పథకం అందిందా?', 'क्या आपको इस योजना का लाभ मिला?')}
                      </span>

                      <Button
                        type="button"
                        size="sm"
                        variant={app.stage === 'sanctioned' ? 'default' : 'outline'}
                        onClick={() => updateApplicationStage(app.scheme_id, 'sanctioned')}
                        className={`min-h-[38px] text-xs font-bold ${
                          app.stage === 'sanctioned'
                            ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                            : 'bg-white text-emerald-900 border-emerald-400 hover:bg-emerald-50'
                        } ${getFontClass()}`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                        {pick('Yes, Availed Properly', 'అవును, లబ్ధి అందింది', 'हाँ, लाभ प्राप्त हुआ')}
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant={app.stage === 'rejected' ? 'default' : 'outline'}
                        onClick={() => setClaimDoctorApp(app)}
                        className={`min-h-[38px] text-xs font-bold ${
                          app.stage === 'rejected'
                            ? 'bg-rose-700 hover:bg-rose-800 text-white'
                            : 'bg-white text-rose-900 border-rose-300 hover:bg-rose-50'
                        } ${getFontClass()}`}
                      >
                        <Stethoscope className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                        {pick(
                          'Got Rejected / Payment Failed (Claim Doctor)',
                          'తిరస్కరించబడింది / డబ్బు రాలేదు (క్లెయిమ్ డాక్టర్)',
                          'अस्वीकृत / भुगतान रुका (क्लेम डॉक्टर)'
                        )}
                      </Button>

                      {app.stage === 'sanctioned' && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => downloadAnnualRenewalIcs(app, language)}
                          className={`min-h-[38px] text-xs bg-white font-semibold ${getFontClass()}`}
                        >
                          <RefreshCw className="h-3.5 w-3.5 mr-1.5 text-indigo-700" aria-hidden="true" />
                          {pick(
                            'Download Annual Renewal Reminder (.ics)',
                            'వార్షిక పునరుద్ధరణ రిమైండర్ (.ics)',
                            'वार्षिक नवीनीकरण रिमाइंडर (.ics)'
                          )}
                        </Button>
                      )}
                    </div>

                    {app.stage === 'rejected' && savedRejectionDiag && (
                      <div className="rounded-lg border border-rose-300 bg-rose-50/70 p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className={getFontClass()}>
                          <strong className="text-rose-950">
                            {pick('Diagnosed Issue:', 'గుర్తించిన సమస్య:', 'पहचानी गई समस्या:')}{' '}
                          </strong>
                          <span className="text-rose-900">
                            {pick(
                              savedRejectionDiag.title_en,
                              savedRejectionDiag.title_te,
                              savedRejectionDiag.title_hi
                            )}
                          </span>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setClaimDoctorApp(app)}
                          className="min-h-[34px] text-xs bg-white border-rose-300 text-rose-900 font-bold"
                        >
                          {pick('Open Fix Steps & 1902 Slip', 'పరిష్కారం & 1902 స్లిప్', 'समाधान व 1902 पर्ची')}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Document Readiness + Local Non-PII Note */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 flex items-center justify-between gap-3">
                      <div className={getFontClass()}>
                        <div className="text-sm font-bold text-body flex items-center gap-1.5">
                          <FileCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                          <span>
                            {pick('Documents Prepared:', 'సిద్ధమైన పత్రాలు:', 'तैयार दस्तावेज़:')}{' '}
                            {checkedCount} / {mandatoryDocs.length}
                          </span>
                        </div>
                        <p className="text-sm text-muted mt-0.5">
                          {app.deadline_label_en
                            ? pick(app.deadline_label_en, app.deadline_label_te, app.deadline_label_hi)
                            : pick('Open year-round', 'సంవత్సరం పొడవునా అందుబాటులో', 'पूरे वर्ष खुला')}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(ROUTES.DOCUMENT_CHECKLIST(app.scheme_id))}
                        className={`min-h-[44px] bg-white text-sm shrink-0 ${getFontClass()}`}
                      >
                        {pick('Open Checklist', 'జాబితా చూడండి', 'सूची खोलें')}
                      </Button>
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor={`note-${app.scheme_id}`}
                        className={`text-sm font-semibold text-body block ${getFontClass()}`}
                      >
                        {pick(
                          'Sachivalayam Visit / Follow-up Note (No ID numbers):',
                          'సచివాలయ సందర్శన / రసీదు గమనిక (ఆధార్ నంబర్లు రాయవద్దు):',
                          'सचिवालय विज़िट / फॉलो-अप नोट (कोई आईडी नंबर न लिखें):'
                        )}
                      </label>
                      <Input
                        id={`note-${app.scheme_id}`}
                        type="text"
                        value={app.reference_note}
                        onChange={(e) => handleNoteChange(app.scheme_id, e.target.value)}
                        placeholder={pick(
                          'e.g., Met Welfare Assistant at Ward 4 on Monday…',
                          'ఉదా: సోమవారం వార్డు 4 సచివాలయంలో దరఖాస్తు ఇచ్చాము…',
                          'जैसे: सोमवार को वार्ड 4 सचिवालय में जमा किया…'
                        )}
                        className={getFontClass()}
                      />
                      {piiWarningSchemeId === app.scheme_id && (
                        <p role="alert" className={`text-sm text-danger font-semibold ${getFontClass()}`}>
                          {pick(
                            'Sensitive ID digits were automatically removed for your privacy.',
                            'మీ భద్రత కోసం గుర్తింపు సంఖ్యలు ఆటోమేటిక్‌గా తొలగించబడ్డాయి.',
                            'आपकी सुरक्षा के लिए संवेदनशील नंबर स्वतः हटा दिए गए।'
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-5 md:p-6 pt-3 border-t border-slate-100 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={() => handleDownloadIcs(app)}
                      className={`min-h-[44px] text-sm inline-flex items-center gap-1.5 ${getFontClass()}`}
                    >
                      <CalendarPlus className="h-4 w-4 text-amber-300" aria-hidden="true" />
                      <span>
                        {pick(
                          'Calendar Alert (.ics)',
                          'క్యాలెండర్ అలర్ట్ (.ics)',
                          'कैलेंडर अलर्ट (.ics)'
                        )}
                      </span>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className={`min-h-[44px] text-sm border-emerald-500 text-emerald-900 bg-emerald-50/70 hover:bg-emerald-100 inline-flex items-center gap-1.5 ${getFontClass()}`}
                    >
                      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                        <Share2 className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                        <span>
                          {pick(
                            'WhatsApp Reminder',
                            'వాట్సాప్ రిమైండర్',
                            'व्हाट्सएप रिमाइंडर'
                          )}
                        </span>
                      </a>
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <a
                      href="tel:1902"
                      className="inline-flex items-center gap-1 text-slate-700 font-medium hover:text-primary"
                    >
                      <PhoneCall className="h-4 w-4 text-primary" aria-hidden="true" />
                      <span>1902</span>
                    </a>
                    <a
                      href={app.status_check_url || app.official_source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`min-h-[44px] inline-flex items-center gap-1 font-semibold text-primary hover:underline ${getFontClass()}`}
                    >
                      <span>{pick('Check Official Status', 'అధికారిక స్థితి చూడండి', 'आधिकारिक स्थिति देखें')}</span>
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Interactive Sector Coverage Visualization: Availed vs Still Likely Eligible */}
      {schemes.length > 0 && (
        <section className="pt-4 border-t border-border">
          <SectorCoverageVisualizer
            schemes={schemes}
            profile={confirmedProfile}
            trackedApplications={trackedApplications}
          />
        </section>
      )}

      {claimDoctorApp && (
        <ClaimDoctorModal
          open={Boolean(claimDoctorApp)}
          onOpenChange={(isOpen) => {
            if (!isOpen) setClaimDoctorApp(null);
          }}
          application={claimDoctorApp}
          district={confirmedProfile?.district_code}
          onSelectReason={(reasonCode) => setRejectionReason(claimDoctorApp.scheme_id, reasonCode)}
        />
      )}
    </div>
  );
};
