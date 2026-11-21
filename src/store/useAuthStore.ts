import { useSyncExternalStore } from 'react';
import { AuthUser, PersistedUserProfile } from '@/types/auth';
import { CitizenProfile } from '@/types/profile';
import { DEFAULT_PROFILE, setGlobalConfirmedProfile } from './useProfileStore';

const JWT_STORAGE_KEY = 'claimsaathi_jwt_token_v4';

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  persistedProfile: PersistedUserProfile | null;
  status: 'idle' | 'loading' | 'authenticated' | 'guest';
  error: string | null;
}

function loadStoredToken(): string | null {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage.getItem(JWT_STORAGE_KEY);
    }
  } catch {
    // Ignore storage read errors
  }
  return null;
}

let authState: AuthState = {
  user: null,
  token: loadStoredToken(),
  persistedProfile: null,
  status: 'idle',
  error: null,
};

const listeners = new Set<() => void>();

function commitAuth(next: AuthState) {
  authState = next;
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      if (next.token) {
        window.sessionStorage.setItem(JWT_STORAGE_KEY, next.token);
      } else {
        window.sessionStorage.removeItem(JWT_STORAGE_KEY);
      }
    }
  } catch {
    // Ignore storage errors
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): AuthState {
  return authState;
}

export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authState.token) {
    headers.Authorization = `Bearer ${authState.token}`;
  }
  return headers;
}

export function isUserAuthenticatedSnapshot(): boolean {
  return Boolean(authState.user);
}

export function getAuthUserSnapshot(): AuthUser | null {
  return authState.user;
}

function normalizePersistedProfile(raw: Record<string, unknown> | null): PersistedUserProfile | null {
  if (!raw) return null;
  return {
    ...DEFAULT_PROFILE,
    age_band: (raw.age_band as CitizenProfile['age_band']) || 'unknown',
    state_code: 'AP',
    district_code: typeof raw.district_code === 'string' ? raw.district_code : 'unknown',
    income_band: (raw.income_band as CitizenProfile['income_band']) || 'unknown',
    occupation_category:
      (raw.occupation_category as CitizenProfile['occupation_category']) || 'unknown',
    social_category: (raw.social_category as CitizenProfile['social_category']) || 'unknown',
    land_holding_band:
      (raw.land_holding_band as CitizenProfile['land_holding_band']) || 'unknown',
    language_pref: (raw.language_pref as CitizenProfile['language_pref']) || 'en',
    household_members: Array.isArray(raw.household_members) ? raw.household_members : [],
    has_school_student:
      (raw.has_school_student as CitizenProfile['has_school_student']) || 'unknown',
    has_college_student:
      (raw.has_college_student as CitizenProfile['has_college_student']) || 'unknown',
    is_widow_or_single_woman:
      (raw.is_widow_or_single_woman as CitizenProfile['is_widow_or_single_woman']) || 'unknown',
    has_disability: (raw.has_disability as CitizenProfile['has_disability']) || 'unknown',
    is_tenant_farmer_ccrc:
      (raw.is_tenant_farmer_ccrc as CitizenProfile['is_tenant_farmer_ccrc']) || 'unknown',
    has_white_ration_card:
      (raw.has_white_ration_card as CitizenProfile['has_white_ration_card']) || 'unknown',
    is_sample: false,
    user_id: typeof raw.user_id === 'string' ? raw.user_id : undefined,
    gmail_address: typeof raw.gmail_address === 'string' ? raw.gmail_address : null,
    email_notifications_enabled: raw.email_notifications_enabled !== false,
    updated_at: typeof raw.updated_at === 'string' ? raw.updated_at : undefined,
  };
}

export async function hydrateAuthSession(): Promise<void> {
  if (authState.status === 'loading') return;
  commitAuth({ ...authState, status: 'loading', error: null });

  try {
    const resp = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
      headers: getAuthHeaders(),
    });
    if (!resp.ok) {
      commitAuth({
        user: null,
        token: null,
        persistedProfile: null,
        status: 'guest',
        error: null,
      });
      return;
    }

    const data = (await resp.json()) as {
      user: AuthUser;
      profile: Record<string, unknown> | null;
    };
    const normalized = normalizePersistedProfile(data.profile);
    if (normalized) {
      setGlobalConfirmedProfile(normalized);
    }

    commitAuth({
      ...authState,
      user: data.user,
      persistedProfile: normalized,
      status: 'authenticated',
      error: null,
    });
  } catch {
    commitAuth({
      ...authState,
      user: null,
      persistedProfile: null,
      status: 'guest',
      error: null,
    });
  }
}

