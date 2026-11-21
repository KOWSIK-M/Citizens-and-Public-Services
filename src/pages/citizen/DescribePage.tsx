import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/store/useLanguageStore';
import { useProfileStore } from '@/store/useProfileStore';
import { PlainTextInput } from '@/components/citizen/PlainTextInput';
import { extractCoarseProfileFromText } from '@/services/profileExtractor';
import { SYNTHETIC_SCENARIOS } from '@/config/constants';
import { ROUTES } from '@/config/routes';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit3, Sparkles } from 'lucide-react';

export const DescribePage: React.FC = () => {
  const { pick, getFontClass, language } = useLanguage();
  const { setProposedProfile, loadScenario } = useProfileStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleTextSubmit = (text: string) => {
    setIsLoading(true);
    // Simulate brief processing delay
    setTimeout(() => {
      const result = extractCoarseProfileFromText(text, language);
      setProposedProfile(result.proposed_profile);
      setIsLoading(false);
      navigate(ROUTES.CONFIRM_PROFILE);
    }, 600);
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
        <p className="text-sm md:text-base text-muted leading-relaxed">
          {pick(
            'Mention your age, family members, occupation, agricultural land (if any), and living conditions. Our engine will match relevant welfare schemes.',
            'మీ వయస్సు, కుటుంబ సభ్యులు, వృత్తి, వ్యవసాయ భూమి (ఉంటే) మరియు ఆదాయ వివరాలను వివరించండి.',
            'अपनी आयु, परिवार के सदस्य, व्यवसाय, कृषि भूमि (यदि है) और आय की स्थिति का उल्लेख करें।'
          )}
        </p>
      </div>

      {/* Preset synthetic scenario bar for hackathon demo evaluators */}
      <Card className="border border-slate-200/90 bg-white">
        <CardHeader className="py-3 px-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
            <span>
              {pick(
                'Instant Demo Personas (Click to Test):',
                'నమూనా ప్రొఫైల్స్ (వెంటనే పరీక్షించండి):',
                'डेमो प्रोफ़ाइल (परीक्षण के लिए क्लिक करें):'
              )}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 bg-slate-50/50 flex flex-wrap gap-2">
          {SYNTHETIC_SCENARIOS.map((sc) => (
            <Button
              key={sc.id}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => loadScenario(sc.id, language)}
              className="text-xs bg-white text-slate-800 border-slate-300 hover:bg-primary hover:text-white transition-colors"
            >
              {pick(sc.title_en, sc.title_te, sc.title_hi)}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Plain text input box */}
      <Card className="border border-border shadow-xs bg-white">
        <CardHeader className="p-5 md:p-6 pb-2">
          <CardTitle className={`text-base md:text-lg flex items-center gap-2 ${getFontClass()}`}>
            <Edit3 className="h-5 w-5 text-primary" aria-hidden="true" />
            <span>
              {pick(
                'Type or Paste Your Circumstances Below',
                'మీ వివరాలను క్రింద నమోదు చేయండి',
                'अपनी परिस्थितियां नीचे दर्ज करें'
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
