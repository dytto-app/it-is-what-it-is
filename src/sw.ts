/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

// Precache all static assets (injected by vite-plugin-pwa)
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Network-first for Supabase API calls
registerRoute(
  ({ url }) => url.hostname.includes('supabase.co'),
  new NetworkFirst({ cacheName: 'supabase-api-cache' })
);

// Handle navigation requests (SPA fallback)
registerRoute(
  new NavigationRoute(
    new NetworkFirst({ cacheName: 'pages', networkTimeoutSeconds: 3 })
  )
);

// ─── Push notification support ────────────────────────────────────────────────

// Handle push events from a push server (Phase 2: VAPID + Supabase Edge Function)
self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return;

  let payload: { title?: string; body?: string; tag?: string; url?: string } = {};
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'Back-log', body: event.data.text() };
  }

  const title = payload.title || 'Back-log';
  const options: NotificationOptions = {
    body: payload.body || '',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: payload.tag || 'backlog',
    data: { url: payload.url || '/' },
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Open app when notification is clicked
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  const url = (event.notification.data?.url as string) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      for (const client of clients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});

// ─── Scheduled streak reminders via postMessage ────────────────────────────

let streakReminderTimeout: ReturnType<typeof setTimeout> | null = null;

self.addEventListener('message', (event: ExtendableMessageEvent) => {
  const data = event.data as {
    type: string;
    delayMs?: number;
    streakDays?: number;
    title?: string;
    body?: string;
    tag?: string;
  };

  if (data.type === 'SCHEDULE_STREAK_REMINDER') {
    // Clear any existing reminder
    if (streakReminderTimeout !== null) {
      clearTimeout(streakReminderTimeout);
      streakReminderTimeout = null;
    }

    const { delayMs = 0, title = 'Back-log', body = 'Time to take a break!', tag = 'streak-reminder' } = data;

    streakReminderTimeout = setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag,
        requireInteraction: false,
        data: { url: '/' },
      });
      streakReminderTimeout = null;
    }, delayMs);
  }

  if (data.type === 'CANCEL_STREAK_REMINDER') {
    if (streakReminderTimeout !== null) {
      clearTimeout(streakReminderTimeout);
      streakReminderTimeout = null;
    }
  }
});

// Skip waiting for immediate activation
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if ((event.data as { type: string })?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
