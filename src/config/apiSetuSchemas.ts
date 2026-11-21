// API Setu OpenAPI v3 & DigiLocker Document Schema Registry + AP Certificate Expiry Validator
// Guardrails:
// 1. Uses public API Setu / DigiLocker `docType` & `orgId` specifications only.
// 2. Expiry pre-check asks ONLY for approximate issue month/year—never certificate or Aadhaar numbers.
// 3. Synthetic sandbox tokens (`SYNTH-AP-*`) are strictly isolated to `is_sample = true` personas.

import type { SchemeDocument } from '../types/scheme';

export type ApiSetuDocType =
  | 'INCER'
  | 'CSCER'
  | 'CCRC'
  | 'RICE'
  | 'SSCER'
  | 'UDID'
  | 'LPR'
  | 'NPCI_DBT';

export interface ApiSetuDocSchema {
  docType: ApiSetuDocType;
  orgId: string;
  issuerName_en: string;
  issuerName_te: string;
  issuerName_hi: string;
  title_en: string;
  title_te: string;
  title_hi: string;
  digilockerPullable: boolean;
  validityMonths: number | null; // null = permanent / continuous unless household changes
  validityRule_en: string;
  validityRule_te: string;
  validityRule_hi: string;
  syntheticSampleToken: string;
  openApiEndpointSlug: string;
}

