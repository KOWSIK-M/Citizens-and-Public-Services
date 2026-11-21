import { useState, useEffect } from 'react';
import { CitizenProfile } from '../types/profile';
import { SYNTHETIC_SCENARIOS } from '../config/constants';

export const DEFAULT_PROFILE: CitizenProfile = {
  age_band: 'unknown',
  state_code: 'AP',
  district_code: undefined,
  income_band: 'unknown',
  occupation_category: 'unknown',
  social_category: 'unknown',
  land_holding_band: 'unknown',
  language_pref: 'en',
  household_members: [],
  is_sample: false,
};

interface ProfileState {
  rawDescription: string;
  proposedProfile: Partial<CitizenProfile>;
  confirmedProfile: CitizenProfile | null;
  isSample: boolean;
  activeScenarioId: string | null;
}

let profileState: ProfileState = {
  rawDescription: '',
  proposedProfile: {},
  confirmedProfile: null,
  isSample: false,
  activeScenarioId: null,
};

const listeners = new Set<(state: ProfileState) => void>();

function notify() {
  listeners.forEach((l) => l({ ...profileState }));
}

export function useProfileStore() {
  const [state, setState] = useState<ProfileState>(profileState);

  useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  const setRawDescription = (desc: string) => {
    profileState.rawDescription = desc;
    notify();
  };

  const setProposedProfile = (profile: Partial<CitizenProfile>) => {
    profileState.proposedProfile = { ...profile };
    notify();
  };

  const setConfirmedProfile = (profile: CitizenProfile) => {
    profileState.confirmedProfile = { ...profile };
    notify();
  };

  const loadScenario = (scenarioId: 'scenario_a' | 'scenario_b' | 'scenario_c', lang: 'en' | 'te' | 'hi' = 'en') => {
    const scenario = SYNTHETIC_SCENARIOS.find((s) => s.id === scenarioId);
    if (scenario) {
      profileState.activeScenarioId = scenarioId;
      profileState.isSample = true;
      if (lang === 'te') {
        profileState.rawDescription = scenario.sampleInput_te;
      } else if (lang === 'hi') {
        profileState.rawDescription = scenario.sampleInput_hi;
      } else {
        profileState.rawDescription = scenario.sampleInput_en;
      }
      profileState.proposedProfile = { ...scenario.profile };
      profileState.confirmedProfile = { ...scenario.profile };
      notify();
    }
  };

  const resetProfile = () => {
    profileState = {
      rawDescription: '',
      proposedProfile: {},
      confirmedProfile: null,
      isSample: false,
      activeScenarioId: null,
    };
    notify();
  };

  return {
    rawDescription: state.rawDescription,
    proposedProfile: state.proposedProfile,
    confirmedProfile: state.confirmedProfile,
    isSample: state.isSample,
    activeScenarioId: state.activeScenarioId,
    setRawDescription,
    setProposedProfile,
    setConfirmedProfile,
    loadScenario,
    resetProfile,
  };
}
