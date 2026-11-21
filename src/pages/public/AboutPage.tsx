import React from 'react';
import { useLanguage } from '@/store/useLanguageStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ShieldCheck, BookOpen, ExternalLink, CheckCircle } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { pick, getFontClass } = useLanguage();

  const dataSources = [
    {
      name: 'myScheme National Portal',
      publisher: 'NeGD / Ministry of Electronics and Information Technology (MeitY)',
      url: 'https://www.myscheme.gov.in/',
      description: 'Central registry of national and state government schemes.',
    },
    {
      name: 'Andhra Pradesh SGSW Welfare Portal',
      publisher: 'Government of Andhra Pradesh',
      url: 'https://sgsw.ap.gov.in/',
      description: 'Official portal for AP welfare schemes and social security pensions.',
    },
    {
      name: 'National Scholarship Portal (NSP)',
      publisher: 'Govt. of India',
      url: 'https://scholarships.gov.in/',
      description: 'Single-window electronic platform for scholarships.',
    },
    {
      name: 'Direct Benefit Transfer (DBT) Bharat',
      publisher: 'Cabinet Secretariat, Govt. of India',
      url: 'https://dbtbharat.gov.in/',
      description: 'Central portal monitoring transparent welfare disbursements.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-3">
        <h1 className={`text-3xl font-extrabold text-primary flex items-center gap-2.5 ${getFontClass()}`}>
          <BookOpen className="h-8 w-8 text-primary" aria-hidden="true" />
          <span>{pick('About ClaimSaathi', 'క్లెయిమ్ సాథీ గురించి', 'क्लेम साथी के बारे में')}</span>
        </h1>
        <p className="text-base text-slate-700 leading-relaxed">
          {pick(
            'ClaimSaathi was created for Problem Statement 5: "Claim What’s Yours" (Citizens and Public Services). Hundreds of welfare schemes exist in India, but millions of eligible citizens never claim them due to complex bureaucratic jargon, hidden eligibility rules, and predatory middlemen.',
            'వందలాది సంక్షేమ పథకాలు ఉన్నప్పటికీ, సరైన సమాచారం లేకపోవడం మరియు దళారులపై ఆధారపడటం వల్ల ప్రజలు లబ్ది పొందలేకపోతున్నారు. ఈ సమస్యను పరిష్కరించడానికి క్లెయిమ్ సాథీ రూపొందించబడింది.',
            'सैकड़ों कल्याणकारी योजनाएं होने के बावजूद, जटिल नियमों और बिचौलियों के कारण कई पात्र परिवार इनका लाभ नहीं ले पाते हैं। क्लेम साथी इसी समस्या के समाधान के लिए बनाया गया है।'
          )}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-700" />
            <span>{pick('Our Core Commitments', 'మా ప్రధాన నిబద్ధతలు', 'हमारी मुख्य प्रतिबद्धताएं')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <div className="flex items-start gap-2.5">
            <CheckCircle className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
            <span>
              <strong>Zero Sensitive Identity Data:</strong> We never collect Aadhaar numbers, PAN cards, phone numbers, or passwords.
            </span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
            <span>
              <strong>Explainable Rules:</strong> We state the exact rule condition and citizen attribute behind every match.
            </span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
            <span>
              <strong>Verified Sources:</strong> Every scheme cites an official Government Order (G.O.) or portal URL with a verified-on date.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Official Data Sources */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-body">
          {pick('Primary Official Sources', 'ప్రాథమిక అధికారిక వనరులు', 'प्राथमिक आधिकारिक स्रोत')}
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {dataSources.map((source) => (
            <Card key={source.name} className="border border-slate-200 hover:border-primary/50 transition-colors">
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-base text-body">{source.name}</h3>
                  <p className="text-xs text-muted mt-0.5">{source.publisher}</p>
                  <p className="text-xs text-slate-600 mt-1">{source.description}</p>
                </div>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline whitespace-nowrap"
                >
                  <span>Visit Portal</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
