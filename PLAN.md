# Two-Year Goal Dashboard — Implementation Plan v2

**For:** Cursor (agent mode)
**Repo:** the Next.js App Router app deployed at `origin-app-kohl.vercel.app`
**Supersedes:** plan v1. Re-derived from the live app on Aug 19, 2026 after the Savings, Business, and Full Plan pages shipped.
**How to use:** one phase per PR, in the order given. Do not start a phase until the previous one is merged. Stop at the end of each phase and report what changed.

---

## What changed since v1

Shipped since the last plan, and no longer in scope:

- **`/business`** — leads, closes, quoted/won, commission estimate, day 2/7/21 follow-up queue, Google reviews counter, quarterly residential targets, 11-item systems checklist. This covers v1's Phase 1 and goes past it.
- **`/savings`** — cash on hand, $30K down payment progress, four duplex milestones, mortgage prep checklist, deposit/withdrawal log.
- **`/plan`** — the full two-year narrative, quarterly one-page plan, budget figures, habit floors, first-two-weeks checklist, FICO tracker, open-questions form.
- **Dashboard** — four-outcome header, Habit Floors row, Toward Down Payment card, Business This Week card.
- **`/fitness`** — body weight + protein logging, Aug 2028 body targets.
- **`/debt`** — first-two-weeks checklist, FICO tracker, payoff-order rationale, credit repair track.
- **`/review`** — quarterly checkpoint.

Still open from v1, and carried forward below: the payoff engine, the pace-aware badge, reminders, manual PR entry, and the priority-4 gap.

**The app roughly doubled in surface area without the underlying model changing.** Everything is still hardcoded projections and static balances, and there are now four pages presenting numbers that all descend from the same handful of assumptions. That coupling is the theme of this plan.

---

## Phase 0 — Discovery (do this first, write no feature code)

This plan was written from the outside by inspecting the deployed app. It describes **what to build and why**, not the file names in this repo. Before touching anything, produce a short `DISCOVERY.md` answering:

1. **Routing.** Confirm App Router. List route files for `/`, `/debt`, `/savings`, `/fitness`, `/business`, `/review`, `/plan`. Which are server components?
2. **Data layer.** Database and client (Prisma/Drizzle/Supabase/other)? Where is the schema? How are migrations run?
3. **Mutations.** Server actions or route handlers? Walk one example end to end (e.g. "Log payment") — validation, write, revalidation. Note: `/plan` renders 27 separate `<form>` elements, so checklist items are almost certainly one form per item. Confirm.
4. **Auth.** What provides the session? How does a server component get the user id? Is every table user-scoped?
5. **Existing models.** Dump the schema for: accounts/debts, payments, savings transactions, savings milestones, leads, workouts, workout templates, weekly schedule, reviews, quarterly checkpoints, body/protein logs, FICO entries, and **every checklist** (first-two-weeks, mortgage prep, residential systems, capacity, credit repair).
6. **Checklist storage — answer this precisely.** Are the checklists on `/plan` the *same rows* as the ones on `/debt`, `/savings`, and `/business`, or duplicated copies? This determines the size of Phase 2. Test it: check "Autopay every minimum" on `/debt`, then load `/plan` and see whether it is checked there.
7. **Static content.** Where do the hardcoded strings live — the 10-month payoff table, the quarterly plan, the residential targets, the body targets, the duplex cash breakdown? One constants module, or inline per page?
8. **Charts.** Which library renders "Payoff Progress" and "Strength Progress"?
9. **Conventions.** Money as cents-integer or decimal? Date type? Is "today" computed in UTC or user-local? Validation library? Tests, and how they run? Tailwind? Shared card/stat-tile components, or repeated styling?

**Then adapt every phase below to those answers.** Where this plan names a table, column, or component, map it onto the repo's actual conventions rather than introducing a second style. If a phase conflicts with what you find, say so and propose an alternative before implementing.

