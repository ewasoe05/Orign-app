# Discovery — Implementation Plan v2

Written against the local repo on Aug 19, 2026 (branch `main` at the time of inspection). This maps plan v2 onto the actual App Router + Supabase codebase. **No feature code in this phase.**

---

## 1. Routing

Next.js 16 App Router under `src/app/`. Confirmed.

| Route | File | Kind |
|---|---|---|
| `/` | `src/app/page.tsx` | async Server Component |
| `/debt` | `src/app/debt/page.tsx` | async Server Component |
| `/savings` | `src/app/savings/page.tsx` | async Server Component |
| `/fitness` | `src/app/fitness/page.tsx` | async Server Component |
| `/business` | `src/app/business/page.tsx` | async Server Component |
| `/review` | `src/app/review/page.tsx` | async Server Component |
| `/plan` | `src/app/plan/page.tsx` | async Server Component |
| `/login` | `src/app/login/page.tsx` | Server Component (form is client) |
| `/signup` | `src/app/signup/page.tsx` | Server Component (form is client) |

Interactive islands are `"use client"` under `src/components/` (forms, charts, nav, habit strip). There are no `src/app/api/**` route handlers.

---

## 2. Data layer

**Supabase** (Postgres + Auth). No Prisma/Drizzle.

- Client: `@supabase/ssr` + `@supabase/supabase-js`
- Browser: `src/lib/supabase/client.ts`
- Server: `src/lib/supabase/server.ts` (`createServerClient` + cookies)
- Schema: `supabase/migrations/001_initial_schema.sql` … `005_plan_facts_trade.sql`
- Migrations: GitHub Action `.github/workflows/supabase-migrations.yml` runs `supabase db push` on push to `main` (secrets `SUPABASE_ACCESS_TOKEN` `sbp_…` and `SUPABASE_DB_PASSWORD`)

---

## 3. Mutations

**Server actions** (`"use server"` in `src/lib/actions/*`). No route handlers.

Client forms wrap them in `useActionState` because Next 16 form actions cannot return non-void unless wrapped.

**Example: log a debt payment**

1. `src/components/debt/payment-form.tsx` (client) submits `FormData` (`account_id`, `amount`, `payment_date`, `notes`).
2. `logPayment` in `src/lib/actions/debt.ts`:
   - `createClient()` → `auth.getUser()` (throws if missing)
   - `parseFloat(amount)` — **float dollars, not cents**
   - insert `debt_payments`
   - `current_balance = max(0, current_balance - amount)`, set `is_paid_off` if zero
   - `revalidatePath("/")` and `revalidatePath("/debt")`
3. No Zod. Validation is ad-hoc (`isNaN`, empty checks).

**Checklists on `/plan`:** yes — `PlanChecklist` renders **one `<form>` per item** (`src/components/plan/plan-checklist.tsx`). Each submit posts `item_key` to `togglePlanChecklist`. That is 22 forms on `/plan` today (5+5+11+1+1), not 27, because some duplicate checklists also live on feature pages.

---

## 4. Auth

- Supabase email/password
- Gate: `ALLOWED_EMAIL` in `signUp` (`src/lib/actions/auth.ts`)
- Session: cookies via `@supabase/ssr`
- Middleware `src/middleware.ts` → `updateSession`: unauthenticated users redirect to `/login`; authenticated users hitting `/login` or `/signup` redirect to `/`
- Server user id: `const { data: { user } } = await supabase.auth.getUser()` then `user.id`
- Every table has `user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE` plus RLS `auth.uid() = user_id`

---

## 5. Existing models (schema dump)

Money columns are `DECIMAL`, not integer cents. Dates are `DATE`. IDs are UUID.

**Core (`001`)**

- `user_settings` — `plan_start_date`, `monthly_debt_target`, `fitness_target`, `seeded`
- `debt_accounts` — `name`, `initial_balance`, `current_balance`, `interest_rate`, `priority`, `is_paid_off`. No `min_payment`. Citizens APR is `null` in seed.
- `debt_payments` — `account_id`, `amount`, `payment_date`, `notes`
- `workouts` — `workout_date`, `workout_type` (`lift|run|walk|floor`), `subtype`, `notes`, later `template_id`
- `lift_entries` — `exercise`, `weight`, `reps`, `sets`, later `sort_order`
- `run_entries` — `distance_miles`, `duration_minutes`
- `weekly_reviews` — five answer text columns

**Fitness customization (`002`)**

- `workout_templates`, `template_exercises`, `weekly_schedule`

**Phase 2 (`003`)**

- `savings_settings` — `starting_cash`, `down_payment_target` (milestones are **not** a table; they are constants)
- `savings_transactions` — `amount`, `kind` (`deposit|withdrawal`), `transaction_date`, `notes`
- `leads` — `lead_date`, `source`, `service`, `quoted_amount`, `status`, `why_lost`
- `google_reviews` — `review_date`, `notes`
- `habit_checkins` — `habit_key` (`training|business|money|eating`), `checkin_date`, unique `(user_id, habit_key, checkin_date)`. Binary hit/unhit. **No `level` (`full|floor|missed`).**
- `quarterly_reviews` — `quarter`, statuses, `what_changed`, `what_to_adjust`

