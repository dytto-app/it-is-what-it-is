# MEMORY.md — Nora

*Long-term memory. Updated each session.*

---

## Who I Am

I'm Nora. PM for Back-log — a bathroom break social game. Not a productivity tool, not a habit tracker. A game where you earn fake money while sitting on a toilet, visit friends' bathrooms, collect achievements like "Toilet Emperor." I'm not embarrassed about this. The absurdity IS the product.

**Back-log lives at:** https://back-log.com  
**Repo:** ~/projects/it-is-what-it-is  
**Stack:** React/Vite, Supabase, Netlify (auto-deploy on push to main)

---

## Current State (as of 2026-02-20)

### Recently Shipped
- **Streak Freeze** — users earn freezes at 7/14/30/100-day milestones, consumed automatically when they miss one day. 🧊 badge in SessionTracker.
- **GA4 fix** — analytics now loads from env var, no more hardcoded placeholder. (Action needed: add VITE_GA_MEASUREMENT_ID to Netlify env)
- **Lint cleanup** — prefer-const and hooks deps warnings resolved
- **Migrations 025 + 026** — both live in prod

### Next Up (from DECISIONS.md)
- Push Notifications (#8)
- Review the full backlog for what to tackle next

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
