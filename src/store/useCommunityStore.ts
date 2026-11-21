import { useSyncExternalStore } from 'react';
import {
  CommunityChatMessage,
  CommunityProposal,
  EscalationTargetType,
  MessagesListResponse,
  ProposalsListResponse,
} from '@/types/community';
import { SchemeCategory } from '@/types/scheme';
import { inspectTextForPii } from '@/utils/piiValidator';
import { getAuthHeaders } from './useAuthStore';

const VOTER_TOKEN_KEY = 'claimsaathi_voter_token_v1';
const VOTED_IDS_KEY = 'claimsaathi_voted_proposals_v1';

interface CommunityState {
  proposals: CommunityProposal[];
  messages: CommunityChatMessage[];
  votedProposalIds: Record<string, boolean>;
  dataSource: 'neon';
  isLoading: boolean;
  error: string | null;
}

function getOrCreateVoterToken(): string {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const existing = window.localStorage.getItem(VOTER_TOKEN_KEY);
      if (existing && existing.length >= 12) return existing;
      const generated = `anon-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
      window.localStorage.setItem(VOTER_TOKEN_KEY, generated);
      return generated;
    }
  } catch {
    // Ignore storage restrictions
  }
  return `anon-mem-${Math.random().toString(36).slice(2, 12)}`;
}

function loadVotedIds(): Record<string, boolean> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem(VOTED_IDS_KEY);
      if (saved) return JSON.parse(saved) as Record<string, boolean>;
    }
  } catch {
    // Ignore
  }
  return {};
}

let communityState: CommunityState = {
  proposals: [],
  messages: [],
  votedProposalIds: loadVotedIds(),
  dataSource: 'neon',
  isLoading: false,
  error: null,
};

const listeners = new Set<() => void>();

function commitState(next: CommunityState) {
  communityState = next;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(VOTED_IDS_KEY, JSON.stringify(next.votedProposalIds));
    }
  } catch {
    // Ignore
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): CommunityState {
  return communityState;
}

export function useCommunityStore() {
  const state = useSyncExternalStore(subscribe, getSnapshot, () => communityState);

  const refreshCommunityData = async () => {
    commitState({ ...communityState, isLoading: true, error: null });
    try {
      const [propResp, msgResp] = await Promise.all([
        fetch('/api/community/proposals', { credentials: 'include' }),
        fetch('/api/community/messages', { credentials: 'include' }),
      ]);

      if (!propResp.ok || !msgResp.ok) {
        commitState({
          ...communityState,
          isLoading: false,
          error:
            'Neon community tables are unavailable. Run database/migrations/002_community_and_proposals.sql & seeds/003_recent_schemes_and_notifications.sql.',
        });
        return;
      }

      const pJson = (await propResp.json()) as ProposalsListResponse;
      const mJson = (await msgResp.json()) as MessagesListResponse;

      commitState({
        ...communityState,
        proposals: (pJson.proposals || []).sort((a, b) => b.upvotes_count - a.upvotes_count),
        messages: mJson.messages || [],
        dataSource: 'neon',
        isLoading: false,
        error: null,
      });
    } catch {
      commitState({
        ...communityState,
        isLoading: false,
        error: 'Unable to reach Neon community API.',
      });
    }
  };

  const createProposal = async (input: {
    title: string;
    description: string;
    category: SchemeCategory;
    district: string;
    target_cohort: string;
    escalation_target: EscalationTargetType;
    author_persona_label: string;
    is_sample?: boolean;
  }): Promise<{ ok: boolean; error?: string; proposal?: CommunityProposal }> => {
    const piiCheck = inspectTextForPii(
      `${input.title}\n${input.description}\n${input.target_cohort}\n${input.author_persona_label}`
    );
    if (piiCheck.hasPii) {
      return {
        ok: false,
        error:
          'Personal IDs, Aadhaar, phone numbers, or bank numbers detected. Please remove sensitive numbers before submitting.',
      };
    }

    try {
      const resp = await fetch('/api/community/proposals', {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify(input),
      });
      const data = (await resp.json()) as { proposal?: CommunityProposal; message?: string };
      if (!resp.ok || !data.proposal) {
        return { ok: false, error: data.message || 'Unable to publish proposal to Neon.' };
      }

      commitState({
        ...communityState,
        proposals: [data.proposal, ...communityState.proposals],
        votedProposalIds: { ...communityState.votedProposalIds, [data.proposal.id]: true },
      });
      return { ok: true, proposal: data.proposal };
    } catch {
      return { ok: false, error: 'Network error while saving proposal to Neon.' };
    }
  };

  const upvoteProposal = async (proposalId: string): Promise<{ thresholdReached: boolean }> => {
    if (communityState.votedProposalIds[proposalId]) {
      const existing = communityState.proposals.find((p) => p.id === proposalId);
      return {
        thresholdReached: Boolean(
          existing && existing.upvotes_count >= existing.escalation_threshold
        ),
      };
    }

    const voterToken = getOrCreateVoterToken();
    try {
      const resp = await fetch('/api/community/proposals', {
        method: 'PATCH',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ proposal_id: proposalId, voter_token: voterToken }),
      });
      if (!resp.ok) return { thresholdReached: false };

      const json = (await resp.json()) as {
        proposal?: CommunityProposal;
        threshold_reached?: boolean;
      };
      if (json.proposal) {
        commitState({
          ...communityState,
          proposals: communityState.proposals
            .map((p) => (p.id === proposalId ? json.proposal! : p))
            .sort((a, b) => b.upvotes_count - a.upvotes_count),
          votedProposalIds: { ...communityState.votedProposalIds, [proposalId]: true },
        });
      }
      return { thresholdReached: Boolean(json.threshold_reached) };
    } catch {
      return { thresholdReached: false };
    }
  };

  const postChatMessage = async (input: {
    district: string;
    topic_category: string;
    author_persona_label: string;
    message_body: string;
    linked_proposal_id?: string | null;
  }): Promise<{ ok: boolean; error?: string }> => {
    const piiCheck = inspectTextForPii(`${input.message_body}\n${input.author_persona_label}`);
    if (piiCheck.hasPii) {
      return {
        ok: false,
        error:
          'Privacy Shield: Do NOT include Aadhaar, phone numbers, PAN, bank accounts, or email addresses in community chat.',
      };
    }

    try {
      const resp = await fetch('/api/community/messages', {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify(input),
      });
      const data = (await resp.json()) as { message?: CommunityChatMessage; error?: string };
      if (!resp.ok || !data.message) {
        return { ok: false, error: data.error || 'Unable to post message to Neon.' };
      }
      commitState({
        ...communityState,
        messages: [data.message, ...communityState.messages],
      });
      return { ok: true };
    } catch {
      return { ok: false, error: 'Network error while posting to Neon.' };
    }
  };

  const markMessageHelpful = async (messageId: string) => {
    try {
      const resp = await fetch('/api/community/messages', {
        method: 'PATCH',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ message_id: messageId }),
      });
      if (!resp.ok) return;
      const json = (await resp.json()) as { message?: CommunityChatMessage };
      if (json.message) {
        commitState({
          ...communityState,
          messages: communityState.messages.map((m) => (m.id === messageId ? json.message! : m)),
        });
      }
    } catch {
      // Ignore
    }
  };

  return {
    proposals: state.proposals,
    messages: state.messages,
    votedProposalIds: state.votedProposalIds,
    dataSource: state.dataSource,
    isLoading: state.isLoading,
    error: state.error,
    refreshCommunityData,
    createProposal,
    upvoteProposal,
    postChatMessage,
    markMessageHelpful,
  };
}
