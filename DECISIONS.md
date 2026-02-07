# DECISIONS.md — Back-log

## Approved (Do These)

- **Streak Tracking (#3)** — Daily login streaks with achievements. Build it.
- **Leaderboard Cosmetics (#1)** — Show other users' equipped cosmetics on leaderboard. Monetization opportunity.
- **Social Sharing (#5)** — Share session results to social media. Viral growth potential.
- **PWA Support (#6)** — Make app installable on mobile with offline support.

## Pending (Need Ayaan's Input)

*None*

## Completed

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