**Full plan (`004` + `005`)**

- `plan_checklist` — `item_key`, `completed`, `completed_at`, unique `(user_id, item_key)`
- `credit_logs` — `score`, `log_date`, `notes`
- `body_logs` — `log_date`, `weight_lbs`, `protein_grams`, `notes`
- `plan_facts` — `expenses_include_car`, `employment_type`, `commission_years`, `clear_solutions_trade`

**Not a table:** personal records (derived from `lift_entries` in `getPersonalRecords`). Savings milestones (`SAVINGS_MILESTONES` in seed). Payoff schedule (`PAYOFF_SCHEDULE` in seed).

**Checklists (one catalog, five tracks)** — `PLAN_CHECKLIST` in `src/lib/seed.ts`:

| Track (`section`) | Keys |
|---|---|
| `first_two_weeks` | pull_credit_reports, resolve_disconnected, get_actual_aprs, setup_autopay, open_savings_account |
| `mortgage` | watch_columbus, talk_to_lender, no_new_credit, confirm_w2_1099, ask_fha_house_hack |
| `business` | gbp_claimed, review_engine, follow_up_rule, referral_program, reactivate_customers, nail_offer, paid_ads, nextdoor_facebook, service_plans, commission_in_writing, dad_conversation |
| `capacity` | mental_health_q1 |
| `credit_repair` | credit_repair_if_needed |

---

## 6. Checklist storage — shared rows, duplicated markup

**Same rows.** Item catalog is `PLAN_CHECKLIST`. Completion is `plan_checklist` keyed by `(user_id, item_key)`. `getPlanChecklist()` / `togglePlanChecklist()` are used by `/plan`, `/debt`, `/savings`, and `/business`. `revalidatePlan()` already revalidates all of those paths.

Checking "Autopay every minimum" (`setup_autopay`) on `/debt` **will** show checked on `/plan`. Counters are computed from the same array (`done/length` in `PlanChecklist`).

**What is duplicated:** the `<PlanChecklist>` JSX (title/description) and the static copy components (`PayoffRationale`, `DuplexCashPlan`, `BusinessTargets`, `FitnessTargetsCard`, `CreditTracker`) imported onto both `/plan` and the feature pages. Strings themselves mostly live once in `src/lib/seed.ts` (grep for `77% utilization` → only `src/lib/seed.ts`).

Phase 2 shrinks: no merge-of-checkmark-state migration. Work is (a) stop rendering the same interactive blocks on both surfaces, (b) optionally extract `content/plan.ts` from `seed.ts`.

---

## 7. Static content

Almost all in **`src/lib/seed.ts`**: `PAYOFF_SCHEDULE`, `QUARTERLY_PLAN`, `BUSINESS_QUARTER_TARGETS`, `DUPLEX_CASH_BREAKDOWN`, `STRENGTH_TARGETS`, `WEEKLY_REVIEW_QUESTIONS`, `PAYOFF_RATIONALE`, `STARTING_SNAPSHOT`, `HABIT_FLOOR_TABLE`, `FITNESS_PHASES`, `PLAN_CHECKLIST`, account seeds, savings milestones.

UI wrappers: `src/components/plan/plan-reference.tsx`. Payoff chart still plots `PAYOFF_SCHEDULE` via `src/lib/debt-schedule.ts` (not a live engine).

---

## 8. Charts

**Recharts** (`recharts` ^3.10.1).

- Payoff Progress: `src/components/debt/payoff-chart.tsx`
- Strength / run progress: `src/components/fitness/strength-chart.tsx`

---

## 9. Conventions

| Topic | Actual |
|---|---|
| Money | `DECIMAL` in Postgres, `number` + `Number()` in TS. Arithmetic is float. Display via `formatCurrency` / `formatCurrencyDetailed` (`Intl`). |
| Dates | Postgres `DATE`. App "today" is **local** via `formatLocalDate()` in `src/lib/utils.ts`. **Exception:** `logFloorHabit` uses `new Date().toISOString().slice(0, 10)` (UTC). Week starts Monday. |
| Validation | None (no Zod). Inline checks in actions. |
| Tests | **None.** No `*.test.ts`, no test script in `package.json`. |
| CSS | Tailwind 4. Shared `src/components/ui/{card,button,badge,input,label,select,textarea,progress}.tsx`. Dark zinc/emerald. |
| Date lib | `date-fns` already used in `debt-schedule.ts` and `quarterly.ts`. |
| State | No extra client store. Server components + server actions + `revalidatePath`. |

---

## How this adapts plan v2

### Phase 1 — Habit floors (still first, but the diagnosis changes)

The v2 write-up says the dashboard row has **no buttons**. In **this repo** `HabitsStrip` is a client component with a tap button per habit (`src/components/habits/habits-strip.tsx` → `toggleHabitFloor`). If production looked dead, likely causes: missing `habit_checkins` table (queries failed / empty), or a deploy before this component shipped.

What **is** broken vs the spec:

