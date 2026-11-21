import React from 'react';
import { useLanguage } from '@/store/useLanguageStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ShieldCheck,
  BookOpen,
  ExternalLink,
  CheckCircle,
  RefreshCw,
  Landmark,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { pick, getFontClass } = useLanguage();

  const dataSources = [
    {
      nameEn: 'Andhra Pradesh Grama / Ward Sachivalayam (GSWS)',
      nameTe: 'ఆంధ్రప్రదేశ్ గ్రామ / వార్డు సచివాలయ పోర్టల్ (GSWS)',
      nameHi: 'आंध्र प्रदेश ग्राम / वार्ड सचिवालय पोर्टल (GSWS)',
      pubEn: 'GSWS Department, Government of Andhra Pradesh',
      pubTe: 'గ్రామ/వార్డు సచివాలయ శాఖ, ఆంధ్రప్రదేశ్ ప్రభుత్వం',
      pubHi: 'ग्राम/वार्ड सचिवालय विभाग, आंध्र प्रदेश सरकार',
      url: 'https://gsws-nbm.ap.gov.in/',
      descEn: 'Single-window welfare intake, Navasakam beneficiary social audits, and application status.',
      descTe: 'సంక్షేమ పథకాల దరఖాస్తు, సామాజిక తనిఖీ జాబితాలు మరియు స్థితి పరిశీలన వేదిక.',
      descHi: 'कल्याणकारी योजनाओं का पंजीकरण, सामाजिक अंकेक्षण और आवेदन स्थिति पोर्टल।',
    },
    {
      nameEn: 'NTR Bharosa Social Security Pensions (SERP)',
      nameTe: 'ఎన్టీఆర్ భరోసా సామాజిక భద్రతా పెన్షన్ పోర్టల్ (SERP)',
      nameHi: 'एनटीआर भरोसा सामाजिक सुरक्षा पेंशन पोर्टल (SERP)',
      pubEn: 'Society for Elimination of Rural Poverty (SERP), AP',
      pubTe: 'గ్రామీణ పేదరిక నిర్మూలన సంస్థ (SERP), ఆంధ్రప్రదేశ్',
      pubHi: 'ग्रामीण गरीबी उन्मूलन सोसायटी (SERP), आंध्र प्रदेश',
      url: 'https://sspensions.ap.gov.in/',
      descEn: 'Official rules, G.O. guidelines, and sanction registers for Old-Age, Widow, and Disability pensions.',
      descTe: 'వృద్ధాప్య, వితంతు మరియు దివ్యాంగుల పెన్షన్ నిబంధనలు మరియు మంజూరు వివరాలు.',
      descHi: 'वृद्धावस्था, विधवा और दिव्यांग पेंशन के आधिकारिक नियम व स्वीकृति विवरण।',
    },
    {
      nameEn: 'AP Jnanabhumi Scholarships & School Education',
      nameTe: 'జ్ఞానభూమి స్కాలర్‌షిప్ & పాఠశాల విద్యా శాఖ పోర్టల్',
      nameHi: 'एपी ज्ञानभूमि छात्रवृत्ति एवं स्कूल शिक्षा पोर्टल',
      pubEn: 'Social Welfare & Education Departments, Govt. of AP',
      pubTe: 'సాంఘిక సంక్షేమ & విద్యా శాఖ, ఆంధ్రప్రదేశ్ ప్రభుత్వం',
      pubHi: 'समाज कल्याण एवं शिक्षा विभाग, आंध्र प्रदेश सरकार',
      url: 'https://jnanabhumi.ap.gov.in/',
      descEn: 'Official portal for Post-Matric RTF/MTF scholarships and student welfare verification.',
      descTe: 'పోస్ట్-మెట్రిక్ స్కాలర్‌షిప్‌లు (RTF/MTF) మరియు విద్యా సంక్షేమ అధికారిక పోర్టల్.',
      descHi: 'पोस्ट-मैट्रिक छात्रवृत्ति (RTF/MTF) और छात्र कल्याण सत्यापन का आधिकारिक पोर्टल।',
    },
    {
      nameEn: 'PM-KISAN & AP Agriculture (e-Panta)',
      nameTe: 'పీఎం కిసాన్ & ఆంధ్రప్రదేశ్ వ్యవసాయ శాఖ (ఈ-పంట)',
      nameHi: 'पीएम किसान और आंध्र प्रदेश कृषि पोर्टल (ई-पंटा)',
      pubEn: 'Ministry of Agriculture (GoI) & Dept of Agriculture (AP)',
      pubTe: 'కేంద్ర వ్యవసాయ మంత్రిత్వ శాఖ & ఆంధ్రప్రదేశ్ వ్యవసాయ శాఖ',
      pubHi: 'कृषि मंत्रालय (भारत सरकार) एवं कृषि विभाग (आंध्र प्रदेश)',
      url: 'https://pmkisan.gov.in/',
      descEn: 'Official portals for PM-KISAN Samman Nidhi and AP seasonal cultivator support.',
      descTe: 'పీఎం కిసాన్ సమ్మాన్ నిధి మరియు ఆంధ్రప్రదేశ్ రైతు పెట్టుబడి సాయం అధికారిక వనరులు.',
      descHi: 'पीएम किसान सम्मान निधि और आंध्र प्रदेश कृषि निवेश सहायता के आधिकारिक पोर्टल।',
    },
    {
      nameEn: 'myScheme National Discovery Platform',
      nameTe: 'మై-స్కీమ్ (myScheme) జాతీయ పోర్టల్',
      nameHi: 'माई-स्कीम (myScheme) राष्ट्रीय पोर्टल',
      pubEn: 'NeGD / Ministry of Electronics & IT (MeitY), Govt. of India',
      pubTe: 'ఎలక్ట్రానిక్స్ & ఐటీ మంత్రిత్వ శాఖ (MeitY), భారత ప్రభుత్వం',
      pubHi: 'इलेक्ट्रॉनिक्स और सूचना प्रौद्योगिकी मंत्रालय (MeitY), भारत सरकार',
      url: 'https://www.myscheme.gov.in/',
      descEn: 'National public repository of central and state welfare schemes.',
      descTe: 'కేంద్ర మరియు రాష్ట్ర ప్రభుత్వ సంక్షేమ పథకాల జాతీయ సమాచార వేదిక.',
      descHi: 'केंद्र और राज्य सरकार की कल्याणकारी योजनाओं का राष्ट्रीय सार्वजनिक पोर्टल।',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <h1 className={`text-3xl font-extrabold text-primary flex items-center gap-2.5 ${getFontClass()}`}>
          <BookOpen className="h-8 w-8 text-primary shrink-0" aria-hidden="true" />
          <span>{pick('About ClaimSaathi & Governance', 'క్లెయిమ్ సాథీ గురించి & నిర్వహణ విధానం', 'क्लेम साथी के बारे में और शासन प्रणाली')}</span>
        </h1>
        <p className={`text-base text-slate-700 leading-relaxed ${getFontClass()}`}>
          {pick(
            'ClaimSaathi was built for ACE Builders Hackathon 2026 — Problem Statement 5 ("Claim What’s Yours"). We focus on low-income rural daily-wage and smallholder farming families in Andhra Pradesh who miss out on scholarships, pensions, crop support, and cashless healthcare due to scattered notices, complex rules, and fee-charging middlemen.',
            'ఆంధ్రప్రదేశ్‌లోని గ్రామీణ దినసరి కూలీలు మరియు సన్నకారు రైతు కుటుంబాలు సంక్లిష్టమైన నిబంధనలు, దళారుల కారణంగా సంక్షేమ పథకాలను కోల్పోకుండా ఉండేందుకు క్లెయిమ్ సాథీ రూపొందించబడింది.',
            'क्लेम साथी आंध्र प्रदेश के ग्रामीण दिहाड़ी मजदूर और छोटे किसान परिवारों के लिए बनाया गया है ताकि वे जटिल नियमों या बिचौलियों के कारण अपने हक की योजनाओं से वंचित न रहें।'
          )}
        </p>
      </div>

      {/* Core Commitments */}
      <Card className="border border-border shadow-sm">
        <CardHeader className="p-6 pb-3">
          <CardTitle className={`text-lg md:text-xl font-bold flex items-center gap-2 ${getFontClass()}`}>
            <ShieldCheck className="h-5 w-5 text-emerald-700 shrink-0" aria-hidden="true" />
            <span>{pick('Strict Citizen Guardrails', 'పౌర భద్రతా ప్రమాణాలు', 'सख्त नागरिक सुरक्षा नियम')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className={`p-6 pt-2 space-y-3 text-sm text-slate-700 leading-relaxed ${getFontClass()}`}>
          <div className="flex items-start gap-2.5">
            <CheckCircle className="h-4 w-4 text-emerald-700 shrink-0 mt-1" aria-hidden="true" />
            <span>
              <strong>
                {pick('Zero Sensitive ID Collection:', 'గుర్తింపు సంఖ్యల సేకరణ లేదు:', 'कोई संवेदनशील आईडी संग्रह नहीं:')}
              </strong>{' '}
              {pick(
                'We never request or store Aadhaar, PAN, Voter ID, phone numbers, or bank account numbers. Our Indic-aware PII shield intercepts accidental numbers in English, Telugu, and Devanagari digits.',
                'ఆధార్, పాన్, ఓటర్ ఐడి, ఫోన్ లేదా బ్యాంక్ ఖాతా నంబర్లను ఎప్పుడూ అడగము మరియు నిల్వ చేయము. పొరపాటున టైప్ చేసినా మా భద్రతా కవచం వెంటనే అడ్డుకుంటుంది.',
                'हम कभी भी आधार, पैन, वोटर आईडी, फोन या बैंक खाता संख्या नहीं मांगते और न ही सहेजते हैं।'
              )}
            </span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle className="h-4 w-4 text-emerald-700 shrink-0 mt-1" aria-hidden="true" />
            <span>
              <strong>
                {pick('Deterministic Rules Decide, Language Explains:', 'నిబంధనలే నిర్ణయిస్తాయి, సరళ భాష వివరిస్తుంది:', 'नियम निर्णय लेते हैं, सरल भाषा समझाती है:')}
              </strong>{' '}
              {pick(
                'Eligibility is never guessed by an AI prompt. Structured rules evaluate coarse household bands deterministically and always say "Likely eligible", never "guaranteed".',
                'అర్హతను AI ఊహించదు. ప్రభుత్వ నిబంధనల డేటా ఆధారంగానే ఖచ్చితంగా లెక్కించి "అర్హత పొందే అవకాశం ఉంది" అని మాత్రమే చూపుతుంది.',
                'पात्रता का अनुमान एआई से नहीं लगाया जाता। संरचित नियमों से मूल्यांकन कर हमेशा "पात्र होने की संभावना" बताई जाती है।'
              )}
            </span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle className="h-4 w-4 text-emerald-700 shrink-0 mt-1" aria-hidden="true" />
            <span>
              <strong>
                {pick('Honest Source Provenance (FR-09 Hold):', 'నిజాయితీ గల ప్రభుత్వ ఉత్తర్వుల ధృవీకరణ:', 'ईमानदार स्रोत सत्यापन (FR-09):')}
              </strong>{' '}
              {pick(
                'Any scheme whose latest Government Order (G.O.) is awaiting primary verification is explicitly badged PENDING VERIFICATION and held back from Likely Eligible.',
                'అధికారిక ప్రభుత్వ ఉత్తర్వుల (G.O.) ధృవీకరణ పెండింగ్‌లో ఉన్న పథకాలను స్పష్టంగా "ధృవీకరణ పెండింగ్" అని చూపుతాము.',
                'जिस योजना का सरकारी आदेश सत्यापन लंबित है उसे स्पष्ट रूप से "सत्यापन लंबित" दिखाया जाता है।'
              )}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* How Rules Stay Accurate + Sustainability ("Who Pays?") */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-border shadow-sm">
          <CardHeader className="p-6 pb-3">
            <CardTitle className={`text-lg font-bold flex items-center gap-2 text-primary ${getFontClass()}`}>
              <RefreshCw className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
              <span>
                {pick(
                  'How Rules Stay Accurate When Policies Change',
                  'ప్రభుత్వ నిబంధనలు మారినప్పుడు ఖచ్చితత్వం ఎలా ఉంటుంది?',
                  'योजना नियम बदलने पर सटीकता कैसे बनी रहती है?'
                )}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className={`p-6 pt-2 space-y-2.5 text-sm text-slate-700 leading-relaxed ${getFontClass()}`}>
            <p>
              <strong>1. {pick('Editable Data Registry:', 'డేటాగా నిబంధనల నిర్వహణ:', 'संपादन योग्य डेटा नियम:')}</strong>{' '}
              {pick(
                'The hosted demo reads scheme rules and checklists from a shared catalog.',
                'హోస్ట్ చేసిన నమూనా పథకాల నిబంధనలు, పత్రాల జాబితాలను ఉమ్మడి జాబితా నుంచి చదువుతుంది.',
                'होस्ट किया गया डेमो योजना के नियम और दस्तावेज़ सूचियाँ एक साझा कैटलॉग से लेता है।'
              )}
            </p>
            <p>
              <strong>2. {pick('Synthetic Persona Impact Simulator & 90-Day TTL:', 'నమూనా ప్రొఫైల్ పరీక్ష & 90 రోజుల గడువు:', 'सिंथेटिक प्रोफ़ाइल प्रभाव जांच व 90-दिन TTL:')}</strong>{' '}
              {pick(
                'The local Admin Studio demonstrates rule editing and shows how changes affect sample profiles.',
                'స్థానిక అడ్మిన్ స్టూడియోలో నియమాలను మార్చడం, ఆ మార్పులు నమూనా ప్రొఫైళ్లపై ఎలా ప్రభావం చూపుతాయో చూడవచ్చు.',
                'स्थानीय एडमिन स्टूडियो दिखाता है कि नियम कैसे बदलते हैं और बदलाव नमूना प्रोफ़ाइल पर कैसे असर डालते हैं।'
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardHeader className="p-6 pb-3">
            <CardTitle className={`text-lg font-bold flex items-center gap-2 text-primary ${getFontClass()}`}>
              <Landmark className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
              <span>
                {pick(
                  'Sustainability: 100% Free for Citizens (Who Pays?)',
                  'పౌరులకు ఎల్లప్పుడూ ఉచితం (నిర్వహణ నిధులు ఎవరి నుండి?)',
                  'नागरिकों के लिए 100% निःशुल्क (वित्तपोषण मॉडल)'
                )}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className={`p-6 pt-2 space-y-2.5 text-sm text-slate-700 leading-relaxed ${getFontClass()}`}>
            <div className="flex flex-wrap gap-1.5 mb-1">
              <Badge variant="success" className="text-sm">₹0 Citizen Fee</Badge>
              <Badge variant="info" className="text-sm">B2B2C / DPI Model</Badge>
            </div>
            <p>
              <strong>• {pick('CSR & Grassroots NGOs / FPOs:', 'CSR నిధులు & స్వచ్ఛంద సంస్థలు:', 'CSR फंड और गैर-सरकारी संगठन:')}</strong>{' '}
              {pick(
                'Schedule VII CSR livelihood grants equip SHG Village Organization Assistants (VOAs) & FPOs (~₹15 compute cost unlocks ₹15,000–₹48,000/yr in household DBT).',
                'CSR నిధులతో స్వయం సహాయక సంఘాల (SHG) వాలంటీర్లు మరియు రైతు ఉత్పత్తిదారుల సంఘాల ద్వారా గ్రామాల్లో ఉచిత సేవ.',
                'CSR अनुदान से स्वयं सहायता समूहों और किसान संगठनों के माध्यम से निःशुल्क सहायता।'
              )}
            </p>
            <p>
              <strong>• {pick('Regional Rural Banks & State Sachivalayam DPI:', 'గ్రామీణ బ్యాంకులు & సచివాలయ కియోస్క్‌లు:', 'ग्रामीण बैंक (BC सखी) व राज्य सचिवालय:')}</strong>{' '}
              {pick(
                'Rural banks license assisted ClaimSaathi tools for BC Sakhis (driving NPCI DBT CASA deposits), scaling to state IEC Sachivalayam kiosks.',
                'గ్రామీణ బ్యాంకులు (BC సఖీలు) మరియు రాష్ట్ర ప్రభుత్వ సమాచార (IEC) విభాగం ద్వారా సచివాలయాలలో విస్తరణ.',
                'ग्रामीण बैंक बीसी सखियों और राज्य सचिवालय कियोस्क द्वारा लाइसेंसिंग।'
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Primary Official Sources */}
      <div className="space-y-4">
        <h2 className={`text-xl md:text-2xl font-bold text-body ${getFontClass()}`}>
          {pick(
            'Primary Official Sources Referenced',
            'ప్రాథమిక అధికారిక ప్రభుత్వ వనరులు',
            'संदर्भित प्राथमिक आधिकारिक सरकारी स्रोत'
          )}
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {dataSources.map((source) => (
            <Card key={source.url} className="border border-slate-200 hover:border-primary/50 transition-colors">
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className={getFontClass()}>
                  <h3 className="font-bold text-base text-body">
                    {pick(source.nameEn, source.nameTe, source.nameHi)}
                  </h3>
                  <p className="text-sm text-muted mt-0.5">
                    {pick(source.pubEn, source.pubTe, source.pubHi)}
                  </p>
                  <p className="text-sm text-slate-700 mt-1">
                    {pick(source.descEn, source.descTe, source.descHi)}
                  </p>
                </div>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`min-h-[44px] inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline whitespace-nowrap px-3 py-2 rounded border border-primary/30 bg-primary/5 shrink-0 ${getFontClass()}`}
                >
                  <span>{pick('Visit Official Portal', 'పోర్టల్ తెరవండి', 'आधिकारिक पोर्टल खोलें')}</span>
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