### Global rules for every phase

- Match existing naming, formatting, and file layout. No new state library, styling approach, or date library.
- All money math in integer cents. Never do currency arithmetic in floats.
- All new tables user-scoped, with the same auth guard as existing tables.
- Every page and mutation must work with **zero data** — that is the app's current state everywhere.
- No new npm dependency without justifying it in the PR description.
- Typecheck, lint, and build clean before a phase is done.

---

## Phase 1 — Habit Floors are dead controls (fix first)

### Why
The dashboard's Habit Floors row shows four habits — Training, Business, Money, Eating — each reading `0 day streak · 0/7 this week`, badged "Don't miss twice." **The block contains no buttons, inputs, or links.** I checked the rendered DOM: zero interactive elements.

The only floor-logging control anywhere in the app is "Hit floor today" on `/fitness`. `/business`, `/savings`, and `/debt` have none. So three of the four habit streaks are structurally incapable of ever leaving zero.

This matters more than anything else here. `/plan` states the design principle: *"the plan must work on your worst weeks, not just your best ones. Hit the floor. Never miss twice."* Habit Floors is the mechanism for that principle, and it is currently a picture of a mechanism. Every other item in this plan is an improvement; this one is a feature that doesn't work.

### Scope

1. **Data model.** `habit_logs`: `id`, `user_id`, `habit` (enum: `training` | `business` | `money` | `eating`), `date`, `level` (enum: `full` | `floor` | `missed`), `note` (nullable), `created_at`. Unique on `(user_id, habit, date)` so a day can be re-marked, not duplicated.
2. **Make the dashboard row interactive.** Each habit card gets a three-state control for today: Full / Floor / Miss. Tapping writes a `habit_log` and updates the streak in place. This is the single highest-traffic control in the app — it should be one tap from the dashboard, no navigation.
3. **Streak rules — define them explicitly and document them in a code comment.** Proposed: a day counts toward the streak at `full` *or* `floor` (that is the entire point of a floor). The streak breaks only on two consecutive missed days — matching "never miss twice" literally, rather than breaking on a single miss.
4. **The "never miss twice" alert.** When a habit has exactly one missed day immediately prior, the card switches to an amber "Don't miss twice — today matters" state. Right now the badge says this permanently, which makes it decoration. It should fire only when true.
5. **Seven-day strip.** Replace `0/7 this week` with seven small day dots per habit, in the same visual language as the fitness week strip. Filled = full, hollow = floor, empty = miss, dim = future.
6. **Wire up the existing control.** "Hit floor today" on `/fitness` should write a `training` floor log through the same path, not a parallel one. Delete any separate fitness-floor state.
7. **Per-page full-credit actions.** Logging a workout marks Training `full`. Logging a lead or follow-up marks Business `full`. Logging an extra payment marks Money `full`. Eating needs its own control — put it on `/fitness` next to the protein log, since protein is already tracked there (`170g/day` target); hitting the protein target should mark Eating `full` automatically.

### Acceptance
- All four habits can be marked from the dashboard with one tap and no page navigation.
- Marking Training `full` from the dashboard and logging a workout on `/fitness` do not produce two rows for the same day.
- A streak survives a single missed day and breaks on the second consecutive one.
- The "Don't miss twice" badge is absent on a clean streak and present after exactly one miss.

---

## Phase 2 — One source of truth for shared content

### Why
`/plan` duplicates content that also lives on the feature pages. By my count, at least ten blocks appear in two places:

| Block | Appears on |
|---|---|
| "Why this payoff order" | `/plan`, `/debt` |
| "First two weeks" checklist (5 items) | `/plan`, `/debt` |
| FICO tracker | `/plan`, `/debt` |
| "Credit repair (if needed)" (1 item) | `/plan`, `/debt` |
| "$30,000 duplex cash" breakdown | `/plan`, `/savings` |
| "Mortgage prep" checklist (5 items) | `/plan`, `/savings` |
| "Residential targets" (5 quarters) | `/plan`, `/business` |
| "Residential business" checklist (11 items) | `/plan`, `/business` |
| "Aug 2028 body targets" | `/plan`, `/fitness` |
| Sunday review questions (5) | `/plan`, `/review` |

