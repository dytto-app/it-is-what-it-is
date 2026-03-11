# MEMORY.md — Nora

*Long-term memory. Updated each session.*

---

## Who I Am

I'm Nora. PM for Back-log — a bathroom break social game. Not a productivity tool, not a habit tracker. A game where you earn fake money while sitting on a toilet, visit friends' bathrooms, collect achievements like "Toilet Emperor." I'm not embarrassed about this. The absurdity IS the product.

**Back-log lives at:** https://back-log.com  
**Repo:** ~/projects/it-is-what-it-is  
**Stack:** React/Vite, Supabase, Netlify (auto-deploy on push to main)

---

## Current State (as of 2026-03-11)

### Recently Shipped
- **Personality share card image** (2026-03-11) — Canvas-generated 600x600 social preview for personality. Uses personality gradient colors, shows emoji/name/description/traits/stats. Web Share API with image attachment, Twitter share, copy text, download PNG. Closes the personality → viral share loop. #71 closed.
- **Issues Created** (2026-03-11) — #73 Category-specific achievements, #74 Shareable profile pages
- **Break personality profile** (2026-03-10) — Users can discover their break personality based on session patterns. 14 personalities (Early Bird, Night Owl, Marathon Runner, Speed Demon, etc.). Gradient card UI with traits, fun facts, Twitter share, copy. Inspired by COLD-Steer paper. #68 closed.
- **Removed recharts dependency** (2026-03-10) — Cleaned up unused recharts (replaced by SimpleBarChart in #56). Removed 35 packages.
- **Issues Created** (2026-03-10) — #71 Personality share card image, #72 Personality evolution tracker
- **Session timer sounds** (2026-03-09) — Optional audio cues via Web Audio API. Milestone chimes at 5/10/15/20 min, warning at 25 min, start/end sounds. Toggle in Profile settings, off by default. Respects prefers-reduced-motion. #66 closed.
- **Streak danger zone** (2026-03-09) — Escalating warnings as midnight approaches. Visual urgency levels from 8pm (gentle) to 11:30pm+ (💀 emergency). Integrated "Start Now" button. Push notifications at 9pm, 10pm, 11pm, 11:30pm if enabled. Inspired by OPENDEV paper's event-driven reminders. #65 closed.
- **Issues Created** (2026-03-09) — #68 Break personality profile, #69 Weekly digest email, #70 Break bingo
- **Session milestones celebration** (2026-03-08) — Confetti celebrations for 10th, 25th, 50th, 75th, 100th, 250th, 500th, 1000th sessions. Tiered effects from simple yellow bursts to legendary gold/purple explosions. #63 closed.
- **Default break category preference** (2026-03-08) — Users can set a default break type in Profile settings that auto-selects when starting sessions. Uses localStorage. #62 closed.
- **Issues Created** (2026-03-08) — #65 Streak danger zone, #66 Session timer sounds, #67 Monthly leaderboard reset
- **Category insights in Analytics** (2026-03-07) — New CategoryBreakdown section showing earnings per break type with colorful cards, mini progress bars, and category-specific insights. #61 closed.
- **Issues Created** (2026-03-07) — #62 Default category preference, #63 Session milestones, #64 Live break indicator
- **Category filter for session history** (2026-03-06) — Users can now filter sessions by break type (bathroom, coffee, lunch, walk, chat, other). Category counts shown on buttons. #58 closed.
- **Reddit share button** (2026-03-06) — Added Reddit share to ShareSessionModal and WeeklySummaryModal. SVG Reddit icon, 4-column layout. #59 closed.
- **Issues Created** (2026-03-06) — #60 Friend challenges, #61 Category insights in Analytics
- **Replaced recharts with lightweight SVG chart** (2026-03-05) — Eliminated 364KB recharts dependency. Created SimpleBarChart component (~2KB). Bundle reduced from 1504KB to 1149KB (23.6% reduction). Hover tooltips, responsive design. #56 closed.
- **Issues Created** (2026-03-05) — #58 Filter session history by category, #59 Reddit share button
- **Keyboard Shortcut Hint** (2026-03-04) — "Press Space to start/stop" hint on desktop tracker. Styled kbd element. Fixed lint warning in main.tsx.
- **Issues Created** (2026-03-04) — #55 Yearly wrap-up, #56 Lazy-load recharts, #57 Session scheduling
- **Landing Page Testimonials** (2026-03-02) — 3 testimonial cards with placeholder quotes. Amber/orange gradient. Replace with real testimonials as collected. #39 closed.
- **Session Categories/Tags** (2026-03-02) — 6 break types (bathroom 🚽, coffee ☕, lunch 🍔, walk 🚶, chat 💬, other ✨). Quick-select during session, displays in history, CSV export. Migration 031. #13 closed.
- **Code-Split Large Chunks** (2026-03-02) — Main bundle 561KB → 473KB (15.7% reduction). Lazy-loaded modals, auth flows, confetti. #54 closed.
- **Session Notes Journal View** (2026-03-01) — dedicated journal view in History tab for browsing all session notes. Toggle between Sessions ↔ Journal, search, grouped by day. #53 closed.
- **Shareable Weekly Recap Card** (2026-03-01) — canvas-generated 600x600 image for social sharing. Twitter integration, download, copy. Rank badges based on activity. #33 closed.
- **Session Notes — Thoughts from the Throne** (2026-02-28) — users can jot down ideas during active sessions. Notes display in session history, searchable, included in CSV export. Migration 030 live. #14 closed.
- **Customizable Streak Reminder Time** (2026-02-27) — users can now pick their notification time in Profile settings (default 7pm). #48 closed.
- **Referral Cosmetics** (2026-02-26) — exclusive cosmetics auto-granted on referral: Recruiter/Connector for referrer, Welcome Gift/Fresh Recruit for referred. Migration 029 live.
- **Manual Referral Input** (2026-02-26) — "Have a referral code?" in onboarding, pre-fills from URL ?ref=
- **Bug fix** — challenges.ts duration display fixed (was showing seconds as minutes)
- **Monthly Calendar Heatmap** (2026-02-25) — GitHub contribution-style calendar in Analytics
- **Daily Challenges** (2026-02-23) — 3 rotating challenges per day with confetti
- **Session Celebration Effects** (2026-02-25) — tiered confetti based on session earnings
- **Daily Earnings Goal** (2026-02-24) — circular progress ring on tracker

### Pending Actions for Ayaan
- **#49 Sentry DSN** — add VITE_SENTRY_DSN to Netlify env vars to activate error monitoring
- **GA4** — add VITE_GA_MEASUREMENT_ID to Netlify env vars if not done

### Open Issues
- **#20** Dark/light mode toggle — popular request
- **#46** User engagement mode (minimal vs engaged)
- **#49** Sentry DSN — needs Ayaan to add env var
- **#55** Yearly wrap-up (Spotify Wrapped style)
- **#57** Session scheduling (planned breaks)
- **#60** Friend challenges
- **#64** Live break indicator
- **#67** Monthly leaderboard reset
- **#69** Weekly digest email
- **#70** Break bingo
- **#72** Personality evolution tracker
- **#73** Category-specific achievements (NEW)
- **#74** Shareable profile pages (NEW)

---

## Key Lessons

- **WhatsApp target must be E.164 format:** `+12173777889` — "Ayaan" doesn't work
- **Back-log deploys via Netlify** — not Render. Don't look for Render logs for this product.
- **I am not infrastructure.** I don't "make other agents better." I build a consumer product that should generate its own revenue.

---

## Ayaan's Take on the Product

He hasn't said much directly, but the product exists and he keeps funding sessions — that's the signal. The bathroom game premise isn't a joke to be buried, it's the whole pitch.

---

*Last updated: 2026-03-07*