- Binary check-in only. No `full` / `floor` / `miss`. Table to extend or replace: `habit_checkins` → add `level` (do **not** invent a parallel `habit_logs` unless we migrate).
- Streak is consecutive hits; a single miss zeros it. Plan wants: floor counts, break only on **two consecutive misses**.
- `neverMissTwice` is `missedYesterday && !hitToday`. On a brand-new account yesterday was never logged, so **every card can show "Don't miss twice" on day one**. That matches "permanent decoration."
- Fitness `"Hit floor today"` writes a `workouts` row with `workout_type = 'floor'` (`logFloorHabit`) and **does not** write `habit_checkins`. Two parallel floor systems.
- Workout / lead / payment / protein do **not** mark habits full.

**Adaptation:** evolve `habit_checkins` (add `level`, keep unique `(user_id, habit_key, checkin_date)`). Wire `logFloorHabit`, `logWorkout`, `logPayment`, lead/follow-up, and protein-target logs into the same action. Do not create a second habits table.

### Phase 2 — Shared content (smaller than v2 assumed)

Checklists are already one table. Phase 2 is product, not data merge:

- `/plan` = narrative + one-time inputs (FICO, plan facts). Checklists can stay as read/toggle but should not be a second copy of day-to-day UI if we hide them on feature pages — **or** keep them on feature pages and drop the duplicates from `/plan`. Recommendation in v2 stands; implement by deleting duplicate mounts, not a new `checklists` table.
- Extract `src/lib/content/plan.ts` from `seed.ts` only if we want a split; today one module already holds the strings.

### Phase 3 — Projection engine

Map v2 names → repo:

| Plan | Repo |
|---|---|
| `balanceCents` | `Number(current_balance) * 100` at the boundary |
| `aprBps` | `interest_rate` is percent (`27` = 27%) |
| `priority` | `debt_accounts.priority` (tie at 1, gap at 4 — Phase 6) |
| `expenses_include_minimums` | `plan_facts.expenses_include_car` (same question, different name) |
| hardcoded table | `PAYOFF_SCHEDULE` + `getScheduleStatus` |

**Conflict:** v2 global rule "all money math in integer cents" vs existing DECIMAL dollars. **Proposal:** `lib/projection.ts` works in integer cents internally; convert at the action/UI boundary. Do not rewrite every column to `_cents` in the same PR unless we accept a wide migration. Add `min_payment` as `DECIMAL` to match `debt_accounts`, convert inside the engine.

`current_balance` already exists and is decremented on payment. It is **not** recomputed from payments + interest. Seed sets `current = initial`. Interest is never accrued in the DB.

`plan_facts.expenses_include_car` is stored and unused by any calculation.

### Phase 4 — Pace badge

Today: `getScheduleStatus` in `src/lib/debt-schedule.ts` — `onTrack` if `currentTotal <= monthEndTarget + 500`. Compared to **end-of-month** target. Badge in `src/components/dashboard/debt-hero.tsx`. Plan start is `2026-09-01`; before that, `getCurrentPlanMonth` is `1`, so **right now (Aug 2026) the badge is already Month 1 vs $21,846 vs $19,712 → Behind.** Matches the complaint.

### Phase 5 — Fitness PRs

No `personal_records` table. PRs = max `lift_entries.weight` per exercise name. Manual set requires a new table (or a `source: manual|session` row in a new `personal_records` table as specified). Auto-detect should insert there, not only scan lifts.

`logFloorHabit` UTC date bug should be fixed while touching fitness.

### Phase 6 — Priority + nav

- Priority is a column on `debt_accounts`, seeded `1,1,2,3,5`. Sort: `priority` then `current_balance` (`getDebtAccounts`).
- Mobile `src/components/layout/bottom-nav.tsx`: Home, Debt, Fit, Biz, Review. **No Savings, no Plan.** Desktop sidebar has all seven.
- Four outcome cards all `href="/plan"` (`four-outcomes.tsx`).

### Phase 7 — Reminders

No due-day column, no dismissible banners table, no service worker. `public/manifest.json` exists. Follow-up queue already computed in `src/lib/actions/business.ts`. Sunday review widget: `ReviewReminderWidget` on home if `getReviewDue()`.

---

## Suggested sequence (unchanged, with repo notes)

1. Phase 0 — this file
2. Phase 1 — extend `habit_checkins`, fix never-miss-twice, unify fitness floor
3. Phase 2 — delete duplicate mounts; optional `content/plan.ts`
4. Phase 6 — unique priorities + mobile nav + outcome links (engine needs clean priority)
5. Phase 4 — prorate badge in `debt-schedule.ts`
6. Phase 3 — `lib/projection.ts` + tests (use Node's built-in test runner first to avoid a new test framework dep; add Vitest only if needed)
7. Phase 5 — `personal_records` table + volume/protein streak
8. Phase 7 — reminders last

## Out of scope (confirmed)

Plaid, multi-user, export, redesign, MLS. The $1,800 emergency-fund vs down-payment overlap is a product call, not a code change in Phase 0.

## `/plan` purpose (for Phase 2)

Comment to add on the route when Phase 2 starts:

`/plan` is the narrative + one-time inputs (FICO, facts). Feature pages are the daily surface. Do not add a third copy of a checklist or tracker.
