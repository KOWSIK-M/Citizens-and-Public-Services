// Defense-in-Depth PII Interception and Sanitization Engine (Client + Server Shared Logic)
// Guardrail: Do NOT collect Aadhaar numbers, PAN, phone numbers, Voter IDs, bank accounts, IFSC, or emails.
// Supports ASCII, Telugu (౦-౯), and Devanagari (०-९) numerals.

export type DetectedPiiType =
  | 'aadhaar_or_12_digit'
  | 'phone_number'
  | 'pan_number'
  | 'voter_id'
  | 'bank_or_card_number'
  | 'ifsc_code'
  | 'email_address';

export interface PiiDetectionResult {
  hasPii: boolean;
  detectedTypes: DetectedPiiType[];
  sanitizedText: string;
  warningMessageEn?: string;
  warningMessageTe?: string;
  warningMessageHi?: string;
}

/**
 * Normalizes Telugu (U+0C66–U+0C6F) and Devanagari (U+0966–U+096F) numerals
 * to standard ASCII digits '0'–'9' while preserving exact character string length.
 */
export function normalizeIndicDigits(text: string): string {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 0x0c66 && code <= 0x0c6f) {
      out += String.fromCharCode(0x30 + (code - 0x0c66));
    } else if (code >= 0x0966 && code <= 0x096f) {
      out += String.fromCharCode(0x30 + (code - 0x0966));
    } else {
      out += text[i];
    }
  }
  return out;
}

// Character class matching ASCII, Telugu, or Devanagari digit
const D = '[0-9\\u0C66-\\u0C6F\\u0966-\\u096F]';

// 16-digit card (4-4-4-4 or contiguous) — checked BEFORE 12-digit Aadhaar so last 4 digits aren't left behind!
const CARD_16_PATTERN = `(?<!${D})${D}{4}[\\s./-]+${D}{4}[\\s./-]+${D}{4}[\\s./-]+${D}{4}(?!${D})|(?<!${D})${D}{16}(?!${D})`;

// 12-digit Aadhaar (4-4-4 with space/hyphen/slash/dot or 12 contiguous digits)
const AADHAAR_PATTERN = `(?<!${D})${D}{4}[\\s./-]+${D}{4}[\\s./-]+${D}{4}(?!${D})|(?<!${D})${D}{12}(?!${D})`;

// Indian mobile numbers: optional +91 / 91 / 0 prefix + [6-9] + 9 digits (contiguous or 5-5 / 3-3-4 spaced/dashed)
const PHONE_PATTERN = `(?<!${D})(?:(?:\\+91|91)[\\s.-]*|0)?[6-9\\u0C6C-\\u0C6F\\u096C-\\u096F](?:${D}{9}|${D}{4}[\\s.-]+${D}{5}|${D}{2}[\\s.-]+${D}{3}[\\s.-]+${D}{4})(?!${D})`;

// Bank account / Rice card long digit sequences (9, 11, or 13–18 contiguous digits, avoiding 10-digit phones & 12-digit Aadhaar)
const BANK_ACCOUNT_PATTERN = `(?<!${D})(?:${D}{9}|${D}{11}|${D}{13,15}|${D}{17,18})(?!${D})`;

// PAN: 5 letters + 4 digits + 1 letter
const PAN_PATTERN = `\\b[A-Za-z]{5}${D}{4}[A-Za-z]\\b`;

// Voter ID (EPIC): 3 letters + 7 digits
const VOTER_ID_PATTERN = `\\b[A-Za-z]{3}${D}{7}\\b`;

// IFSC: 4 letters + '0' + 6 alphanumeric chars (must contain at least one digit in suffix to avoid English words)
const IFSC_PATTERN = `\\b[A-Za-z]{4}[0\\u0C66\\u0966](?=[A-Za-z0-9\\u0C66-\\u0C6F\\u0966-\\u096F]*${D})[A-Za-z0-9\\u0C66-\\u0C6F\\u0966-\\u096F]{6}\\b`;

// Email address
const EMAIL_PATTERN = `\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b`;

