import { useSyncExternalStore } from 'react';
import { AuditLogEntry, GovernmentScheme, RuleOperator } from '@/types/scheme';
import type { SchemeListResponse } from '@/types/api';
import { evaluateDeterministicEligibility } from '@/services/deterministicEngine';
import { getConfirmedProfileSnapshot } from './useProfileStore';
import { setGlobalAssessment } from './useAssessmentStore';
import { getAuthHeaders, getAuthUserSnapshot } from './useAuthStore';

export interface SchemeRegistryState {
  schemes: GovernmentScheme[];
  auditLog: AuditLogEntry[];
  catalogStatus: 'idle' | 'loading' | 'ready' | 'error';
  catalogError: string | null;
}

let registryState: SchemeRegistryState = {
  schemes: [],
  auditLog: [],
  catalogStatus: 'idle',
  catalogError: null,
};

const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function syncActiveCitizenAssessment(schemes: GovernmentScheme[]) {
  const confirmed = getConfirmedProfileSnapshot();
  if (confirmed && schemes.length > 0) {
    setGlobalAssessment(evaluateDeterministicEligibility(confirmed, schemes));
  }
}

export async function loadSchemeCatalog(options?: {
  force?: boolean;
  includeUnpublished?: boolean;
}): Promise<void> {
  if (!options?.force && (registryState.catalogStatus === 'loading' || registryState.catalogStatus === 'ready')) {
    return;
  }

  // Keep existing schemes rendered during background refreshes so SchemeCatalogLayout does not unmount children!
  if (registryState.schemes.length === 0) {
    registryState = { ...registryState, catalogStatus: 'loading', catalogError: null };
    notifyListeners();
  }

  const request = new AbortController();
  const timeout = setTimeout(() => request.abort(), 15000);
  try {
    const query = options?.includeUnpublished ? '?include_unpublished=1' : '';
    const response = await fetch(`/api/schemes${query}`, {
      signal: request.signal,
      credentials: 'include',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errBody = (await response.json().catch(() => ({}))) as { message?: string };
      throw new Error(errBody.message || 'Neon scheme catalog request failed');
    }

    const catalog: SchemeListResponse = await response.json();
    if (!Array.isArray(catalog.schemes)) {
      throw new Error('Catalog response format is invalid');
    }

    syncActiveCitizenAssessment(catalog.schemes);
    registryState = {
      ...registryState,
      schemes: catalog.schemes,
      catalogStatus: 'ready',
      catalogError: null,
    };
  } catch (err) {
    registryState = {
      ...registryState,
      catalogStatus: 'error',
      catalogError:
        err instanceof Error ? err.message : 'Unable to load schemes from Neon PostgreSQL.',
    };
  } finally {
    clearTimeout(timeout);
  }

  notifyListeners();
}

export async function loadAdminAuditLog(): Promise<void> {
  try {
    const resp = await fetch('/api/admin/schemes', {
      method: 'GET',
      credentials: 'include',
      headers: getAuthHeaders(),
    });
    if (!resp.ok) return;
    const data = (await resp.json()) as { audit_log?: AuditLogEntry[] };
    if (Array.isArray(data.audit_log)) {
      registryState = { ...registryState, auditLog: data.audit_log };
      notifyListeners();
    }
  } catch {
    // Ignore when non-admin
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): SchemeRegistryState {
  return registryState;
}

export function getSchemesSnapshot(): GovernmentScheme[] {
  return registryState.schemes;
}

export function useSchemeStore() {
  const state = useSyncExternalStore(subscribe, getSnapshot, () => registryState);
  const authUser = getAuthUserSnapshot();

  const runAdminPatch = async (payload: Record<string, unknown>): Promise<boolean> => {
    const resp = await fetch('/api/admin/schemes', {
      method: 'PATCH',
      credentials: 'include',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!resp.ok) return false;
    await Promise.all([
      loadSchemeCatalog({ force: true, includeUnpublished: true }),
      loadAdminAuditLog(),
    ]);
    return true;
  };

  const updateRule = async (
    schemeId: string,
    ruleId: string,
    updates: { operator?: RuleOperator; value: string; reason_en?: string },
    sourceNote = 'Admin Rule Registry Live Update'
  ) => {
    return runAdminPatch({
      action: 'update_rule',
      scheme_id: schemeId,
      rule_id: ruleId,
      operator: updates.operator,
      value: updates.value,
      source_note: sourceNote,
    });
  };

  const verifySchemeSource = async (
    schemeId: string,
    _verifiedBy: string,
    goReference?: string
  ) => {
    return runAdminPatch({
      action: 'verify_source',
      scheme_id: schemeId,
      go_reference: goReference,
    });
  };

  const markSourcePending = async (
    schemeId: string,
    reasonNote = 'Flagged for G.O. re-verification'
  ) => {
    return runAdminPatch({
      action: 'mark_pending',
      scheme_id: schemeId,
      source_note: reasonNote,
    });
  };

  const toggleSchemePublished = async (schemeId: string) => {
    return runAdminPatch({
      action: 'toggle_published',
      scheme_id: schemeId,
    });
  };

  return {
    schemes: state.schemes,
    auditLog: state.auditLog,
    isAdminAuthenticated: authUser?.role === 'admin',
    catalogStatus: state.catalogStatus,
    catalogError: state.catalogError,
    reloadCatalog: loadSchemeCatalog,
    loadAdminAuditLog,
    updateRule,
    verifySchemeSource,
    markSourcePending,
    toggleSchemePublished,
  };
}
