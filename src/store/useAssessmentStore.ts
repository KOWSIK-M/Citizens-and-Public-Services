import { useSyncExternalStore } from 'react';
import { EligibilityAssessmentResult } from '../types/eligibility';

const SESSION_KEY = 'claimsaathi_assessment_session_v2';

export interface AssessmentState {
  assessment: EligibilityAssessmentResult | null;
  isLoading: boolean;
  error: string | null;
  selectedCategory: string;
  selectedLevel: 'all' | 'central' | 'state';
}

const INITIAL_STATE: AssessmentState = {
  assessment: null,
  isLoading: false,
  error: null,
  selectedCategory: 'all',
  selectedLevel: 'all',
};

function loadInitialAssessment(): AssessmentState {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const saved = window.sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<AssessmentState>;
        return {
          ...INITIAL_STATE,
          ...parsed,
          isLoading: false,
        };
      }
    }
  } catch {
    // Ignore storage errors
  }
  return { ...INITIAL_STATE };
}

let assessmentState: AssessmentState = loadInitialAssessment();

const listeners = new Set<() => void>();

function updateAssessmentState(next: AssessmentState) {
  assessmentState = next;
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(assessmentState));
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

function getSnapshot(): AssessmentState {
  return assessmentState;
}

export function setGlobalAssessment(assessment: EligibilityAssessmentResult | null) {
  updateAssessmentState({
    ...assessmentState,
    assessment,
    error: null,
  });
}

export function resetAssessmentState() {
  updateAssessmentState({ ...INITIAL_STATE });
}

export function useAssessmentStore() {
  const state = useSyncExternalStore(subscribe, getSnapshot, () => INITIAL_STATE);

  const setAssessment = (assessment: EligibilityAssessmentResult | null) => {
    setGlobalAssessment(assessment);
  };

  const setLoading = (loading: boolean) => {
    updateAssessmentState({ ...assessmentState, isLoading: loading });
  };

  const setError = (error: string | null) => {
    updateAssessmentState({ ...assessmentState, error });
  };

  const setSelectedCategory = (category: string) => {
    updateAssessmentState({ ...assessmentState, selectedCategory: category });
  };

  const setSelectedLevel = (level: 'all' | 'central' | 'state') => {
    updateAssessmentState({ ...assessmentState, selectedLevel: level });
  };

  return {
    assessment: state.assessment,
    isLoading: state.isLoading,
    error: state.error,
    selectedCategory: state.selectedCategory,
    selectedLevel: state.selectedLevel,
    setAssessment,
    setLoading,
    setError,
    setSelectedCategory,
    setSelectedLevel,
    resetAssessment: resetAssessmentState,
  };
}
