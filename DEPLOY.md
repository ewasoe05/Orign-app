# Deployment Guide

Use this guide to put the app online so you can access it from your phone or any PC — not just at home on `localhost`.

## Prerequisites

- A [GitHub](https://github.com) account
- A [Vercel](https://vercel.com) account (sign in with GitHub)
- A [Supabase](https://supabase.com) project (you likely already have one from local setup)

---

## 1. Push code to GitHub

If the repo is not on GitHub yet:

```bash
# From the project folder
git add .
git commit -m "Initial commit: Two-Year Goal Dashboard"
```

Create a **private** repo at [github.com/new](https://github.com/new) named `two-year-dashboard`, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/two-year-dashboard.git
git branch -M main
git push -u origin main
```

Or with GitHub CLI:

```bash
gh repo create two-year-dashboard --private --source=. --push
```

**Important:** `.env.local` is gitignored — your secrets never get pushed.

---

## 2. Create Supabase project (if not done)

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Open **SQL Editor** and run both migrations in order:
   - [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql)
   - [`supabase/migrations/002_fitness_customization.sql`](supabase/migrations/002_fitness_customization.sql)
3. Go to **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Common mistake: wrong Supabase URL

Use the **Project URL**, not the REST endpoint:

```env
# Correct
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co

# Wrong — causes "Invalid path specified in request URL"
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co/rest/v1/
```

4. Under **Authentication → Providers → Email**:
   - Email provider enabled
   - Turn **off** "Confirm email" for solo personal use

---

## 3. Deploy to Vercel

1. Sign in at [vercel.com](https://vercel.com) with GitHub
2. Click **Add New Project** → import `two-year-dashboard`
3. Before deploying, add **Environment Variables**:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://yourproject.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key (starts with `eyJ...`) |
| `ALLOWED_EMAIL` | Your email (blocks other signups) |

4. Click **Deploy**

You'll get a URL like `https://two-year-dashboard.vercel.app`.

---

## 4. Configure Supabase Auth for production

In Supabase → **Authentication → URL Configuration**:

| Setting | Value |
|---|---|
| **Site URL** | `https://your-app.vercel.app` |
| **Redirect URLs** | `https://your-app.vercel.app/**` |

Replace with your actual Vercel URL. Save changes.

For local dev, also add:

| Redirect URLs | `http://localhost:3000/**` |

---

## 5. Verify on phone (away from home)

1. Use cellular data or a network other than home Wi-Fi
2. Open your Vercel URL in the browser
3. Sign in with your allowed email
4. Confirm dashboard, debt, fitness, and review pages load
5. Log a test payment or workout — it should sync to the same Supabase data as local dev

### Add to Home Screen (optional)

Makes the app feel native on your phone:

- **iPhone:** Safari → Share → Add to Home Screen
- **Android:** Chrome → menu (⋮) → Add to Home Screen

The app includes a PWA manifest for a clean home screen icon.

---

## Local Development

```bash
cp .env.local.example .env.local
# Fill in Supabase credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Troubleshooting

| Problem | Fix |
|---|---|
| "Invalid path specified in request URL" on signup | Remove `/rest/v1/` from `NEXT_PUBLIC_SUPABASE_URL` |
| Login works locally but not on Vercel | Add Vercel URL to Supabase Redirect URLs; check env vars in Vercel dashboard |
| Signup blocked | `ALLOWED_EMAIL` must match the email you're using exactly |
| Blank page after deploy | Check Vercel deployment logs; ensure env vars are set for Production |
| Changes not showing | Redeploy on Vercel (auto-deploys on git push if connected) |
| No debt accounts after signup | Run SQL migrations in Supabase; sign out and back in |

---

## Cost

- **Vercel:** free tier (personal use)
- **Supabase:** free tier
- **GitHub:** free private repo

---

## Quick checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project imported and deployed
- [ ] All 3 env vars set on Vercel
- [ ] Supabase Site URL + Redirect URLs updated
- [ ] Tested on phone with cellular data
- [ ] Added to Home Screen (optional)
