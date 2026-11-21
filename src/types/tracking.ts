// Application tracking record. Stored only in the browser (localStorage); no server, no login.

export type TrackedApplicationStatus = 'not_started' | 'in_progress' | 'submitted' | 'closed';

export interface TrackedApplication {
  schemeId: string;
  status: TrackedApplicationStatus;
  deadline: string | null; // ISO date, YYYY-MM-DD, or null if unknown
  updatedAt: string; // ISO timestamp
}
