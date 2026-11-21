import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/store/useLanguageStore';
import { useProfileStore } from '@/store/useProfileStore';
import { ROUTES } from '@/config/routes';
import { SYNTHETIC_SCENARIOS } from '@/config/constants';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Sparkles,
  FileText,
  Lock,
  CheckCircle,
  CalendarClock,
  BookOpen,
  PhoneCall,
  MapPin,
  Users,
  BellRing,
  BarChart3,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { pick, getFontClass, language } = useLanguage();
  const { loadScenario } = useProfileStore();
  const navigate = useNavigate();

  const handleSelectScenario = (scenarioId: 'scenario_a' | 'scenario_b' | 'scenario_c') => {
    loadScenario(scenarioId, language);
    navigate(ROUTES.DESCRIBE);
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 via-primary/5 to-transparent pt-10 md:pt-14 pb-14 border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <Badge
            variant="outline"
            className={`border-primary/40 bg-white text-primary text-sm font-semibold px-3.5 py-1 mb-1 ${getFontClass()}`}
          >
            {pick(
              'Built for Rural Daily-Wage & Smallholder Households in Andhra Pradesh',
              'ఆంధ్రప్రదేశ్ గ్రామీణ కూలీ & సన్నకారు రైతు కుటుంబాల కొరకు',
              'आंध्र प्रदेश के ग्रामीण दिहाड़ी मजदूर व छोटे किसान परिवारों के लिए'
            )}
          </Badge>

          <h1
            className={`text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary tracking-tight leading-tight ${getFontClass()}`}
          >
            {pick(
              'Claim What’s Yours in Plain Language',
              'మీ హక్కులను సరళమైన భాషలో పొందండి',
              'अपने हक़ का लाभ सरल भाषा में पाएं'
            )}
          </h1>

          <p
            className={`max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-slate-700 leading-relaxed ${getFontClass()}`}
          >
            {pick(
              'Speak or type your family’s situation in Telugu, English, or Hindi—no long forms or Aadhaar numbers. See which Andhra Pradesh & Central schemes you are likely eligible for, why each rule matches, which documents to carry, and track deadlines for free.',
              'పొడవైన ఫారాలు లేదా ఆధార్ నంబర్లు అవసరం లేదు—మీ కుటుంబ పరిస్థితిని తెలుగు, ఇంగ్లీష్ లేదా హిందీలో మాట్లాడి లేదా టైప్ చేసి చెప్పండి. ఏ పథకాలకు అర్హత పొందే అవకాశం ఉందో, ఏ పత్రాలతో సచివాలయంలో ఉచితంగా దరఖాస్తు చేయాలో తెలుసుకోండి.',
              'लंबे फॉर्म या आधार नंबर की आवश्यकता नहीं—अपनी पारिवारिक स्थिति तेलुगु, हिंदी या अंग्रेजी में बोलकर या लिखकर बताएं। जानें कि आप किन योजनाओं के लिए संभावित रूप से पात्र हैं और निःशुल्क आवेदन कैसे करें।'
            )}
          </p>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate(ROUTES.DESCRIBE)}
              className={`w-full sm:w-auto min-h-[52px] px-7 text-base font-bold shadow-md inline-flex items-center justify-center gap-2 ${getFontClass()}`}
            >
              <Sparkles className="h-5 w-5 text-amber-300 shrink-0" aria-hidden="true" />
              <span>
                {pick(
                  'Describe Your Situation',
                  'మీ పరిస్థితిని వివరించండి',
                  'अपनी स्थिति का वर्णन करें'
                )}
              </span>
              <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate(ROUTES.VOICE_CALL)}
              className={`w-full sm:w-auto min-h-[52px] px-6 text-base font-bold bg-emerald-50 border-emerald-400 text-emerald-950 hover:bg-emerald-100 inline-flex items-center justify-center gap-2 ${getFontClass()}`}
            >
              <PhoneCall className="h-5 w-5 text-emerald-700 shrink-0" aria-hidden="true" />
              <span>
                {pick(
                  'Talk to Saathi (Live Call)',
                  'సాథీతో మాట్లాడండి (లైవ్ కాల్)',
                  'साथी से बात करें (लाइव कॉल)'
                )}
              </span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate(ROUTES.SCHEMES_BROWSE)}
              className={`w-full sm:w-auto min-h-[52px] px-6 text-base font-semibold bg-white inline-flex items-center justify-center gap-2 ${getFontClass()}`}
            >
              <BookOpen className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
              <span>
                {pick(
                  'Browse All Schemes',
                  'అన్ని పథకాలను చూడండి',
                  'सभी योजनाएं देखें'
                )}
              </span>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTES.SERVICE_CENTRES)}
              className={`min-h-[40px] text-sm font-semibold text-primary hover:bg-white/80 ${getFontClass()}`}
            >
              <MapPin className="h-4 w-4 mr-1.5 text-emerald-700" aria-hidden="true" />
              {pick(
                'Find Local Sachivalayam & MeeSeva',
                'సమీప సచివాలయం & మీసేవ లొకేటర్',
                'नजदीकी सचिवालय और मीसेवा केंद्र'
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTES.COMMUNITY)}
              className={`min-h-[40px] text-sm font-semibold text-primary hover:bg-white/80 ${getFontClass()}`}
            >
              <Users className="h-4 w-4 mr-1.5 text-indigo-700" aria-hidden="true" />
              {pick(
                'Community Chat & Propose a Scheme',
                'ప్రజా వేదిక & కొత్త పథకం ఓటింగ్',
                'नागरिक समुदाय व नई योजना मतदान'
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTES.NOTIFICATIONS)}
              className={`min-h-[40px] text-sm font-semibold text-primary hover:bg-white/80 ${getFontClass()}`}
            >
              <BellRing className="h-4 w-4 mr-1.5 text-amber-600" aria-hidden="true" />
              {pick(
                'Recent Govt Schemes & Gmail Alerts',
                'కొత్త ప్రభుత్వ పథకాలు & Gmail అలర్ట్‌లు',
                'ताज़ा सरकारी योजनाएं व Gmail अलर्ट'
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTES.PROFILE)}
              className={`min-h-[40px] text-sm font-semibold text-primary hover:bg-white/80 ${getFontClass()}`}
            >
              <BarChart3 className="h-4 w-4 mr-1.5 text-primary" aria-hidden="true" />
              {pick(
                'Sector Coverage Insights',
                'రంగాల విశ్లేషణ చార్ట్',
                'सेक्टर कवरेज विश्लेषण'
              )}
            </Button>
          </div>

          {/* Citizen-Friendly Sample Stories */}
          <div className="pt-8 border-t border-slate-200 max-w-3xl mx-auto">
            <span
              className={`text-sm font-semibold text-slate-700 block mb-3 ${
                language === 'en' ? 'uppercase tracking-wider' : ''
              } ${getFontClass()}`}
            >
              {pick(
                'Try an Example Family Story (Sample Test Profiles):',
                'ఉదాహరణ కుటుంబ కథనాన్ని ఎంచుకుని పరీక్షించండి:',
                'उदाहरण पारिवारिक कहानी चुनकर तुरंत जांचें:'
              )}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {SYNTHETIC_SCENARIOS.map((sc) => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => handleSelectScenario(sc.id)}
                  className={`min-h-[52px] rounded-lg px-3.5 py-2.5 text-left bg-white border border-slate-300 hover:border-primary hover:bg-primary/5 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${getFontClass()}`}
                >
                  <div className="text-sm font-bold text-primary leading-snug">
                    {pick(sc.title_en, sc.title_te, sc.title_hi)}
                  </div>
                  {sc.subtitle_en && (
                    <div className="text-sm text-muted mt-0.5">
                      {pick(sc.subtitle_en, sc.subtitle_te, sc.subtitle_hi)}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Pillars */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="sr-only">
          {pick('Key Platform Safeguards', 'ప్రధాన భద్రతా ప్రమాణాలు', 'मुख्य सुरक्षा मानक')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="border border-border shadow-sm">
            <CardHeader className="p-5 pb-3">
              <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center mb-2">
                <CheckCircle className="h-6 w-6" aria-hidden="true" />
              </div>
              <CardTitle className={`text-base md:text-lg font-bold ${getFontClass()}`}>
                {pick('Rule-Backed Reasoning', 'నిబంధనల ఆధారిత వివరణ', 'नियम-आधारित पारदर्शिता')}
              </CardTitle>
            </CardHeader>
            <CardContent className={`px-5 pb-5 pt-0 text-sm text-slate-700 leading-relaxed ${getFontClass()}`}>
              {pick(
                'Shows why you may qualify rule by rule, linked to official AP Government Orders and portals.',
                'మీకు ఎందుకు అర్హత ఉండే అవకాశం ఉందో ప్రతి నిబంధనను ప్రభుత్వ ఉత్తర్వులతో సహా చూపుతుంది.',
                'दिखाता है कि आप किस नियम के आधार पर संभावित पात्र हैं, आधिकारिक स्रोत लिंक के साथ।'
              )}
            </CardContent>
          </Card>

          <Card className="border border-border shadow-sm">
            <CardHeader className="p-5 pb-3">
              <div className="w-11 h-11 rounded-lg bg-blue-50 text-primary flex items-center justify-center mb-2">
                <Lock className="h-6 w-6" aria-hidden="true" />
              </div>
              <CardTitle className={`text-base md:text-lg font-bold ${getFontClass()}`}>
                {pick('Zero Aadhaar or IDs', 'ఆధార్ / ఐడి అవసరం లేదు', 'कोई आधार या आईडी नहीं')}
              </CardTitle>
            </CardHeader>
            <CardContent className={`px-5 pb-5 pt-0 text-sm text-slate-700 leading-relaxed ${getFontClass()}`}>
              {pick(
                'Active PII shield blocks Aadhaar, phone, PAN, and bank numbers—using safe household bands like White Rice Card.',
                'ఆధార్, ఫోన్, పాన్, బ్యాంక్ నంబర్లను అడగదు; తెల్ల రైస్ కార్డు వంటి సాధారణ వివరాలతోనే పనిచేస్తుంది.',
                'आधार, फोन, पैन या बैंक नंबर कभी नहीं मांगे जाते; केवल सामान्य पारिवारिक श्रेणियों का उपयोग।'
              )}
            </CardContent>
          </Card>

          <Card className="border border-border shadow-sm">
            <CardHeader className="p-5 pb-3">
              <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center mb-2">
                <FileText className="h-6 w-6" aria-hidden="true" />
              </div>
              <CardTitle className={`text-base md:text-lg font-bold ${getFontClass()}`}>
                {pick('Personalised Master Pack', 'వ్యక్తిగత పత్రాల జాబితా', 'व्यक्तिगत दस्तावेज़ पैक')}
              </CardTitle>
            </CardHeader>
            <CardContent className={`px-5 pb-5 pt-0 text-sm text-slate-700 leading-relaxed ${getFontClass()}`}>
              {pick(
                'Adapts checklists to widow, CCRC tenant, or caste status and combines shared proofs for one Sachivalayam visit.',
                'వితంతువు, కౌలు రైతు (CCRC) స్థితికి తగిన పత్రాలను చూపి, ఒకే సచివాలయ సందర్శనకు ఉమ్మడి జాబితా ఇస్తుంది.',
                'विधवा, CCRC बटाईदार या श्रेणी के अनुसार दस्तावेज़ ढालता है ताकि एक ही बार सचिवालय जाना पड़े।'
              )}
            </CardContent>
          </Card>

          <Card className="border border-border shadow-sm">
            <CardHeader className="p-5 pb-3">
              <div className="w-11 h-11 rounded-lg bg-purple-50 text-purple-900 flex items-center justify-center mb-2">
                <CalendarClock className="h-6 w-6" aria-hidden="true" />
              </div>
              <CardTitle className={`text-base md:text-lg font-bold ${getFontClass()}`}>
                {pick('Deadlines & Tracking', 'గడువు రిమైండర్లు & ట్రాకింగ్', 'अंतिम तिथि व ट्रैकिंग')}
              </CardTitle>
            </CardHeader>
            <CardContent className={`px-5 pb-5 pt-0 text-sm text-slate-700 leading-relaxed ${getFontClass()}`}>
              {pick(
                'Save calendar alerts, share checklists to WhatsApp, and track Sachivalayam submission & 1902 follow-ups privately.',
                'క్యాలెండర్ రిమైండర్, వాట్సాప్ షేర్ మరియు సచివాలయ దరఖాస్తు స్థితిని గోప్యంగా ట్రాక్ చేసుకోండి.',
                'कैलेंडर रिमाइंडर डाउनलोड करें, व्हाट्सएप पर भेजें और आवेदन की स्थिति ट्रैक करें।'
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it Works Roadmap */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h2 className={`text-2xl md:text-3xl font-bold text-center text-primary mb-8 ${getFontClass()}`}>
          {pick(
            'How ClaimSaathi Eliminates Middlemen in 4 Steps',
            'దళారులు లేకుండా 4 సులభ దశల్లో మీ హక్కులను పొందండి',
            'बिना बिचौलियों के 4 सरल चरणों में योजना लाभ समझें'
          )}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            {
              step: '1',
              titleEn: 'Speak or Type in Telugu, Hindi, or English',
              titleTe: 'తెలుగు, హిందీ లేదా ఇంగ్లీష్‌లో మాట్లాడండి / టైప్ చేయండి',
              titleHi: 'तेलुगु, हिंदी या अंग्रेजी में बोलें या लिखें',
              descEn: 'Describe your age, work, children’s schooling, or White Rice Card in everyday words.',
              descTe: 'మీ వయస్సు, పని, పిల్లల చదువు లేదా తెల్ల రైస్ కార్డు గురించి మీ మాటల్లోనే చెప్పండి.',
              descHi: 'अपनी उम्र, काम, बच्चों की पढ़ाई या सफेद राशन कार्ड के बारे में साधारण शब्दों में बताएं।',
            },
            {
              step: '2',
              titleEn: 'Confirm Extracted Chips & Answer Up to 3 Quick Cards',
              titleTe: 'గుర్తించిన వివరాలను చూసి 1–3 సులభ ప్రశ్నలకు సమాధానం ఇవ్వండి',
              titleHi: 'निकाले गए विवरण देखें और 1–3 आसान कार्ड चुनें',
              descEn: 'Don’t know exact income? Just tap everyday proxies like White Rice Card or CCRC lease card.',
              descTe: 'ఖచ్చితమైన ఆదాయం తెలియకపోయినా ఫర్వాలేదు—తెల్ల రైస్ కార్డు లేదా CCRC కౌలు కార్డు ఎంచుకోండి.',
              descHi: 'सटीक आय नहीं पता? बस सफेद राइस कार्ड या CCRC लीज कार्ड जैसा विकल्प चुनें।',
            },
            {
              step: '3',
              titleEn: 'Review Likely-Eligible Schemes & Listen Aloud',
              titleTe: 'అర్హత ఉండే పథకాలను చూడండి & వాయిస్‌లో వినండి',
              titleHi: 'संभावित पात्र योजनाएं देखें और बोलकर सुनें',
              descEn: 'Inspect every matched rule, official G.O. source date, and tap Listen for spoken explanations.',
              descTe: 'ప్రతి నిబంధన కారణాన్ని, ప్రభుత్వ ఉత్తర్వుల తేదీని చూసి "వినండి" బటన్‌తో వినవచ్చు.',
              descHi: 'प्रत्येक नियम का कारण व सत्यापन तिथि देखें और "सुनें" बटन से आवाज में समझें।',
            },
            {
              step: '4',
              titleEn: 'Print Master Folder, Apply at Sachivalayam & Track',
              titleTe: 'పత్రాల జాబితా తీసుకుని సచివాలయంలో దరఖాస్తు చేసి ట్రాక్ చేయండి',
              titleHi: 'दस्तावेज़ सूची लेकर सचिवालय में आवेदन करें व ट्रैक करें',
              descEn: 'Download deadline reminders (.ics), track acknowledgement receipts, and escalate delays via 1902.',
              descTe: 'గడువు రిమైండర్లు పెట్టుకుని, సచివాలయ రసీదును ట్రాక్ చేస్తూ అవసరమైతే 1902 కు కాల్ చేయండి.',
              descHi: 'रिमाइंडर सेट करें, पावती रसीद ट्रैक करें और देरी होने पर 1902 हेल्पलाइन की मदद लें।',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="flex items-start gap-4 p-5 rounded-lg border border-slate-200 bg-white shadow-sm"
            >
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">
                {item.step}
              </div>
              <div>
                <h3 className={`text-base font-bold text-body ${getFontClass()}`}>
                  {pick(item.titleEn, item.titleTe, item.titleHi)}
                </h3>
                <p className={`text-sm text-slate-700 mt-1 leading-relaxed ${getFontClass()}`}>
                  {pick(item.descEn, item.descTe, item.descHi)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
