// Pure deadline-reminder logic. No timers, no notifications, no network.
// Dates are YYYY-MM-DD and compared as UTC midnights to avoid timezone drift.

import { TrackedApplication } from '../types/tracking';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toUtcDay(isoDate: string): number {
  return Date.parse(`${isoDate}T00:00:00Z`) / MS_PER_DAY;
}

/**
 * Returns tracked applications whose deadline falls within [today, today + windowDays]
 * (both inclusive), excluding closed applications and applications with no deadline.
 * Past deadlines are not returned.
 */
export function dueReminders(
  apps: TrackedApplication[],
  todayIso: string,
  windowDays = 7,
): TrackedApplication[] {
  const today = toUtcDay(todayIso);
  if (Number.isNaN(today)) return [];

  return apps.filter((app) => {
    if (app.status === 'closed') return false;
    if (app.deadline === null) return false;
    const deadline = toUtcDay(app.deadline);
    if (Number.isNaN(deadline)) return false;
    const diff = deadline - today;
    return diff >= 0 && diff <= windowDays;
  });
}
