// Local Citizen Community Chat, Missing-Scheme Proposals & Escalation Types
// Guardrail: Coarse anonymous persona badges only—zero real names, phone numbers, or Aadhaar IDs.

import type { SchemeCategory } from './scheme';

export const ESCALATION_VOTE_THRESHOLD = 10;

export type EscalationTargetType =
  | 'ap_gsws_1902'
  | 'district_collectorate'
  | 'ngo_legal_aid';

export interface CommunityProposal {
  id: string;
  title: string;
  description: string;
  category: SchemeCategory;
  district: string; // 'All AP' or one of the 26 AP districts
  target_cohort: string;
  escalation_target: EscalationTargetType;
  author_persona_label: string; // e.g., "Daily-Wage Worker • Visakhapatnam"
  upvotes_count: number;
  escalation_threshold: number; // default 10
  is_validated: boolean;
  is_sample: boolean;
  created_at: string;
}

export interface CommunityChatMessage {
  id: string;
  district: string;
  topic_category: string;
  author_persona_label: string;
  message_body: string;
  helpful_count: number;
  linked_proposal_id?: string | null;
  is_sample: boolean;
  created_at: string;
}

export interface ProposalsListResponse {
  proposals: CommunityProposal[];
  escalation_threshold: number;
  data_source: 'neon' | 'seed_fallback';
}

export interface MessagesListResponse {
  messages: CommunityChatMessage[];
  data_source: 'neon' | 'seed_fallback';
}
