# DECISIONS.md — Back-log

## Approved (Do These)

*None pending — all approved items shipped!*

## Pending (Need Ayaan's Input)

*None*

## Completed

### ✅ PWA Support (#6)
- **Priority:** Medium (mobile experience)
- **Status:** Done — shipped in commit db3b804 (2026-02-08)
- **Details:**
  - Added vite-plugin-pwa with autoUpdate registration
  - Generated manifest.webmanifest with app metadata
  - Created PWA icons (192x192, 512x512) with gradient + emoji
  - Configured workbox for offline caching
  - Precaches all static assets (JS, CSS, HTML, images)
  - NetworkFirst strategy for Supabase API calls
  - App now installable on mobile with 'Add to Home Screen'

### ✅ Social Sharing (#5)
- **Priority:** Medium-high (viral growth)
- **Status:** Done — shipped in commit fcbfa67 (2026-02-08)
- **Details:**
  - Added ShareSessionModal component that appears after session ends
  - Canvas-based image generation with earnings, duration, streak
  - Web Share API for native mobile sharing (with image attachment)
  - Twitter/X share intent with @backlog_app mention
  - Copy to clipboard functionality
  - Download generated image as PNG
  - Streak count included if 3+ days

### ✅ Leaderboard Cosmetics (#1)
- **Priority:** High (monetization)
- **Status:** Done — shipped in commit 5e6fbbf (2026-02-08)
- **Details:** Other users' equipped cosmetics now display on the leaderboard

### ✅ Streak Tracking (#3)
- **Priority:** Medium (retention/engagement)
- **Status:** Done — shipped in commit ef27434 (2026-02-07)
- **Details:**
  - Added `current_streak`, `longest_streak`, `last_session_date` columns to profiles
  - Created 5 streak achievements: 3-day, 7-day, 14-day, 30-day, 100-day
  - Built `update_user_streak()` SQL function for atomic streak updates
  - Updated achievement system to support 'streak' type achievements
  - Added streak counter UI on SessionTracker with 🔥 emoji
  - Streak auto-updates after each session ends
  - Tracks both current and longest streak

### ✅ Forgot Password (#4)
- **Priority:** High
- **Status:** Done — shipped in commit 302f46e (2026-02-07)
- **Details:**
  - Added `recovery_email` column to profiles (optional field)
  - Created `password_reset_tokens` table with secure token storage
  - Built Edge Function (`password-reset`) with three endpoints
  - Added ForgotPassword and ResetPassword components
  - Updated vercel.json for proper SPA routing on /reset-password

### ✅ Add Sign Out Function
- **Priority:** High
- **Status:** Done — shipped in PR #83 (2026-02-04)
- **Details:** Added sign out button in header and Profile page
