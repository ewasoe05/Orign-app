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

## Supabase SQL (run in order)

If the Full Plan page errors on missing tables, run these in the SQL Editor:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_fitness_customization.sql`
3. `supabase/migrations/003_phase2.sql`
4. `supabase/migrations/004_full_plan.sql`
5. `supabase/migrations/005_plan_facts_trade.sql`

---

## After deploy

1. Open Vercel URL on phone (cellular, not home Wi-Fi)
2. Sign in with `waspeethan@gmail.com`
3. Add to Home Screen for quick access

Your Vercel URL will appear on the Vercel dashboard after the first successful deploy.
