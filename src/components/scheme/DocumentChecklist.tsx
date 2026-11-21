import React, { useState } from 'react';
import { useLanguage } from '@/store/useLanguageStore';
import { SchemeDocument } from '@/types/scheme';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileCheck, Printer, Copy, Check } from 'lucide-react';

export interface DocumentChecklistProps {
  schemeNameEn: string;
  schemeNameTe: string;
  schemeNameHi: string;
  documents: SchemeDocument[];
}

export const DocumentChecklist: React.FC<DocumentChecklistProps> = ({
  schemeNameEn,
  schemeNameTe,
  schemeNameHi,
  documents,
}) => {
  const { pick, getFontClass } = useLanguage();
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const mandatoryDocs = documents.filter((d) => d.requirement === 'mandatory');
  const optionalDocs = documents.filter((d) => d.requirement === 'optional');

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const schemeName = pick(schemeNameEn, schemeNameTe, schemeNameHi);
    let text = `ClaimSaathi Document Checklist: ${schemeName}\n\n`;
    text += `Mandatory Documents:\n`;
    mandatoryDocs.forEach((d, i) => {
      text += `${i + 1}. [${checkedIds[d.id] ? 'X' : ' '}] ${pick(d.document_name_en, d.document_name_te, d.document_name_hi)}\n`;
    });
    if (optionalDocs.length > 0) {
      text += `\nOptional Documents:\n`;
      optionalDocs.forEach((d, i) => {
        text += `${i + 1}. [${checkedIds[d.id] ? 'X' : ' '}] ${pick(d.document_name_en, d.document_name_te, d.document_name_hi)}\n`;
      });
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border border-border shadow-xs my-6 print-card">
      <CardHeader className="p-5 md:p-6 pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardTitle className={`text-lg md:text-xl flex items-center gap-2 ${getFontClass()}`}>
            <FileCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            <span>{pick('Required Documents Checklist', 'అవసరమైన పత్రాల జాబితా', 'आवश्यक दस्तावेज़ सूची')}</span>
          </CardTitle>
          <p className="text-xs md:text-sm text-muted mt-1">
            {pick(
              'Tick off documents you have prepared. Your checks are saved in your current session.',
              'మీ వద్ద ఉన్న పత్రాలను టిక్ చేయండి. ఈ సమాచారం మీ బ్రౌజర్‌లో మాత్రమే ఉంటుంది.',
              'आपके पास मौजूद दस्तावेज़ों पर निशान लगाएं। यह जानकारी केवल आपके ब्राउज़र में रहती है।'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 no-print">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="text-xs h-9 inline-flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />
                <span>{pick('Copied!', 'కాపీ చేయబడింది!', 'कॉपी हो गया!')}</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{pick('Copy List', 'జాబితాను కాపీ చేయండి', 'सूची कॉपी करें')}</span>
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handlePrint}
            className="text-xs h-9 inline-flex items-center gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{pick('Print Checklist', 'జాబితాను ప్రింట్ చేయండి', 'सूची प्रिंट करें')}</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-5 md:p-6 space-y-6">
        {/* Mandatory Documents */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h4 className={`text-sm md:text-base font-bold text-body ${getFontClass()}`}>
              {pick('Mandatory Documents', 'తప్పనిసరి పత్రాలు', 'अनिवार्य दस्तावेज़')}
            </h4>
            <Badge variant="danger" className="text-[10px] px-2 py-0">
              {mandatoryDocs.length} {pick('Required', 'తప్పనిసరి', 'अनिवार्य')}
            </Badge>
          </div>

          <div className="space-y-3">
            {mandatoryDocs.map((doc) => (
              <label
                key={doc.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer touch-target"
              >
                <input
                  type="checkbox"
                  checked={!!checkedIds[doc.id]}
                  onChange={() => toggleCheck(doc.id)}
                  className="mt-1 h-5 w-5 rounded border-slate-300 text-primary focus:ring-focus cursor-pointer"
                />
                <div className="flex-1">
                  <span
                    className={`text-sm font-semibold text-body ${
                      checkedIds[doc.id] ? 'line-through text-muted' : ''
                    } ${getFontClass()}`}
                  >
                    {pick(doc.document_name_en, doc.document_name_te, doc.document_name_hi)}
                  </span>
                  {doc.notes_en && (
                    <p className="text-xs text-muted mt-0.5">
                      {pick(doc.notes_en, doc.notes_te, doc.notes_hi)}
                    </p>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Optional Documents */}
        {optionalDocs.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h4 className={`text-sm md:text-base font-bold text-body ${getFontClass()}`}>
                {pick('Optional / Conditional Documents', 'ఐచ్ఛిక / షరతులతో కూడిన పత్రాలు', 'वैकल्पिक / सशर्त दस्तावेज़')}
              </h4>
              <Badge variant="secondary" className="text-[10px] px-2 py-0">
                {optionalDocs.length} {pick('Optional', 'ఐచ్ఛికం', 'वैकल्पिक')}
              </Badge>
            </div>

            <div className="space-y-3">
              {optionalDocs.map((doc) => (
                <label
                  key={doc.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer touch-target"
                >
                  <input
                    type="checkbox"
                    checked={!!checkedIds[doc.id]}
                    onChange={() => toggleCheck(doc.id)}
                    className="mt-1 h-5 w-5 rounded border-slate-300 text-primary focus:ring-focus cursor-pointer"
                  />
                  <div className="flex-1">
                    <span
                      className={`text-sm font-semibold text-body ${
                        checkedIds[doc.id] ? 'line-through text-muted' : ''
                      } ${getFontClass()}`}
                    >
                      {pick(doc.document_name_en, doc.document_name_te, doc.document_name_hi)}
                    </span>
                    {doc.notes_en && (
                      <p className="text-xs text-muted mt-0.5">
                        {pick(doc.notes_en, doc.notes_te, doc.notes_hi)}
                      </p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 leading-relaxed">
          {pick(
            'Important Note: Do NOT submit original documents to unauthorized individuals or middlemen. Applications at Sachivalayam and portals accept verified photocopies only.',
            'ముఖ్య గమనిక: అనధికార వ్యక్తులకు లేదా దళారులకు అసలు పత్రాలను ఇవ్వవద్దు. సచివాలయంలో ధృవీకరించిన నకలు పత్రాలు మాత్రమే సమర్పించండి.',
            'महत्वपूर्ण नोट: किसी भी अनधिकृत व्यक्ति या बिचौलिये को मूल दस्तावेज़ न दें। सचिवालय और पोर्टलों पर केवल सत्यापित छायाप्रतियां स्वीकार की जाती हैं।'
          )}
        </div>
      </CardContent>
    </Card>
  );
};