Two failure modes follow. If the checklists are duplicated rows, checking an item in one place leaves it unchecked in the other and the `0/5 done` counters disagree — the app quietly lies about progress. If they are shared rows but duplicated markup, then every copy edit has to be made twice and they will drift. Phase 0 question 6 tells you which you are dealing with.

### Scope

1. **Extract static content to a single module** — `content/plan.ts` or similar. The quarterly plan, residential targets, duplex cash breakdown, body targets, review questions, payoff-order rationale, budget figures. One export per block, imported by both the feature page and `/plan`. No string appears in two files.
2. **One `checklists` table, one component.** `checklist_items` seeded with a stable `key` per item and a `track` (`first_two_weeks` | `mortgage_prep` | `residential` | `capacity` | `credit_repair`), plus `checklist_state` rows keyed by `(user_id, item_key)`. Both `/plan` and the feature page render the same `<ChecklistTrack track="..." />` against the same state. Checking anywhere checks everywhere.
3. **Migration.** If duplicated state already exists, merge it: an item is checked if it is checked in *either* copy. Do not silently drop a checkmark.
4. **Decide what `/plan` is for.** Recommendation: `/plan` becomes the read-oriented narrative view — full text, all checklists rendered but rolled up by track, and the FICO tracker and open-questions form *only* here since they are one-time inputs. The feature pages keep the interactive day-to-day surface. Whatever you decide, write it in a comment at the top of the `/plan` route so the next change doesn't re-fork it.

### Acceptance
- Checking "Autopay every minimum" on `/debt` shows it checked on `/plan` immediately, and both counters read `1/5`.
- Grepping for a distinctive content string (e.g. "77% utilization") returns exactly one source file.

---

## Phase 3 — The projection engine

### Why
Four pages now display projections, and **they are all downstream of the same two or three numbers, none of which are computed.**

Everything on `/debt` is a hardcoded 10-month table. Account cards still read `Started at $X` equal to the current balance, so nothing moves when a payment is logged. And now `/savings` milestones sit *on top of* that table: $6K by Aug 2027, $18.6K by Jan 2028, $30.6K by Jun 2028, $35.4K close Aug 2028. I checked the arithmetic — those figures are exactly `$1,800 + $2,400 × (month − 10)`. The savings plan assumes debt-free at month 10 and $2,400/month saved from month 11.

**So a one-month slip in debt payoff moves the duplex closing date.** Nothing in the app expresses that dependency; the two pages just happen to agree today.

### The contradiction the app already knows about

`/plan` states: take-home ~$4,000, expenses $1,887, monthly surplus **~$2,113**. But the payoff table implies a total monthly outlay of about **$2,395** — I verified this: a straight avalanche simulation at $2,395/month reproduces the published table within $26 across all ten months, and month 1 matches to the dollar.

Those two numbers are $282/month apart. The resolution is the question `/plan` asks under "Still need from you": *"Does $1,887 include the car payment?"* If it includes the debt minimums, the plan works with room to spare. If it doesn't, he is short every month. Simulated:

| Monthly outlay | Debt-free | Total interest | Knock-on |
|---|---|---|---|
| $2,563 (expenses include minimums) | month 9 | $1,000 | closing pulls ~1 mo earlier |
| $2,395 (published plan) | month 10 | $1,067 | Aug 2028 close |
| $2,113 (surplus only) | month 11 | $1,195 | every savings milestone slips ~1 mo |
| $2,000 (extra target only) | month 12 | $1,263 | closing slips ~2 mo |

The app collects the answer to that question in a form and does nothing with it. It should drive the entire projection.

