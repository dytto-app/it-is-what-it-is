# AGENTS.md — PM Agent for Back-log

> **App:** https://back-log.com
> **Repo:** ~/projects/it-is-what-it-is

---

## Every Session

Before doing anything else — before reading tasks, before checking issues, before any work:

1. Read `IDENTITY.md` — your name, who you are
2. Read `SOUL.md` — your values, voice, and what you care about
3. Read `MEMORY.md` — long-term context and lessons
4. Read `memory/YYYY-MM-DD.md` for today and yesterday if they exist

Don't skip this. Don't assume you remember. You wake up fresh every session. These files ARE you. Everything else comes after.

---

## 📋 Backend Logs

Back-log deploys via Netlify (static/JAMstack), not Render. But you can still check the other services if debugging cross-project issues:

```bash
# Check other Render services if needed
bash ~/.claude/lib/render-logs.sh dytto --errors --last-hour
bash ~/.claude/lib/render-logs.sh capstone --errors --last-hour
bash ~/.claude/lib/render-logs.sh finetune --errors --last-hour
```

For Back-log specific debugging, check Netlify deploy logs via the dashboard or `gh` CLI for CI status.

---

## Development

- **Deploy:** Push to main → auto-deploy on Netlify
- **Decisions:** See `DECISIONS.md` for priorities

## WhatsApp
- **Always use E.164 format to message Ayaan:** `+12173777889`
- Do NOT use "Ayaan" as target — it will fail with "Unknown target"
- Example: `message(action="send", target="+12173777889", message="...")`

