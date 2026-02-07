# DECISIONS.md — Back-log

## Approved (Do These)

- **Leaderboard Cosmetics (#1)** — Show other users' equipped cosmetics on leaderboard. Monetization opportunity.
- **Social Sharing (#5)** — Share session results to social media. Viral growth potential.
- **PWA Support (#6)** — Make app installable on mobile with offline support.

## Pending (Need Ayaan's Input)

*None*

## Completed

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
- **Note:** Migration needs to be run on Supabase. Streak achievements will appear in Achievements tab once unlocked.

### ✅ Forgot Password (#4)
- **Priority:** High (was PRIORITY)
- **Status:** Done — shipped in commit 302f46e (2026-02-07)
- **Details:**
  - Added `recovery_email` column to profiles (optional field)
  - Created `password_reset_tokens` table with secure token storage
  - Built Edge Function (`password-reset`) with three endpoints:
    - `/request` — sends reset link to recovery email (if set)
    - `/verify` — validates token before showing reset form
    - `/reset` — resets password with valid token
  - Added ForgotPassword component with username input
  - Added ResetPassword component for token validation + new password
  - Updated Auth.tsx with "Forgot Password?" link (login only)
  - Updated Profile.tsx with recovery email field
  - Added vercel.json for proper SPA routing on /reset-password
- **Note:** Requires RESEND_API_KEY env var in Supabase for email sending. Users must add a recovery email to their profile to use password reset.

### ✅ Add Sign Out Function
- **Priority:** High
- **Status:** Done — shipped in PR #83 (2026-02-04)
- **Details:** Added sign out button in two places: (1) LogOut icon in header top-right for quick access from any screen, (2) Dedicated "Account" section in Profile page with Sign Out button. Separated Account from Data Management for clearer UX.
- **Approved by:** Ayaan (2026-02-03)
