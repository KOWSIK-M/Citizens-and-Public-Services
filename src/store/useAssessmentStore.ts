import { useState, useEffect } from 'react';
import { EligibilityAssessmentResult } from '../types/eligibility';

interface AssessmentState {
  assessment: EligibilityAssessmentResult | null;
  isLoading: boolean;
  error: string | null;
  selectedCategory: string;
  selectedLevel: 'all' | 'central' | 'state';
}

let assessmentState: AssessmentState = {
  assessment: null,
  isLoading: false,
  error: null,
  selectedCategory: 'all',
  selectedLevel: 'all',
};

const listeners = new Set<(state: AssessmentState) => void>();

function notify() {
  listeners.forEach((l) => l({ ...assessmentState }));
}

export function useAssessmentStore() {
  const [state, setState] = useState<AssessmentState>(assessmentState);

  useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  const setAssessment = (assessment: EligibilityAssessmentResult | null) => {
    assessmentState.assessment = assessment;
    assessmentState.error = null;
    notify();
  };

  const setLoading = (loading: boolean) => {
    assessmentState.isLoading = loading;
    notify();
  };

  const setError = (error: string | null) => {
    assessmentState.error = error;
    notify();
  };

  const setSelectedCategory = (category: string) => {
    assessmentState.selectedCategory = category;
    notify();
  };

  const setSelectedLevel = (level: 'all' | 'central' | 'state') => {
    assessmentState.selectedLevel = level;
    notify();
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
  };
}
