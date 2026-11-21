// Privacy-First Application Tracking, Opening Alerts & Rejection Follow-Up Types
// Guardrails: Stored strictly in citizen's browser localStorage; zero Aadhaar, phone, or PII collected.

export type ApplicationStage =
  | 'upcoming_notify'
  | 'documents_prep'
  | 'submitted'
  | 'receipt_saved'
  | 'verification_pending'
  | 'sanctioned'
  | 'rejected';

export interface TrackedApplication {
  scheme_id: string;
  scheme_code: string;
  name_en: string;
  name_te: string;
  name_hi: string;
  benefit_summary_en: string;
  benefit_summary_te: string;
  benefit_summary_hi: string;
  official_source_url: string;
  status_check_url?: string;
  grievance_helpline?: string;
  application_open_on?: string | null;
  application_close_on?: string | null;
  deadline_label_en?: string;
  deadline_label_te?: string;
  deadline_label_hi?: string;
  stage: ApplicationStage;
  reference_note: string; // Optional non-PII note (e.g., "Submitted at Guntur Ward 4 Sachivalayam")
  added_at: string;
  updated_at: string;
  reminder_downloaded: boolean;
  // v3.0 Full Lifecycle Follow-Up Fields
  notify_when_opens?: boolean;
  submitted_at?: string | null;
  expected_sla_days?: number;
  outcome_checked_at?: string | null;
  rejection_reason_code?: string | null;
}
