import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Tabs from '@radix-ui/react-tabs';
import { useLanguage } from '@/store/useLanguageStore';
import { useAuthStore } from '@/store/useAuthStore';
import { syncApplicationsFromNeon } from '@/store/useTrackerStore';
import { refreshNotificationsFromNeon } from '@/store/useNotificationsStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/config/routes';
import { ShieldCheck, LogIn, UserPlus, Mail, Lock } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { pick, getFontClass } = useLanguage();
  const { login, register, status, isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [gmailAlerts, setGmailAlerts] = useState('');
  const [enableGmailAlerts, setEnableGmailAlerts] = useState(true);
  const [adminInviteCode, setAdminInviteCode] = useState('');
  const [showAdminField, setShowAdminField] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (isAuthenticated && user) {
    return (
      <div className="max-w-md mx-auto py-14 px-4 text-center space-y-4">
        <Badge className="bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold">
          {pick('Signed In via JWT', 'JWT ద్వారా లాగిన్ అయ్యారు', 'JWT द्वारा साइन इन')}
        </Badge>
        <h1 className={`text-2xl font-extrabold text-primary ${getFontClass()}`}>
          {pick(`Welcome back, ${user.display_name}`, `స్వాగతం, ${user.display_name}`, `स्वागत है, ${user.display_name}`)}
        </h1>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button onClick={() => navigate(ROUTES.PROFILE)} className="min-h-[44px] font-bold">
            {pick('Open Personalised Dashboard', 'నా ప్రొఫైల్ డ్యాష్‌బోర్డ్', 'मेरा प्रोफ़ाइल डैशबोर्ड')}
          </Button>
          {user.role === 'admin' && (
            <Button variant="outline" onClick={() => navigate(ROUTES.ADMIN)} className="min-h-[44px]">
              Admin Governance Studio
            </Button>
          )}
        </div>
      </div>
    );
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const res = await login(email, password);
    if (!res.ok) {
      setErrorMsg(res.error || 'Login failed.');
      return;
    }
    await Promise.all([syncApplicationsFromNeon(), refreshNotificationsFromNeon()]);
    navigate(ROUTES.PROFILE);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const res = await register({
      email,
      password,
      display_name: displayName,
      gmail_address: gmailAlerts.trim() || email.trim(),
      email_notifications_enabled: enableGmailAlerts,
      admin_invite_code: adminInviteCode.trim() || undefined,
    });
    if (!res.ok) {
      setErrorMsg(res.error || 'Registration failed.');
      return;
    }
    await Promise.all([syncApplicationsFromNeon(), refreshNotificationsFromNeon()]);
    navigate(ROUTES.PROFILE);
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <Card className="border-border bg-white shadow-md">
        <CardHeader className="text-center space-y-2 pb-4 border-b border-slate-100">
          <div className="mx-auto h-11 w-11 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <CardTitle className={`text-xl font-extrabold text-primary ${getFontClass()}`}>
            {pick(
              'ClaimSaathi Personal Account',
              'క్లెయిమ్ సాథీ వ్యక్తిగత ఖాతా',
              'क्लेम साथी व्यक्तिगत खाता'
            )}
          </CardTitle>
          <p className={`text-xs text-muted ${getFontClass()}`}>
            {pick(
              'Save your personalised profile to Neon, visualize availed vs eligible sectors, and receive Gmail start/end date deadline alerts.',
              'మీ ప్రొఫైల్‌ను సేవ్ చేసి, రంగాల విశ్లేషణ & Gmail గడువు అలర్ట్‌లు పొందండి (ఆధార్ అవసరం లేదు).',
              'अपनी प्रोफ़ाइल सहेजें, सेक्टर विश्लेषण देखें और Gmail पर समय सीमा अलर्ट प्राप्त करें।'
            )}
          </p>
        </CardHeader>

        <CardContent className="p-5">
          <Tabs.Root value={tab} onValueChange={(v) => { setTab(v as 'login' | 'register'); setErrorMsg(null); }}>
            <Tabs.List className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-lg mb-5">
              <Tabs.Trigger
                value="login"
                className="min-h-[40px] rounded-md text-xs sm:text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-xs text-slate-600"
              >
                <LogIn className="h-4 w-4 inline mr-1.5" aria-hidden="true" />
                {pick('Sign In', 'లాగిన్', 'साइन इन')}
              </Tabs.Trigger>
              <Tabs.Trigger
                value="register"
                className="min-h-[40px] rounded-md text-xs sm:text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-xs text-slate-600"
              >
                <UserPlus className="h-4 w-4 inline mr-1.5" aria-hidden="true" />
                {pick('Create Account', 'కొత్త ఖాతా', 'नया खाता')}
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="login">
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="login-email" className="block text-xs font-bold text-primary">
                    {pick('Email / Gmail Address', 'ఇమెయిల్ / Gmail', 'ईमेल / Gmail')}
                  </label>
                  <Input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="citizen@gmail.com"
                    className="min-h-[44px]"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="login-pass" className="block text-xs font-bold text-primary">
                    {pick('Password', 'పాస్‌వర్డ్', 'पासवर्ड')}
                  </label>
                  <Input
                    id="login-pass"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="min-h-[44px]"
                  />
                </div>
                {errorMsg && (
                  <p role="alert" className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded p-2.5">
                    {errorMsg}
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full min-h-[46px] font-bold"
                >
                  {status === 'loading'
                    ? pick('Signing in…', 'లాగిన్ అవుతోంది…', 'साइन इन हो रहा है…')
                    : pick('Sign In Securely', 'సురక్షితంగా లాగిన్ అవ్వండి', 'सुरक्षित साइन इन करें')}
                </Button>
              </form>
            </Tabs.Content>

            <Tabs.Content value="register">
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label htmlFor="reg-name" className="block text-xs font-bold text-primary">
                    {pick('Display Name', 'మీ పేరు', 'आपका नाम')}
                  </label>
                  <Input
                    id="reg-name"
                    type="text"
                    required
                    minLength={2}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g., Lakshmi Devi"
                    className="min-h-[44px]"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="reg-email" className="block text-xs font-bold text-primary">
                    {pick('Email / Gmail Address', 'ఇమెయిల్ / Gmail', 'ईमेल / Gmail')}
                  </label>
                  <Input
                    id="reg-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@gmail.com"
                    className="min-h-[44px]"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="reg-pass" className="block text-xs font-bold text-primary">
                    {pick('Password (min 8 chars)', 'పాస్‌వర్డ్ (కనీసం 8 అక్షరాలు)', 'पासवर्ड (कम से कम 8 अक्षर)')}
                  </label>
                  <Input
                    id="reg-pass"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="min-h-[44px]"
                  />
                </div>

                <div className="rounded-lg border border-indigo-200 bg-indigo-50/40 p-3 space-y-2">
                  <label className="flex items-start gap-2 text-xs font-semibold text-primary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableGmailAlerts}
                      onChange={(e) => setEnableGmailAlerts(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded"
                    />
                    <span className={getFontClass()}>
                      <Mail className="h-3.5 w-3.5 inline mr-1 text-indigo-700" aria-hidden="true" />
                      {pick(
                        'Email me scheme start dates, closing deadlines & recent govt updates via Gmail SMTP',
                        'పథకం ప్రారంభ తేదీలు, గడువులు & కొత్త పథకాల అప్‌డేట్లను నా Gmail కు పంపండి',
                        'मुझे योजना की प्रारंभ/अंतिम तिथियाँ व सरकारी अपडेट Gmail पर भेजें'
                      )}
                    </span>
                  </label>
                  {enableGmailAlerts && (
                    <Input
                      type="email"
                      value={gmailAlerts}
                      onChange={(e) => setGmailAlerts(e.target.value)}
                      placeholder={pick(
                        'Gmail for alerts (defaults to account email)',
                        'అలర్ట్‌ల కోసం Gmail (ఐచ్ఛికం)',
                        'अलर्ट के लिए Gmail (वैकल्पिक)'
                      )}
                      className="min-h-[40px] bg-white text-xs"
                    />
                  )}
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setShowAdminField((v) => !v)}
                    className="text-[11px] font-semibold text-muted hover:text-primary underline inline-flex items-center gap-1"
                  >
                    <Lock className="h-3 w-3" aria-hidden="true" />
                    {pick(
                      'Registering as an Admin Officer? Enter Invite Code',
                      'అడ్మిన్ అధికారిగా నమోదు చేస్తున్నారా?',
                      'क्या आप एडमिन अधिकारी हैं? इनवाइट कोड दर्ज करें'
                    )}
                  </button>
                  {showAdminField && (
                    <Input
                      type="password"
                      value={adminInviteCode}
                      onChange={(e) => setAdminInviteCode(e.target.value)}
                      placeholder="ADMIN_INVITE_CODE"
                      className="mt-2 min-h-[40px] text-xs"
                    />
                  )}
                </div>

                {errorMsg && (
                  <p role="alert" className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded p-2.5">
                    {errorMsg}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full min-h-[46px] font-bold"
                >
                  {status === 'loading'
                    ? pick('Creating Account…', 'ఖాతా సృష్టిస్తోంది…', 'खाता बन रहा है…')
                    : pick('Create Personalised Account', 'వ్యక్తిగత ఖాతా సృష్టించండి', 'व्यक्तिगत खाता बनाएं')}
                </Button>
              </form>
            </Tabs.Content>
          </Tabs.Root>
        </CardContent>
      </Card>
    </div>
  );
};
