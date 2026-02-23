import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import { initAnalytics, trackPage } from './utils/mixpanel';
import App from './App.tsx';
import './index.css';

// Initialize Sentry error monitoring (no-op when DSN is not configured)
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1, // 10% of transactions traced — free tier friendly
    integrations: [
      Sentry.browserTracingIntegration(),
    ],
  });
}

// Initialize Mixpanel analytics
initAnalytics();

// Track initial page load
trackPage('App Load');

const SentryApp = sentryDsn
  ? Sentry.withErrorBoundary(App, {
      fallback: (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
          <p className="text-slate-400 mb-6">Back-log hit an unexpected error. It's been reported.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors"
          >
            Reload app
          </button>
        </div>
      ),
    })
  : App;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SentryApp />
  </StrictMode>
);
