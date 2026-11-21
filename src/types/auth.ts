// Authentication, RBAC Authorization, Personalised Profile & Notifications Types

import type { CitizenProfile } from './profile';

export type UserRole = 'citizen' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  created_at?: string;
}

export interface PersistedUserProfile extends CitizenProfile {
  user_id?: string;
  gmail_address: string | null;
  email_notifications_enabled: boolean;
  updated_at?: string;
}

export interface SchemeNotificationItem {
  id: string;
  scheme_id: string | null;
  notification_type: 'recent_scheme' | 'window_opening' | 'deadline_closing' | 'policy_update';
  title_en: string;
  title_te: string;
  title_hi: string;
  body_en: string;
  body_te: string;
  body_hi: string;
  sector: string;
  start_date: string | null;
  end_date: string | null;
  official_url: string;
  published_at: string;
  is_read: boolean;
}

export interface SchemeWindowSchedule {
  id: string;
  scheme_code: string;
  category: string;
  status: string;
  name_en: string;
  name_te: string;
  name_hi: string;
  benefit_summary_en: string;
  benefit_summary_te: string;
  benefit_summary_hi: string;
  application_open_on: string | null;
  application_close_on: string | null;
  official_url: string;
}