export const API_SETU_DOC_SCHEMAS: Record<ApiSetuDocType, ApiSetuDocSchema> = {
  INCER: {
    docType: 'INCER',
    orgId: 'in.gov.ap.meeseva',
    issuerName_en: 'AP Revenue Dept (MeeSeva / Grama Sachivalayam)',
    issuerName_te: 'ఆంధ్రప్రదేశ్ రెవెన్యూ శాఖ (మీసేవ / గ్రామ సచివాలయం)',
    issuerName_hi: 'आंध्र प्रदेश राजस्व विभाग (मीसेवा / सचिवालय)',
    title_en: 'Income Certificate (INCER)',
    title_te: 'ఆదాయ ధృవీకరణ పత్రం (INCER)',
    title_hi: 'आय प्रमाण पत्र (INCER)',
    digilockerPullable: true,
    validityMonths: 48, // 4 years in Andhra Pradesh per Revenue G.O.
    validityRule_en: 'Valid for 4 years from issue date in Andhra Pradesh',
    validityRule_te: 'ఆంధ్రప్రదేశ్‌లో జారీ చేసిన తేదీ నుండి 4 సంవత్సరాలు చెల్లుతుంది',
    validityRule_hi: 'आंध्र प्रदेश में जारी तिथि से 4 वर्ष तक मान्य',
    syntheticSampleToken: 'SYNTH-AP-INCER-2026-0041',
    openApiEndpointSlug: '/certificate/v3/apmeeseva/incer',
  },
  CSCER: {
    docType: 'CSCER',
    orgId: 'in.gov.ap.meeseva',
    issuerName_en: 'AP Revenue Dept (Integrated Community & Nativity)',
    issuerName_te: 'ఆంధ్రప్రదేశ్ రెవెన్యూ శాఖ (ఇంటిగ్రేటెడ్ కుల ధృవీకరణ)',
    issuerName_hi: 'आंध्र प्रदेश राजस्व विभाग (एकीकृत जाति प्रमाण पत्र)',
    title_en: 'Integrated Caste / Community Certificate (CSCER)',
    title_te: 'ఇంటిగ్రేటెడ్ కుల ధృవీకరణ పత్రం (CSCER)',
    title_hi: 'एकीकृत जाति प्रमाण पत्र (CSCER)',
    digilockerPullable: true,
    validityMonths: null,
    validityRule_en: 'Permanent validity (fetchable via DigiLocker / API Setu)',
    validityRule_te: 'శాశ్వత చెల్లుబాటు (డిజిలాకర్ ద్వారా పొందవచ్చు)',
    validityRule_hi: 'स्थायी वैधता (डिजिलॉकर से प्राप्त करने योग्य)',
    syntheticSampleToken: 'SYNTH-AP-CSCER-PERM-0089',
    openApiEndpointSlug: '/certificate/v3/apmeeseva/cscer',
  },
  CCRC: {
    docType: 'CCRC',
    orgId: 'in.gov.ap.ccla',
    issuerName_en: 'AP CCLA / Rythu Seva Kendra (Tenant Farmer)',
    issuerName_te: 'ఆంధ్రప్రదేశ్ CCLA / రైతు సేవా కేంద్రం (కౌలు రైతు)',
    issuerName_hi: 'आंध्र प्रदेश CCLA / रैतु सेवा केंद्र (बटाईदार किसान)',
    title_en: 'Crop Cultivator Rights Card (CCRC)',
    title_te: 'పంట సాగుదారు హక్కు పత్రం (CCRC)',
    title_hi: 'फसल काश्तकार अधिकार कार्ड (CCRC)',
    digilockerPullable: false,
    validityMonths: 11, // 11-month / 1-year crop season lease card in AP
    validityRule_en: 'Valid for 11 months (1 crop year) — renew before Kharif booking',
    validityRule_te: '11 నెలలు (ఒక పంట సంవత్సరం) చెల్లుతుంది — ఖరీఫ్ ముందు పునరుద్ధరించాలి',
    validityRule_hi: '11 महीने (1 फसल वर्ष) के लिए मान्य — खरीफ से पहले नवीनीकरण करें',
    syntheticSampleToken: 'SYNTH-AP-CCRC-2026-0112',
    openApiEndpointSlug: '/certificate/v3/apccla/ccrc',
  },
  RICE: {
    docType: 'RICE',
    orgId: 'in.gov.ap.epds',
    issuerName_en: 'AP Civil Supplies Dept (e-PDS)',
    issuerName_te: 'ఆంధ్రప్రదేశ్ పౌర సరఫరాల శాఖ (రైస్ కార్డు)',
    issuerName_hi: 'आंध्र प्रदेश नागरिक आपूर्ति विभाग (राइस कार्ड)',
    title_en: 'White Rice / Ration Card (RICE)',
    title_te: 'తెల్ల రేషన్ / రైస్ కార్డు (RICE)',
    title_hi: 'सफेद राशन / राइस कार्ड (RICE)',
    digilockerPullable: true,
    validityMonths: null,
    validityRule_en: 'Active subject to annual household biometric e-KYC',
    validityRule_te: 'వార్షిక బయోమెట్రిక్ e-KYC ఆధారంగా అమలులో ఉంటుంది',
    validityRule_hi: 'वार्षिक बायोमेट्रिक e-KYC के साथ सक्रिय',
    syntheticSampleToken: 'SYNTH-AP-RICE-BPL-0304',
    openApiEndpointSlug: '/certificate/v3/apepds/ricecard',
  },
  SSCER: {
    docType: 'SSCER',
    orgId: 'in.gov.ap.bse',
    issuerName_en: 'Board of Secondary Education, Andhra Pradesh',
    issuerName_te: 'ఆంధ్రప్రదేశ్ సెకండరీ ఎడ్యుకేషన్ బోర్డు (SSC)',
    issuerName_hi: 'माध्यमिक शिक्षा बोर्ड, आंध्र प्रदेश (SSC)',
    title_en: 'Class 10 / SSC Marks Memo (SSCER)',
    title_te: '10వ తరగతి / SSC మార్కుల మెమో (SSCER)',
    title_hi: 'कक्षा 10 / SSC अंक तालिका (SSCER)',
    digilockerPullable: true,
    validityMonths: null,
    validityRule_en: 'Permanent academic & date-of-birth record on DigiLocker',
    validityRule_te: 'డిజిలాకర్‌లో శాశ్వత విద్యా & పుట్టిన తేదీ రికార్డు',
    validityRule_hi: 'डिजिलॉकर पर स्थायी शैक्षणिक और जन्मतिथि रिकॉर्ड',
    syntheticSampleToken: 'SYNTH-AP-SSCER-2025-0917',
    openApiEndpointSlug: '/certificate/v3/bseap/sscer',
  },
  UDID: {
    docType: 'UDID',
    orgId: 'in.gov.swavlamban',
    issuerName_en: 'DEPwD / AP SADAREM Disability Authority',
    issuerName_te: 'సదరం (SADAREM) / దివ్యాంగుల సాధికారత శాఖ (UDID)',
    issuerName_hi: 'दिव्यांगजन सशक्तिकरण विभाग / सदारम (UDID)',
    title_en: 'SADAREM / UDID Disability Certificate',
    title_te: 'సదరం / UDID దివ్యాంగుల ధృవీకరణ పత్రం',
    title_hi: 'सदारम / UDID दिव्यांगता प्रमाण पत्र',
    digilockerPullable: true,
    validityMonths: 60, // Temporary reassessment cards typically 5 yrs; permanent for lifelong
    validityRule_en: 'Permanent (or 5-year reassessment if marked temporary on SADAREM)',
    validityRule_te: 'శాశ్వతం (తాత్కాలిక కార్డు అయితే 5 ఏళ్లకు పునఃపరిశీలన)',
    validityRule_hi: 'स्थायी (अस्थायी कार्ड होने पर 5 वर्ष में पुनर्मूल्यांकन)',
    syntheticSampleToken: 'SYNTH-IN-UDID-2026-0420',
    openApiEndpointSlug: '/certificate/v3/swavlamban/udid',
  },
  LPR: {
    docType: 'LPR',
    orgId: 'in.gov.ap.webland',
    issuerName_en: 'AP Webland / Meebhoomi Revenue Records',
    issuerName_te: 'ఆంధ్రప్రదేశ్ వెబ్‌ల్యాండ్ / మీభూమి (1B అడంగల్)',
    issuerName_hi: 'आंध्र प्रदेश वेबलैंड / मीभूमि (1B अडंगल)',
    title_en: 'Webland 1B / Pattadar Adangal Extract (LPR)',
    title_te: 'వెబ్‌ల్యాండ్ 1B / పట్టాదారు అడంగల్ (LPR)',
    title_hi: 'वेबलैंड 1B / पट्टाधारक अडंगल (LPR)',
    digilockerPullable: true,
    validityMonths: 12,
    validityRule_en: 'Fetch latest seasonal extract before crop/subsidy submission',
    validityRule_te: 'పంట సబ్సిడీ దరఖాస్తు ముందు తాజా 1B కాపీ తీసుకోవాలి',
    validityRule_hi: 'सब्सिडी आवेदन से पहले नवीनतम 1B प्रति लें',
    syntheticSampleToken: 'SYNTH-AP-WEBLAND1B-2026-077',
    openApiEndpointSlug: '/certificate/v3/apwebland/lpr',
  },
  NPCI_DBT: {
    docType: 'NPCI_DBT',
    orgId: 'org.npci.dbt',
    issuerName_en: 'NPCI / India Post Payments Bank (IPPB) Mapper',
    issuerName_te: 'NPCI / ఇండియా పోస్ట్ పేమెంట్స్ బ్యాంక్ (IPPB) సీడింగ్',
    issuerName_hi: 'NPCI / इंडिया पोस्ट पेमेंट्स बैंक (IPPB) डीबीटी मैपर',
    title_en: 'Aadhaar–NPCI Seeded Bank Account (DBT Ready)',
    title_te: 'ఆధార్–NPCI లింక్ అయిన బ్యాంకు ఖాతా (DBT సిద్ధం)',
    title_hi: 'आधार–NPCI सीडेड बैंक खाता (DBT सक्रिय)',
    digilockerPullable: false,
    validityMonths: null,
    validityRule_en: 'Must remain ACTIVE on NPCI mapper; avoid 6+ months dormancy',
    validityRule_te: 'NPCI మ్యాపర్‌లో యాక్టివ్‌గా ఉండాలి; 6 నెలలు లావాదేవీలు ఆపవద్దు',
    validityRule_hi: 'NPCI मैपर पर सक्रिय रहना आवश्यक; खाते को निष्क्रिय न होने दें',
    syntheticSampleToken: 'SYNTH-NPCI-MAPPER-ACTIVE-01',
    openApiEndpointSlug: '/dbt/v3/npci/mapper-status',
  },
};