### Step 3a — Extract a pure module

Create `lib/projection.ts` — **no React, no DB imports**, so it can be unit tested:

```ts
type Account = {
  id: string
  name: string
  balanceCents: number
  aprBps: number            // 2700 = 27.00%
  minPaymentCents: number
  priority: number
}

type ProjectionInput = {
  accounts: Account[]
  monthlyOutlayCents: number    // minimums + extra
  savingsRateCents: number      // per month once debt-free
  startingCashCents: number
  savingsGoalCents: number      // 30_600_00
  startMonth: string            // 'YYYY-MM'
  maxMonths?: number            // default 120, guards runaway loops
}

type MonthRow = {
  month: string
  startingBalanceCents: number
  interestCents: number
  principalCents: number
  endingBalanceCents: number
  cashCents: number
  payments: { accountId: string; amountCents: number; paidOff: boolean }[]
  label: string                 // "Kill Amazon. Rest to Quicksilver."
}

type Projection = {
  rows: MonthRow[]
  debtFreeMonth: string | null
  downPaymentMonth: string | null   // cash >= savingsGoal
  totalInterestCents: number
  feasible: boolean
}

export function project(input: ProjectionInput): Projection
```

Rules:

- Monthly interest per account = `round(balance * aprBps / 10000 / 12)`, accrued **before** payment.
- Apply each account's minimum first, then all remaining money to the lowest `priority` with a balance > 0 (the avalanche order the app already encodes).
- Never overpay: cap at balance + that month's interest, roll the surplus to the next priority **within the same month**.
- After `debtFreeMonth`, redirect the full outlay into cash at `savingsRateCents`.
- `feasible: false` when the outlay cannot cover minimums plus accrued interest — surface it in the UI rather than looping forever.

**Unit tests required for this module** (non-negotiable — four pages will depend on it):

- Single account, no interest, pays off in exactly N months.
- Interest-only edge: payment equals interest → `feasible: false`, no infinite loop.
- Rollover: an account cleared mid-month spills the remainder onto the next priority that same month.
- Reproduces the published 10-month table within $30/month at $2,395/month against the real starting balances.
- Reproduces the four published savings milestones ($6.6K / $18.6K / $30.6K / $35.4K) at $2,400/month from month 11.

### Step 3b — Real inputs

- Add `current_balance_cents` distinct from `starting_balance_cents`. Recompute current from logged payments and accrued interest. Backfill `current = starting`.
- Add `min_payment_cents` per account.
- Add an APR for **Citizens One Personal**, which displays no APR at all. Until supplied, treat as 0% and show a "Set APR" prompt on the card rather than silently assuming — this is also already on his first-two-weeks list ("Get actual APRs on all five accounts").
- Add a `budget` record: `take_home_cents`, `expenses_cents`, `expenses_include_minimums` (bool, nullable). **Wire the "Still need from you" form on `/plan` to it.** Answering "Does $1,887 include the car payment?" should visibly change the projected debt-free date. That is the moment the app stops being a document.

### Step 3c — Rebuild the UI on the engine

- `/debt`: the schedule renders from `project()`, not a constant. Month count is whatever the engine returns. Plan line and Actual line on "Payoff Progress" both come from it.
- **Interest panel** on `/debt`: interest paid to date, projected remaining, and interest saved versus minimums-only (run the engine twice and difference the totals — the minimums-only run may not terminate inside `maxMonths`, so report "never / 30+ years" rather than crashing). At 27% on $7,516.78 of card debt he is burning about $169/month, plus $92 on the auto loan.
- `/savings`: milestones derive their dates from `downPaymentMonth` and the months around it, not fixed strings. When debt payoff slips, milestone dates move and are visibly marked as moved.
- **Dashboard:** the four outcome cards show engine-derived dates. "Debt-free June 2027" and "June–Aug 2028" become computed, and change when reality does.
- **What-if slider** on `/debt`: $1,000–$3,500 in $50 steps. Re-run client-side (the module is pure and cheap — no server round trip) and show debt-free date, total interest, **and duplex closing date**. Showing the closing date move is the whole point: it connects a $50/month decision to the house.

