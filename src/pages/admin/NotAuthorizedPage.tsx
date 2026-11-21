import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/store/useLanguageStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import { Lock, Home, KeyRound } from 'lucide-react';

export const NotAuthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { pick, getFontClass } = useLanguage();

  return (
    <div className="max-w-lg mx-auto py-16 px-4">
      <Card className="border-amber-300 bg-white shadow-sm">
        <CardContent className="p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center mx-auto">
            <Lock className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className={`text-2xl font-extrabold text-body ${getFontClass()}`}>
            {import.meta.env.DEV
              ? pick('Administrator Access Required', 'నిర్వాహక అనుమతి అవసరం', 'प्रशासक अनुमति आवश्यक है')
              : pick('Admin tools are local only', 'నిర్వాహక సాధనాలు స్థానికంగా మాత్రమే అందుబాటులో ఉంటాయి', 'प्रशासन के साधन केवल स्थानीय रूप से उपलब्ध हैं')}
          </h1>
          <p className={`text-sm text-muted leading-relaxed ${getFontClass()}`}>
            {import.meta.env.DEV
              ? pick('Enter the demo passcode to edit the local catalog.', 'స్థానిక పథకాల జాబితాను మార్చడానికి నమూనా పాస్‌కోడ్ నమోదు చేయండి.', 'स्थानीय योजना सूची संपादित करने के लिए डेमो पासकोड दर्ज करें।')
              : pick('You can browse the demo schemes and try a sample assessment here.', 'ఇక్కడ నమూనా పథకాలను చూడవచ్చు, నమూనా అర్హత తనిఖీని ప్రయత్నించవచ్చు.', 'यहाँ आप डेमो योजनाएँ देख सकते हैं और नमूना मूल्यांकन आज़मा सकते हैं।')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {import.meta.env.DEV && <Button
              variant="default"
              onClick={() => navigate(ROUTES.ADMIN)}
              className={`min-h-[44px] inline-flex items-center gap-1.5 ${getFontClass()}`}
            >
              <KeyRound className="h-4 w-4" aria-hidden="true" />
              <span>{pick('Enter Demo Passcode', 'పాస్‌కోడ్ నమోదు చేయండి', 'पासकोड दर्ज करें')}</span>
            </Button>}
            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.HOME)}
              className={`min-h-[44px] inline-flex items-center gap-1.5 ${getFontClass()}`}
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              <span>{pick('Citizen Home', 'హోమ్ పేజీ', 'मुख्य पृष्ठ')}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
