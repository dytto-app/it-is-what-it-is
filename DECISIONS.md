# DECISIONS.md — Back-log

## Approved (Do These)

### ✅ Streak Freeze (#92)
- **Priority:** Medium (retention)
- **Status:** Done — shipped in commit 2f5b0ff (2026-02-20)
- **Details:**
  - Migration 026_streak_freeze.sql: adds `streak_freezes` column to profiles
  - SQL: `update_user_streak()` now consumes a freeze when user misses exactly 1 day
  - Users earn a freeze at 7, 14, 30, 100-day streak milestones
  - Returns `freeze_consumed` / `freeze_granted` flags from RPC
  - SessionTracker: 🧊 badge shows freeze count next to 🔥 streak counter
  - Achievements page: freeze count + milestone hints
  - GA events for freeze earned/used
  - Migration deployed to prod on 2026-02-20 ✅

### ✅ Fix: GA4 Placeholder (#7)
- **Priority:** Low (analytics)
- **Status:** Done — shipped in commit 2426323 (2026-02-20)
- **Details:**
  - index.html now uses `%VITE_GA_MEASUREMENT_ID%` (Vite HTML env injection)
  - Loads GA dynamically only if env var is set; silently no-ops otherwise
  - **Action needed:** Add `VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX` to Netlify env vars

### ✅ Fix Lint Errors (#82)
- **Priority:** Low (cleanup)
- **Status:** Done — shipped in commit 2f5b0ff (2026-02-20)
- **Details:**
  - `prefer-const` error in calculations.ts fixed (`let weekBuckets` → `const`)
  - `react-hooks/exhaustive-deps` warning suppressed with eslint-disable comment

### ✅ Deploy Supabase migrations 025 + 026 (#41)
- **Priority:** High (activates features)
- **Status:** Done — both pushed to prod (2026-02-20)
- **Details:**
  - 025: already applied — `get_recent_activity()` RPC live, landing page social proof works
  - 026: pushed today — `streak_freezes` column + updated streak function — streak freeze fully live

### ✅ Push Notifications (#8 / #74 / #95)
- **Priority:** High (retention)
- **Status:** Done — shipped in commit 25c02c6 (2026-02-22)
- **Details:**
  - Contextual NotificationPrompt component: appears after share modal, once per user, streak-aware copy
  - Shows only if: not asked before, permission not denied, not already enabled
  - On accept: requests permission → enables → schedules tomorrow's streak reminder
  - On dismiss: marked as seen, suppressed permanently
  - On app init: schedules reminder if user has streak but no session yet today
  - Profile settings toggle already existed; this closes the discovery gap
  - All events tracked via GA (Notifications Enabled via Prompt, Prompt Dismissed)

### ✅ Weekly Earnings Summary (#42)
- **Priority:** Medium (retention + shareability)
- **Status:** Done — shipped in commit f978c3a (2026-02-22)
- **Details:**
  - WeeklySummaryModal: last week's total earnings, time, sessions, streak
  - Best break highlight, peak day stat, fun commentary line
  - Shows on Mondays when user has last-week sessions (once per week via localStorage)
  - Share button uses Web Share API with clipboard fallback
  - getISOWeek helper to key the seen-state per calendar week

### ✅ Streak Freeze Celebration (#40)
- **Priority:** Low (polish)
- **Status:** Done — shipped in commit a9db842 (2026-02-22)
- **Details:**
  - Added celebrateStreakFreeze() to confetti.ts — cyan/blue color scheme, side icicle effect
  - Fires from handleSessionEnd when streakResult.freezeGranted is true
  - Visual metaphor matches the 🧊 freeze badge

### ✅ First-Time User Tutorial (#34)
- **Priority:** Medium (retention)
- **Status:** Done — shipped in commit ad0aeb0 (2026-02-20)
- **Details:**
  - Created TutorialModal component with 3-step walkthrough
  - Shows after salary onboarding completion
  - Tracks completion in localStorage (shows once per user)
  - Mobile-friendly carousel with progress dots
  - Analytics event tracking for tutorial completion
  - Reduces cold-start churn by setting clear expectations

