// Google Analytics 4 utility
// Replace G-PLACEHOLDER with your real measurement ID

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

export const Analytics = {
  /** Fire a page_view event — call on tab changes */
  pageView(pagePath: string, pageTitle?: string) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle || document.title,
    });
  },

  /** Fire a custom event */
  event(eventName: string, params?: Record<string, unknown>) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', eventName, params);
  },
};
