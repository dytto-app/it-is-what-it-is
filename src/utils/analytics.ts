// Google Analytics 4 + Mixpanel unified analytics
import { track, trackPage } from './mixpanel';

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

export const Analytics = {
  /** Fire a page_view event — call on tab changes */
  pageView(pagePath: string, pageTitle?: string) {
    // GA4
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: pagePath,
        page_title: pageTitle || document.title,
      });
    }
    // Mixpanel
    trackPage(pageTitle || pagePath, { path: pagePath });
  },

  /** Fire a custom event */
  event(eventName: string, params?: Record<string, unknown>) {
    // GA4
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }
    // Mixpanel
    track(eventName, params);
  },
};
