import { describe, it, expect } from 'vitest';
import { dueReminders } from '../reminders';
import { TrackedApplication } from '../../types/tracking';

// All dates and scheme ids are synthetic.
const TODAY = '2030-01-10';

function app(overrides: Partial<TrackedApplication>): TrackedApplication {
  return {
    schemeId: 'synthetic-scheme',
    status: 'in_progress',
    deadline: null,
    updatedAt: '2030-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('dueReminders', () => {
  it('counts a deadline that is today', () => {
    const result = dueReminders([app({ schemeId: 'a', deadline: '2030-01-10' })], TODAY);
    expect(result.map((r) => r.schemeId)).toEqual(['a']);
  });

  it('counts a deadline exactly 7 days away', () => {
    const result = dueReminders([app({ schemeId: 'a', deadline: '2030-01-17' })], TODAY);
    expect(result.map((r) => r.schemeId)).toEqual(['a']);
  });

  it('does not count a deadline 8 days away', () => {
    const result = dueReminders([app({ schemeId: 'a', deadline: '2030-01-18' })], TODAY);
    expect(result).toEqual([]);
  });

  it('never counts a null deadline', () => {
    const result = dueReminders([app({ schemeId: 'a', deadline: null })], TODAY);
    expect(result).toEqual([]);
  });

  it('never counts a closed application, even if due today', () => {
    const result = dueReminders(
      [app({ schemeId: 'a', status: 'closed', deadline: '2030-01-10' })],
      TODAY,
    );
    expect(result).toEqual([]);
  });

  it('does not count a past deadline', () => {
    const result = dueReminders([app({ schemeId: 'a', deadline: '2030-01-09' })], TODAY);
    expect(result).toEqual([]);
  });

  it('respects a custom window size', () => {
    const apps = [app({ schemeId: 'a', deadline: '2030-01-12' })];
    expect(dueReminders(apps, TODAY, 1)).toEqual([]);
    expect(dueReminders(apps, TODAY, 2).map((r) => r.schemeId)).toEqual(['a']);
  });
});
