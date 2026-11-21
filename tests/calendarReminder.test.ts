import { describe, it, expect } from 'vitest';
import {
  buildSchemeReminderIcs,
  buildWhatsAppReminderUrl,
  getDaysUntilDeadline,
  type ReminderSchemeInput,
} from '@/utils/calendarReminder';
import { MOCK_GOVERNMENT_SCHEMES } from './fixtures/sampleSchemes';

const tallikiScheme = MOCK_GOVERNMENT_SCHEMES.find((s) => s.scheme_code === 'AP-TALLIKI-VANDANAM')!;

const sampleReminderInput: ReminderSchemeInput = {
  scheme_id: tallikiScheme.id,
  scheme_code: tallikiScheme.scheme_code,
  name_en: tallikiScheme.name_en,
  name_te: tallikiScheme.name_te,
  name_hi: tallikiScheme.name_hi,
  benefit_summary_en: tallikiScheme.benefit_summary_en,
  benefit_summary_te: tallikiScheme.benefit_summary_te,
  benefit_summary_hi: tallikiScheme.benefit_summary_hi,
  official_source_url: tallikiScheme.source.source_url,
  application_close_on: '2026-12-15',
  deadline_label_en: tallikiScheme.deadline_label_en,
  deadline_label_te: tallikiScheme.deadline_label_te,
  deadline_label_hi: tallikiScheme.deadline_label_hi,
};

describe('Calendar (.ics) & WhatsApp Self-Reminder Helpers', () => {
  it('builds RFC-5545 compliant VCALENDAR with DTSTART and both -P7D and -P2D VALARM triggers', () => {
    const ics = buildSchemeReminderIcs(sampleReminderInput, 'en');
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('DTSTART;VALUE=DATE:20261215');
    expect(ics).toContain('TRIGGER:-P7D');
    expect(ics).toContain('TRIGGER:-P2D');
    expect(ics).toContain('SUMMARY:ClaimSaathi Scheme Reminder: Talliki Vandanam Scheme');
    expect(ics).toContain('END:VCALENDAR');
  });

  it('localizes .ics summary in Telugu (`te`) and handles rolling null deadlines', () => {
    const icsTe = buildSchemeReminderIcs({ ...sampleReminderInput, application_close_on: null }, 'te');
    expect(icsTe).toContain('క్లెయిమ్ సాథీ గడువు రిమైండర్');
    expect(icsTe).toContain('తల్లికి వందనం పథకం');
    expect(icsTe).toMatch(/DTSTART;VALUE=DATE:\d{8}/);
  });

  it('localizes .ics summary in Hindi (`hi`)', () => {
    const icsHi = buildSchemeReminderIcs(sampleReminderInput, 'hi');
    expect(icsHi).toContain('क्लेम साथी अंतिम तिथि अनुस्मारक');
    expect(icsHi).toContain('तल्लिकी वंदनम योजना');
  });

  it('generates English WhatsApp share URL containing documents, helpline 1902 & anti-middleman notice', () => {
    const urlEn = buildWhatsAppReminderUrl(sampleReminderInput, tallikiScheme.documents, 'en');
    expect(urlEn.startsWith('https://wa.me/?text=')).toBe(true);
    const decodedEn = decodeURIComponent(urlEn.replace('https://wa.me/?text=', ''));
    expect(decodedEn).toContain('Talliki Vandanam Scheme');
    expect(decodedEn).toContain('1902');
    expect(decodedEn).toContain('never pay middlemen');
    expect(decodedEn).toContain('School Study / Bonafide Certificate');
  });

  it('generates localized Telugu and Hindi WhatsApp share URLs', () => {
    const urlTe = buildWhatsAppReminderUrl(sampleReminderInput, tallikiScheme.documents, 'te');
    const decodedTe = decodeURIComponent(urlTe.replace('https://wa.me/?text=', ''));
    expect(decodedTe).toContain('తల్లికి వందనం పథకం');
    expect(decodedTe).toContain('దళారులకు డబ్బు ఇవ్వకండి');

    const urlHi = buildWhatsAppReminderUrl(sampleReminderInput, tallikiScheme.documents, 'hi');
    const decodedHi = decodeURIComponent(urlHi.replace('https://wa.me/?text=', ''));
    expect(decodedHi).toContain('तल्लिकी वंदनम योजना');
    expect(decodedHi).toContain('बिचौलियों को शुल्क न दें');
  });

  it('computes days until deadline cleanly and returns null for rolling or invalid dates', () => {
    expect(getDaysUntilDeadline(null)).toBeNull();
    expect(getDaysUntilDeadline('not-a-date')).toBeNull();
    const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const days = getDaysUntilDeadline(futureDate);
    expect(days).not.toBeNull();
    expect(days!).toBeGreaterThanOrEqual(9);
    expect(days!).toBeLessThanOrEqual(11);
  });
});