export function resolveApiSetuDocSpec(doc: Pick<SchemeDocument, 'canonical_key' | 'document_name_en'>): ApiSetuDocSchema | null {
  const key = (doc.canonical_key || '').toLowerCase();
  const name = doc.document_name_en.toLowerCase();

  if (key.includes('income') || name.includes('income certificate')) {
    return API_SETU_DOC_SCHEMAS.INCER;
  }
  if (key.includes('caste') || name.includes('caste certificate') || name.includes('community certificate')) {
    return API_SETU_DOC_SCHEMAS.CSCER;
  }
  if (key.includes('ccrc') || name.includes('ccrc') || name.includes('cultivator rights')) {
    return API_SETU_DOC_SCHEMAS.CCRC;
  }
  if (key.includes('rice') || key.includes('ration') || name.includes('rice card') || name.includes('ration card')) {
    return API_SETU_DOC_SCHEMAS.RICE;
  }
  if (key.includes('ssc') || name.includes('class 10') || name.includes('ssc') || name.includes('marks memo')) {
    return API_SETU_DOC_SCHEMAS.SSCER;
  }
  if (key.includes('sadarem') || key.includes('disability') || name.includes('sadarem') || name.includes('udid') || name.includes('disability')) {
    return API_SETU_DOC_SCHEMAS.UDID;
  }
  if (key.includes('webland') || key.includes('1b') || key.includes('land') || name.includes('1b') || name.includes('adangal') || name.includes('pattadar')) {
    return API_SETU_DOC_SCHEMAS.LPR;
  }
  if (key.includes('bank') || key.includes('npci') || name.includes('bank') || name.includes('npci')) {
    return API_SETU_DOC_SCHEMAS.NPCI_DBT;
  }

  return null;
}