export function inspectTextForPii(input: string): PiiDetectionResult {
  if (!input) {
    return { hasPii: false, detectedTypes: [], sanitizedText: input };
  }

  const detectedTypes: DetectedPiiType[] = [];

  // Stateless non-global RegExp instances prevent lastIndex bugs
  const hasCard16 = new RegExp(CARD_16_PATTERN, 'u').test(input);
  let working = input;

  if (hasCard16) {
    detectedTypes.push('bank_or_card_number');
    working = working.replace(new RegExp(CARD_16_PATTERN, 'gu'), '[ACCOUNT/CARD REMOVED]');
  }

  if (new RegExp(AADHAAR_PATTERN, 'u').test(working)) {
    detectedTypes.push('aadhaar_or_12_digit');
    working = working.replace(new RegExp(AADHAAR_PATTERN, 'gu'), '[ID NUMBER REMOVED]');
  }

  if (new RegExp(PAN_PATTERN, 'u').test(working)) {
    detectedTypes.push('pan_number');
    working = working.replace(new RegExp(PAN_PATTERN, 'gu'), '[PAN REMOVED]');
  }

  if (new RegExp(VOTER_ID_PATTERN, 'u').test(working)) {
    detectedTypes.push('voter_id');
    working = working.replace(new RegExp(VOTER_ID_PATTERN, 'gu'), '[VOTER ID REMOVED]');
  }

  if (new RegExp(IFSC_PATTERN, 'u').test(working)) {
    detectedTypes.push('ifsc_code');
    working = working.replace(new RegExp(IFSC_PATTERN, 'gu'), '[IFSC REMOVED]');
  }

  if (new RegExp(PHONE_PATTERN, 'u').test(working)) {
    detectedTypes.push('phone_number');
    working = working.replace(new RegExp(PHONE_PATTERN, 'gu'), '[PHONE REMOVED]');
  }

  if (new RegExp(BANK_ACCOUNT_PATTERN, 'u').test(working)) {
    if (!detectedTypes.includes('bank_or_card_number')) {
      detectedTypes.push('bank_or_card_number');
    }
    working = working.replace(new RegExp(BANK_ACCOUNT_PATTERN, 'gu'), '[ACCOUNT REMOVED]');
  }

  if (new RegExp(EMAIL_PATTERN, 'u').test(working)) {
    detectedTypes.push('email_address');
    working = working.replace(new RegExp(EMAIL_PATTERN, 'gu'), '[EMAIL REMOVED]');
  }

  const hasPii = detectedTypes.length > 0;

  let warningMessageEn: string | undefined;
  let warningMessageTe: string | undefined;
  let warningMessageHi: string | undefined;

  if (hasPii) {
    warningMessageEn =
      'Personal ID or account number detected (such as Aadhaar, phone, PAN, Voter ID, or bank account). ClaimSaathi never collects sensitive numbers—click below to remove them while keeping your story.';
    warningMessageTe =
      'ఆధార్, ఫోన్, పాన్, ఓటర్ ఐడి లేదా బ్యాంక్ ఖాతా వంటి వ్యక్తిగత సంఖ్యలు గుర్తించబడ్డాయి. క్లెయిమ్ సాథీ ఎటువంటి గుర్తింపు సంఖ్యలను సేకరించదు—మీ వివరణను ఉంచుతూ సంఖ్యలను మాత్రమే తొలగించడానికి క్రింది బటన్‌ను నొక్కండి.';
    warningMessageHi =
      'आधार, फोन, पैन, वोटर आईडी या बैंक खाते जैसी व्यक्तिगत संख्या का पता चला है। क्लेम साथी कभी भी संवेदनशील नंबर एकत्र नहीं करता—अपनी कहानी सुरक्षित रखते हुए नंबर हटाने के लिए नीचे क्लिक करें।';
  }

  return {
    hasPii,
    detectedTypes,
    sanitizedText: working,
    warningMessageEn,
    warningMessageTe,
    warningMessageHi,
  };
}
