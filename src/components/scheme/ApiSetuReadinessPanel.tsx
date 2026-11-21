import React, { useState } from 'react';
import { useLanguage } from '@/store/useLanguageStore';
import { useProfileStore } from '@/store/useProfileStore';
import {
  API_SETU_DOC_SCHEMAS,
  ApiSetuDocType,
  checkCertificateValidity,
  resolveApiSetuDocSpec,
} from '@/config/apiSetuSchemas';
import { SchemeDocument } from '@/types/scheme';
import { buildFallbackIppbDesks, IppbSeedingDesk, PinLookupResponse } from '../../../api/apisetu/pin-lookup';
import type { ApiSetuOpenApiV3Response } from '../../../api/apisetu/sandbox';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ShieldCheck,
  FileCheck2,
  Landmark,
  Code2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
} from 'lucide-react';

interface ApiSetuReadinessPanelProps {
  documents: SchemeDocument[];
}

export const ApiSetuReadinessPanel: React.FC<ApiSetuReadinessPanelProps> = ({ documents }) => {
  const { pick, getFontClass } = useLanguage();
  const { confirmedProfile, isSample } = useProfileStore();

  const matchedSpecs = Array.from(
    new Map(
      documents
        .map((d) => resolveApiSetuDocSpec(d))
        .filter((s): s is NonNullable<typeof s> => Boolean(s))
        .map((s) => [s.docType, s])
    ).values()
  );

  const defaultDocType: ApiSetuDocType = matchedSpecs[0]?.docType || 'INCER';
  const currentYear = new Date().getFullYear();

  // Module 3A: Certificate Expiry Pre-Validator State
  const [selectedDocType, setSelectedDocType] = useState<ApiSetuDocType>(defaultDocType);
  const [issuedYear, setIssuedYear] = useState<number>(currentYear - 2);
  const [issuedMonth, setIssuedMonth] = useState<number>(6);

  // Module 3B: 6-Digit PIN -> IPPB NPCI DBT Seeding Desk State
  const [pinInput, setPinInput] = useState<string>('522001');
  const [ippbDesks, setIppbDesks] = useState<IppbSeedingDesk[] | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinLoading, setPinLoading] = useState(false);

  // Module 3C: API Setu OpenAPI v3 Synthetic Sandbox State
  const [sandboxOpen, setSandboxOpen] = useState(false);
  const [sandboxResult, setSandboxResult] = useState<ApiSetuOpenApiV3Response | null>(null);
  const [sandboxLoading, setSandboxLoading] = useState(false);

  const validity = checkCertificateValidity(selectedDocType, issuedYear, issuedMonth);
  const activeSchema = API_SETU_DOC_SCHEMAS[selectedDocType];
  const canUseSyntheticSandbox = Boolean(isSample || confirmedProfile?.is_sample);

  const handlePinLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = pinInput.trim();
    if (!/^[1-8]\d{5}$/.test(cleaned)) {
      setPinError(
        pick(
          'Enter a valid 6-digit PIN code (e.g. 522001). Never enter Aadhaar or phone numbers.',
          'సరైన 6-అంకెల పిన్ కోడ్ మాత్రమే ఇవ్వండి (ఉదా: 522001). ఆధార్/ఫోన్ వద్దు.',
          'केवल वैध 6-अंकीय पिन कोड दर्ज करें (जैसे 522001)। आधार/फ़ोन न लिखें।'
        )
      );
      return;
    }

    setPinError(null);
    setPinLoading(true);
    try {
      const resp = await fetch(`/api/apisetu/pin-lookup?pin=${encodeURIComponent(cleaned)}`);
      if (resp.ok) {
        const data = (await resp.json()) as PinLookupResponse;
        setIppbDesks(data.desks);
      } else {
        setIppbDesks(buildFallbackIppbDesks(cleaned));
      }
    } catch {
      setIppbDesks(buildFallbackIppbDesks(cleaned));
    } finally {
      setPinLoading(false);
    }
  };

  const handleRunSyntheticSandbox = async () => {
    setSandboxLoading(true);
    const district =
      confirmedProfile?.district_code && confirmedProfile.district_code !== 'unknown'
        ? confirmedProfile.district_code
        : 'Guntur';

    try {
      const resp = await fetch('/api/apisetu/sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_sample: true,
          doc_type: selectedDocType,
          synthetic_token: activeSchema.syntheticSampleToken,
          district_code: district,
          persona_label: 'Synthetic AP Demo Citizen',
        }),
      });

      if (resp.ok) {
        const json = (await resp.json()) as ApiSetuOpenApiV3Response;
        setSandboxResult(json);
        setSandboxLoading(false);
        return;
      }
    } catch {
      // Vite dev mode fallback envelope matching `/api/apisetu/sandbox`
    }

    const txnId = `apisetu-v3-synth-${Date.now().toString(36)}`;
    setSandboxResult({
      apiVersion: '3.0.0',
      txnId,
      ts: new Date().toISOString(),
      sandboxMode: 'SYNTHETIC_PERSONA_ONLY',
      orgId: activeSchema.orgId,
      docType: activeSchema.docType,
      endpointSimulated: activeSchema.openApiEndpointSlug,
      requestEnvelope: {
        txnId,
        format: 'json',
        certificateParameters: {
          syntheticCertRef: activeSchema.syntheticSampleToken,
          stateCode: 'AP',
          district,
        },
        consentArtifact: {
          consentId: `consent-synth-${selectedDocType.toLowerCase()}-2026`,
          purpose: 'Citizen Pre-Submission Readiness Check (Synthetic Demo)',
          piiCollected: false,
        },
      },
      verificationResult: {
        status: 'VERIFIED_SYNTHETIC_DEMO',
        issuer: activeSchema.issuerName_en,
        digilockerPullReady: activeSchema.digilockerPullable,
        validityRule: activeSchema.validityRule_en,
        verifiedAttributes: {
          holderType: 'Synthetic AP Household Persona',
          state: 'Andhra Pradesh',
          district,
          documentCode: activeSchema.docType,
          standing: 'ACTIVE_IN_SYNTHETIC_SANDBOX',
        },
        advisoryNote:
          'Preliminary readiness check using synthetic API Setu v3 schema only. Final eligibility is verified by Grama/Ward Sachivalayam officers.',
      },
    });
    setSandboxLoading(false);
  };

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 sm:p-5 space-y-5 no-print">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-700 shrink-0" aria-hidden="true" />
            <h3 className={`text-base font-extrabold text-primary ${getFontClass()}`}>
              {pick(
                'API Setu & DigiLocker Pre-Submission Readiness Suite',
                'API సేతు & డిజిలాకర్ ముందస్తు పత్రాల తనిఖీ',
                'API सेतु और डिजिलॉकर पूर्व-आवेदन तत्परता जांच'
              )}
            </h3>
          </div>
          <p className={`text-xs text-muted ${getFontClass()}`}>
            {pick(
              'Catch expired certificates and inactive NPCI DBT bank links before visiting the Sachivalayam—zero certificate or Aadhaar numbers required.',
              'సచివాలయానికి వెళ్లే ముందే గడువు ముగిసిన సర్టిఫికెట్లు మరియు NPCI బ్యాంకు లింక్ సమస్యలను గుర్తించండి (ఆధార్/సర్టిఫికెట్ నంబర్ అవసరం లేదు).',
              'सचिवालय जाने से पहले प्रमाण पत्र की वैधता और NPCI बैंक सीडिंग जांचें (कोई आधार या प्रमाण पत्र नंबर आवश्यक नहीं)।'
            )}
          </p>
        </div>

        <Badge className="bg-indigo-100 text-indigo-900 border border-indigo-300 text-xs font-mono">
          API Setu OpenAPI v3
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Module 3A: DigiLocker docType & AP Certificate Expiry Validator */}
        <Card className="border-indigo-200 bg-white">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-indigo-700 shrink-0" aria-hidden="true" />
              <h4 className={`text-sm font-bold text-primary ${getFontClass()}`}>
                {pick(
                  '1. AP Certificate Validity & DigiLocker docType Check',
                  '1. సర్టిఫికెట్ చెల్లుబాటు & డిజిలాకర్ docType తనిఖీ',
                  '1. प्रमाण पत्र वैधता और डिजिलॉकर docType जांच'
                )}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-3">
                <label
                  htmlFor="apisetu-doctype-select"
                  className="block text-[11px] font-semibold text-muted mb-1"
                >
                  {pick('Select Certificate Type', 'పత్రం రకం ఎంచుకోండి', 'प्रमाण पत्र चुनें')}
                </label>
                <select
                  id="apisetu-doctype-select"
                  value={selectedDocType}
                  onChange={(e) => {
                    setSelectedDocType(e.target.value as ApiSetuDocType);
                    setSandboxResult(null);
                  }}
                  className="w-full min-h-[40px] rounded-md border border-input bg-white px-2.5 text-xs font-medium text-body"
                >
                  {Object.values(API_SETU_DOC_SCHEMAS).map((spec) => (
                    <option key={spec.docType} value={spec.docType}>
                      {spec.docType} — {pick(spec.title_en, spec.title_te, spec.title_hi)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="apisetu-issue-year"
                  className="block text-[11px] font-semibold text-muted mb-1"
                >
                  {pick('Issued Year', 'జారీ సంవత్సరం', 'जारी वर्ष')}
                </label>
                <select
                  id="apisetu-issue-year"
                  value={issuedYear}
                  onChange={(e) => setIssuedYear(Number(e.target.value))}
                  className="w-full min-h-[40px] rounded-md border border-input bg-white px-2 text-xs text-body"
                >
                  {Array.from({ length: 8 }, (_, idx) => currentYear - idx).map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="apisetu-issue-month"
                  className="block text-[11px] font-semibold text-muted mb-1"
                >
                  {pick('Issued Month (Approx.)', 'జారీ నెల (సుమారు)', 'जारी महीना (लगभग)')}
                </label>
                <select
                  id="apisetu-issue-month"
                  value={issuedMonth}
                  onChange={(e) => setIssuedMonth(Number(e.target.value))}
                  className="w-full min-h-[40px] rounded-md border border-input bg-white px-2 text-xs text-body"
                >
                  {[
                    '01 - Jan',
                    '02 - Feb',
                    '03 - Mar',
                    '04 - Apr',
                    '05 - May',
                    '06 - Jun',
                    '07 - Jul',
                    '08 - Aug',
                    '09 - Sep',
                    '10 - Oct',
                    '11 - Nov',
                    '12 - Dec',
                  ].map((label, idx) => (
                    <option key={label} value={idx + 1}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              className={`rounded-lg p-3 text-xs border flex items-start gap-2 ${getFontClass()} ${
                validity.status === 'expired_renew_needed'
                  ? 'bg-rose-50 border-rose-300 text-rose-950'
                  : validity.status === 'expiring_soon'
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-950'
              }`}
            >
              {validity.status === 'expired_renew_needed' ? (
                <XCircle className="h-4 w-4 text-rose-700 shrink-0 mt-0.5" aria-hidden="true" />
              ) : validity.status === 'expiring_soon' ? (
                <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
              )}
              <div className="space-y-1">
                <p className="font-semibold">
                  {pick(validity.message_en, validity.message_te, validity.message_hi)}
                </p>
                <p className="text-[11px] opacity-85 font-mono">
                  Issuer: {activeSchema.orgId} • DigiLocker:{' '}
                  {activeSchema.digilockerPullable ? 'Pullable' : 'Physical/RSK Card'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Module 3B: 6-Digit PIN -> Nearest IPPB / Post Office NPCI DBT Seeding Finder */}
        <Card className="border-indigo-200 bg-white">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Landmark className="h-4 w-4 text-emerald-700 shrink-0" aria-hidden="true" />
              <h4 className={`text-sm font-bold text-primary ${getFontClass()}`}>
                {pick(
                  '2. Nearest Post Office / IPPB NPCI DBT Seeding Desk',
                  '2. సమీప పోస్టాఫీసు / IPPB ఆధార్–NPCI DBT సీడింగ్ కేంద్రం',
                  '2. नजदीकी डाकघर / IPPB आधार–NPCI DBT सीडिंग केंद्र'
                )}
              </h4>
            </div>

            <p className={`text-xs text-muted ${getFontClass()}`}>
              {pick(
                'Over 60% of DBT payment failures happen when NPCI bank mapping is inactive. Enter your 6-digit PIN to find the nearest IPPB seeding desk.',
                'DBT జమ కాకపోవడానికి ప్రధాన కారణం NPCI బ్యాంకు సీడింగ్ లేకపోవడమే. మీ 6-అంకెల పిన్ కోడ్ ఇవ్వండి.',
                'DBT भुगतान विफल होने का मुख्य कारण निष्क्रिय NPCI मैपिंग है। नजदीकी IPPB केंद्र खोजने के लिए 6-अंकीय पिन दर्ज करें।'
              )}
            </p>

            <form onSubmit={handlePinLookup} className="flex items-center gap-2">
              <Input
                inputMode="numeric"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="522001"
                aria-label="6-digit PIN code for IPPB DBT desk"
                className="min-h-[40px] text-xs"
              />
              <Button
                type="submit"
                disabled={pinLoading}
                className="min-h-[40px] text-xs font-bold shrink-0"
              >
                <Search className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                {pinLoading
                  ? pick('Checking…', 'వెతుకుతోంది…', 'खोज रहा है…')
                  : pick('Find Desk', 'కేంద్రం చూడండి', 'केंद्र खोजें')}
              </Button>
            </form>

            {pinError && <p className="text-xs text-rose-700 font-medium">{pinError}</p>}

            {ippbDesks && (
              <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                {ippbDesks.map((desk, i) => (
                  <div
                    key={`${desk.office_name}-${i}`}
                    className="rounded-md bg-slate-50 border border-slate-200 p-2.5 text-xs space-y-0.5"
                  >
                    <p className="font-bold text-primary">{desk.office_name}</p>
                    <p className={`text-[11px] text-muted ${getFontClass()}`}>
                      {pick(desk.service_note_en, desk.service_note_te, desk.service_note_hi)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Module 3C: API Setu OpenAPI v3 Synthetic Sandbox Verifier */}
      <div className="border-t border-indigo-200/80 pt-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-indigo-700 shrink-0" aria-hidden="true" />
            <span className={`text-xs font-bold text-primary ${getFontClass()}`}>
              {pick(
                '3. API Setu OpenAPI v3 Synthetic Verification Preview',
                '3. API సేతు OpenAPI v3 నమూనా ధృవీకరణ ప్రివ్యూ',
                '3. API सेतु OpenAPI v3 सिंथेटिक सत्यापन पूर्वावलोकन'
              )}
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => setSandboxOpen((v) => !v)}
            className="min-h-[36px] text-xs bg-white"
          >
            {sandboxOpen
              ? pick('Hide Sandbox', 'దాచు', 'छुपाएं')
              : pick('Inspect API Setu v3 Envelope', 'API సేతు v3 పరీక్షించండి', 'API सेतु v3 देखें')}
          </Button>
        </div>

        {sandboxOpen && (
          <div className="mt-3 rounded-lg bg-slate-950 text-slate-100 p-4 space-y-3 text-xs">
            {!canUseSyntheticSandbox ? (
              <p className={`text-amber-300 ${getFontClass()}`}>
                {pick(
                  'Privacy Guardrail Active: Live API Setu certificate verification is strictly enabled only for Synthetic Demo Personas (Scenario A/B/C on Check Eligibility) so real citizen certificate numbers are never collected.',
                  'గోప్యతా నిబంధన: నిజమైన సర్టిఫికెట్ నంబర్లు సేకరించకుండా ఉండేందుకు, ఈ API సేతు శాండ్‌బాక్స్ నమూనా ప్రొఫైల్స్ (Scenario A/B/C) కి మాత్రమే పనిచేస్తుంది.',
                  'गोपनीयता सुरक्षा: वास्तविक प्रमाण पत्र नंबर एकत्र न करने के लिए API सेतु सैंडबॉक्स केवल सिंथेटिक डेमो प्रोफ़ाइल (Scenario A/B/C) के लिए सक्रिय है।'
                )}
              </p>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-emerald-300">
                    POST /api/apisetu/sandbox • Token: {activeSchema.syntheticSampleToken}
                  </span>
                  <Button
                    type="button"
                    onClick={handleRunSyntheticSandbox}
                    disabled={sandboxLoading}
                    className="min-h-[36px] bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                  >
                    {sandboxLoading
                      ? 'Simulating…'
                      : `Verify Synthetic ${selectedDocType} Payload`}
                  </Button>
                </div>
                {sandboxResult && (
                  <pre className="overflow-x-auto rounded bg-slate-900 border border-slate-800 p-3 text-[11px] text-emerald-200 leading-relaxed">
                    {JSON.stringify(sandboxResult, null, 2)}
                  </pre>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
