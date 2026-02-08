import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initAnalytics, trackPage } from './utils/mixpanel';
import App from './App.tsx';
import './index.css';

// Initialize Mixpanel analytics
initAnalytics();

// Track initial page load
trackPage('App Load');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
