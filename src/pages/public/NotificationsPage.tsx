import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/store/useLanguageStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationsStore } from '@/store/useNotificationsStore';
import { useSchemeStore } from '@/store/useSchemeStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useTrackerStore } from '@/store/useTrackerStore';
import { computeSectorCoverage } from '@/components/insights/SectorCoverageVisualizer';
import { getDaysUntilDeadline } from '@/utils/calendarReminder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/config/routes';
import {
  BellRing,
  CalendarClock,
  Mail,
  Send,
  ExternalLink,
  CheckCheck,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { pick, getFontClass } = useLanguage();
  const { user, persistedProfile } = useAuthStore();
  const {
    notifications,
    schemeWindows,
    unreadCount,
    isLoading,
    error,
    refreshNotifications,
    markRead,
    markAllRead,
    sendDeadlineDigestToGmail,
  } = useNotificationsStore();
  const { schemes } = useSchemeStore();
  const { confirmedProfile } = useProfileStore();
  const { trackedApplications } = useTrackerStore();

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [gmailInput, setGmailInput] = useState<string>(
    persistedProfile?.gmail_address || user?.email || ''
  );
  const [sending, setSending] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<{
    ok: boolean;
    message: string;
    previewHtml?: string;
  } | null>(null);

  useEffect(() => {
    void refreshNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!gmailInput && (persistedProfile?.gmail_address || user?.email)) {
      setGmailInput(persistedProfile?.gmail_address || user?.email || '');
    }
  }, [persistedProfile?.gmail_address, user?.email, gmailInput]);

  const filtered = notifications.filter(
    (n) => typeFilter === 'all' || n.notification_type === typeFilter
  );

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gmailInput.trim()) return;
    setSending(true);
    setEmailFeedback(null);

    const cov = computeSectorCoverage(
      schemes,
      persistedProfile || confirmedProfile,
      trackedApplications,
      { level: 'all', sector: 'all', status: 'all' }
    );

    const res = await sendDeadlineDigestToGmail({
      gmail_address: gmailInput.trim(),
      display_name: user?.display_name || 'Citizen',
      unclaimed_sectors: cov.unclaimedSectorNames,
    });
    setSending(false);
    setEmailFeedback({
      ok: res.ok,
      message: res.message,
      previewHtml: res.preview_html,
    });
  };

  return (
    <div className="max-w-5xl mx-auto py-8 md:py-10 px-4 sm:px-6 lg:px-8 space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1.5">
          <h1 className={`text-2xl md:text-3xl font-extrabold text-primary flex items-center gap-2.5 ${getFontClass()}`}>
            <BellRing className="h-7 w-7 text-amber-600 shrink-0" aria-hidden="true" />
            <span>
              {pick(
                'Recent Government Schemes, Start Dates & Deadline Alerts',
                'కొత్త ప్రభుత్వ పథకాలు, ప్రారంభ తేదీలు & గడువు అలర్ట్‌లు',
                'ताज़ा सरकारी योजनाएं, प्रारंभ तिथियाँ और अंतिम तिथि अलर्ट'
              )}
            </span>
          </h1>
          <p className={`text-xs sm:text-sm text-muted ${getFontClass()}`}>
            {pick(
              'Live Neon updates covering newly announced Andhra Pradesh & Central welfare schemes, start dates, closing deadlines, and direct Gmail SMTP notifications.',
              'ఆంధ్రప్రదేశ్ & కేంద్ర ప్రభుత్వ తాజా పథకాల అప్‌డేట్లు, ప్రారంభ/చివరి తేదీలు మరియు Gmail అలర్ట్‌లు.',
              'आंध्र प्रदेश व केंद्र की नई योजनाओं के अपडेट, प्रारंभ/अंतिम तिथियाँ और Gmail अलर्ट।'
            )}
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => void markAllRead()}
            className="min-h-[40px] bg-white text-xs font-bold shrink-0"
          >
            <CheckCheck className="h-4 w-4 mr-1.5 text-emerald-700" aria-hidden="true" />
            {pick(`Mark All Read (${unreadCount})`, `అన్నీ చదివినవిగా గుర్తించు`, `सभी पढ़ा हुआ चिह्नित करें`)}
          </Button>
        )}
      </div>

      {/* Ask User for Gmail -> Direct SMTP Deadline Mailer */}
      <Card className="border-2 border-indigo-300 bg-indigo-50/40 shadow-xs">
        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="flex items-start gap-2.5">
            <Mail className="h-5 w-5 text-indigo-700 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-0.5">
              <h2 className={`text-sm sm:text-base font-extrabold text-primary ${getFontClass()}`}>
                {pick(
                  'Get Scheme Start Dates, End Dates & New Launches Directly on Your Gmail',
                  'పథకాల ప్రారంభ & చివరి తేదీల అలర్ట్‌లను నేరుగా మీ Gmail లో పొందండి',
                  'योजना की प्रारंभ/अंतिम तिथियाँ और नए अपडेट सीधे अपने Gmail पर पाएं'
                )}
              </h2>
              <p className={`text-xs text-muted ${getFontClass()}`}>
                {pick(
                  'Enter your Gmail address below to subscribe and receive an instant deadline & recent government schemes email via ClaimSaathi SMTP.',
                  'క్రింద మీ Gmail చిరునామా ఇవ్వండి—తక్షణమే గడువు తేదీల మెయిల్ పంపబడుతుంది.',
                  'नीचे अपना Gmail दर्ज करें और तुरंत समय सीमा व ताज़ा योजनाओं का ईमेल प्राप्त करें।'
                )}
              </p>
            </div>
          </div>

          <form onSubmit={handleSendEmail} className="flex flex-col sm:flex-row gap-2">
            <Input
              type="email"
              required
              value={gmailInput}
              onChange={(e) => setGmailInput(e.target.value)}
              placeholder="Enter your Gmail (e.g. citizen@gmail.com)"
              aria-label="Your Gmail address for scheme alerts"
              className="min-h-[44px] bg-white"
            />
            <Button
              type="submit"
              disabled={sending || !gmailInput.trim()}
              className="min-h-[44px] font-bold shrink-0"
            >
              <Send className="h-4 w-4 mr-1.5" aria-hidden="true" />
              {sending
                ? pick('Sending…', 'పంపుతోంది…', 'भेजा जा रहा है…')
                : pick('Mail Deadlines to My Gmail', 'నా Gmail కు పంపు', 'मेरे Gmail पर भेजें')}
            </Button>
          </form>

          {emailFeedback && (
            <div className="space-y-2">
              <p
                role="status"
                className={`text-xs font-bold rounded-md p-2.5 border ${
                  emailFeedback.ok
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}
              >
                {emailFeedback.message}
              </p>
              {emailFeedback.previewHtml && (
                <iframe
                  title="Gmail SMTP Digest Preview"
                  srcDoc={emailFeedback.previewHtml}
                  sandbox=""
                  className="w-full h-[260px] rounded-lg border border-slate-200 bg-white"
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Scheme Start Dates & End Dates Countdown Strip */}
      {schemeWindows.length > 0 && (
        <section className="space-y-3" aria-label="Upcoming Scheme Dates">
          <h2 className={`text-base sm:text-lg font-extrabold text-primary flex items-center gap-2 ${getFontClass()}`}>
            <CalendarClock className="h-5 w-5 text-emerald-700 shrink-0" aria-hidden="true" />
            <span>
              {pick(
                'Live Scheme Start Dates & Closing Deadlines',
                'పథకాల ప్రారంభ తేదీలు & దరఖాస్తు చివరి తేదీలు',
                'योजनाओं की प्रारंभ और अंतिम तिथियाँ'
              )}
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {schemeWindows.map((win) => {
              const daysLeft = getDaysUntilDeadline(win.application_close_on);
              return (
                <Card key={win.id} className="border-border bg-white">
                  <CardContent className="p-4 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <Link
                        to={ROUTES.SCHEME_DETAIL(win.id)}
                        className={`text-sm font-bold text-primary hover:underline ${getFontClass()}`}
                      >
                        {pick(win.name_en, win.name_te, win.name_hi)}
                      </Link>
                      <div className="flex flex-wrap gap-2 text-xs text-muted">
                        {win.application_open_on && (
                          <span className="font-semibold text-emerald-800">
                            {pick('Starts:', 'ప్రారంభం:', 'शुरू:')} {win.application_open_on}
                          </span>
                        )}
                        {win.application_close_on && (
                          <span className="font-semibold text-amber-900">
                            {pick('Ends:', 'చివరి తేదీ:', 'अंतिम तिथि:')} {win.application_close_on}
                          </span>
                        )}
                      </div>
                    </div>
                    {daysLeft !== null && daysLeft >= 0 && (
                      <Badge
                        variant={daysLeft <= 20 ? 'warning' : 'secondary'}
                        className="shrink-0 font-bold"
                      >
                        {daysLeft}d left
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Filter Bar for Recent Government Scheme Notifications */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', en: 'All Updates', te: 'అన్నీ', hi: 'सभी' },
          { id: 'recent_scheme', en: 'Recent Govt Schemes', te: 'కొత్త పథకాలు', hi: 'नई योजनाएं' },
          { id: 'window_opening', en: 'Start Dates / Opening', te: 'ప్రారంభ తేదీలు', hi: 'प्रारंभ तिथियाँ' },
          { id: 'deadline_closing', en: 'Closing Deadlines', te: 'చివరి తేదీలు', hi: 'अंतिम तिथियाँ' },
          { id: 'policy_update', en: 'Policy Updates', te: 'విధాన మార్పులు', hi: 'नीति अपडेट' },
        ].map((tab) => (
          <Button
            key={tab.id}
            type="button"
            size="sm"
            variant={typeFilter === tab.id ? 'default' : 'outline'}
            onClick={() => setTypeFilter(tab.id)}
            className={`min-h-[38px] text-xs font-semibold ${getFontClass()}`}
          >
            {pick(tab.en, tab.te, tab.hi)}
          </Button>
        ))}
      </div>

      {/* Notifications List */}
      {error && (
        <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-xs sm:text-sm text-amber-950 flex items-center gap-2 font-semibold">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-muted py-6 text-center">Loading live updates from Neon…</p>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted">
          {pick(
            'No notifications found for this filter yet.',
            'ఈ ఫిల్టర్‌లో నోటిఫికేషన్లు లేవు.',
            'इस फ़िल्टर के लिए कोई सूचना नहीं मिली।'
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => (
            <Card
              key={n.id}
              className={`border transition-all ${
                n.is_read ? 'border-border bg-white' : 'border-primary/40 bg-primary/[0.03] shadow-xs'
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      className={
                        n.notification_type === 'deadline_closing'
                          ? 'bg-amber-100 text-amber-950 border-amber-300'
                          : n.notification_type === 'window_opening'
                          ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                          : 'bg-indigo-100 text-indigo-950 border-indigo-300'
                      }
                    >
                      <Sparkles className="h-3 w-3 mr-1" aria-hidden="true" />
                      {n.notification_type.replace('_', ' ').toUpperCase()}
                    </Badge>
                    {!n.is_read && (
                      <Badge className="bg-rose-100 text-rose-900 border-rose-300 text-[10px]">
                        NEW
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-muted font-semibold">
                    {n.start_date && <span>Starts: {n.start_date}</span>}
                    {n.end_date && <span className="text-amber-900">Ends: {n.end_date}</span>}
                  </div>
                </div>
                <CardTitle className={`text-base font-extrabold text-primary pt-1 ${getFontClass()}`}>
                  {pick(n.title_en, n.title_te, n.title_hi)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs sm:text-sm">
                <p className={`text-body leading-relaxed ${getFontClass()}`}>
                  {pick(n.body_en, n.body_te, n.body_hi)}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex flex-wrap gap-2">
                    {n.scheme_id && (
                      <Link
                        to={ROUTES.SCHEME_DETAIL(n.scheme_id)}
                        className="inline-flex items-center px-3 min-h-[36px] rounded-md bg-primary text-white text-xs font-bold hover:bg-primary/90"
                      >
                        {pick('View Scheme & Checklist', 'పథకం వివరాలు చూడండి', 'योजना विवरण देखें')}
                      </Link>
                    )}
                    <a
                      href={n.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 min-h-[36px] rounded-md border border-border bg-white text-primary text-xs font-semibold hover:bg-slate-50"
                    >
                      {pick('Official Portal', 'అధికారిక పోర్టల్', 'आधिकारिक पोर्टल')}
                      <ExternalLink className="h-3.5 w-3.5 ml-1" aria-hidden="true" />
                    </a>
                  </div>
                  {!n.is_read && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => void markRead(n.id)}
                      className="min-h-[36px] text-xs text-muted hover:text-primary"
                    >
                      {pick('Mark Read', 'చదివినట్లు గుర్తించు', 'पढ़ा हुआ चिह्नित करें')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