### ✅ Tech Debt: Remove Dead Leaderboard Prop (#35)
- **Priority:** Low (cleanup)
- **Status:** Done — shipped in commit 346e304 (2026-02-20)
- **Details:**
  - Removed unused `entries` prop from LeaderboardProps interface
  - Cleaned up App.tsx to remove `entries={[]}` call
  - Leaderboard fetches its own data; prop was never used

### ✅ Deploy Supabase migration 025_recent_activity (#32)
- **Priority:** Low (quick manual step)
- **Status:** Done — was already deployed to prod (confirmed 2026-02-20)
- **Details:** `get_recent_activity()` RPC is live. Landing page social proof stats are active.

### 🔲 Session History Pagination (#94)
- **Priority:** Medium (data visibility)
- **Status:** Done — shipped in commit 8446688 (2026-02-19)
- **Details:** Shows 10 sessions per page with Prev/Next. Previously capped at 6 sessions visible.

### 🔲 Streak Freeze (#92)
- **Priority:** Medium (retention)
- **Status:** Issue created, not started
- **Details:** Let users protect streaks with freeze mechanic (like Duolingo). Earn freezes via milestones.

### 🔲 Push Notifications (#95)
- **Priority:** High (retention)
- **Status:** Issue created, not started
- **Details:** Web Push API, streak-at-risk alerts first. PWA service worker already in place.

### 🔲 Referral System (#96)
- **Priority:** Medium (growth)
- **Status:** Issue created, not started
- **Details:** Unique referral codes, rewards for both referrer and new user.
- **Priority:** Low (quick manual step)
- **Status:** Migration written, needs `supabase db push` to prod
- **Details:** `get_recent_activity()` RPC. Landing page gracefully degrades until this is applied.

### ✅ Bug fixes: Delete All Data, Auth Flash, Active Session Warning (2026-02-19)
- **Priority:** High (trust, UX)
- **Status:** Done — shipped in commit 2c0acb5 (2026-02-19)
- **Details:**
  - Fixed #84: Delete All Data now actually deletes sessions, achievements, cosmetics from Supabase
  - Fixed #91: Auth loading state prevents landing page flash for returning users
  - Fixed #89: beforeunload warning when navigating away with active session

### ✅ Recent Activity Stats on Landing (#23)
- **Priority:** Medium (growth/marketing)
- **Status:** Done — shipped in commit 58d8b7a (2026-02-18)
- **Details:**
  - Added Supabase migration 025_recent_activity.sql with get_recent_activity() RPC
  - Landing page fetches users_this_week and sessions_today
  - Shows animated pulse badges ("X joined this week", "Y sessions today") above stats
  - Graceful degradation if migration not yet deployed

### ✅ Smart Session Insights + Welcome Back Modal (#31, #30)
- **Priority:** Medium (engagement/retention)
- **Status:** Done — shipped in commit ae00ac2 (2026-02-18)
- **Details:**
  - generateInsights() in calculations.ts: peak hour, best day, avg earnings, monthly pace, 7-day consistency, streak proximity, weekday/weekend split
  - Analytics "Your Patterns" card shows up to 3 personalized insights
  - WelcomeBackModal: shows on login after 3+ days away, estimates missed earnings, prompts re-engagement
  - Inspired by arxiv:2602.13134 (Awakening Dormant Users) + arxiv:2602.15012 (Cold-Start Personalization)

### ✅ PWA Install Prompt Banner (#25)
- **Priority:** Low-Medium (growth)
- **Status:** Done — shipped in commit 9d0129c (2026-02-17)
- **Details:**
  - Created InstallPrompt component with beforeinstallprompt listener
  - Shows banner after user completes 2+ sessions
  - Respects user dismissal (stored in localStorage)
  - Detects if already installed (display-mode: standalone)
  - Tracks install events via GA
  - Gradient design matching app aesthetic
  - Smooth slide-up animation

### ✅ Offline Indicator for PWA (#22)
- **Priority:** Low (UX polish)
- **Status:** Done — shipped in commit c914b50 (2026-02-17)
- **Details:**
  - Created OfflineIndicator component
  - Shows amber banner when offline: "You're offline — data will sync when connected"
  - Shows green banner briefly when back online: "Back online — syncing..."
  - Auto-hides after reconnection
  - Uses z-index 100 to appear above all content

