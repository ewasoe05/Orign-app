# Vercel + Supabase Production Checklist

Copy-paste this when deploying. Fill in your values where marked.

## Vercel Environment Variables

Set these in Vercel → Project → Settings → Environment Variables (Production):

```
NEXT_PUBLIC_SUPABASE_URL=https://gpnazcsoyxwnhuefxofw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste from Supabase → Settings → API → anon public>
ALLOWED_EMAIL=waspeethan@gmail.com
```

**Do not** include `/rest/v1/` in the Supabase URL.

Apply to: Production, Preview, and Development (optional but recommended).

---

## Supabase Auth URL Configuration

Supabase → Authentication → URL Configuration:

| Field | Value (update after first Vercel deploy) |
|---|---|
| Site URL | `https://YOUR-APP.vercel.app` |
| Redirect URLs | `https://YOUR-APP.vercel.app/**` |
| Redirect URLs (local dev) | `http://localhost:3000/**` |

---

## After deploy

1. Open Vercel URL on phone (cellular, not home Wi-Fi)
2. Sign in with `waspeethan@gmail.com`
3. Add to Home Screen for quick access

Your Vercel URL will appear on the Vercel dashboard after the first successful deploy.
