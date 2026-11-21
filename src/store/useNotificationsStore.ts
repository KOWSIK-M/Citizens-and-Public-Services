import { useSyncExternalStore } from 'react';
import { SchemeNotificationItem, SchemeWindowSchedule } from '@/types/auth';
import { getAuthHeaders, isUserAuthenticatedSnapshot } from './useAuthStore';

export interface NotificationsState {
  notifications: SchemeNotificationItem[];
  schemeWindows: SchemeWindowSchedule[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

let notificationsState: NotificationsState = {
  notifications: [],
  schemeWindows: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

const listeners = new Set<() => void>();

function commitNotifications(next: NotificationsState) {
  notificationsState = next;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): NotificationsState {
  return notificationsState;
}

export async function refreshNotificationsFromNeon(): Promise<void> {
  commitNotifications({ ...notificationsState, isLoading: true, error: null });
  try {
    const resp = await fetch('/api/notifications', {
      method: 'GET',
      credentials: 'include',
      headers: getAuthHeaders(),
    });
    if (!resp.ok) {
      const err = (await resp.json().catch(() => ({}))) as { message?: string };
      commitNotifications({
        ...notificationsState,
        isLoading: false,
        error: err.message || 'Unable to load notifications from Neon.',
      });
      return;
    }

    const data = (await resp.json()) as {
      notifications: SchemeNotificationItem[];
      scheme_windows: SchemeWindowSchedule[];
      unread_count: number;
    };
    commitNotifications({
      notifications: data.notifications || [],
      schemeWindows: data.scheme_windows || [],
      unreadCount: data.unread_count || 0,
      isLoading: false,
      error: null,
    });
  } catch {
    commitNotifications({
      ...notificationsState,
      isLoading: false,
      error: 'Unable to reach notifications API.',
    });
  }
}

export function useNotificationsStore() {
  const state = useSyncExternalStore(subscribe, getSnapshot, () => notificationsState);

  const markRead = async (notificationId: string) => {
    const updated = notificationsState.notifications.map((n) =>
      n.id === notificationId ? { ...n, is_read: true } : n
    );
    commitNotifications({
      ...notificationsState,
      notifications: updated,
      unreadCount: updated.filter((n) => !n.is_read).length,
    });

    if (isUserAuthenticatedSnapshot()) {
      await fetch('/api/notifications', {
        method: 'PATCH',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ notification_id: notificationId }),
      }).catch(() => undefined);
    }
  };

  const markAllRead = async () => {
    const updated = notificationsState.notifications.map((n) => ({ ...n, is_read: true }));
    commitNotifications({
      ...notificationsState,
      notifications: updated,
      unreadCount: 0,
    });

    if (isUserAuthenticatedSnapshot()) {
      await fetch('/api/notifications', {
        method: 'PATCH',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ mark_all: true }),
      }).catch(() => undefined);
    }
  };

  const sendDeadlineDigestToGmail = async (input: {
    gmail_address: string;
    display_name?: string;
    unclaimed_sectors?: string[];
  }): Promise<{
    ok: boolean;
    sent?: boolean;
    smtp_configured?: boolean;
    subject?: string;
    preview_html?: string;
    message: string;
  }> => {
    try {
      const resp = await fetch('/api/notifications/send-email', {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify(input),
      });
      const data = (await resp.json()) as {
        sent?: boolean;
        smtp_configured?: boolean;
        subject?: string;
        preview_html?: string;
        message?: string;
      };
      if (!resp.ok) {
        return { ok: false, message: data.message || 'Unable to send Gmail notification.' };
      }
      return {
        ok: true,
        sent: data.sent,
        smtp_configured: data.smtp_configured,
        subject: data.subject,
        preview_html: data.preview_html,
        message: data.message || 'Email processed.',
      };
    } catch {
      return { ok: false, message: 'Network error while dispatching SMTP email.' };
    }
  };

  return {
    notifications: state.notifications,
    schemeWindows: state.schemeWindows,
    unreadCount: state.unreadCount,
    isLoading: state.isLoading,
    error: state.error,
    refreshNotifications: refreshNotificationsFromNeon,
    markRead,
    markAllRead,
    sendDeadlineDigestToGmail,
  };
}
