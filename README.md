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

## Deploy

See [DEPLOY.md](DEPLOY.md) for full Vercel + Supabase deployment instructions.

Set `ALLOWED_EMAIL` in production to restrict signup to your email only.

## Tech Stack

- Next.js 16, TypeScript, Tailwind CSS
- Supabase (Postgres + Auth)
- Recharts
