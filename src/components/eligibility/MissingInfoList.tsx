import React from 'react';
import { useLanguage } from '@/store/useLanguageStore';
import { Button } from '@/components/ui/button';
import { HelpCircle, PlusCircle } from 'lucide-react';

export interface MissingInfoListProps {
  missingFields: string[];
  onAddDetail: (fieldName: string) => void;
}

export const MissingInfoList: React.FC<MissingInfoListProps> = ({ missingFields, onAddDetail }) => {
  const { pick, getFontClass } = useLanguage();

  if (!missingFields || missingFields.length === 0) return null;

  const formatFieldName = (field: string) => {
    switch (field) {
      case 'income_band':
        return pick('Annual Income Bracket', 'వార్షిక ఆదాయ పరిమితి', 'वार्षिक आय सीमा');
      case 'land_holding_band':
        return pick('Farmland Land Holding', 'వ్యవసాయ భూమి వివరాలు', 'कृषि भूमि की स्थिति');
      case 'age_band':
        return pick('Age Group', 'వయోపరిమితి', 'आयु वर्ग');
      case 'occupation_category':
        return pick('Occupation', 'వృత్తి', 'व्यवसाय');
      case 'household_has_student':
        return pick('Student Details in Family', 'కుటుంబంలో విద్యార్థి వివరాలు', 'परिवार में छात्र का विवरण');
      default:
        return field.replace(/_/g, ' ');
    }
  };

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50/70 p-4 my-3 text-amber-950">
      <div className="flex items-center gap-2 font-semibold text-xs md:text-sm mb-2 text-amber-900">
        <HelpCircle className="h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
        <span className={getFontClass()}>
          {pick(
            'Add the following details to verify likely eligibility:',
            'ఖచ్చితమైన అర్హతను పరిశీలించడానికి క్రింది వివరాలను జోడించండి:',
            'सटीक पात्रता जांचने के लिए कृपया निम्नलिखित विवरण जोड़ें:'
          )}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {missingFields.map((field) => (
          <Button
            key={field}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onAddDetail(field)}
            className="h-8 px-3 text-xs bg-white text-amber-900 border-amber-300 hover:bg-amber-100/70 inline-flex items-center gap-1.5"
          >
            <PlusCircle className="h-3.5 w-3.5 text-amber-700" aria-hidden="true" />
            <span>{formatFieldName(field)}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
