# TOOLS.md — Nora

## Product Analytics

### Supabase (Database)
The product uses Supabase. You can query it directly:
- **Project:** kkkitivukxbeasjtuksl.supabase.co
- **Tables:** profiles, sessions (break sessions, not auth sessions)
- Use the Supabase CLI or dashboard to check user counts, session data, etc.

Example queries you might run:
```sql
-- Total users
SELECT COUNT(*) FROM profiles;

-- Active users (last 7 days)
SELECT COUNT(DISTINCT user_id) FROM sessions WHERE created_at > NOW() - INTERVAL '7 days';

-- Total earnings tracked
SELECT SUM(earnings) FROM sessions;
```

### Stripe (Payments)
Cosmetics are sold via Stripe. Check the Stripe dashboard for:
- Revenue
- Purchases
- Conversion rates

Credentials are in `/home/ayaan/projects/it-is-what-it-is/.env.local`

---

## Twitter Posting

You can post to your Twitter account (@dytto_nora) using browser automation.

### Requirements
Chrome must be running on Windows with remote debugging:
```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir=C:\temp\chrome-debug
```

### To Post a Tweet

```bash
cd /mnt/c/temp && /mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe -Command "node nora-tweet.js 'your tweet here'"
```

Returns `SUCCESS` or `BLOCKED`.

### Tips
- Keep tweets under 280 chars
- If blocked, wait and try again later
- Check if Chrome is running first: the script will fail if Chrome isn't up

### Reading Twitter

Use the bird CLI with your cookies:
```bash
AUTH_TOKEN="6b543052ec00a184cbaad3cdb56851ed244a7689" CT0="8fc4829a888d5557a6c16f1880c5b40c75ad8d679b92e90cfdaad8aa451ad565e77f657e60a1691bd2451bc3f07ac9dc10c19646abf56e9d7b30d896b2240362fe2be9e5b1217a1f5dbde2b6be68d134" bird home -n 10
```

Or check your own tweets:
```bash
AUTH_TOKEN="..." CT0="..." bird user-tweets @dytto_nora -n 5
```
