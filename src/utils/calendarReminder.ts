// Client-Side Calendar (.ics) Reminder & Zero-Server WhatsApp Self-Share Helpers
// Mandatory Pillar #4: Deadline reminders and application tracking, so nothing lapses.

import { SupportedLanguage } from '@/types/i18n';
import { SchemeDocument } from '@/types/scheme';

export interface ReminderSchemeInput {
  scheme_id: string;
  scheme_code: string;
  name_en: string;
  name_te: string;
  name_hi: string;
  benefit_summary_en: string;
  benefit_summary_te: string;
  benefit_summary_hi: string;
  official_source_url: string;
  application_open_on?: string | null;
  application_close_on?: string | null;
  deadline_label_en?: string;
  deadline_label_te?: string;
  deadline_label_hi?: string;
}

function formatIcsDate(date: Date): string {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

function escapeIcsText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

export function buildSchemeReminderIcs(item: ReminderSchemeInput, lang: SupportedLanguage): string {
  const now = new Date();
  let targetDate: Date;

  if (item.application_close_on) {
    const parsed = new Date(`${item.application_close_on}T09:00:00`);
    targetDate = Number.isNaN(parsed.getTime())
      ? new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
      : parsed;
  } else {
    // Rolling open scheme -> schedule a 14-day Sachivalayam application/follow-up check-in
    targetDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  }

  const nextDay = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);
  const name = lang === 'te' ? item.name_te : lang === 'hi' ? item.name_hi : item.name_en;
  const benefit =
    lang === 'te'
      ? item.benefit_summary_te
      : lang === 'hi'
      ? item.benefit_summary_hi
      : item.benefit_summary_en;

  const summaryPrefix =
    lang === 'te'
      ? 'క్లెయిమ్ సాథీ గడువు రిమైండర్'
      : lang === 'hi'
      ? 'क्लेम साथी अंतिम तिथि अनुस्मारक'
      : 'ClaimSaathi Scheme Reminder';

  const description = `${name}\n${benefit}\nOfficial Portal: ${item.official_source_url}\nHelpline: 1902 (AP Grama/Ward Sachivalayam)`;
  const dtStamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ClaimSaathi//Citizen Welfare Reminder//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:claimsaathi-${item.scheme_id}-${Date.now()}@claimsaathi.local`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART;VALUE=DATE:${formatIcsDate(targetDate)}`,
    `DTEND;VALUE=DATE:${formatIcsDate(nextDay)}`,
    `SUMMARY:${escapeIcsText(`${summaryPrefix}: ${name}`)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `URL:${item.official_source_url}`,
    'BEGIN:VALARM',
    'TRIGGER:-P7D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeIcsText(`7 days left to apply / follow up: ${name}`)}`,
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-P2D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeIcsText(`2 days left before deadline: ${name}`)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadSchemeReminderIcs(item: ReminderSchemeInput, lang: SupportedLanguage): void {
  const content = buildSchemeReminderIcs(item, lang);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${item.scheme_code.toLowerCase()}-reminder.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function buildWhatsAppReminderUrl(
  item: ReminderSchemeInput,
  documents: SchemeDocument[],
  lang: SupportedLanguage
): string {
  const name = lang === 'te' ? item.name_te : lang === 'hi' ? item.name_hi : item.name_en;
  const benefit =
    lang === 'te'
      ? item.benefit_summary_te
      : lang === 'hi'
      ? item.benefit_summary_hi
      : item.benefit_summary_en;
  const deadline =
    (lang === 'te'
      ? item.deadline_label_te
      : lang === 'hi'
      ? item.deadline_label_hi
      : item.deadline_label_en) ||
    item.application_close_on ||
    (lang === 'te' ? 'సంవత్సరం పొడవునా (సచివాలయం)' : lang === 'hi' ? 'पूरे वर्ष खुला (सचिवालय)' : 'Open year-round at Sachivalayam');

  const docLines = documents
    .slice(0, 5)
    .map((d, idx) => {
      const docName =
        lang === 'te' ? d.document_name_te : lang === 'hi' ? d.document_name_hi : d.document_name_en;
      return `${idx + 1}. ${docName}`;
    })
    .join('\n');

  const header =
    lang === 'te'
      ? `*క్లెయిమ్ సాథీ — పథకం & గడువు వివరాలు*`
      : lang === 'hi'
      ? `*क्लेम साथी — योजना व अंतिम तिथि विवरण*`
      : `*ClaimSaathi — Scheme & Deadline Summary*`;

  const disclaimer =
    lang === 'te'
      ? `గమనిక: ఇది ప్రాథమిక అర్హత సమాచారం మాత్రమే. దళారులకు డబ్బు ఇవ్వకండి.`
      : lang === 'hi'
      ? `नोट: यह केवल प्रारंभिक मार्गदर्शन है। बिचौलियों को शुल्क न दें।`
      : `Note: Likely-eligible guidance only. Apply free at Grama/Ward Sachivalayam—never pay middlemen.`;

  const fullMessage = [
    header,
    `*${name}*`,
    benefit,
    `📅 ${lang === 'te' ? 'గడువు' : lang === 'hi' ? 'अंतिम तिथि' : 'Deadline'}: ${deadline}`,
    docLines ? `\n📄 ${lang === 'te' ? 'అవసరమైన పత్రాలు' : lang === 'hi' ? 'आवश्यक दस्तावेज़' : 'Documents to carry'}:\n${docLines}` : '',
    `\n🔗 ${item.official_source_url}`,
    `☎️ AP Helpline: 1902`,
    `\n_${disclaimer}_`,
  ]
    .filter(Boolean)
    .join('\n');

  return `https://wa.me/?text=${encodeURIComponent(fullMessage)}`;
}

export function getDaysUntilDeadline(closeDate?: string | null): number | null {
  if (!closeDate) return null;
  const close = new Date(`${closeDate}T23:59:59`);
  if (Number.isNaN(close.getTime())) return null;
  const now = new Date();
  const diffMs = close.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function buildSchemeOpeningIcs(item: ReminderSchemeInput, lang: SupportedLanguage): string {
  const now = new Date();
  const parsedOpen = item.application_open_on
    ? new Date(`${item.application_open_on}T09:00:00`)
    : null;
  const targetDate =
    parsedOpen && !Number.isNaN(parsedOpen.getTime())
      ? parsedOpen
      : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextDay = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);

  const name = lang === 'te' ? item.name_te : lang === 'hi' ? item.name_hi : item.name_en;
  const prefix =
    lang === 'te'
      ? 'క్లెయిమ్ సాథీ — దరఖాస్తు ప్రారంభ అలర్ట్'
      : lang === 'hi'
      ? 'क्लेम साथी — आवेदन प्रारंभ अलर्ट'
      : 'ClaimSaathi — Scheme Window Opens';
  const dtStamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ClaimSaathi//Scheme Opening Alert//EN',
    'BEGIN:VEVENT',
    `UID:claimsaathi-open-${item.scheme_id}-${Date.now()}@claimsaathi.local`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART;VALUE=DATE:${formatIcsDate(targetDate)}`,
    `DTEND;VALUE=DATE:${formatIcsDate(nextDay)}`,
    `SUMMARY:${escapeIcsText(`${prefix}: ${name}`)}`,
    `DESCRIPTION:${escapeIcsText(`Check Sachivalayam / Official Portal: ${item.official_source_url} | Helpline: 1902`)}`,
    `URL:${item.official_source_url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadSchemeOpeningIcs(item: ReminderSchemeInput, lang: SupportedLanguage): void {
  const content = buildSchemeOpeningIcs(item, lang);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${item.scheme_code.toLowerCase()}-opens-alert.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadAnnualRenewalIcs(item: ReminderSchemeInput, lang: SupportedLanguage): void {
  const now = new Date();
  const nextYear = new Date(now);
  nextYear.setUTCFullYear(now.getUTCFullYear() + 1);
  nextYear.setUTCDate(now.getUTCDate() - 14);
  const nextDay = new Date(nextYear.getTime() + 24 * 60 * 60 * 1000);

  const name = lang === 'te' ? item.name_te : lang === 'hi' ? item.name_hi : item.name_en;
  const prefix =
    lang === 'te'
      ? 'క్లెయిమ్ సాథీ — వార్షిక పునరుద్ధరణ & e-KYC రిమైండర్'
      : lang === 'hi'
      ? 'क्लेम साथी — वार्षिक नवीनीकरण व e-KYC अनुस्मारक'
      : 'ClaimSaathi — Annual Renewal & e-KYC Check';
  const dtStamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const content = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ClaimSaathi//Annual Renewal Reminder//EN',
    'BEGIN:VEVENT',
    `UID:claimsaathi-renew-${item.scheme_id}-${Date.now()}@claimsaathi.local`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART;VALUE=DATE:${formatIcsDate(nextYear)}`,
    `DTEND;VALUE=DATE:${formatIcsDate(nextDay)}`,
    `SUMMARY:${escapeIcsText(`${prefix}: ${name}`)}`,
    `DESCRIPTION:${escapeIcsText(`Complete annual e-KYC / certificate check at Grama/Ward Sachivalayam so ${name} continues smoothly. Portal: ${item.official_source_url}`)}`,
    `URL:${item.official_source_url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${item.scheme_code.toLowerCase()}-annual-renewal.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface FollowUpStatusEvaluation {
  state: 'waiting_to_open' | 'just_opened' | 'in_sla_window' | 'sla_overdue' | 'sanctioned' | 'rejected' | 'prep';
  daysSinceSubmission: number | null;
  slaDays: number;
}

export function evaluateFollowUpStatus(
  app: {
    stage: string;
    application_open_on?: string | null;
    submitted_at?: string | null;
    expected_sla_days?: number;
  },
  referenceDate: Date = new Date()
): FollowUpStatusEvaluation {
  const slaDays = app.expected_sla_days || 21;

  if (app.stage === 'sanctioned') {
    return { state: 'sanctioned', daysSinceSubmission: null, slaDays };
  }
  if (app.stage === 'rejected') {
    return { state: 'rejected', daysSinceSubmission: null, slaDays };
  }

  if (app.application_open_on) {
    const openDate = new Date(`${app.application_open_on}T00:00:00`);
    if (!Number.isNaN(openDate.getTime())) {
      if (referenceDate.getTime() < openDate.getTime()) {
        return { state: 'waiting_to_open', daysSinceSubmission: null, slaDays };
      }
      if (app.stage === 'upcoming_notify') {
        return { state: 'just_opened', daysSinceSubmission: null, slaDays };
      }
    }
  }

  if (
    app.submitted_at &&
    (app.stage === 'submitted' || app.stage === 'receipt_saved' || app.stage === 'verification_pending')
  ) {
    const subDate = new Date(app.submitted_at);
    if (!Number.isNaN(subDate.getTime())) {
      const daysElapsed = Math.floor(
        (referenceDate.getTime() - subDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysElapsed >= slaDays) {
        return { state: 'sla_overdue', daysSinceSubmission: daysElapsed, slaDays };
      }
      return { state: 'in_sla_window', daysSinceSubmission: daysElapsed, slaDays };
    }
  }

  return { state: 'prep', daysSinceSubmission: null, slaDays };
}