### ✅ Achievement Progress Bars (#26)
- **Priority:** Low (UX polish)
- **Status:** Done — shipped in commit ff5e368 (2026-02-16)
- **Details:**
  - Calculate progress metrics from sessions (counts, earnings, time, streak)
  - Show progress bars for all trackable achievements (sessions, earnings, time, streak, special)
  - Format progress display based on achievement type ($X / $Y, Xh Ym / Yh, X / Y)
  - Show encouraging messages at milestones (25%, 50%, 75%)
  - Subtle gradient progress bar that visually indicates completion

### ✅ Skeleton Loading States (#28)
- **Priority:** Low (UX polish)
- **Status:** Done — shipped in commit 8b4bd4e (2026-02-16)
- **Details:**
  - Created Skeleton.tsx with reusable primitives (SkeletonPulse, SkeletonText, SkeletonCircle)
  - Added AnalyticsSkeleton matching Analytics page structure with chart placeholders
  - Added SessionHistorySkeleton with summary cards and session list
  - Added AchievementsSkeleton with progress bar and category navigation
  - Added LeaderboardSkeleton with entry cards and sort controls
  - Added ProfileSkeleton with settings sections
  - Each skeleton uses theme colors matching its page (emerald for history, yellow for achievements, etc.)
  - Replaced generic LoadingSpinner with context-aware skeletons for all lazy-loaded components

### ✅ Modal Focus Trap (#24)
- **Priority:** Low (accessibility)
- **Status:** Done — shipped in commit 61ff978 (2026-02-15)
- **Details:**
  - Created reusable `useFocusTrap` hook
  - Tab/Shift+Tab cycles through modal elements only
  - Focus moves to first element on modal open
  - Focus restores to previous element on modal close
  - Added proper ARIA attributes (role=dialog, aria-modal, aria-labelledby)
  - Applied to KeyboardShortcutsModal and ShareSessionModal

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

*None currently.*

## Up Next (Approved for Future Sessions)

### 🔲 Referral Cosmetic Rewards (#50)
- **Priority:** Medium (closes the referral incentive loop)
- **Status:** Filed 2026-02-25, not started
- **Details:** referral system is live but cosmetics aren't granted yet. Need DB trigger or function to grant exclusive cosmetic when apply_referral() succeeds.

### 🔲 Manual Referral Code Input (#51)
- **Priority:** Low (fallback for non-link referrals)
- **Status:** Filed 2026-02-25, not started
- **Details:** "Have a referral code?" optional field at end of onboarding.

### 🔲 Sentry DSN: Add to Netlify (#49)
- **Priority:** Medium (infrastructure — need production visibility)
- **Status:** Filed 2026-02-25, action on Ayaan
- **Details:** Code is wired, just needs VITE_SENTRY_DSN env var set in Netlify. Create Sentry project → copy DSN → add to Netlify → redeploy.

### ✅ Referral System (#9 / #96 / #76)
- **Status:** Done — shipped in commit 8a2ef18 (2026-02-25)
- **Details:** Migration 028 live (referrals table + apply_referral + get_user_by_referral_code RPCs). Profile shows code + copy + share. URL ?ref= capture → apply on onboarding. ensureReferralCode auto-generates for existing users.

### ✅ Session Completion Celebration (#37)
- **Status:** Done — shipped in commit 8a2ef18 (2026-02-25)
- **Details:** celebrateSessionEnd() — 4-tier scaled confetti. Personal record: gold side cannons. $10+/30min: large green burst. $5+/15min: medium. $1+/5min: subtle. Skips if streak freeze fires.

### ✅ Challenge History — 7-day grid (#47)
- **Status:** Done — shipped in commit 8a2ef18 (2026-02-25)
- **Details:** Collapsible in DailyChallenges. Reads from localStorage (no DB). 3 dots per day (filled = completed), perfect week badge, today highlighted in violet.

### ✅ Monthly Earnings Calendar (#29 / #52)
- **Status:** Done — shipped in commit d443b19 (2026-02-25)
- **Details:** GitHub contribution-style heatmap in Analytics. Quintile color scaling per user's data. Hover tooltips (earnings + count). Month navigation. Monthly total in header.

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
