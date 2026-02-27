/**
 * Notification utilities for Back-log
 * Handles Web Push permission, subscription management, and streak reminders.
 *
 * Architecture:
 * - Phase 1 (shipped): Permission UI + local scheduled notifications via SW
 * - Phase 2 (future): VAPID + Supabase Edge Function for true background push
 */

const NOTIFICATION_PREF_KEY = 'notificationsEnabled';
const STREAK_REMINDER_ALARM_KEY = 'streakReminderScheduledFor';
const STREAK_REMINDER_TIME_KEY = 'streakReminderTime';
const DEFAULT_REMINDER_TIME = '19:00'; // 7pm

export const NotificationUtils = {
  /** Is the Notification API supported? */
  isSupported(): boolean {
    return 'Notification' in window;
  },

  /** Current permission state */
  getPermission(): NotificationPermission | 'unsupported' {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  },

  /** Did the user opt in to notifications in our app settings? */
  isEnabled(): boolean {
    return localStorage.getItem(NOTIFICATION_PREF_KEY) === 'true';
  },

  setEnabled(enabled: boolean): void {
    localStorage.setItem(NOTIFICATION_PREF_KEY, enabled ? 'true' : 'false');
  },

  /** Get the user's preferred reminder time (HH:MM format, default 19:00) */
  getReminderTime(): string {
    return localStorage.getItem(STREAK_REMINDER_TIME_KEY) || DEFAULT_REMINDER_TIME;
  },

  /** Set the user's preferred reminder time (HH:MM format) */
  setReminderTime(time: string): void {
    localStorage.setItem(STREAK_REMINDER_TIME_KEY, time);
    // Clear scheduled reminder so it reschedules with new time
    localStorage.removeItem(STREAK_REMINDER_ALARM_KEY);
  },

  /** Request notification permission from the browser */
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;

    const result = await Notification.requestPermission();
    return result === 'granted';
  },

  /** Show a notification immediately (for testing or in-session alerts) */
  show(title: string, options?: NotificationOptions): void {
    if (!this.isSupported() || Notification.permission !== 'granted') return;
    // Use SW to show notification if available (works even when tab is backgrounded)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(sw => {
        sw.showNotification(title, {
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          ...options,
        }).catch(() => {
          // Fallback to basic Notification
          new Notification(title, { icon: '/pwa-192x192.png', ...options });
        });
      });
    } else {
      new Notification(title, { icon: '/pwa-192x192.png', ...options });
    }
  },

  /**
   * Schedule a streak reminder for the user's preferred time if they haven't had a session today.
   * Uses service worker postMessage to persist the schedule.
   *
   * Call this at the end of each session, or when the app loads with an active streak.
   */
  scheduleStreakReminder(streakDays: number): void {
    if (!this.isEnabled() || Notification.permission !== 'granted') return;
    if (!('serviceWorker' in navigator)) return;

    // Parse user's preferred reminder time (HH:MM)
    const reminderTime = this.getReminderTime();
    const [hours, minutes] = reminderTime.split(':').map(Number);

    // Schedule for today if it's before the reminder time, otherwise tomorrow
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
    if (target.getTime() <= now.getTime()) {
      // Past the reminder time — schedule for tomorrow
      target.setDate(target.getDate() + 1);
    }

    const delayMs = target.getTime() - now.getTime();
    const scheduledFor = target.toISOString();

    // Don't reschedule if already scheduled for this slot
    const alreadyScheduled = localStorage.getItem(STREAK_REMINDER_ALARM_KEY);
    if (alreadyScheduled === scheduledFor) return;

    localStorage.setItem(STREAK_REMINDER_ALARM_KEY, scheduledFor);

    navigator.serviceWorker.ready.then(sw => {
      sw.active?.postMessage({
        type: 'SCHEDULE_STREAK_REMINDER',
        delayMs,
        streakDays,
        title: `🔥 ${streakDays}-day streak at risk`,
        body: "Don't forget to take a break today — your streak is counting on it.",
        tag: 'streak-reminder',
      });
    });
  },

  /** Cancel any pending streak reminder (call when user completes a session) */
  cancelStreakReminder(): void {
    localStorage.removeItem(STREAK_REMINDER_ALARM_KEY);
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.ready.then(sw => {
      sw.active?.postMessage({ type: 'CANCEL_STREAK_REMINDER' });
    });
  },
};
