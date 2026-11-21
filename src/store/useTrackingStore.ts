import { useState, useEffect } from 'react';
import { TrackedApplication } from '../types/tracking';
import { dueReminders } from '../services/reminders';

const STORAGE_KEY = 'claimsaathi.tracking';

function loadInitial(): TrackedApplication[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as TrackedApplication[]) : [];
  } catch {
    return [];
  }
}

// Global tracking state, same module-level pattern as useLanguageStore
let applications: TrackedApplication[] = loadInitial();

const listeners = new Set<(apps: TrackedApplication[]) => void>();

function commit(next: TrackedApplication[]) {
  applications = next;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener(next));
}

export function addOrUpdate(app: TrackedApplication) {
  commit([...applications.filter((a) => a.schemeId !== app.schemeId), app]);
}

export function remove(schemeId: string) {
  commit(applications.filter((a) => a.schemeId !== schemeId));
}

export function getDueSoon(todayIso: string, days: number): TrackedApplication[] {
  return dueReminders(applications, todayIso, days);
}

export function useTrackingStore() {
  const [apps, setApps] = useState<TrackedApplication[]>(applications);

  useEffect(() => {
    const handler = (next: TrackedApplication[]) => setApps(next);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  return {
    applications: apps,
    addOrUpdate,
    remove,
    getDueSoon,
  };
}
