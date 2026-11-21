import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/store/useLanguageStore';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { pick, getFontClass } = useLanguage();

  return (
    <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
      <h1 className="text-5xl font-extrabold text-primary">404</h1>
      <h2 className={`text-xl font-bold text-body ${getFontClass()}`}>
        {pick('Page Not Found', 'ఈ పేజీ కనుగొనబడలేదు', 'पृष्ठ नहीं मिला')}
      </h2>
      <p className={`text-sm md:text-base text-muted leading-relaxed ${getFontClass()}`}>
        {pick(
          'The page you are looking for does not exist or may have been moved.',
          'మీరు వెతుకుతున్న పేజీ అందుబాటులో లేదు లేదా మార్చబడింది.',
          'आप जिस पृष्ठ की तलाश कर रहे हैं वह मौजूद नहीं है या स्थानांतरित कर दिया गया है।'
        )}
      </p>
      <div className="pt-2">
        <Button
          onClick={() => navigate(ROUTES.HOME)}
          className={`min-h-[44px] inline-flex items-center gap-2 ${getFontClass()}`}
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          <span>{pick('Return to Home', 'హోమ్ పేజీకి వెళ్ళండి', 'मुख्य पृष्ठ पर लौटें')}</span>
        </Button>
      </div>
    </div>
  );
};
