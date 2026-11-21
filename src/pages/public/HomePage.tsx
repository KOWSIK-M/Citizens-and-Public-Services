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
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { pick, getFontClass } = useLanguage();
  const { loadScenario } = useProfileStore();
  const navigate = useNavigate();

  const handleSelectScenario = (scenarioId: 'scenario_a' | 'scenario_b' | 'scenario_c') => {
    loadScenario(scenarioId);
    navigate(ROUTES.DESCRIBE);
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 via-primary/5 to-transparent pt-12 pb-16 border-b border-border/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <Badge variant="outline" className="border-primary/40 bg-white text-primary text-xs font-semibold px-3 py-1 mb-2">
            {pick(
              'Andhra Pradesh & Central Welfare Navigator',
              'ఆంధ్రప్రదేశ్ & కేంద్ర సంక్షేమ పథకాల మార్గదర్శి',
              'आंध्र प्रदेश और केंद्रीय कल्याणकारी योजना मार्गदर्शक'
            )}
          </Badge>

          <h1 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary tracking-tight leading-tight ${getFontClass()}`}>
            {pick(
              'Claim What’s Yours in Plain Language',
              'మీ హక్కులను సరళమైన భాషలో పొందండి',
              'अपने हक़ का लाभ सरल भाषा में पाएं'
            )}
          </h1>

          <p className={`max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-slate-700 leading-relaxed ${getFontClass()}`}>
            {pick(
              'Describe your situation in plain English, Telugu, or Hindi. Discover which government schemes you are likely eligible for, understand the exact rules, and get verified application checklists.',
              'మీ పరిస్థితిని సరళమైన తెలుగు, ఇంగ్లీష్ లేదా హిందీలో వివరించండి. ఏ సంక్షేమ పథకాలకు అర్హత ఉందో, ఎందుకు అర్హత ఉందో తెలుసుకోండి.',
              'अपनी स्थिति का सरल भाषा में विवरण दें। जानें कि आप किन सरकारी योजनाओं के लिए पात्र हैं, और सत्यापित आवेदन सूची प्राप्त करें।'
            )}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate(ROUTES.DESCRIBE)}
              className={`w-full sm:w-auto h-13 px-8 text-base font-bold shadow-md inline-flex items-center gap-2 ${getFontClass()}`}
            >
              <Sparkles className="h-5 w-5 text-amber-300" aria-hidden="true" />
              <span>
                {pick(
                  'Describe Your Situation',
                  'మీ పరిస్థితిని వివరించండి',
                  'अपनी स्थिति का वर्णन करें'
                )}
              </span>
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate(ROUTES.ABOUT)}
              className="w-full sm:w-auto h-13 text-base font-semibold bg-white"
            >
              {pick('Learn How It Works', 'ఇది ఎలా పనిచేస్తుంది?', 'यह कैसे काम करता है?')}
            </Button>
          </div>

          {/* Quick Demo Presets */}
          <div className="pt-8 border-t border-slate-200/80 max-w-3xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted block mb-3">
              {pick(
                '⚡ Try Quick Synthetic Demo Profiles:',
                '⚡ నమూనా ప్రొఫైల్స్ ద్వారా వెంటనే పరీక్షించండి:',
                '⚡ तुरंत परीक्षण के लिए नमूना प्रोफ़ाइल चुनें:'
              )}
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {SYNTHETIC_SCENARIOS.map((sc) => (
                <Button
                  key={sc.id}
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSelectScenario(sc.id)}
                  className="text-xs bg-white border border-slate-300 hover:bg-primary hover:text-white transition-colors"
                >
                  {pick(sc.title_en, sc.title_te, sc.title_hi)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Principles & Trust Badges */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-border shadow-xs">
            <CardHeader className="p-6">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center mb-2">
                <CheckCircle className="h-6 w-6" aria-hidden="true" />
              </div>
              <CardTitle className={`text-lg font-bold ${getFontClass()}`}>
                {pick('Rule-Based Reasoning', 'నిబంధనల ఆధారిత వివరణ', 'नियम-आधारित पारदर्शिता')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-0 text-sm text-slate-600 leading-relaxed">
              {pick(
                'Every match explains why you qualify, linking each benefit to the official government order and verification date.',
                'ప్రతి పథకం ఎందుకు సరిపోతుందో ఖచ్చితమైన కారణాన్ని మరియు ప్రభుత్వ ఉత్తర్వుల తేదీని స్పష్టంగా చూపుతుంది.',
                'प्रत्येक योजना यह स्पष्ट करती है कि आप क्यों पात्र हैं, आधिकारिक आदेशों और सत्यापन तिथियों के साथ।'
              )}
            </CardContent>
          </Card>

          <Card className="border border-border shadow-xs">
            <CardHeader className="p-6">
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-primary flex items-center justify-center mb-2">
                <Lock className="h-6 w-6" aria-hidden="true" />
              </div>
              <CardTitle className={`text-lg font-bold ${getFontClass()}`}>
                {pick('Strict Privacy Protection', 'పూర్తి గోప్యతా రక్షణ', 'सख्त गोपनीयता सुरक्षा')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-0 text-sm text-slate-600 leading-relaxed">
              {pick(
                'No Aadhaar, PAN, or phone numbers are collected. Details are processed in coarse, non-identifying categories.',
                'ఎటువంటి ఆధార్, పాన్ లేదా ఫోన్ నంబర్లు తీసుకోబడవు. కేవలం సాధారణ వర్గాల ఆధారంగా మాత్రమే పరిశీలించబడుతుంది.',
                'कोई आधार, पैन या फोन नंबर एकत्र नहीं किया जाता है। केवल सामान्य श्रेणियों के आधार पर मूल्यांकन किया जाता है।'
              )}
            </CardContent>
          </Card>

          <Card className="border border-border shadow-xs">
            <CardHeader className="p-6">
              <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center mb-2">
                <FileText className="h-6 w-6" aria-hidden="true" />
              </div>
              <CardTitle className={`text-lg font-bold ${getFontClass()}`}>
                {pick('Actionable Checklists', 'సమగ్ర పత్రాల జాబితా', 'उपयोगी दस्तावेज़ सूची')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-0 text-sm text-slate-600 leading-relaxed">
              {pick(
                'Personalized document requirements and official portal steps so you never depend on fee-charging middlemen.',
                'దళారులపై ఆధారపడకుండా మీరే దరఖాస్తు చేసుకోవడానికి అవసరమైన పత్రాల జాబితా మరియు దశల వివరణ.',
                'बिचौलियों पर निर्भर हुए बिना आवेदन करने के लिए आवश्यक दस्तावेज़ों की सूची और चरण-दर-चरण मार्गदर्शन।'
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it Works Roadmap */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className={`text-2xl md:text-3xl font-bold text-center text-primary mb-10 ${getFontClass()}`}>
          {pick(
            'How ClaimSaathi Works',
            'క్లెయిమ్ సాథీ ఎలా పనిచేస్తుంది?',
            'क्लेम साथी कैसे काम करता है?'
          )}
        </h2>

        <div className="space-y-6">
          <div className="flex items-start gap-4 p-5 rounded-lg border border-slate-200 bg-white">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">
              1
            </div>
            <div>
              <h3 className={`text-base font-bold text-body ${getFontClass()}`}>
                {pick(
                  'Describe Your Life in Plain Language',
                  'మీ పరిస్థితిని సరళంగా వివరించండి',
                  'अपनी स्थिति का सरल भाषा में विवरण दें'
                )}
              </h3>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                {pick(
                  'No complicated government forms. Just talk or type about your family, occupation, and circumstances.',
                  'క్లిష్టమైన దరఖాస్తులు అవసరం లేదు. మీ కుటుంబం మరియు వృత్తి గురించి మాట్లాడండి లేదా టైప్ చేయండి.',
                  'कठिन सरकारी फॉर्म भरने की जरूरत नहीं है। बस अपने परिवार, व्यवसाय और परिस्थितियों के बारे में लिखें।'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-lg border border-slate-200 bg-white">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">
              2
            </div>
            <div>
              <h3 className={`text-base font-bold text-body ${getFontClass()}`}>
                {pick(
                  'Review Extracted Coarse Profile',
                  'గుర్తించిన వివరాలను నిర్ధారించండి',
                  'निकाले गए सामान्य विवरण की समीक्षा करें'
                )}
              </h3>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                {pick(
                  'Review and adjust your income band, land category, and district before any rules are evaluated.',
                  'నిబంధనలు సరిచూడడానికి ముందు మీ వివరాలను పరిశీలించి అవసరమైతే సరిచేసుకోండి.',
                  'नियमों की जांच से पहले अपनी आय सीमा और भूमि श्रेणी की समीक्षा करें।'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-lg border border-slate-200 bg-white">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">
              3
            </div>
            <div>
              <h3 className={`text-base font-bold text-body ${getFontClass()}`}>
                {pick(
                  'Get Transparent, Rule-Backed Results',
                  'స్పష్టమైన అర్హత కారణాలు & మార్గదర్శనం పొందండి',
                  'पारदर्शी पात्रता परिणाम और मार्गदर्शन प्राप्त करें'
                )}
              </h3>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                {pick(
                  'See which schemes you are likely eligible for, print your document checklist, and access official application links.',
                  'మీకు సరిపోయే పథకాలు, అవసరమైన పత్రాల జాబితా మరియు అధికారిక దరఖాస్తు లింకులు పొందండి.',
                  'जानें कि आप किन योजनाओं के लिए पात्र हैं, दस्तावेज़ सूची प्रिंट करें और आधिकारिक लिंक देखें।'
                )}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
