import React, { useState } from 'react';
import { useLanguage } from '@/store/useLanguageStore';
import { MasterDocumentPackItem } from '@/services/deterministicEngine';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FolderCheck, Printer, ChevronDown, ChevronUp } from 'lucide-react';

export interface MasterDocumentPackCardProps {
  items: MasterDocumentPackItem[];
  schemeCount: number;
}

export const MasterDocumentPackCard: React.FC<MasterDocumentPackCardProps> = ({
  items,
  schemeCount,
}) => {
  const { pick, getFontClass } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  if (!items || items.length === 0 || schemeCount < 1) return null;

  return (
    <Card className="border-2 border-primary/25 bg-gradient-to-r from-blue-50/70 via-white to-emerald-50/50 shadow-sm print-card">
      <CardHeader className="p-5 md:p-6 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className={`text-base md:text-lg font-bold text-primary flex items-center gap-2 ${getFontClass()}`}>
              <FolderCheck className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
              <span>
                {pick(
                  'Single Sachivalayam Visit — Master Document Folder',
                  'ఒకేసారి సచివాలయ సందర్శన — ఉమ్మడి పత్రాల జాబితా',
                  'एकल सचिवालय विज़िट — समेकित मास्टर दस्तावेज़ फ़ोल्डर'
                )}
              </span>
            </CardTitle>
            <Badge variant="success" className={`text-sm font-bold ${getFontClass()}`}>
              {items.length} {pick('Unique Proofs', 'ఉమ్మడి పత్రాలు', 'साझा दस्तावेज़')}
            </Badge>
          </div>
          <p className={`text-sm text-slate-700 ${getFontClass()}`}>
            {pick(
              `Deduplicated across all ${schemeCount} likely-eligible scheme(s) so your family carries one clean folder without extra trips.`,
              `మీకు సరిపోయే ${schemeCount} పథకాలకు కలిపి ఒకేసారి తీసుకెళ్లాల్సిన ఉమ్మడి పత్రాలు (మళ్లీ మళ్లీ తిరగాల్సిన పనిలేదు).`,
              `सभी ${schemeCount} संभावित पात्र योजनाओं के साझा दस्तावेज़ ताकि बार-बार चक्कर न लगाना पड़े।`
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 no-print">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className={`min-h-[44px] bg-white text-sm font-semibold inline-flex items-center gap-1.5 ${getFontClass()}`}
            aria-expanded={expanded}
          >
            <span>
              {expanded
                ? pick('Hide Master List', 'జాబితా దాచు', 'सूची छुपाएं')
                : pick('View Combined Folder', 'ఉమ్మడి జాబితా చూడండి', 'साझा सूची देखें')}
            </span>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="p-5 md:p-6 pt-2 space-y-3 border-t border-slate-200/70">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {items.map((doc, idx) => (
              <div
                key={doc.key}
                className="rounded-lg border border-slate-300 bg-white p-3.5 flex flex-col justify-between gap-2"
              >
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className={`text-sm font-semibold text-body ${getFontClass()}`}>
                    {pick(doc.document_name_en, doc.document_name_te, doc.document_name_hi)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 pl-8">
                  <Badge variant="info" className={`text-sm ${getFontClass()}`}>
                    {pick(
                      `Used by ${doc.used_by_schemes.length} scheme${doc.used_by_schemes.length > 1 ? 's' : ''}`,
                      `${doc.used_by_schemes.length} పథకాలకు ఉపయోగపడుతుంది`,
                      `${doc.used_by_schemes.length} योजनाओं में उपयोगी`
                    )}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2 no-print">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => window.print()}
              className={`min-h-[44px] text-sm inline-flex items-center gap-1.5 ${getFontClass()}`}
            >
              <Printer className="h-4 w-4" aria-hidden="true" />
              <span>{pick('Print Master Visit Pack', 'ఉమ్మడి జాబితా ప్రింట్ తీయండి', 'मास्टर सूची प्रिंट करें')}</span>
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