export function useAuthStore() {
  const state = useSyncExternalStore(subscribe, getSnapshot, () => authState);

  const register = async (input: {
    email: string;
    password: string;
    display_name: string;
    gmail_address?: string;
    email_notifications_enabled?: boolean;
    admin_invite_code?: string;
  }): Promise<{ ok: boolean; error?: string }> => {
    commitAuth({ ...authState, status: 'loading', error: null });
    try {
      const resp = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = (await resp.json()) as {
        token?: string;
        user?: AuthUser;
        profile?: Record<string, unknown> | null;
        message?: string;
      };
      if (!resp.ok || !data.user || !data.token) {
        const msg = data.message || 'Registration failed.';
        commitAuth({ ...authState, status: 'guest', error: msg });
        return { ok: false, error: msg };
      }

      const normalized = normalizePersistedProfile(data.profile || null);
      if (normalized) {
        setGlobalConfirmedProfile(normalized);
      }

      commitAuth({
        user: data.user,
        token: data.token,
        persistedProfile: normalized,
        status: 'authenticated',
        error: null,
      });
      return { ok: true };
    } catch {
      const msg = 'Unable to connect to Neon authentication service.';
      commitAuth({ ...authState, status: 'guest', error: msg });
      return { ok: false, error: msg };
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ ok: boolean; error?: string }> => {
    commitAuth({ ...authState, status: 'loading', error: null });
    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = (await resp.json()) as {
        token?: string;
        user?: AuthUser;
        profile?: Record<string, unknown> | null;
        message?: string;
      };
      if (!resp.ok || !data.user || !data.token) {
        const msg = data.message || 'Invalid email or password.';
        commitAuth({ ...authState, status: 'guest', error: msg });
        return { ok: false, error: msg };
      }

      const normalized = normalizePersistedProfile(data.profile || null);
      if (normalized) {
        setGlobalConfirmedProfile(normalized);
      }

      commitAuth({
        user: data.user,
        token: data.token,
        persistedProfile: normalized,
        status: 'authenticated',
        error: null,
      });
      return { ok: true };
    } catch {
      const msg = 'Unable to reach authentication server.';
      commitAuth({ ...authState, status: 'guest', error: msg });
      return { ok: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // Ignore network errors on logout
    }
    commitAuth({
      user: null,
      token: null,
      persistedProfile: null,
      status: 'guest',
      error: null,
    });
  };

  const savePersonalisedProfile = async (
    updates: Partial<PersistedUserProfile>
  ): Promise<{ ok: boolean; error?: string; profile?: PersistedUserProfile }> => {
    if (!authState.user) {
      return { ok: false, error: 'Please sign in first to save your personalised profile.' };
    }
    try {
      const resp = await fetch('/api/profile/me', {
        method: 'PUT',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...(authState.persistedProfile || DEFAULT_PROFILE),
          ...updates,
        }),
      });
      const data = (await resp.json()) as {
        profile?: Record<string, unknown>;
        message?: string;
      };
      if (!resp.ok || !data.profile) {
        return { ok: false, error: data.message || 'Unable to save profile to Neon.' };
      }

      const normalized = normalizePersistedProfile(data.profile)!;
      setGlobalConfirmedProfile(normalized);
      commitAuth({
        ...authState,
        persistedProfile: normalized,
      });
      return { ok: true, profile: normalized };
    } catch {
      return { ok: false, error: 'Network error while saving personalised profile.' };
    }
  };

  return {
    user: state.user,
    token: state.token,
    persistedProfile: state.persistedProfile,
    status: state.status,
    error: state.error,
    isAuthenticated: Boolean(state.user),
    isAdmin: state.user?.role === 'admin',
    hydrateSession: hydrateAuthSession,
    register,
    login,
    logout,
    savePersonalisedProfile,
  };
}
