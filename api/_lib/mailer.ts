// Simple Gmail / Standard SMTP Mailer using Open-Source Nodemailer
// Sends scheme start-date alerts, closing deadlines, recent government scheme updates,
// and unclaimed eligible sector digests directly to opt-in citizen Gmail addresses.

import nodemailer from 'nodemailer';

export interface DigestAlertItem {
  title: string;
  sector: string;
  startDate?: string | null;
  endDate?: string | null;
  officialUrl: string;
  summary: string;
}

export interface DeadlineEmailPayload {
  displayName: string;
  recipientEmail: string;
  upcomingOpenings: DigestAlertItem[];
  closingDeadlines: DigestAlertItem[];
  recentUpdates: DigestAlertItem[];
  unclaimedSectors: string[];
}

export interface EmailDispatchResult {
  sent: boolean;
  smtp_configured: boolean;
  subject: string;
  provider_message_id?: string;
  preview_html: string;
  message: string;
}

export function isValidGmailOrEmail(email: string): boolean {
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email.trim());
}

export function isSmtpConfigured(): boolean {
  return Boolean(process.env.SMTP_USER?.trim() && process.env.SMTP_PASS?.trim());
}

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderItemSectionHtml(heading: string, color: string, items: DigestAlertItem[]): string {
  if (items.length === 0) return '';
  const rows = items
    .map(
      (item) => `
      <div style="border:1px solid #e2e8f0;border-left:4px solid ${color};border-radius:8px;padding:12px;margin-bottom:10px;background:#ffffff;">
        <div style="font-size:14px;font-weight:700;color:#0f172a;">${escapeHtml(item.title)}</div>
        <div style="font-size:12px;color:#475569;margin-top:4px;">${escapeHtml(item.summary)}</div>
        <div style="font-size:12px;color:#1e293b;margin-top:6px;">
          ${item.startDate ? `<strong>Starts:</strong> ${escapeHtml(item.startDate)} &nbsp;|&nbsp; ` : ''}
          ${item.endDate ? `<strong>Closes:</strong> ${escapeHtml(item.endDate)} &nbsp;|&nbsp; ` : ''}
          <a href="${escapeHtml(item.officialUrl)}" style="color:#1f4e79;font-weight:700;">Official Portal &rarr;</a>
        </div>
      </div>`
    )
    .join('');

  return `<h2 style="font-size:15px;color:${color};margin:20px 0 8px 0;">${escapeHtml(heading)}</h2>${rows}`;
}

export function buildDeadlineDigestEmail(payload: DeadlineEmailPayload): {
  subject: string;
  html: string;
  text: string;
} {
  const totalCount =
    payload.closingDeadlines.length +
    payload.upcomingOpenings.length +
    payload.recentUpdates.length;

  const subject = `ClaimSaathi Alert: ${totalCount} Scheme Start Dates, Deadlines & Recent Govt Updates`;

  const unclaimedHtml =
    payload.unclaimedSectors.length > 0
      ? `<div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:12px;margin-top:16px;font-size:13px;color:#78350f;">
          <strong>Other Sectors You Are Still Likely Eligible For:</strong> ${escapeHtml(payload.unclaimedSectors.join(', '))}
        </div>`
      : '';

  const html = `
    <div style="font-family:Segoe UI,Arial,sans-serif;max-width:620px;margin:0 auto;background:#f8fafc;padding:20px;border-radius:12px;">
      <div style="background:#1f4e79;color:#ffffff;padding:16px 20px;border-radius:10px;">
        <div style="font-size:18px;font-weight:800;">ClaimSaathi Welfare Alerts</div>
        <div style="font-size:12px;opacity:0.9;margin-top:4px;">Start Dates • Closing Deadlines • Recent Government Scheme Updates</div>
      </div>
      <div style="padding:16px 4px;">
        <p style="font-size:14px;color:#0f172a;margin:0 0 10px 0;">Namaskaram <strong>${escapeHtml(payload.displayName)}</strong>,</p>
        <p style="font-size:13px;color:#334155;margin:0 0 12px 0;">Here are your latest Andhra Pradesh &amp; Central Government scheme dates and official updates. Apply free at your local Grama/Ward Sachivalayam—never pay middlemen.</p>
        ${renderItemSectionHtml('Closing Deadlines (Apply Before End Date)', '#b45309', payload.closingDeadlines)}
        ${renderItemSectionHtml('Upcoming Scheme Start Dates', '#047857', payload.upcomingOpenings)}
        ${renderItemSectionHtml('Recent Government Schemes & Policy Updates', '#1d4ed8', payload.recentUpdates)}
        ${unclaimedHtml}
        <p style="font-size:11px;color:#64748b;margin-top:20px;border-top:1px solid #e2e8f0;padding-top:12px;">
          Note: Eligibility indicators mean <strong>likely eligible</strong> based on public rules—final approval rests with official government authorities. AP Helpline: <strong>1902</strong>.
        </p>
      </div>
    </div>`;

  const textLines = [
    `ClaimSaathi Welfare Alerts for ${payload.displayName}`,
    '',
    ...payload.closingDeadlines.map(
      (i) => `[CLOSING] ${i.title} | End Date: ${i.endDate || 'Check portal'} | ${i.officialUrl}`
    ),
    ...payload.upcomingOpenings.map(
      (i) => `[OPENING] ${i.title} | Start Date: ${i.startDate || 'Open'} | ${i.officialUrl}`
    ),
    ...payload.recentUpdates.map((i) => `[UPDATE] ${i.title} | ${i.officialUrl}`),
    payload.unclaimedSectors.length > 0
      ? `\nOther Sectors You Are Still Likely Eligible For: ${payload.unclaimedSectors.join(', ')}`
      : '',
    '\nDisclaimer: Likely-eligible guidance only. AP Helpline: 1902.',
  ];

  return { subject, html, text: textLines.filter(Boolean).join('\n') };
}

export async function sendNotificationEmail(
  payload: DeadlineEmailPayload
): Promise<EmailDispatchResult> {
  const { subject, html, text } = buildDeadlineDigestEmail(payload);

  if (!isSmtpConfigured()) {
    return {
      sent: false,
      smtp_configured: false,
      subject,
      preview_html: html,
      message:
        'Email digest generated in preview mode. Set SMTP_USER and SMTP_PASS (Gmail App Password) in .env.local or Vercel Environment Variables to deliver live emails via Gmail SMTP.',
    };
  }

  const host = process.env.SMTP_HOST?.trim() || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER!.trim();
  const pass = process.env.SMTP_PASS!.trim();
  const from = process.env.SMTP_FROM?.trim() || `ClaimSaathi Alerts <${user}>`;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const info = await transporter.sendMail({
    from,
    to: payload.recipientEmail.trim(),
    subject,
    text,
    html,
  });

  return {
    sent: true,
    smtp_configured: true,
    subject,
    provider_message_id: info.messageId,
    preview_html: html,
    message: `Deadline & scheme alerts emailed successfully to ${payload.recipientEmail.trim()}.`,
  };
}
