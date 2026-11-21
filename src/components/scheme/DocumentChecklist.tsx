import React, { useState } from 'react';
import { useLanguage } from '@/store/useLanguageStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useTrackerStore } from '@/store/useTrackerStore';
import { SchemeDocument } from '@/types/scheme';
import { personaliseSchemeDocuments } from '@/services/deterministicEngine';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileCheck, Printer, Copy, Check, Sparkles, Share2 } from 'lucide-react';
import { buildWhatsAppReminderUrl } from '@/utils/calendarReminder';
import { resolveApiSetuDocSpec } from '@/config/apiSetuSchemas';
import { ApiSetuReadinessPanel } from './ApiSetuReadinessPanel';

export interface DocumentChecklistProps {
  schemeId?: string;
  schemeCode?: string;
  schemeNameEn: string;
  schemeNameTe: string;
  schemeNameHi: string;
  benefitSummaryEn?: string;
  benefitSummaryTe?: string;
  benefitSummaryHi?: string;
  officialPortalUrl?: string;
  deadlineLabelEn?: string;
  deadlineLabelTe?: string;
  deadlineLabelHi?: string;
  documents: SchemeDocument[];
}

export const DocumentChecklist: React.FC<DocumentChecklistProps> = ({
  schemeId = 'default-scheme',
  schemeCode = 'SCHEME',
  schemeNameEn,
  schemeNameTe,
  schemeNameHi,
  benefitSummaryEn = '',
  benefitSummaryTe = '',
  benefitSummaryHi = '',
  officialPortalUrl = 'https://sgsw.ap.gov.in/',
  deadlineLabelEn,
  deadlineLabelTe,
  deadlineLabelHi,
  documents,
}) => {
  const { pick, getFontClass, language } = useLanguage();
  const { confirmedProfile } = useProfileStore();
  const { getCheckedDocuments, toggleDocumentChecked } = useTrackerStore();
  const [copied, setCopied] = useState(false);

  const checkedIds = getCheckedDocuments(schemeId);
  const personalisedDocs = personaliseSchemeDocuments(documents, confirmedProfile);

  const mandatoryDocs = personalisedDocs.filter((d) => d.effective_requirement === 'mandatory');
  const optionalDocs = personalisedDocs.filter((d) => d.effective_requirement === 'optional');
  const checkedMandatoryCount = mandatoryDocs.filter((d) => checkedIds[d.id]).length;

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = async () => {
    const schemeName = pick(schemeNameEn, schemeNameTe, schemeNameHi);
    const headerLabel = pick(
      `ClaimSaathi Personalised Document Checklist: ${schemeName}`,
      `క్లెయిమ్ సాథీ అవసరమైన పత్రాల జాబితా: ${schemeName}`,
      `क्लेम साथी व्यक्तिगत दस्तावेज़ सूची: ${schemeName}`
    );
    const mandatoryLabel = pick('Mandatory Documents:', 'తప్పనిసరి పత్రాలు:', 'अनिवार्य दस्तावेज़:');
    const optionalLabel = pick('Optional / Conditional Documents:', 'ఐచ్ఛిక పత్రాలు:', 'वैकल्पिक दस्तावेज़:');

    let text = `${headerLabel}\n\n${mandatoryLabel}\n`;
    mandatoryDocs.forEach((d, i) => {
      text += `${i + 1}. [${checkedIds[d.id] ? '✓' : ' '}] ${pick(
        d.document_name_en,
        d.document_name_te,
        d.document_name_hi
      )}\n`;
    });
    if (optionalDocs.length > 0) {
      text += `\n${optionalLabel}\n`;
      optionalDocs.forEach((d, i) => {
        text += `${i + 1}. [${checkedIds[d.id] ? '✓' : ' '}] ${pick(
          d.document_name_en,
          d.document_name_te,
          d.document_name_hi
        )}\n`;
      });
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const whatsappUrl = buildWhatsAppReminderUrl(
    {
      scheme_id: schemeId,
      scheme_code: schemeCode,
      name_en: schemeNameEn,
      name_te: schemeNameTe,
      name_hi: schemeNameHi,
      benefit_summary_en: benefitSummaryEn,
      benefit_summary_te: benefitSummaryTe,
      benefit_summary_hi: benefitSummaryHi,
      official_source_url: officialPortalUrl,
      deadline_label_en: deadlineLabelEn,
      deadline_label_te: deadlineLabelTe,
      deadline_label_hi: deadlineLabelHi,
    },
    mandatoryDocs,
    language
  );

  if (!documents || documents.length === 0) {
    return (
      <Card className="border border-border shadow-sm my-6 p-6 text-center text-sm text-muted">
        {pick(
          'Document checklist is pending official Government Order verification.',
          'పత్రాల జాబితా అధికారిక ప్రభుత్వ ఉత్తర్వుల ధృవీకరణ కోసం వేచి ఉంది.',
          'दस्तावेज़ सूची आधिकारिक सरकारी आदेश सत्यापन की प्रतीक्षा में है।'
        )}
      </Card>
    );
  }

  return (
    <Card className="border border-border shadow-sm my-6 print-card">
      <CardHeader className="p-5 md:p-6 pb-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className={`text-lg md:text-xl flex items-center gap-2 ${getFontClass()}`}>
              <FileCheck className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
              <span>
                {pick(
                  'Personalised Documents Checklist',
                  'మీ వివరాలకు తగిన పత్రాల జాబితా',
                  'आपकी प्रोफ़ाइल के अनुसार दस्तावेज़ सूची'
                )}
              </span>
            </CardTitle>
            {confirmedProfile && (
              <Badge variant="info" className={`inline-flex items-center gap-1 text-sm ${getFontClass()}`}>
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>
                  {pick('Adapted to your profile', 'మీ ప్రొఫైల్‌కు అనుగుణంగా', 'आपकी प्रोफ़ाइल के अनुरूप')}
                </span>
              </Badge>
            )}
          </div>
          <p className={`text-sm text-muted ${getFontClass()}`}>
            {pick(
              `Ready: ${checkedMandatoryCount} of ${mandatoryDocs.length} mandatory documents ticked (saved automatically in your browser).`,
              `సిద్ధంగా ఉన్నవి: ${mandatoryDocs.length} తప్పనిసరి పత్రాలలో ${checkedMandatoryCount} టిక్ చేయబడ్డాయి.`,
              `तैयार: ${mandatoryDocs.length} अनिवार्य दस्तावेज़ों में से ${checkedMandatoryCount} तैयार हैं।`
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className={`min-h-[44px] text-sm px-3.5 inline-flex items-center gap-1.5 ${getFontClass()}`}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-success" aria-hidden="true" />
                <span>{pick('Copied!', 'కాపీ అయింది!', 'कॉपी हो गया!')}</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" aria-hidden="true" />
                <span>{pick('Copy List', 'కాపీ చేయండి', 'सूची कॉपी करें')}</span>
              </>
            )}
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className={`min-h-[44px] text-sm px-3.5 inline-flex items-center gap-1.5 border-emerald-500 text-emerald-900 bg-emerald-50/70 hover:bg-emerald-100 ${getFontClass()}`}
          >
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Share2 className="h-4 w-4 text-emerald-700" aria-hidden="true" />
              <span>{pick('Send to WhatsApp', 'వాట్సాప్‌లో పంపండి', 'व्हाट्सएप पर भेजें')}</span>
            </a>
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handlePrint}
            className={`min-h-[44px] text-sm px-3.5 inline-flex items-center gap-1.5 ${getFontClass()}`}
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            <span>{pick('Print Checklist', 'ప్రింట్ తీయండి', 'सूची प्रिंट करें')}</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-5 md:p-6 space-y-6">
        {/* Mandatory Documents */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <h3 className={`text-base font-bold text-body ${getFontClass()}`}>
              {pick('Mandatory Documents to Carry', 'తప్పనిసరిగా తీసుకెళ్లాల్సిన పత్రాలు', 'साथ ले जाने योग्य अनिवार्य दस्तावेज़')}
            </h3>
            <Badge variant="danger" className={`text-sm px-2.5 py-0.5 ${getFontClass()}`}>
              {mandatoryDocs.length} {pick('Required', 'తప్పనిసరి', 'अनिवार्य')}
            </Badge>
          </div>

          <div className="space-y-3">
            {mandatoryDocs.map((doc) => {
              const isChecked = Boolean(checkedIds[doc.id]);
              return (
                <label
                  key={doc.id}
                  className="flex items-start gap-3 p-3.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 transition-colors cursor-pointer touch-target"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleDocumentChecked(schemeId, doc.id)}
                    className="mt-1 h-5 w-5 rounded border-slate-500 text-primary focus:ring-focus cursor-pointer shrink-0"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-sm md:text-base font-semibold text-body ${
                          isChecked ? 'line-through text-muted' : ''
                        } ${getFontClass()}`}
                      >
                        {pick(doc.document_name_en, doc.document_name_te, doc.document_name_hi)}
                      </span>
                      {doc.personalisation_badge_en && (
                        <Badge variant="success" className={`text-sm font-semibold ${getFontClass()}`}>
                          {pick(
                            doc.personalisation_badge_en,
                            doc.personalisation_badge_te,
                            doc.personalisation_badge_hi
                          )}
                        </Badge>
                      )}
                      {(() => {
                        const apiSpec = resolveApiSetuDocSpec(doc);
                        if (!apiSpec) return null;
                        return (
                          <Badge
                            variant="outline"
                            className="border-indigo-300 bg-indigo-50 text-indigo-900 text-[11px] font-mono"
                          >
                            {apiSpec.digilockerPullable
                              ? `DigiLocker: ${apiSpec.docType}`
                              : `API Setu: ${apiSpec.docType}`}
                          </Badge>
                        );
                      })()}
                    </div>
                    {doc.notes_en && (
                      <p className={`text-sm text-muted leading-relaxed ${getFontClass()}`}>
                        {pick(doc.notes_en, doc.notes_te, doc.notes_hi)}
                      </p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Optional Documents */}
        {optionalDocs.length > 0 && (
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <h3 className={`text-base font-bold text-body ${getFontClass()}`}>
                {pick(
                  'Conditional / Situation-Specific Documents',
                  'షరతులతో కూడిన / ప్రత్యేక పత్రాలు',
                  'सशर्त / विशेष स्थिति के दस्तावेज़'
                )}
              </h3>
              <Badge variant="secondary" className={`text-sm px-2.5 py-0.5 ${getFontClass()}`}>
                {optionalDocs.length} {pick('If Applicable', 'వర్తిస్తేనే', 'यदि लागू हो')}
              </Badge>
            </div>

            <div className="space-y-3">
              {optionalDocs.map((doc) => {
                const isChecked = Boolean(checkedIds[doc.id]);
                return (
                  <label
                    key={doc.id}
                    className="flex items-start gap-3 p-3.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 transition-colors cursor-pointer touch-target"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleDocumentChecked(schemeId, doc.id)}
                      className="mt-1 h-5 w-5 rounded border-slate-500 text-primary focus:ring-focus cursor-pointer shrink-0"
                    />
                    <div className="flex-1 space-y-1">
                      <span
                        className={`text-sm md:text-base font-semibold text-body ${
                          isChecked ? 'line-through text-muted' : ''
                        } ${getFontClass()}`}
                      >
                        {pick(doc.document_name_en, doc.document_name_te, doc.document_name_hi)}
                      </span>
                      {doc.notes_en && (
                        <p className={`text-sm text-muted leading-relaxed ${getFontClass()}`}>
                          {pick(doc.notes_en, doc.notes_te, doc.notes_hi)}
                        </p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* API Setu & DigiLocker Readiness Suite */}
        <ApiSetuReadinessPanel documents={personalisedDocs} />

        <div
          className={`rounded-md bg-amber-50 border border-amber-300 p-4 text-sm text-amber-950 leading-relaxed ${getFontClass()}`}
        >
          <strong>
            {pick('Anti-Middleman Protection:', 'దళారుల నుండి రక్షణ:', 'बिचौलियों से सावधानी:')}
          </strong>{' '}
          {pick(
            'Never hand over original certificates, passbooks, or cash to private agents. Grama/Ward Sachivalayams and official portals accept self-attested photocopies free of charge.',
            'అసలు సర్టిఫికెట్లు, బ్యాంక్ పాస్‌బుక్ లేదా డబ్బును ప్రైవేట్ దళారులకు ఎప్పుడూ ఇవ్వవద్దు. గ్రామ/వార్డు సచివాలయాలలో ఉచితంగా జిరాక్స్ పత్రాలతో దరఖాస్తు చేసుకోవచ్చు.',
            'मूल प्रमाण पत्र, पासबुक या नकदी किसी निजी एजेंट/बिचौलिये को न दें। ग्राम/वार्ड सचिवालय में निःशुल्क छायाप्रतियों के साथ आवेदन स्वीकार किए जाते हैं।'
          )}
        </div>
      </CardContent>
    </Card>
  );
};
