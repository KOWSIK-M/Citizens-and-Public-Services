// Client-Side PII Interception and Sanitization Engine
// Guardrail: Do NOT collect Aadhaar numbers, PAN, phone numbers, or sensitive IDs.
// Any 12-digit numeric pattern or sensitive identity token is intercepted before network dispatch.

export interface PiiDetectionResult {
  hasPii: boolean;
  detectedTypes: Array<'aadhaar_or_12_digit' | 'phone_number' | 'pan_number'>;
  sanitizedText: string;
  warningMessageEn?: string;
  warningMessageTe?: string;
  warningMessageHi?: string;
}

// 12 continuous digits, or 4-4-4 formatted pattern (e.g. 1234 5678 9012 or 1234-5678-9012)
const AADHAAR_REGEX = /\b\d{4}[ -]?\d{4}[ -]?\d{4}\b|\b\d{12}\b/g;

// Standard Indian mobile number (starts with 6,7,8,9 followed by 9 digits)
const PHONE_REGEX = /\b[6-9]\d{9}\b/g;

// Permanent Account Number (PAN): 5 letters, 4 digits, 1 letter
const PAN_REGEX = /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/gi;

export function inspectTextForPii(input: string): PiiDetectionResult {
  const detectedTypes: Array<'aadhaar_or_12_digit' | 'phone_number' | 'pan_number'> = [];

  if (AADHAAR_REGEX.test(input)) {
    detectedTypes.push('aadhaar_or_12_digit');
  }

  if (PHONE_REGEX.test(input)) {
    detectedTypes.push('phone_number');
  }

  if (PAN_REGEX.test(input)) {
    detectedTypes.push('pan_number');
  }

  const hasPii = detectedTypes.length > 0;

  // Sanitize text by masking detected sensitive numbers with [REDACTED]
  let sanitized = input
    .replace(AADHAAR_REGEX, '[ID NUMBER REMOVED]')
    .replace(PHONE_REGEX, '[PHONE NUMBER REMOVED]')
    .replace(PAN_REGEX, '[PAN NUMBER REMOVED]');

  let warningMessageEn: string | undefined;
  let warningMessageTe: string | undefined;
  let warningMessageHi: string | undefined;

  if (hasPii) {
    warningMessageEn =
      'Please do not type ID numbers such as Aadhaar, PAN, or phone numbers. Describe your personal situation instead (e.g., "I am 60 years old and do not have a regular income").';
    warningMessageTe =
      'దయచేసి ఆధార్, పాన్ లేదా ఫోన్ నంబర్లు వంటి గుర్తింపు సంఖ్యలను నమోదు చేయవద్దు. మీ పరిస్థితిని మాత్రమే వివరించండి (ఉదాహరణకు: "నాకు 60 ఏళ్లు, ఎటువంటి ఆదాయం లేదు").';
    warningMessageHi =
      'कृपया आधार, पैन या फोन नंबर जैसी पहचान संख्याएं दर्ज न करें। इसके बजाय अपनी व्यक्तिगत स्थिति का विवरण दें (उदाहरण के लिए: "मेरी उम्र 60 वर्ष है और मेरी कोई नियमित आय नहीं है")।';
  }

  return {
    hasPii,
    detectedTypes,
    sanitizedText: sanitized,
    warningMessageEn,
    warningMessageTe,
    warningMessageHi,
  };
}