### Acceptance
- Logging a payment changes the current balance, the Actual line, the projected payoff date, and the savings milestone dates.
- Deleting or editing a payment reverses all of it.
- Answering the `expenses_include_minimums` question changes the projection.
- With zero payments logged and the default outlay, the projection matches today's published plan.

---

## Phase 4 — Pace-aware status badge

### Why
The dashboard reads **"Behind schedule"** on day one of month one, with $0 paid and nothing yet due. The Month 1 target ($19,712) is an end-of-month figure compared against a start-of-month balance, so the badge shows red for most of every month. He will stop reading it, which costs the app its only at-a-glance status signal.

### Fix
Prorate the target by elapsed days:

```
expected = monthStart − (monthStart − monthEndTarget) × (dayOfMonth / daysInMonth)
```

| condition | badge |
|---|---|
| `actual <= expected − tolerance` | **Ahead** (green) |
| within tolerance | **On track** (neutral) |
| `actual > expected + tolerance` | **Behind** (amber) |

Tolerance: 2% of the month's planned reduction. Suppress "Behind" entirely for the first 5 days of a month. Add a subline showing the math: *"Expected $21,140 by Aug 19 · actual $21,846."*

Apply the same treatment to the "Toward Down Payment" card once Phase 3 lands.

### Acceptance
- Day 1 of a month with no payments reads "On track", not "Behind".
- Last day of a month with no payments reads "Behind".
- A payment clearing the month's target flips it to "Ahead" immediately.

---

## Phase 5 — Fitness: manual PRs and volume

### Why
All four Personal Records read "No data" against their goals (Squat 275–315, Bench 205–225, Deadlift 355–405, OHP 135–145). The bars only fill from logged sessions, so the most motivating panel on the page is empty on day one. PRs are also rare — most weeks show no progress even when training is going well.

### Scope
1. **Manual PR entry.** "Set current max" per lift: weight, date, optional note. Store in `personal_records` with history, not a single overwritten value.
2. **Auto-detect.** A logged set beating the stored max inserts a PR row and shows a "New PR" badge for the rest of the week. Must not duplicate on re-render.
3. **e1RM trend.** Epley (`weight × (1 + reps/30)`) per session, plotted on "Strength Progress" alongside true PRs, so the chart has a line on weeks without a PR.
4. **Weekly volume.** Total tonnage (sets × reps × weight) per week with a 4-week sparkline.
5. **Protein streak.** The body/protein log now exists but nothing summarizes it. Add a 7-day protein-target hit rate next to the log — and per Phase 1, hitting 170g marks the Eating habit `full`.
6. **Phase awareness.** `/plan` defines four fitness phases with month ranges (Base 1–6, Lean 7–12, Build 13–18, Sharpen 19–24). The fitness page shows "Phase: Base" as a static badge. Derive it from the plan start date and show what changes at the next transition.

### Acceptance
- Entering a squat max of 285 fills the bar against the 275–315 goal with no workout logged.
- Logging a set that beats the max creates one PR row, not several.

---

## Phase 6 — Priority gap and navigation

### Why
Two loose ends, both small.

**Priorities read 1, 1, 2, 3, 5.** Priority 4 is missing and two accounts tie at 1. Once Phase 3 lands this matters materially: payoff order depends on `priority`, and a tie makes the order of the first two accounts non-deterministic.

**Mobile nav is missing two pages.** The desktop sidebar has seven items; the mobile bar renders only Home, Debt, Fit, Biz, Review. **Savings and Full Plan are unreachable on a phone** — including the entire savings page, which is half the two-year goal.

