# DECISIONS.md — Back-log

## Approved (Do These)

*None pending — all approved items shipped!*

### ✅ Accessibility: aria-labels (#21)
- **Priority:** Low (accessibility polish)
- **Status:** Done — shipped in commit b296159 (2026-02-14)
- **Details:**
  - Added aria-labels to session start/stop button
  - Navigation tabs now have aria-labels and aria-current
  - Profile, sign out, and keyboard shortcuts buttons labeled
  - Modal close buttons and share actions labeled
  - Full screen reader compatibility for interactive elements

### ✅ CSV Export Option (#17)
- **Priority:** Low (nice to have)
- **Status:** Done — shipped in commit dc0e828 (2026-02-13)
- **Details:**
  - Added CSV export alongside existing JSON export
  - Session History page has two export buttons: CSV and JSON
  - CSV format: date, start_time, end_time, duration_seconds, earnings
  - Profile still exports JSON (user profile + sessions)

### ✅ Code cleanup: remove debug console.logs
- **Priority:** Low (cleanup)
- **Status:** Done — shipped in commit aa3c110 (2026-02-13)
- **Details:**
  - Removed Mixpanel initialization console.log
  - Cleaned up share modal error logging

## Completed

### ✅ Haptic Feedback on Mobile (#18)
- **Priority:** Low (polish)
- **Status:** Done — shipped in commit 3da3c1b (2026-02-12)
- **Details:**
  - Added haptics.ts utility using navigator.vibrate() API
  - Session start: short pulse (50ms)
  - Session end: double pulse pattern (50, 30, 50)
  - Achievement unlock: celebration pattern (100, 30, 100, 30, 100)
  - Graceful degradation on unsupported devices

### ✅ Session Rate Limit Feedback (#16)
- **Priority:** Low (bug fix)
- **Status:** Done — shipped in commit c840adb (2026-02-12)
- **Details:**
  - Added cooldownRemaining state with countdown timer
  - Shows animated amber warning indicator when rate limited
  - Displays countdown ("Wait Xs before starting")
  - Disappears when cooldown completes

### ✅ Keyboard Shortcut Hints (#15)
- **Priority:** Low (UX polish)
- **Status:** Done — shipped in commit a0cc480 (2026-02-11)
- **Details:**
  - Added KeyboardShortcutsModal component with all shortcuts listed
  - "?" button in header (desktop only) opens modal
  - Shift+? keyboard shortcut also opens modal
  - Clean modal UI with kbd-styled keys
  - Shows "Desktop only · Disabled when typing" hint

## Pending (Need Ayaan's Input)

*None*

## Completed

### ✅ Keyboard Shortcuts (#12)
- **Priority:** Medium (UX)
- **Status:** Done — shipped in commit 876410a (2026-02-10)
- **Details:**
  - Space to start/stop session (on tracker tab)
  - 1-5 for quick tab navigation
  - Escape to close modals
  - Disabled when typing in inputs

### ✅ Confetti on Achievement Unlock (#11)
- **Priority:** Medium (delight)
- **Status:** Done — shipped in commit 3eb7954 (2026-02-10)
- **Details:**
  - Added canvas-confetti library (~3KB gzipped)
  - Rarity-based celebration effects
  - Common: simple burst, Rare: side cannons, Epic: double burst, Legendary: multi-burst explosion
  - Respects prefers-reduced-motion for accessibility

### ✅ Live Landing Page Stats (#10)
- **Priority:** Medium (social proof)
- **Status:** Done — shipped in commit fdbc6a5 (2026-02-09)
- **Details:**
  - Created `get_platform_stats()` RPC function for aggregate stats
  - Added AnimatedCounter component with smooth easing animation
  - Landing page now shows real user count, hours tracked, and total earnings
  - Graceful loading state while fetching
  - No auth required for public stats

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
