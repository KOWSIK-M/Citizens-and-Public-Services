import React from 'react';
import { useLanguage } from '@/store/useLanguageStore';
import { formatFieldLabel } from '@/config/bands';
import { Button } from '@/components/ui/button';
import { HelpCircle, PlusCircle } from 'lucide-react';

export interface MissingInfoListProps {
  missingFields: string[];
  onAddDetail: (fieldName: string) => void;
}

export const MissingInfoList: React.FC<MissingInfoListProps> = ({ missingFields, onAddDetail }) => {
  const { pick, getFontClass, language } = useLanguage();

  if (!missingFields || missingFields.length === 0) return null;

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50/80 p-4 my-3 text-amber-950">
      <div className="flex items-center gap-2 font-semibold text-sm mb-2.5 text-amber-900">
        <HelpCircle className="h-4 w-4 shrink-0 text-amber-800" aria-hidden="true" />
        <span className={getFontClass()}>
          {pick(
            'Tap a missing detail below to verify likely eligibility:',
            'ఈ పథకం అర్హతను నిర్ధారించడానికి క్రింది వివరాలను జోడించండి:',
            'संभावित पात्रता जांचने के लिए नीचे छूटे हुए विवरण पर टैप करें:'
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
            className={`min-h-[44px] px-3.5 text-sm bg-white text-amber-950 border-amber-400 hover:bg-amber-100/80 inline-flex items-center gap-1.5 font-semibold ${getFontClass()}`}
          >
            <PlusCircle className="h-4 w-4 text-amber-800 shrink-0" aria-hidden="true" />
            <span>{formatFieldLabel(field, language)}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
