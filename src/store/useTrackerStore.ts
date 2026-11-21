import { useSyncExternalStore } from 'react';
import { ApplicationStage, TrackedApplication } from '@/types/tracker';
import { GovernmentScheme } from '@/types/scheme';
import { SchemeMatchResult } from '@/types/eligibility';
import { inspectTextForPii } from '@/utils/piiValidator';
import { getAuthHeaders, isUserAuthenticatedSnapshot } from './useAuthStore';

const TRACKER_STORAGE_KEY = 'claimsaathi_tracked_apps_v2';
const DOC_CHECKS_STORAGE_KEY = 'claimsaathi_doc_checks_v2';

export interface TrackerState {
  trackedApplications: TrackedApplication[];
  checkedDocumentsByScheme: Record<string, Record<string, boolean>>;
}

function loadInitialTrackerState(): TrackerState {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedApps = window.localStorage.getItem(TRACKER_STORAGE_KEY);
      const savedDocs = window.localStorage.getItem(DOC_CHECKS_STORAGE_KEY);
      return {
        trackedApplications: savedApps ? (JSON.parse(savedApps) as TrackedApplication[]) : [],
        checkedDocumentsByScheme: savedDocs
          ? (JSON.parse(savedDocs) as Record<string, Record<string, boolean>>)
          : {},
      };
    }
  } catch {
    // Ignore storage read errors
  }
  return {
    trackedApplications: [],
    checkedDocumentsByScheme: {},
  };
}

let trackerState: TrackerState = loadInitialTrackerState();

const listeners = new Set<() => void>();

function commitTrackerState(next: TrackerState) {
  trackerState = next;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(
        TRACKER_STORAGE_KEY,
        JSON.stringify(trackerState.trackedApplications)
      );
      window.localStorage.setItem(
        DOC_CHECKS_STORAGE_KEY,
        JSON.stringify(trackerState.checkedDocumentsByScheme)
      );
    }
  } catch {
    // Ignore storage quota errors
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): TrackerState {
  return trackerState;
}

export function resetTrackerStoreForTests() {
  commitTrackerState({
    trackedApplications: [],
    checkedDocumentsByScheme: {},
  });
}

async function persistAppToNeon(app: TrackedApplication, checkedDocs: Record<string, boolean>) {
  if (!isUserAuthenticatedSnapshot()) return;
  try {
    await fetch('/api/applications', {
      method: 'POST',
      credentials: 'include',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        scheme_id: app.scheme_id,
        stage: app.stage,
        reference_note: app.reference_note,
        notify_when_opens: Boolean(app.notify_when_opens),
        submitted_at: app.submitted_at || null,
        rejection_reason_code: app.rejection_reason_code || null,
        reminder_downloaded: Boolean(app.reminder_downloaded),
        checked_documents: checkedDocs,
      }),
    });
  } catch {
    // Ignore transient network errors
  }
}

export async function syncApplicationsFromNeon(): Promise<void> {
  if (!isUserAuthenticatedSnapshot()) return;
  try {
    const resp = await fetch('/api/applications', {
      method: 'GET',
      credentials: 'include',
      headers: getAuthHeaders(),
    });
    if (!resp.ok) return;
    const data = (await resp.json()) as {
      applications?: Array<TrackedApplication & { checked_documents?: Record<string, boolean> }>;
    };
    if (!Array.isArray(data.applications)) return;

    const nextChecks: Record<string, Record<string, boolean>> = {
      ...trackerState.checkedDocumentsByScheme,
    };
    const apps: TrackedApplication[] = data.applications.map((row) => {
      if (row.checked_documents && typeof row.checked_documents === 'object') {
        nextChecks[row.scheme_id] = row.checked_documents;
      }
      const { checked_documents: _cd, ...rest } = row;
      return rest;
    });

    commitTrackerState({
      trackedApplications: apps,
      checkedDocumentsByScheme: nextChecks,
    });
  } catch {
    // Ignore
  }
}

