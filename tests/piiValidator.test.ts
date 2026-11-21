import { describe, it, expect } from 'vitest';
import { inspectTextForPii, normalizeIndicDigits } from '@/utils/piiValidator';

describe('Defense-in-Depth PII Shield (`piiValidator.ts`)', () => {
  it('detects contiguous 12-digit Aadhaar numbers', () => {
    const res = inspectTextForPii('My Aadhaar is 234567890123');
    expect(res.hasPii).toBe(true);
    expect(res.detectedTypes).toContain('aadhaar_or_12_digit');
    expect(res.sanitizedText).toBe('My Aadhaar is [ID NUMBER REMOVED]');
  });

  it('detects slash, dot, hyphen, and multi-space formatted 4-4-4 Aadhaar numbers', () => {
    for (const input of ['2345 6789 0123', '2345-6789-0123', '2345/6789/0123', '2345.6789.0123', '2345  6789  0123']) {
      const res = inspectTextForPii(`ID ${input}`);
      expect(res.hasPii).toBe(true);
      expect(res.detectedTypes).toContain('aadhaar_or_12_digit');
      expect(res.sanitizedText).not.toContain('0123');
    }
  });

  it('detects Telugu numerals Aadhaar (`౧౨౩౪ ౫౬౭౮ ౯౦౧౨`)', () => {
    const teAadhaar = inspectTextForPii('నా ఆధార్ నంబర్ ౧౨౩౪ ౫౬౭౮ ౯౦౧౨');
    expect(teAadhaar.hasPii).toBe(true);
    expect(teAadhaar.detectedTypes).toContain('aadhaar_or_12_digit');
    expect(teAadhaar.sanitizedText).toContain('[ID NUMBER REMOVED]');
  });

  it('detects Devanagari numerals mobile (`९८७६५४३२१०`)', () => {
    const hiPhone = inspectTextForPii('मेरा नंबर ९८७६५४३२१० है');
    expect(hiPhone.hasPii).toBe(true);
    expect(hiPhone.detectedTypes).toContain('phone_number');
    expect(hiPhone.sanitizedText).toContain('[PHONE REMOVED]');
  });

  it('normalizes Indic script digits to ASCII digits without changing string length', () => {
    const sample = '౧౨౩-४५६-789';
    const normalized = normalizeIndicDigits(sample);
    expect(normalized).toBe('123-456-789');
    expect(normalized).toHaveLength(sample.length);
  });

  it('detects 0-prefixed 11-digit STD/mobile (`09876543210`) and `+91` spaced/dashed mobile numbers', () => {
    for (const phone of ['09876543210', '+91 98765 43210', '+91-987-654-3210', '98765 43210']) {
      const res = inspectTextForPii(`Call me at ${phone} urgently`);
      expect(res.hasPii).toBe(true);
      expect(res.detectedTypes).toContain('phone_number');
      expect(res.sanitizedText).toContain('[PHONE REMOVED]');
    }
  });

  it('detects PAN (`ABCDE1234F`), Voter ID EPIC (`ABC1234567`), and IFSC (`SBIN0001234`)', () => {
    expect(inspectTextForPii('My PAN card is ABCDE1234F').detectedTypes).toContain('pan_number');
    expect(inspectTextForPii('Voter card ABC1234567').detectedTypes).toContain('voter_id');
    expect(inspectTextForPii('Branch IFSC code SBIN0001234').detectedTypes).toContain('ifsc_code');
  });

  it('detects 11-digit SBI bank account numbers', () => {
    const sbi = inspectTextForPii('Bank a/c 30987654321 in Guntur');
    expect(sbi.hasPii).toBe(true);
    expect(sbi.detectedTypes).toContain('bank_or_card_number');
    expect(sbi.sanitizedText).toBe('Bank a/c [ACCOUNT REMOVED] in Guntur');
  });

  it('detects 16-digit card (`4532 1234 5678 9012`) WITHOUT leaving the last 4 digits exposed', () => {
    const cardSpaced = inspectTextForPii('Card 4532 1234 5678 9012');
    expect(cardSpaced.hasPii).toBe(true);
    expect(cardSpaced.detectedTypes).toContain('bank_or_card_number');
    expect(cardSpaced.sanitizedText).toBe('Card [ACCOUNT/CARD REMOVED]');
    expect(cardSpaced.sanitizedText).not.toContain('9012');

    const cardContiguous = inspectTextForPii('Card 4532123456789012');
    expect(cardContiguous.hasPii).toBe(true);
    expect(cardContiguous.sanitizedText).toBe('Card [ACCOUNT/CARD REMOVED]');
  });

  it('detects email addresses (`citizen@example.com`)', () => {
    const email = inspectTextForPii('Reach me at ramu.rythu@gmail.com please');
    expect(email.hasPii).toBe(true);
    expect(email.detectedTypes).toContain('email_address');
    expect(email.sanitizedText).toContain('[EMAIL REMOVED]');
  });

  it('allows clean citizen stories with ages, acres, and rupee amounts with zero false positives and stateless repeatability', () => {
    const cleanStory =
      'I am 68 years old living in Guntur with 2.5 acres of dry land and annual family income of ₹1,20,000.';
    for (let i = 0; i < 5; i++) {
      const res = inspectTextForPii(cleanStory);
      expect(res.hasPii).toBe(false);
      expect(res.detectedTypes).toEqual([]);
      expect(res.sanitizedText).toBe(cleanStory);
    }
  });
});