### Scope
1. Find the priority source. Stored per row, derived from a sort, or hardcoded? Check for a soft-deleted sixth account.
2. Make priority a stable, unique, contiguous integer per user. One-time migration reindexing to 1..n preserving current order, breaking the 1/1 tie by smallest balance first (Savor $409.93 before Citizens $514.16 — which matches the month-1 label "Kill Savor + Citizens").
3. Add drag-to-reorder on `/debt`, persisting the order and guarding against gaps and duplicates.
4. In the engine, if priorities are duplicated, fall back to a deterministic tiebreak (smallest balance) rather than relying on row order.
5. Fix mobile nav: fit all seven, or use a "More" overflow. Do not leave Savings unreachable.
6. Point the four dashboard outcome cards at their own pages (`/debt`, `/savings`, `/business`, `/fitness`) instead of all four at `/plan`.

### Acceptance
- Priorities read 1,2,3,4,5 after migration.
- Reordering accounts changes the projected schedule and payoff date.
- Every page is reachable at a 375px viewport.

---

## Phase 7 — Reminders

### Why
Every number in this app is hand-entered, and the surface area just doubled. Without nudges the data goes stale in two weeks and the whole thing becomes a museum piece. Do this last, so it nudges toward features that already work.

### Scope
1. **Payment due dates.** `due_day_of_month` per account, "Due in 3 days" on the card. Clamp for short months (day 31 → 28th/30th).
2. **Habit floor nudge.** Given Phase 1, an evening prompt on any habit unmarked today, and an urgent one where missing would be the second consecutive day.
3. **Sunday review.** Promote the review card to the top of the dashboard on Sundays; show a completed state if the week's review exists.
4. **Month-end payment prompt.** Last 5 days of a month with no extra payment logged: a dismissible banner, dismissal persisting for that month only.
5. **Follow-up queue.** `/business` already computes day 2/7/21 follow-ups. Surface the count on the dashboard and in reminders — it is the only place in the app that generates a to-do from data rather than a fixed list.
6. **Quarterly checkpoint.** `/review` has the form; prompt at quarter end.
7. **Web push (optional, behind a flag).** `manifest.json` already ships, so the app is close to installable. If contained, add a service worker and opt-in push. **Do not** build a custom cron/email service here — if scheduled delivery is wanted, use Vercel Cron with a route handler and say so in the PR.

### Acceptance
- All prompts use the user's local date, not UTC — verify a user in `America/New_York` at 8pm Saturday does not see the Sunday prompt.
- Dismissals persist across reloads.

---

## Suggested sequence

| Order | Phase | Why here |
|---|---|---|
| 1 | 0 — Discovery | Everything depends on it |
| 2 | 1 — Habit Floors | A core mechanic is non-functional; smallest fix with the largest behavioral return |
| 3 | 2 — Shared content | Do it before more content lands and the fork widens |
| 4 | 6 — Priority + nav | Small; the engine needs clean priorities |
| 5 | 4 — Pace-aware badge | Small, self-contained, immediately visible |
| 6 | 3 — Projection engine | The big one; do it with a clear head and clean inputs |
| 7 | 5 — Fitness PRs | Independent of everything above |
| 8 | 7 — Reminders | Last, so it nudges toward things that work |

## Out of scope

Bank or card API integration (Plaid etc.), multi-user or sharing, data export, redesign, and any real estate/MLS integration. Ask before pulling any of these in.

## One note that is not a code change

The `/savings` page counts the existing $1,800 toward the $30,000 goal while `/plan` treats it as the only cash buffer during ten months of debt payoff. It cannot be both. Under the current model there is no emergency fund until Aug 2027 — and one $1,500 car repair during that window goes onto a 27% card and breaks the payoff schedule the savings milestones depend on. Worth deciding deliberately: either carve the $1,800 out of the down-payment total as a named buffer, or accept the risk explicitly. This is his call, not Cursor's.
