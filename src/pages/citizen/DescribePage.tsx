import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/store/useLanguageStore';
import { useProfileStore } from '@/store/useProfileStore';
import { PlainTextInput } from '@/components/citizen/PlainTextInput';
import { extractProfileHybrid } from '@/services/profileExtractor';
import { SYNTHETIC_SCENARIOS } from '@/config/constants';
import { ROUTES } from '@/config/routes';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit3, Sparkles, PhoneCall } from 'lucide-react';

export const DescribePage: React.FC = () => {
  const { pick, getFontClass, language } = useLanguage();
  const { setExtractionOutput, loadScenario, activeScenarioId } = useProfileStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleTextSubmit = async (text: string) => {
    setIsLoading(true);
    try {
      const result = await extractProfileHybrid(text, language);
      setExtractionOutput(
        result.proposed_profile,
        result.extracted_fields,
        result.clarifying_questions
      );
      navigate(ROUTES.CONFIRM_PROFILE);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className={`text-2xl md:text-3xl font-extrabold text-primary ${getFontClass()}`}>
          {pick(
            'Describe Your Situation in Plain Language',
            'మీ పరిస్థితిని సరళమైన మాటల్లో వివరించండి',
            'अपनी स्थिति का सरल भाषा में विवरण दें'
          )}
        </h1>
        <p className={`text-sm md:text-base text-muted leading-relaxed ${getFontClass()}`}>
          {pick(
            'Tell us in your own words—your age, work, whether children study in school/college, farmland or CCRC lease, or if you have a White Rice Card.',
            'మీ వయస్సు, పని, పిల్లల చదువు, వ్యవసాయ భూమి లేదా కౌలు (CCRC), తెల్ల రైస్ కార్డు గురించి మీ సొంత మాటల్లో రాయండి లేదా మాట్లాడండి.',
            'अपनी उम्र, काम, बच्चों की पढ़ाई, जमीन या CCRC लीज, या सफेद राशन कार्ड के बारे में अपने शब्दों में लिखें या बोलकर बताएं।'
          )}
        </p>
      </div>

      {/* Live Voice Call Alternative Banner */}
      <Card className="border-emerald-300 bg-emerald-50/60 shadow-xs">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h2 className={`text-sm sm:text-base font-extrabold text-emerald-950 flex items-center gap-2 ${getFontClass()}`}>
              <PhoneCall className="h-4 w-4 text-emerald-700 shrink-0" aria-hidden="true" />
              <span>
                {pick(
                  'Prefer Talking Like a Phone Call? Try Saathi Live Voice Agent',
                  'ఫోన్ కాల్ లాగా మాట్లాడాలనుకుంటున్నారా? సాథీ లైవ్ వాయిస్ ఏజెంట్ వాడండి',
                  'फ़ोन कॉल की तरह बात करना चाहते हैं? साथी लाइव वॉइस एजेंट आज़माएं'
                )}
              </span>
            </h2>
            <p className={`text-xs text-emerald-900 ${getFontClass()}`}>
              {pick(
                'Speak back-and-forth in Telugu, Hindi, or English—Saathi suggests matching schemes and helps you pick and proceed.',
                'తెలుగు, హిందీ లేదా ఇంగ్లీష్‌లో నేరుగా మాట్లాడి మీకు సరిపోయే పథకాన్ని ఎంచుకోండి.',
                'तेलुगु, हिंदी या अंग्रेजी में सीधे बात करें—साथी उपयुक्त योजना सुझाकर आगे बढ़ने में मदद करेगा।'
              )}
            </p>
          </div>
          <Button
            type="button"
            onClick={() => navigate(ROUTES.VOICE_CALL)}
            className={`min-h-[42px] bg-emerald-700 hover:bg-emerald-800 text-white font-bold shrink-0 ${getFontClass()}`}
          >
            <PhoneCall className="h-4 w-4 mr-1.5" aria-hidden="true" />
            {pick('Start Live Call', 'లైవ్ కాల్ చేయండి', 'लाइव कॉल शुरू करें')}
          </Button>
        </CardContent>
      </Card>

      {/* Citizen-Friendly Sample Profiles Bar */}
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader className="py-3 px-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <h2
            className={`text-sm font-semibold text-slate-700 flex items-center gap-1.5 ${
              language === 'en' ? 'uppercase tracking-wider' : ''
            } ${getFontClass()}`}
          >
            <Sparkles className="h-4 w-4 text-amber-600 shrink-0" aria-hidden="true" />
            <span>
              {pick(
                'Sample Family Stories (Tap to Load Synthetic Test Profile):',
                'నమూనా కుటుంబ కథనాలు (పరీక్షించడానికి నొక్కండి):',
                'नमूना पारिवारिक कहानियां (परीक्षण हेतु टैप करें):'
              )}
            </span>
          </h2>
        </CardHeader>
        <CardContent className="p-3.5 bg-slate-50/60 flex flex-wrap gap-2">
          {SYNTHETIC_SCENARIOS.map((sc) => {
            const isSelected = activeScenarioId === sc.id;
            return (
              <Button
                key={sc.id}
                type="button"
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                onClick={() => loadScenario(sc.id, language)}
                className={`min-h-[44px] text-sm px-3.5 ${
                  isSelected
                    ? 'bg-primary text-white'
                    : 'bg-white text-slate-800 border-slate-300 hover:bg-primary/10 hover:text-primary'
                } ${getFontClass()}`}
              >
                {pick(sc.title_en, sc.title_te, sc.title_hi)}
              </Button>
            );
          })}
        </CardContent>
      </Card>

      {/* Plain text & voice input card */}
      <Card className="border border-border shadow-sm bg-white">
        <CardHeader className="p-5 md:p-6 pb-2">
          <CardTitle className={`text-base md:text-lg flex items-center gap-2 ${getFontClass()}`}>
            <Edit3 className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
            <span>
              {pick(
                'Type or Speak Your Story Below',
                'మీ వివరాలను క్రింద టైప్ చేయండి లేదా వాయిస్ ద్వారా చెప్పండి',
                'नीचे अपनी बात लिखें या वॉइस बटन से बोलकर बताएं'
              )}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 md:p-6 pt-2">
          <PlainTextInput onSubmit={handleTextSubmit} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
};
