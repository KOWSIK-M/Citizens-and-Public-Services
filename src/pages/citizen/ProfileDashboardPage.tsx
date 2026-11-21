import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Tabs from '@radix-ui/react-tabs';
import { useLanguage } from '@/store/useLanguageStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfileStore, DEFAULT_PROFILE } from '@/store/useProfileStore';
import { useSchemeStore } from '@/store/useSchemeStore';
import { useTrackerStore } from '@/store/useTrackerStore';
import { useNotificationsStore } from '@/store/useNotificationsStore';
import {
  AGE_BANDS,
  AP_DISTRICT_OPTIONS,
  INCOME_BANDS,
  LAND_HOLDING_BANDS,
  OCCUPATION_CATEGORIES,
  SOCIAL_CATEGORIES,
  TRI_STATE_OPTIONS,
} from '@/config/bands';
import { CitizenProfile } from '@/types/profile';
import {
  SectorCoverageVisualizer,
  computeSectorCoverage,
} from '@/components/insights/SectorCoverageVisualizer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/config/routes';
import {
  UserCircle2,
  BarChart3,
  Mail,
  Save,
  LogOut,
  ShieldCheck,
  Send,
  CheckCircle2,
  LogIn,
} from 'lucide-react';

export const ProfileDashboardPage: React.FC = () => {
  const { pick, getFontClass, language } = useLanguage();
  const {
    user,
    isAuthenticated,
    isAdmin,
    persistedProfile,
    savePersonalisedProfile,
    logout,
  } = useAuthStore();
  const { confirmedProfile, setConfirmedProfile } = useProfileStore();
  const { schemes } = useSchemeStore();
  const { trackedApplications } = useTrackerStore();
  const { sendDeadlineDigestToGmail } = useNotificationsStore();
  const navigate = useNavigate();

  const activeProfile: CitizenProfile = persistedProfile || confirmedProfile || DEFAULT_PROFILE;

  const [formProfile, setFormProfile] = useState<CitizenProfile>(activeProfile);
  const [gmailAddress, setGmailAddress] = useState<string>(
    persistedProfile?.gmail_address || user?.email || ''
  );
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState<boolean>(
    persistedProfile?.email_notifications_enabled ?? true
  );
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // SMTP dispatch state
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{
    ok: boolean;
    message: string;
    previewHtml?: string;
    subject?: string;
  } | null>(null);

  useEffect(() => {
    if (persistedProfile) {
      setFormProfile(persistedProfile);
      setGmailAddress(persistedProfile.gmail_address || user?.email || '');
      setEmailAlertsEnabled(persistedProfile.email_notifications_enabled);
    }
  }, [persistedProfile, user?.email]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage(null);

    const updatedProfile: CitizenProfile = {
      ...formProfile,
      language_pref: language,
      is_sample: false,
    };
    setConfirmedProfile(updatedProfile);

    if (isAuthenticated) {
      const res = await savePersonalisedProfile({
        ...updatedProfile,
        gmail_address: gmailAddress.trim() || null,
        email_notifications_enabled: emailAlertsEnabled,
      });
      setSaving(false);
      setSaveMessage(
        res.ok
          ? pick(
              'Personalised profile & Gmail alert settings saved to Neon PostgreSQL!',
              'మీ వ్యక్తిగత ప్రొఫైల్ & Gmail అలర్ట్ సెట్టింగ్స్ సేవ్ అయ్యాయి!',
              'आपकी व्यक्तिगत प्रोफ़ाइल और Gmail अलर्ट सेटिंग्स सहेजी गईं!'
            )
          : res.error || 'Unable to save profile.'
      );
    } else {
      setSaving(false);
      setSaveMessage(
        pick(
          'Profile applied for this session! Sign in to persist across devices and enable Gmail SMTP alerts.',
          'ఈ సెషన్‌కు ప్రొఫైల్ సేవ్ అయింది! శాశ్వతంగా సేవ్ చేయడానికి లాగిన్ అవ్వండి.',
          'इस सत्र के लिए प्रोफ़ाइल सहेजी गई! स्थायी रूप से सहेजने के लिए साइन इन करें।'
        )
      );
    }
  };

  const handleSendGmailDigest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gmailAddress.trim()) return;
    setSendingEmail(true);
    setEmailStatus(null);

    const coverage = computeSectorCoverage(schemes, activeProfile, trackedApplications, {
      level: 'all',
      sector: 'all',
      status: 'all',
    });

    const result = await sendDeadlineDigestToGmail({
      gmail_address: gmailAddress.trim(),
      display_name: user?.display_name || 'Citizen',
      unclaimed_sectors: coverage.unclaimedSectorNames,
    });

    setSendingEmail(false);
    setEmailStatus({
      ok: result.ok,
      message: result.message,
      previewHtml: result.preview_html,
      subject: result.subject,
    });
  };

  return (
    <div className="max-w-6xl mx-auto py-8 md:py-10 px-4 sm:px-6 lg:px-8 space-y-7">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-indigo-100 text-indigo-900 border border-indigo-300 font-bold">
              <ShieldCheck className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
              {isAuthenticated
                ? `${user?.role.toUpperCase()} • Neon Synced`
                : pick('Guest Session Preview', 'అతిథి సెషన్ ప్రివ్యూ', 'अतिथि सत्र पूर्वावलोकन')}
            </Badge>
            {isAdmin && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => navigate(ROUTES.ADMIN)}
                className="min-h-[30px] text-xs font-bold border-amber-400 text-amber-950 bg-amber-50"
              >
                Admin Studio
              </Button>
            )}
          </div>
          <h1 className={`text-2xl md:text-3xl font-extrabold text-primary flex items-center gap-2.5 ${getFontClass()}`}>
            <UserCircle2 className="h-8 w-8 text-primary shrink-0" aria-hidden="true" />
            <span>
              {isAuthenticated
                ? pick(
                    `${user?.display_name}’s Welfare Dashboard & Personalised Profile`,
                    `${user?.display_name} — సంక్షేమ డ్యాష్‌బోర్డ్ & వ్యక్తిగత ప్రొఫైల్`,
                    `${user?.display_name} — कल्याण डैशबोर्ड और व्यक्तिगत प्रोफ़ाइल`
                  )
                : pick(
                    'Personalised Welfare Dashboard & Sector Insights',
                    'వ్యక్తిగత సంక్షేమ డ్యాష్‌బోర్డ్ & రంగాల విశ్లేషణ',
                    'व्यक्तिगत कल्याण डैशबोर्ड और सेक्टर विश्लेषण'
                  )}
            </span>
          </h1>
          <p className={`text-xs sm:text-sm text-muted ${getFontClass()}`}>
            {pick(
              'Explore which scheme sectors you have availed vs. which sectors you are still likely eligible for, manage your coarse profile, and get Gmail deadline alerts.',
              'మీరు ఏ రంగాలలో పథకాలు పొందారు, ఏ రంగాలలో ఇంకా అర్హత ఉందో విశ్లేషించి Gmail గడువు అలర్ట్‌లు పొందండి.',
              'देखें कि आपने किन क्षेत्रों की योजनाओं का लाभ लिया है और किन क्षेत्रों के लिए अभी भी संभावित पात्र हैं।'
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          {isAuthenticated ? (
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                await logout();
                navigate(ROUTES.HOME);
              }}
              className="min-h-[42px] bg-white text-xs sm:text-sm"
            >
              <LogOut className="h-4 w-4 mr-1.5" aria-hidden="true" />
              {pick('Sign Out', 'లాగ్ అవుట్', 'साइन आउट')}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => navigate(ROUTES.AUTH)}
              className="min-h-[42px] font-bold text-xs sm:text-sm"
            >
              <LogIn className="h-4 w-4 mr-1.5" aria-hidden="true" />
              {pick('Sign In / Save to Neon', 'లాగిన్ / ఖాతా తెరవండి', 'साइन इन / खाता बनाएं')}
            </Button>
          )}
        </div>
      </div>

      {/* Dashboard Tabs */}
      <Tabs.Root defaultValue="insights" className="space-y-6">
        <Tabs.List className="flex flex-wrap gap-2 border-b border-border pb-2">
          <Tabs.Trigger
            value="insights"
            className={`min-h-[44px] px-4 py-2 rounded-lg text-xs sm:text-sm font-bold inline-flex items-center gap-2 border border-border data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:bg-white ${getFontClass()}`}
          >
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
            {pick('Sector Coverage Visualization', 'రంగాల విశ్లేషణ చార్ట్', 'सेक्टर कवरेज विश्लेषण')}
          </Tabs.Trigger>

          <Tabs.Trigger
            value="profile"
            className={`min-h-[44px] px-4 py-2 rounded-lg text-xs sm:text-sm font-bold inline-flex items-center gap-2 border border-border data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:bg-white ${getFontClass()}`}
          >
            <UserCircle2 className="h-4 w-4" aria-hidden="true" />
            {pick('Personalised Profile', 'వ్యక్తిగత ప్రొఫైల్', 'व्यक्तिगत प्रोफ़ाइल')}
          </Tabs.Trigger>

          <Tabs.Trigger
            value="gmail"
            className={`min-h-[44px] px-4 py-2 rounded-lg text-xs sm:text-sm font-bold inline-flex items-center gap-2 border border-border data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:bg-white ${getFontClass()}`}
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            {pick('Gmail SMTP Alerts', 'Gmail గడువు అలర్ట్‌లు', 'Gmail समय सीमा अलर्ट')}
          </Tabs.Trigger>
        </Tabs.List>

        {/* Tab 1: Interactive Sector Coverage Visualization */}
        <Tabs.Content value="insights" className="focus:outline-none">
          <SectorCoverageVisualizer
            schemes={schemes}
            profile={activeProfile}
            trackedApplications={trackedApplications}
          />
        </Tabs.Content>

        {/* Tab 2: Personalised Coarse Household Profile Editor */}
        <Tabs.Content value="profile" className="focus:outline-none">
          <Card className="border-border bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className={`text-lg font-extrabold text-primary ${getFontClass()}`}>
                {pick(
                  'Edit Your Personalised Coarse Profile (Zero Aadhaar / IDs Stored)',
                  'మీ వ్యక్తిగత ప్రొఫైల్ వివరాలు (ఆధార్ నంబర్ అవసరం లేదు)',
                  'अपनी व्यक्तिगत प्रोफ़ाइल संपादित करें (कोई आधार नंबर नहीं)'
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="prof-district" className="block text-xs font-bold text-primary mb-1">
                      {pick('AP District', 'ఆంధ్రప్రదేశ్ జిల్లా', 'आंध्र प्रदेश जिला')}
                    </label>
                    <select
                      id="prof-district"
                      value={formProfile.district_code || 'unknown'}
                      onChange={(e) =>
                        setFormProfile((p) => ({ ...p, district_code: e.target.value }))
                      }
                      className="w-full min-h-[42px] rounded-md border border-input bg-white px-3 text-xs sm:text-sm"
                    >
                      <option value="unknown">Select district</option>
                      {AP_DISTRICT_OPTIONS.map((d) => (
                        <option key={d.value} value={d.value}>
                          {pick(d.label_en, d.label_te, d.label_hi)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="prof-age" className="block text-xs font-bold text-primary mb-1">
                      {pick('Age Band', 'వయోపరిమితి', 'आयु वर्ग')}
                    </label>
                    <select
                      id="prof-age"
                      value={formProfile.age_band}
                      onChange={(e) =>
                        setFormProfile((p) => ({
                          ...p,
                          age_band: e.target.value as CitizenProfile['age_band'],
                        }))
                      }
                      className="w-full min-h-[42px] rounded-md border border-input bg-white px-3 text-xs sm:text-sm"
                    >
                      <option value="unknown">Not specified</option>
                      {AGE_BANDS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {pick(o.label_en, o.label_te, o.label_hi)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="prof-income" className="block text-xs font-bold text-primary mb-1">
                      {pick('Annual Income Band', 'వార్షిక ఆదాయం', 'वार्षिक आय')}
                    </label>
                    <select
                      id="prof-income"
                      value={formProfile.income_band}
                      onChange={(e) =>
                        setFormProfile((p) => ({
                          ...p,
                          income_band: e.target.value as CitizenProfile['income_band'],
                        }))
                      }
                      className="w-full min-h-[42px] rounded-md border border-input bg-white px-3 text-xs sm:text-sm"
                    >
                      <option value="unknown">Not specified</option>
                      {INCOME_BANDS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {pick(o.label_en, o.label_te, o.label_hi)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="prof-occ" className="block text-xs font-bold text-primary mb-1">
                      {pick('Primary Occupation', 'ప్రధాన వృత్తి', 'मुख्य व्यवसाय')}
                    </label>
                    <select
                      id="prof-occ"
                      value={formProfile.occupation_category}
                      onChange={(e) =>
                        setFormProfile((p) => ({
                          ...p,
                          occupation_category:
                            e.target.value as CitizenProfile['occupation_category'],
                        }))
                      }
                      className="w-full min-h-[42px] rounded-md border border-input bg-white px-3 text-xs sm:text-sm"
                    >
                      <option value="unknown">Not specified</option>
                      {OCCUPATION_CATEGORIES.map((o) => (
                        <option key={o.value} value={o.value}>
                          {pick(o.label_en, o.label_te, o.label_hi)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="prof-land" className="block text-xs font-bold text-primary mb-1">
                      {pick('Land Holding', 'వ్యవసాయ భూమి', 'कृषि भूमि')}
                    </label>
                    <select
                      id="prof-land"
                      value={formProfile.land_holding_band}
                      onChange={(e) =>
                        setFormProfile((p) => ({
                          ...p,
                          land_holding_band: e.target.value as CitizenProfile['land_holding_band'],
                        }))
                      }
                      className="w-full min-h-[42px] rounded-md border border-input bg-white px-3 text-xs sm:text-sm"
                    >
                      <option value="unknown">Not specified</option>
                      {LAND_HOLDING_BANDS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {pick(o.label_en, o.label_te, o.label_hi)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="prof-cat" className="block text-xs font-bold text-primary mb-1">
                      {pick('Social Category', 'సామాజిక వర్గం', 'सामाजिक वर्ग')}
                    </label>
                    <select
                      id="prof-cat"
                      value={formProfile.social_category}
                      onChange={(e) =>
                        setFormProfile((p) => ({
                          ...p,
                          social_category: e.target.value as CitizenProfile['social_category'],
                        }))
                      }
                      className="w-full min-h-[42px] rounded-md border border-input bg-white px-3 text-xs sm:text-sm"
                    >
                      <option value="unknown">Not specified</option>
                      {SOCIAL_CATEGORIES.map((o) => (
                        <option key={o.value} value={o.value}>
                          {pick(o.label_en, o.label_te, o.label_hi)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Household Flags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                  {(
                    [
                      ['has_white_ration_card', 'White Rice / Ration Card'],
                      ['has_school_student', 'School Student (Class 1–12)'],
                      ['has_college_student', 'College / Post-Matric Student'],
                      ['is_tenant_farmer_ccrc', 'Tenant Farmer (CCRC Card)'],
                      ['is_widow_or_single_woman', 'Widow / Single Woman'],
                      ['has_disability', 'Person with Disability (SADAREM)'],
                    ] as const
                  ).map(([fieldKey, label]) => (
                    <div key={fieldKey} className="space-y-1">
                      <label htmlFor={`flag-${fieldKey}`} className="block text-xs font-semibold text-body">
                        {label}
                      </label>
                      <select
                        id={`flag-${fieldKey}`}
                        value={formProfile[fieldKey] || 'unknown'}
                        onChange={(e) =>
                          setFormProfile((p) => ({ ...p, [fieldKey]: e.target.value }))
                        }
                        className="w-full min-h-[38px] rounded-md border border-input bg-white px-2.5 text-xs"
                      >
                        {TRI_STATE_OPTIONS.map((t) => (
                          <option key={t.value} value={t.value}>
                            {pick(t.label_en, t.label_te, t.label_hi)}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                {saveMessage && (
                  <p role="status" className="text-xs sm:text-sm font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {saveMessage}
                  </p>
                )}

                <div className="flex justify-end">
                  <Button type="submit" disabled={saving} className="min-h-[44px] font-bold">
                    <Save className="h-4 w-4 mr-1.5" aria-hidden="true" />
                    {saving
                      ? pick('Saving…', 'సేవ్ అవుతోంది…', 'सहेजा जा रहा है…')
                      : pick('Save Personalised Profile', 'ప్రొఫైల్ సేవ్ చేయండి', 'प्रोफ़ाइल सहेजें')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* Tab 3: Gmail SMTP Deadline & Scheme Update Mailer */}
        <Tabs.Content value="gmail" className="focus:outline-none">
          <Card className="border-indigo-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className={`text-lg font-extrabold text-primary flex items-center gap-2 ${getFontClass()}`}>
                <Mail className="h-5 w-5 text-indigo-700 shrink-0" aria-hidden="true" />
                <span>
                  {pick(
                    'Direct Gmail Alerts for Scheme Start Dates, End Dates & Recent Updates',
                    'పథకం ప్రారంభం, గడువు తేదీలు & కొత్త అప్‌డేట్ల కోసం Gmail అలర్ట్‌లు',
                    'योजना की प्रारंभ/अंतिम तिथियों और अपडेट के लिए सीधा Gmail अलर्ट'
                  )}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <p className={`text-xs sm:text-sm text-muted ${getFontClass()}`}>
                {pick(
                  'Enter your Gmail address below. ClaimSaathi uses Nodemailer SMTP (smtp.gmail.com) to send your upcoming start dates, closing deadlines, recent government schemes, and unclaimed eligible sectors directly to your inbox.',
                  'క్రింద మీ Gmail చిరునామా ఇవ్వండి. పథకం ప్రారంభం, చివరి తేదీలు & కొత్త ప్రభుత్వ పథకాల వివరాలను నేరుగా మీ Gmail కు పంపుతాము.',
                  'नीचे अपना Gmail दर्ज करें। हम योजना की प्रारंभ तिथियाँ, अंतिम तिथियाँ और ताज़ा सरकारी योजनाएं सीधे आपके Gmail पर भेजेंगे।'
                )}
              </p>

              <form onSubmit={handleSendGmailDigest} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    type="email"
                    required
                    value={gmailAddress}
                    onChange={(e) => setGmailAddress(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="min-h-[44px]"
                  />
                  <Button
                    type="submit"
                    disabled={sendingEmail || !gmailAddress.trim()}
                    className="min-h-[44px] font-bold shrink-0"
                  >
                    <Send className="h-4 w-4 mr-1.5" aria-hidden="true" />
                    {sendingEmail
                      ? pick('Sending via SMTP…', 'పంపుతోంది…', 'भेजा जा रहा है…')
                      : pick('Send Deadline Digest Now', 'ఇప్పుడే Gmail కు పంపండి', 'अभी Gmail पर भेजें')}
                  </Button>
                </div>

                <label className="flex items-center gap-2 text-xs font-medium text-body cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailAlertsEnabled}
                    onChange={(e) => setEmailAlertsEnabled(e.target.checked)}
                    className="h-4 w-4 rounded"
                  />
                  <span>
                    {pick(
                      'Keep automated start-date & deadline reminder emails enabled on my profile',
                      'ఆటోమేటిక్ గడువు రిమైండర్ ఇమెయిల్స్ ఆన్‌లో ఉంచండి',
                      'मेरी प्रोफ़ाइल पर स्वचालित समय सीमा ईमेल सक्रिय रखें'
                    )}
                  </span>
                </label>
              </form>

              {emailStatus && (
                <div className="space-y-3 pt-2">
                  <div
                    role="status"
                    className={`rounded-lg p-3 text-xs sm:text-sm font-semibold border ${
                      emailStatus.ok
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                        : 'bg-rose-50 border-rose-300 text-rose-950'
                    }`}
                  >
                    {emailStatus.message}
                  </div>
                  {emailStatus.previewHtml && (
                    <div className="rounded-xl border border-slate-300 bg-slate-50 p-3 space-y-2">
                      <p className="text-xs font-bold text-primary">
                        Email Preview — Subject: {emailStatus.subject}
                      </p>
                      <iframe
                        title="ClaimSaathi Gmail Alert Preview"
                        srcDoc={emailStatus.previewHtml}
                        sandbox=""
                        className="w-full h-[320px] rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
};
