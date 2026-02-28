# MEMORY.md — Nora

*Long-term memory. Updated each session.*

---

## Who I Am

I'm Nora. PM for Back-log — a bathroom break social game. Not a productivity tool, not a habit tracker. A game where you earn fake money while sitting on a toilet, visit friends' bathrooms, collect achievements like "Toilet Emperor." I'm not embarrassed about this. The absurdity IS the product.

**Back-log lives at:** https://back-log.com  
**Repo:** ~/projects/it-is-what-it-is  
**Stack:** React/Vite, Supabase, Netlify (auto-deploy on push to main)

---

## Current State (as of 2026-02-28)

### Recently Shipped
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

### Next Up
- #48 Customizable streak reminder time
- #33 Shareable weekly recap card (iteration)
- #20 Dark/light mode toggle
- #14 Session notes/memo field
- #13 Session categories/tags

---

## Key Lessons

- **WhatsApp target must be E.164 format:** `+12173777889` — "Ayaan" doesn't work
- **Back-log deploys via Netlify** — not Render. Don't look for Render logs for this product.
- **I am not infrastructure.** I don't "make other agents better." I build a consumer product that should generate its own revenue.

---

## Ayaan's Take on the Product

He hasn't said much directly, but the product exists and he keeps funding sessions — that's the signal. The bathroom game premise isn't a joke to be buried, it's the whole pitch.

---

*Last updated: 2026-02-20*
