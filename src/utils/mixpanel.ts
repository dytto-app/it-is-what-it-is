/**
 * Shared Mixpanel Analytics
 * Auto-initialized for 'backlog' app
 */

import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN = 'a15e150aa4fe879ffb226695b5f0a567';
const APP_NAME = 'backlog';

let initialized = false;

/**
 * Initialize Mixpanel analytics
 */
export function initAnalytics() {
  if (typeof window === 'undefined' || initialized) return;
  
  mixpanel.init(MIXPANEL_TOKEN, {
    debug: import.meta.env.DEV,
    track_pageview: false,
    persistence: 'localStorage',
  });
  
  mixpanel.register({
    app: APP_NAME,
    environment: import.meta.env.DEV ? 'development' : 'production',
  });
  
  initialized = true;
  console.log(`[Analytics] Mixpanel initialized for ${APP_NAME}`);
}

/**
 * Track a custom event
 */
export function track(event: string, properties: Record<string, unknown> = {}) {
  if (!initialized) return;
  
  mixpanel.track(event, {
    app: APP_NAME,
    ...properties,
    timestamp: Date.now(),
  });
}

/**
 * Track a page/screen view
 */
export function trackPage(page: string, properties: Record<string, unknown> = {}) {
  track('Page View', {
    page,
    url: typeof window !== 'undefined' ? window.location.href : null,
    referrer: typeof document !== 'undefined' ? document.referrer : null,
    ...properties,
  });
}

/**
 * Track an error
 */
export function trackError(error: string | Error, properties: Record<string, unknown> = {}) {
  track('Error', {
    error: typeof error === 'string' ? error : error.message,
    stack: error instanceof Error ? error.stack : null,
    ...properties,
  });
}

/**
 * Identify a user
 */
export function identify(userId: string, traits: Record<string, unknown> = {}) {
  if (!initialized) return;
  mixpanel.identify(userId);
  mixpanel.people.set({
    app: APP_NAME,
    ...traits,
  });
}

/**
 * Reset user identity (on logout)
 */
export function reset() {
  if (!initialized) return;
  mixpanel.reset();
}
