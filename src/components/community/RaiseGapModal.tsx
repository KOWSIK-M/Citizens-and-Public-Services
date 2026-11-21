import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useLanguage } from '@/store/useLanguageStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useCommunityStore } from '@/store/useCommunityStore';
import { AP_DISTRICT_OPTIONS } from '@/config/bands';
import { EscalationTargetType, CommunityProposal } from '@/types/community';
import { SchemeCategory } from '@/types/scheme';
import { inspectTextForPii } from '@/utils/piiValidator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Megaphone, ShieldCheck, X, AlertTriangle } from 'lucide-react';

interface RaiseGapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefillText?: string;
  onCreated?: (proposal: CommunityProposal) => void;
}

export const RaiseGapModal: React.FC<RaiseGapModalProps> = ({
  open,
  onOpenChange,
  prefillText = '',
  onCreated,
}) => {
  const { pick, getFontClass } = useLanguage();
  const { confirmedProfile } = useProfileStore();
  const { createProposal } = useCommunityStore();

  const defaultDistrict =
    confirmedProfile?.district_code && confirmedProfile.district_code !== 'unknown'
      ? confirmedProfile.district_code
      : 'All AP';

  const defaultOccLabel =
    confirmedProfile?.occupation_category && confirmedProfile.occupation_category !== 'unknown'
      ? confirmedProfile.occupation_category.replace(/_/g, ' ')
      : 'Citizen Household';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(prefillText);
  const [category, setCategory] = useState<SchemeCategory>('employment');
  const [district, setDistrict] = useState<string>(defaultDistrict);
  const [targetCohort, setTargetCohort] = useState<string>('');
  const [escalationTarget, setEscalationTarget] =
    useState<EscalationTargetType>('ap_gsws_1902');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (prefillText) {
      setDescription(prefillText);
    }
  }, [prefillText]);

  const livePii = inspectTextForPii(`${title}\n${description}\n${targetCohort}`);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (livePii.hasPii) {
      setSubmitError(
        pick(
          'Please remove Aadhaar, phone, PAN, or bank numbers before submitting.',
          'దయచేసి ఆధార్, ఫోన్ లేదా బ్యాంకు నంబర్లు తొలగించండి.',
          'कृपया सबमिट करने से पहले आधार, फ़ोन या बैंक नंबर हटा दें।'
        )
      );
      return;
    }
    if (title.trim().length < 8 || description.trim().length < 15) {
      setSubmitError(
        pick(
          'Please enter a clear scheme title (8+ chars) and gap description (15+ chars).',
          'దయచేసి స్పష్టమైన శీర్షిక మరియు వివరణ ఇవ్వండి.',
          'कृपया स्पष्ट शीर्षक और विवरण दर्ज करें।'
        )
      );
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const personaBadge = `${defaultOccLabel.charAt(0).toUpperCase() + defaultOccLabel.slice(1)} • ${district}`;
    const res = await createProposal({
      title: title.trim(),
      description: description.trim(),
      category,
      district,
      target_cohort: targetCohort.trim() || `${defaultOccLabel} families in ${district}`,
      escalation_target: escalationTarget,
      author_persona_label: personaBadge,
      is_sample: true,
    });

    setSubmitting(false);
    if (!res.ok) {
      setSubmitError(res.error || 'Unable to submit proposal.');
      return;
    }

    setTitle('');
    setDescription('');
    setTargetCohort('');
    onOpenChange(false);
    if (res.proposal && onCreated) {
      onCreated(res.proposal);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-xl max-h-[90vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-border focus:outline-none">
          <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
            <div className="space-y-1">
              <Badge className="bg-amber-100 text-amber-950 border border-amber-300 font-bold">
                <Megaphone className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                {pick(
                  'Missing-Scheme / Welfare Gap Request',
                  'కొత్త సంక్షేమ పథకం / గ్యాప్ అభ్యర్థన',
                  'नई कल्याणकारी योजना / गैप अनुरोध'
                )}
              </Badge>
              <Dialog.Title className={`text-lg sm:text-xl font-extrabold text-primary ${getFontClass()}`}>
                {pick(
                  'Propose a New Scheme for Community Voting & Escalation',
                  'ప్రజా ఓటింగ్ & ఉన్నతాధికారుల దృష్టికి కొత్త పథకాన్ని ప్రతిపాదించండి',
                  'सामुदायिक मतदान और एस्केलेशन के लिए नई योजना का प्रस्ताव रखें'
                )}
              </Dialog.Title>
              <Dialog.Description className={`text-xs text-muted ${getFontClass()}`}>
                {pick(
                  'Once your proposal reaches 10 community votes, ClaimSaathi unlocks a structured AP Collectorate / 1902 & NGO Escalation Dossier.',
                  'మీ ప్రతిపాదనకు 10 ఓట్లు రాగానే ప్రభుత్వ (1902 / కలెక్టరేట్) & NGO ఎస్కలేషన్ నివేదిక సిద్ధమవుతుంది.',
                  '10 सामुदायिक वोट पूरे होते ही सरकारी (1902 / कलेक्टरेट) और NGO एस्केलेशन रिपोर्ट तैयार हो जाएगी।'
                )}
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

          <form onSubmit={handleSubmit} className="pt-4 space-y-4">
            <div className="space-y-1">
              <label
                htmlFor="gap-title"
                className={`block text-xs font-bold text-primary ${getFontClass()}`}
              >
                {pick('Proposed Scheme Title *', 'ప్రతిపాదిత పథకం పేరు *', 'प्रस्तावित योजना का शीर्षक *')}
              </label>
              <Input
                id="gap-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={150}
                placeholder={pick(
                  'e.g., Monsoon Livelihood Support for Urban Daily-Wage & Auto Workers',
                  'ఉదా: పట్టణ ఆటో డ్రైవర్లు & దినసరి కూలీలకు వర్షాకాల భృతి పథకం',
                  'जैसे: शहरी ऑटो चालकों और दिहाड़ी मजदूरों के लिए मानसून सहायता'
                )}
                className={getFontClass()}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label
                  htmlFor="gap-category"
                  className={`block text-xs font-bold text-primary ${getFontClass()}`}
                >
                  {pick('Welfare Category', 'సంక్షేమ విభాగం', 'कल्याण श्रेणी')}
                </label>
                <select
                  id="gap-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SchemeCategory)}
                  className="w-full min-h-[42px] rounded-md border border-input bg-white px-3 text-xs font-medium text-body"
                >
                  <option value="employment">Employment / Unorganised Labour</option>
                  <option value="farm">Agriculture / Tenant Farmers</option>
                  <option value="scholarship">Education / Student Support</option>
                  <option value="pension">Senior / Disability / Widow Support</option>
                  <option value="health">Healthcare / Nutrition</option>
                  <option value="women_child">Women & Household Welfare</option>
                  <option value="housing">Housing / Shelter</option>
                  <option value="other">Other Civic Gap</option>
                </select>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="gap-district"
                  className={`block text-xs font-bold text-primary ${getFontClass()}`}
                >
                  {pick('District Scope', 'జిల్లా పరిధి', 'जिला क्षेत्र')}
                </label>
                <select
                  id="gap-district"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full min-h-[42px] rounded-md border border-input bg-white px-3 text-xs font-medium text-body"
                >
                  <option value="All AP">All Andhra Pradesh (Statewide)</option>
                  {AP_DISTRICT_OPTIONS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label_en}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label
                  htmlFor="gap-cohort"
                  className={`block text-xs font-bold text-primary ${getFontClass()}`}
                >
                  {pick('Who Is Left Out? (Cohort)', 'ఎవరికి ఉపయోగపడుతుంది?', 'लक्षित समूह')}
                </label>
                <Input
                  id="gap-cohort"
                  value={targetCohort}
                  onChange={(e) => setTargetCohort(e.target.value)}
                  maxLength={80}
                  placeholder={pick(
                    'e.g., Rented-auto drivers & delivery workers',
                    'ఉదా: అద్దె ఆటో డ్రైవర్లు & కూలీలు',
                    'जैसे: किराए के ऑटो चालक व मजदूर'
                  )}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="gap-escalation"
                  className={`block text-xs font-bold text-primary ${getFontClass()}`}
                >
                  {pick('Escalation Channel (at 10 Votes)', 'ఎస్కలేషన్ మార్గం (10 ఓట్ల తర్వాత)', 'एस्केलेशन माध्यम')}
                </label>
                <select
                  id="gap-escalation"
                  value={escalationTarget}
                  onChange={(e) => setEscalationTarget(e.target.value as EscalationTargetType)}
                  className="w-full min-h-[42px] rounded-md border border-input bg-white px-3 text-xs font-medium text-body"
                >
                  <option value="ap_gsws_1902">AP GSWS 1902 / State PGRS Portal</option>
                  <option value="district_collectorate">District Collectorate (Monday Meekosam)</option>
                  <option value="ngo_legal_aid">Relevant Welfare NGO & Legal Aid (DLSA)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="gap-desc"
                className={`block text-xs font-bold text-primary ${getFontClass()}`}
              >
                {pick(
                  'Why Existing Schemes Miss This Group & What Support Is Needed *',
                  'ప్రస్తుత పథకాలు ఎందుకు వర్తించడం లేదు & ఎలాంటి సహాయం కావాలి *',
                  'मौजूदा योजनाएं क्यों लागू नहीं होतीं और क्या सहायता आवश्यक है *'
                )}
              </label>
              <textarea
                id="gap-desc"
                rows={4}
                maxLength={650}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={pick(
                  'Describe the welfare gap clearly without entering any Aadhaar, phone, or bank account numbers…',
                  'ఆధార్ లేదా ఫోన్ నంబర్లు రాయకుండా సమస్యను స్పష్టంగా వివరించండి…',
                  'बिना आधार या फ़ोन नंबर लिखे समस्या का विवरण दें…'
                )}
                className={`w-full rounded-md border border-input bg-white p-3 text-xs sm:text-sm text-body focus:outline-none focus:ring-2 focus:ring-focus ${getFontClass()}`}
              />
            </div>

            {livePii.hasPii ? (
              <div
                role="alert"
                className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-xs text-rose-900 flex items-center gap-2 font-semibold"
              >
                <AlertTriangle className="h-4 w-4 text-rose-700 shrink-0" aria-hidden="true" />
                <span>
                  {pick(
                    'Privacy Shield Alert: Personal ID / phone digits detected—please remove them before posting.',
                    'గోప్యతా హెచ్చరిక: ఆధార్ / ఫోన్ నంబర్లు కనుగొనబడ్డాయి—వాటిని తొలగించండి.',
                    'गोपनीयता चेतावनी: संवेदनशील नंबर मिले हैं—कृपया उन्हें हटा दें।'
                  )}
                </span>
              </div>
            ) : (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-2.5 text-[11px] text-emerald-900 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" aria-hidden="true" />
                <span>
                  {pick(
                    'Posted anonymously with coarse persona tag only—zero Aadhaar, phone, or IP stored.',
                    'పూర్తిగా గోప్యంగా పోస్ట్ చేయబడుతుంది—ఆధార్ లేదా ఫోన్ సేవ్ చేయబడదు.',
                    'पूरी तरह गुमनाम रूप से पोस्ट किया जाएगा—कोई आधार या फ़ोन सहेजा नहीं जाता।'
                  )}
                </span>
              </div>
            )}

            {submitError && (
              <p role="alert" className="text-xs font-bold text-rose-700">
                {submitError}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="min-h-[42px]"
              >
                {pick('Cancel', 'రద్దు', 'रद्द करें')}
              </Button>
              <Button
                type="submit"
                disabled={submitting || livePii.hasPii}
                className={`min-h-[42px] font-bold ${getFontClass()}`}
              >
                {submitting
                  ? pick('Submitting…', 'పంపుతోంది…', 'सबमिट हो रहा है…')
                  : pick('Publish for Voting', 'ఓటింగ్ కోసం ప్రచురించండి', 'मतदान के लिए प्रकाशित करें')}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
