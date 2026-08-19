# Two-Year Goal Dashboard

A personal web app to track your 2-year life plan: debt payoff, fitness, and weekly reviews.

## Features

- **Dashboard** — debt progress, monthly payments, fitness streak, review reminders
- **Debt Tracker** — 5 pre-seeded accounts, payment logging, payoff chart, 10-month schedule
- **Fitness Log** — workout/lift/run logging, floor habit, weekly calendar, strength targets
- **Weekly Review** — 5-question Sunday review with history

## Quick Start

```bash
npm install
cp .env.local.example .env.local
# Add Supabase credentials to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql) in the SQL Editor
3. Copy URL and anon key to `.env.local`

## Use anywhere (not just at home)

The app runs locally on your PC by default. To use it on your phone or any network:

1. Run `.\scripts\push-to-github.ps1` (logs into GitHub and pushes the repo)
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Follow [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md) for env vars and Supabase auth URLs

See [DEPLOY.md](DEPLOY.md) for the full guide.

## Tech Stack

- Next.js 16, TypeScript, Tailwind CSS
- Supabase (Postgres + Auth)
- Recharts
