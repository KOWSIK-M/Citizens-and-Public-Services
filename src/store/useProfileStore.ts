import { useSyncExternalStore } from 'react';
import { CitizenProfile } from '../types/profile';
import { ClarifyingQuestion } from '../types/api';
import { SYNTHETIC_SCENARIOS } from '../config/constants';
import { inspectTextForPii } from '../utils/piiValidator';

const SESSION_KEY = 'claimsaathi_profile_session_v2';

export const DEFAULT_PROFILE: CitizenProfile = {
  age_band: 'unknown',
  state_code: 'AP',
  district_code: 'unknown',
  income_band: 'unknown',
  occupation_category: 'unknown',
  social_category: 'unknown',
  land_holding_band: 'unknown',
  language_pref: 'en',
  household_members: [],
  has_school_student: 'unknown',
  has_college_student: 'unknown',
  is_widow_or_single_woman: 'unknown',
  has_disability: 'unknown',
  is_tenant_farmer_ccrc: 'unknown',
  has_white_ration_card: 'unknown',
  is_sample: false,
};

export interface ProfileState {
  rawDescription: string;
  proposedProfile: Partial<CitizenProfile>;
  confirmedProfile: CitizenProfile | null;
  extractedFields: string[];
  clarifyingQuestions: ClarifyingQuestion[];
  isSample: boolean;
  activeScenarioId: string | null;
  resetCounter: number;
}

const INITIAL_STATE: ProfileState = {
  rawDescription: '',
  proposedProfile: {},
  confirmedProfile: null,
  extractedFields: [],
  clarifyingQuestions: [],
  isSample: false,
  activeScenarioId: null,
  resetCounter: 0,
};

function loadInitialState(): ProfileState {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const raw = window.sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ProfileState>;
        return {
          ...INITIAL_STATE,
          ...parsed,
          // Defense-in-depth: ensure any hydrated text is PII-scrubbed
          rawDescription: parsed.rawDescription
            ? inspectTextForPii(parsed.rawDescription).sanitizedText
            : '',
        };
      }
    }
  } catch {
    // Ignore storage errors
  }
  return { ...INITIAL_STATE };
}

let profileState: ProfileState = loadInitialState();

const listeners = new Set<() => void>();

function persistSession(state: ProfileState) {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      // Never persist unredacted PII into sessionStorage
      const piiSafeDesc = inspectTextForPii(state.rawDescription).sanitizedText;
      window.sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          ...state,
          rawDescription: piiSafeDesc,
        })
      );
    }
  } catch {
    // Ignore quota / security errors
  }
}

function updateState(next: ProfileState) {
  profileState = next;
  persistSession(profileState);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): ProfileState {
  return profileState;
}

export function getConfirmedProfileSnapshot(): CitizenProfile | null {
  return profileState.confirmedProfile;
}

export function setGlobalConfirmedProfile(profile: CitizenProfile) {
  updateState({
    ...profileState,
    proposedProfile: { ...profile },
    confirmedProfile: { ...profile },
    isSample: Boolean(profile.is_sample),
  });
}

export function resetProfileState() {
  updateState({
    ...INITIAL_STATE,
    resetCounter: profileState.resetCounter + 1,
  });
}

export function useProfileStore() {
  const state = useSyncExternalStore(subscribe, getSnapshot, () => INITIAL_STATE);

  const setRawDescription = (desc: string, options?: { preserveSample?: boolean }) => {
    let nextIsSample = state.isSample;
    let nextScenarioId = state.activeScenarioId;

    if (!options?.preserveSample && state.activeScenarioId) {
      const sc = SYNTHETIC_SCENARIOS.find((s) => s.id === state.activeScenarioId);
      const matchesPreset =
        sc &&
        (desc.trim() === sc.sampleInput_en.trim() ||
          desc.trim() === sc.sampleInput_te.trim() ||
          desc.trim() === sc.sampleInput_hi.trim());
      if (!matchesPreset) {
        nextIsSample = false;
        nextScenarioId = null;
      }
    }

    updateState({
      ...profileState,
      rawDescription: desc,
      isSample: desc.trim() === '' ? false : nextIsSample,
      activeScenarioId: desc.trim() === '' ? null : nextScenarioId,
    });
  };

  const setExtractionOutput = (
    proposed: Partial<CitizenProfile>,
    extractedFields: string[] = [],
    clarifyingQuestions: ClarifyingQuestion[] = []
  ) => {
    updateState({
      ...profileState,
      proposedProfile: { ...proposed, is_sample: profileState.isSample },
      confirmedProfile: null, // Clear stale confirmed profile when new story is extracted
      extractedFields,
      clarifyingQuestions,
    });
  };

  const setProposedProfile = (profile: Partial<CitizenProfile>) => {
    updateState({
      ...profileState,
      proposedProfile: { ...profile },
    });
  };

  const setConfirmedProfile = (profile: CitizenProfile) => {
    updateState({
      ...profileState,
      proposedProfile: { ...profile },
      confirmedProfile: { ...profile },
    });
  };

  const loadScenario = (
    scenarioId: 'scenario_a' | 'scenario_b' | 'scenario_c',
    lang: 'en' | 'te' | 'hi' = 'en'
  ) => {
    const scenario = SYNTHETIC_SCENARIOS.find((s) => s.id === scenarioId);
    if (scenario) {
      const sampleText =
        lang === 'te'
          ? scenario.sampleInput_te
          : lang === 'hi'
          ? scenario.sampleInput_hi
          : scenario.sampleInput_en;

      updateState({
        ...profileState,
        activeScenarioId: scenarioId,
        isSample: true,
        rawDescription: sampleText,
        proposedProfile: { ...scenario.profile, language_pref: lang },
        confirmedProfile: { ...scenario.profile, language_pref: lang },
        extractedFields: [
          'age_band',
          'district_code',
          'income_band',
          'occupation_category',
          'land_holding_band',
          'social_category',
        ],
        clarifyingQuestions: [],
      });
    }
  };

  return {
    rawDescription: state.rawDescription,
    proposedProfile: state.proposedProfile,
    confirmedProfile: state.confirmedProfile,
    extractedFields: state.extractedFields,
    clarifyingQuestions: state.clarifyingQuestions,
    isSample: state.isSample,
    activeScenarioId: state.activeScenarioId,
    resetCounter: state.resetCounter,
    setRawDescription,
    setExtractionOutput,
    setProposedProfile,
    setConfirmedProfile,
    loadScenario,
    resetProfile: resetProfileState,
  };
}
