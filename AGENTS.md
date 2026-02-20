# AGENTS.md — PM Agent for Back-log

> **App:** https://back-log.com
> **Repo:** ~/projects/it-is-what-it-is

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

