import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useLanguage } from '@/store/useLanguageStore';
import { CommunityProposal } from '@/types/community';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Printer,
  Copy,
  Check,
  X,
  ExternalLink,
  PhoneCall,
  Award,
} from 'lucide-react';

interface EscalationDossierModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposal: CommunityProposal;
}

export const EscalationDossierModal: React.FC<EscalationDossierModalProps> = ({
  open,
  onOpenChange,
  proposal,
}) => {
  const { pick, getFontClass } = useLanguage();
  const [copied, setCopied] = useState(false);

  const recipientLabel =
    proposal.escalation_target === 'district_collectorate'
      ? `District Collectorate Public Grievance Cell (Monday Meekosam) — ${proposal.district}`
      : proposal.escalation_target === 'ngo_legal_aid'
      ? `District Legal Services Authority (DLSA) & Accredited Livelihood NGOs — ${proposal.district}`
      : `AP Grama/Ward Sachivalayam & State Public Grievance Redressal System (1902 / pgrs.ap.gov.in)`;

  const dossierText = [
    '====================================================================',
    'CLAIMSAATHI CITIZEN WELFARE GAP & POLICY ESCALATION DOSSIER',
    '====================================================================',
    `Dossier Reference : CS-ESC-${proposal.id.toUpperCase()}`,
    `Generated Date    : ${new Date().toISOString().slice(0, 10)}`,
    `Validation Status : COMMUNITY THRESHOLD MET (${proposal.upvotes_count} / ${proposal.escalation_threshold} Verified Citizen Votes)`,
    `Escalation Route  : ${recipientLabel}`,
    `Geographic Scope  : ${proposal.district}, Andhra Pradesh`,
    `Welfare Domain    : ${proposal.category.toUpperCase()}`,
    `Underserved Group : ${proposal.target_cohort}`,
    '--------------------------------------------------------------------',
    `PROPOSED SCHEME / POLICY INTERVENTION:`,
    proposal.title,
    '',
    'EVIDENCE OF WELFARE COVERAGE GAP (NON-PII CITIZEN SUBMISSION):',
    proposal.description,
    '',
    'REQUESTED ACTION FROM GOVERNMENT / RELEVANT NGO:',
    '1. Review the identified eligibility gap where vulnerable households fall outside current scheme rules.',
    '2. Table this representation in the District Collectorate Meekosam / GSWS Policy Feedback review, or initiate interim NGO/CSR relief linkage.',
    '3. Publish official clarification or supplemental guidelines via Grama/Ward Sachivalayam notice boards.',
    '--------------------------------------------------------------------',
    'Privacy & Guardrail Attestation: Generated without collecting Aadhaar, phone numbers, bank accounts, or personal identifiers.',
    'Official Submission Channels: https://pgrs.ap.gov.in/ | Toll-Free: 1902',
    '====================================================================',
  ].join('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(dossierText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-2xl max-h-[90vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-border focus:outline-none">
          <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
            <div className="space-y-1">
              <Badge className="bg-emerald-100 text-emerald-950 border border-emerald-400 font-bold">
                <Award className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                {pick(
                  `Escalation Ready • ${proposal.upvotes_count} Citizen Votes`,
                  `ఎస్కలేషన్ సిద్ధం • ${proposal.upvotes_count} ప్రజల ఓట్లు`,
                  `एस्केलेशन तैयार • ${proposal.upvotes_count} नागरिक वोट`
                )}
              </Badge>
              <Dialog.Title className={`text-lg sm:text-xl font-extrabold text-primary ${getFontClass()}`}>
                {pick(
                  'Official Government (1902 / Collectorate) & NGO Escalation Dossier',
                  'ప్రభుత్వ (1902 / కలెక్టరేట్) & NGO ఎస్కలేషన్ నివేదిక',
                  'सरकारी (1902 / कलेक्टरेट) एवं NGO एस्केलेशन डोज़ियर'
                )}
              </Dialog.Title>
              <Dialog.Description className={`text-xs text-muted ${getFontClass()}`}>
                {recipientLabel}
              </Dialog.Description>
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-full p-2 text-muted hover:bg-slate-100 min-h-[40px] min-w-[40px] flex items-center justify-center"
                aria-label="Close"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>

          <div className="py-4 space-y-4">
            <pre className="whitespace-pre-wrap text-[11px] sm:text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl p-4 text-slate-800 max-h-[320px] overflow-y-auto leading-relaxed">
              {dossierText}
            </pre>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => window.print()}
                  className={`min-h-[42px] text-xs sm:text-sm font-bold ${getFontClass()}`}
                >
                  <Printer className="h-4 w-4 mr-1.5" aria-hidden="true" />
                  {pick('Print / Save PDF Dossier', 'PDF / ప్రింట్ తీసుకోండి', 'प्रिंट / PDF सहेजें')}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopy}
                  className={`min-h-[42px] text-xs sm:text-sm ${getFontClass()}`}
                >
                  {copied ? (
                    <Check className="h-4 w-4 mr-1.5 text-emerald-700" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4 mr-1.5" aria-hidden="true" />
                  )}
                  {copied
                    ? pick('Copied!', 'కాపీ అయింది!', 'कॉपी हो गया!')
                    : pick('Copy Brief', 'నివేదిక కాపీ చేయండి', 'रिपोर्ट कॉपी करें')}
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <a
                  href="https://pgrs.ap.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-md px-3 min-h-[42px] text-xs font-bold bg-indigo-700 hover:bg-indigo-800 text-white"
                >
                  <FileText className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                  AP PGRS Portal
                  <ExternalLink className="h-3 w-3 ml-1" aria-hidden="true" />
                </a>

                <a
                  href="tel:1902"
                  className="inline-flex items-center justify-center rounded-md px-3 min-h-[42px] text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white"
                >
                  <PhoneCall className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                  1902
                </a>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