export function useTrackerStore() {
  const state = useSyncExternalStore(subscribe, getSnapshot, () => trackerState);

  const trackSchemeFromResult = (
    item: SchemeMatchResult | GovernmentScheme,
    extra?: { status_check_url?: string; grievance_helpline?: string; notify_when_opens?: boolean }
  ) => {
    const schemeId = 'scheme_id' in item ? item.scheme_id : item.id;
    const exists = trackerState.trackedApplications.some((a) => a.scheme_id === schemeId);
    if (exists) return;

    const now = new Date().toISOString();
    const officialUrl =
      'official_source_url' in item ? item.official_source_url : item.source.source_url;
    const isUpcoming = item.status === 'not_yet_open';

    const newApp: TrackedApplication = {
      scheme_id: schemeId,
      scheme_code: item.scheme_code,
      name_en: item.name_en,
      name_te: item.name_te,
      name_hi: item.name_hi,
      benefit_summary_en: item.benefit_summary_en,
      benefit_summary_te: item.benefit_summary_te,
      benefit_summary_hi: item.benefit_summary_hi,
      official_source_url: officialUrl,
      status_check_url:
        extra?.status_check_url || ('status_check_url' in item ? item.status_check_url : undefined),
      grievance_helpline:
        extra?.grievance_helpline ||
        ('grievance_helpline' in item ? item.grievance_helpline : undefined),
      application_open_on: 'application_open_on' in item ? item.application_open_on : null,
      application_close_on: item.application_close_on,
      deadline_label_en: item.deadline_label_en,
      deadline_label_te: item.deadline_label_te,
      deadline_label_hi: item.deadline_label_hi,
      stage: isUpcoming ? 'upcoming_notify' : 'documents_prep',
      reference_note: '',
      added_at: now,
      updated_at: now,
      reminder_downloaded: false,
      notify_when_opens: extra?.notify_when_opens ?? isUpcoming,
      submitted_at: null,
      expected_sla_days: 'sla_days' in item && item.sla_days ? item.sla_days : 21,
      outcome_checked_at: null,
      rejection_reason_code: null,
    };

    commitTrackerState({
      ...trackerState,
      trackedApplications: [newApp, ...trackerState.trackedApplications],
    });
    void persistAppToNeon(newApp, trackerState.checkedDocumentsByScheme[schemeId] || {});
  };

  const untrackScheme = (schemeId: string) => {
    commitTrackerState({
      ...trackerState,
      trackedApplications: trackerState.trackedApplications.filter(
        (a) => a.scheme_id !== schemeId
      ),
    });
    if (isUserAuthenticatedSnapshot()) {
      void fetch(`/api/applications?scheme_id=${encodeURIComponent(schemeId)}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders(),
      }).catch(() => undefined);
    }
  };

  const updateApplicationStage = (schemeId: string, stage: ApplicationStage) => {
    const now = new Date().toISOString();
    let updatedApp: TrackedApplication | null = null;
    commitTrackerState({
      ...trackerState,
      trackedApplications: trackerState.trackedApplications.map((app) => {
        if (app.scheme_id !== schemeId) return app;
        const nextSubmittedAt =
          (stage === 'submitted' || stage === 'receipt_saved' || stage === 'verification_pending') &&
          !app.submitted_at
            ? now
            : app.submitted_at;
        updatedApp = {
          ...app,
          stage,
          submitted_at: nextSubmittedAt,
          outcome_checked_at:
            stage === 'sanctioned' || stage === 'rejected' ? now : app.outcome_checked_at,
          updated_at: now,
        };
        return updatedApp;
      }),
    });
    if (updatedApp) {
      void persistAppToNeon(updatedApp, trackerState.checkedDocumentsByScheme[schemeId] || {});
    }
  };

  const toggleOpeningAlert = (schemeId: string) => {
    const now = new Date().toISOString();
    let updatedApp: TrackedApplication | null = null;
    commitTrackerState({
      ...trackerState,
      trackedApplications: trackerState.trackedApplications.map((app) => {
        if (app.scheme_id !== schemeId) return app;
        updatedApp = { ...app, notify_when_opens: !app.notify_when_opens, updated_at: now };
        return updatedApp;
      }),
    });
    if (updatedApp) {
      void persistAppToNeon(updatedApp, trackerState.checkedDocumentsByScheme[schemeId] || {});
    }
  };

  const setRejectionReason = (schemeId: string, reasonCode: string) => {
    const now = new Date().toISOString();
    let updatedApp: TrackedApplication | null = null;
    commitTrackerState({
      ...trackerState,
      trackedApplications: trackerState.trackedApplications.map((app) => {
        if (app.scheme_id !== schemeId) return app;
        updatedApp = {
          ...app,
          stage: 'rejected',
          rejection_reason_code: reasonCode,
          outcome_checked_at: now,
          updated_at: now,
        };
        return updatedApp;
      }),
    });
    if (updatedApp) {
      void persistAppToNeon(updatedApp, trackerState.checkedDocumentsByScheme[schemeId] || {});
    }
  };

  const updateReferenceNote = (schemeId: string, rawNote: string): { hadPii: boolean } => {
    // Defense-in-depth: never store Aadhaar/phone/PAN even in local reference notes
    const piiResult = inspectTextForPii(rawNote);
    const safeNote = piiResult.sanitizedText.slice(0, 140);
    const now = new Date().toISOString();

    commitTrackerState({
      ...trackerState,
      trackedApplications: trackerState.trackedApplications.map((app) =>
        app.scheme_id === schemeId ? { ...app, reference_note: safeNote, updated_at: now } : app
      ),
    });

    return { hadPii: piiResult.hasPii };
  };

  const markReminderDownloaded = (schemeId: string) => {
    const now = new Date().toISOString();
    commitTrackerState({
      ...trackerState,
      trackedApplications: trackerState.trackedApplications.map((app) =>
        app.scheme_id === schemeId
          ? { ...app, reminder_downloaded: true, updated_at: now }
          : app
      ),
    });
  };

  const isSchemeTracked = (schemeId: string): boolean => {
    return state.trackedApplications.some((a) => a.scheme_id === schemeId);
  };

  const toggleDocumentChecked = (schemeId: string, docId: string) => {
    const currentForScheme = trackerState.checkedDocumentsByScheme[schemeId] || {};
    const nextForScheme = {
      ...currentForScheme,
      [docId]: !currentForScheme[docId],
    };
    commitTrackerState({
      ...trackerState,
      checkedDocumentsByScheme: {
        ...trackerState.checkedDocumentsByScheme,
        [schemeId]: nextForScheme,
      },
    });
  };

  const getCheckedDocuments = (schemeId: string): Record<string, boolean> => {
    return state.checkedDocumentsByScheme[schemeId] || {};
  };

  const clearAllTrackerData = () => {
    commitTrackerState({
      trackedApplications: [],
      checkedDocumentsByScheme: {},
    });
  };

  return {
    trackedApplications: state.trackedApplications,
    checkedDocumentsByScheme: state.checkedDocumentsByScheme,
    trackSchemeFromResult,
    untrackScheme,
    updateApplicationStage,
    toggleOpeningAlert,
    setRejectionReason,
    updateReferenceNote,
    markReminderDownloaded,
    isSchemeTracked,
    toggleDocumentChecked,
    getCheckedDocuments,
    clearAllTrackerData,
  };
}