export interface CertificateValidityEvaluation {
  status: 'permanent' | 'valid' | 'expiring_soon' | 'expired_renew_needed';
  monthsRemaining: number | null;
  expiresLabel: string;
  message_en: string;
  message_te: string;
  message_hi: string;
}

export function checkCertificateValidity(
  docType: ApiSetuDocType,
  issuedYear: number,
  issuedMonth: number, // 1..12
  referenceDate: Date = new Date()
): CertificateValidityEvaluation {
  const schema = API_SETU_DOC_SCHEMAS[docType];
  if (!schema || schema.validityMonths === null) {
    return {
      status: 'permanent',
      monthsRemaining: null,
      expiresLabel: 'Permanent',
      message_en: `${schema.title_en} has permanent validity—ensure details match your Rice Card & Aadhaar spelling.`,
      message_te: `${schema.title_te} శాశ్వతంగా చెల్లుతుంది—పేరు అక్షరాలు సరిపోల్చుకోండి.`,
      message_hi: `${schema.title_hi} स्थायी रूप से मान्य है—नाम की वर्तनी जांच लें।`,
    };
  }

  const safeMonth = Math.min(12, Math.max(1, issuedMonth));
  const issuedTotalMonths = issuedYear * 12 + (safeMonth - 1);
  const expiryTotalMonths = issuedTotalMonths + schema.validityMonths;
  const nowTotalMonths =
    referenceDate.getUTCFullYear() * 12 + referenceDate.getUTCMonth();

  const monthsRemaining = expiryTotalMonths - nowTotalMonths;
  const expYear = Math.floor(expiryTotalMonths / 12);
  const expMonth = (expiryTotalMonths % 12) + 1;
  const expiresLabel = `${expYear}-${String(expMonth).padStart(2, '0')}`;

  if (monthsRemaining <= 0) {
    return {
      status: 'expired_renew_needed',
      monthsRemaining,
      expiresLabel,
      message_en: `Expired (${expiresLabel}). Renew this ${schema.title_en} at your Grama/Ward Sachivalayam or MeeSeva BEFORE submitting so your application is not rejected.`,
      message_te: `గడువు ముగిసింది (${expiresLabel}). దరఖాస్తు తిరస్కరణకు గురికాకుండా ఉండేందుకు సచివాలయం లేదా మీసేవలో ముందుగా పునరుద్ధరించండి.`,
      message_hi: `अवधि समाप्त (${expiresLabel})। अस्वीकृति से बचने के लिए आवेदन से पहले सचिवालय या मीसेवा में नवीनीकरण कराएं।`,
    };
  }

  if (monthsRemaining <= 3) {
    return {
      status: 'expiring_soon',
      monthsRemaining,
      expiresLabel,
      message_en: `Expiring soon (${monthsRemaining} month${monthsRemaining === 1 ? '' : 's'} left, until ${expiresLabel}). Consider renewing at MeeSeva/Sachivalayam if verification takes 21+ days.`,
      message_te: `త్వరలో గడువు ముగుస్తుంది (${expiresLabel} వరకు మాత్రమే). ముందస్తుగా సచివాలయంలో పునరుద్ధరించుకోవడం మంచిది.`,
      message_hi: `जल्द समाप्त हो रहा है (${expiresLabel} तक)। सत्यापन से पहले नवीनीकरण कराना उचित रहेगा।`,
    };
  }

  return {
    status: 'valid',
    monthsRemaining,
    expiresLabel,
    message_en: `Valid until ${expiresLabel} (${monthsRemaining} months remaining). Ready for DigiLocker / Sachivalayam submission.`,
    message_te: `${expiresLabel} వరకు చెల్లుబాటులో ఉంది (${monthsRemaining} నెలలు మిగిలి ఉన్నాయి). సమర్పణకు సిద్ధంగా ఉంది.`,
    message_hi: `${expiresLabel} तक मान्य (${monthsRemaining} महीने शेष)। जमा करने के लिए तैयार।`,
  };
}
