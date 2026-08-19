export const STARTING_DEBT_TOTAL = 21846.05;

export const DEBT_ACCOUNTS_SEED = [
  {
    name: "Capital One Savor",
    initial_balance: 409.93,
    interest_rate: 27,
    priority: 1,
  },
  {
    name: "Citizens One Personal",
    initial_balance: 514.16,
    interest_rate: null,
    priority: 1,
  },
  {
    name: "Amazon Store Card",
    initial_balance: 1458.81,
    interest_rate: 27,
    priority: 2,
  },
  {
    name: "Capital One Quicksilver",
    initial_balance: 5648.04,
    interest_rate: 27,
    priority: 3,
  },
  {
    name: "TrueCore FCU – 2020 Ford",
    initial_balance: 13815.11,
    interest_rate: 7.99,
    priority: 5,
  },
] as const;

export const PAYOFF_SCHEDULE = [
  { month: 1, label: "Sep 2026", action: "Kill Savor + Citizens. Rest to Amazon.", targetRemaining: 19712 },
  { month: 2, label: "Oct 2026", action: "Kill Amazon. Rest to Quicksilver.", targetRemaining: 17542 },
  { month: 3, label: "Nov 2026", action: "All to Quicksilver", targetRemaining: 15327 },
  { month: 4, label: "Dec 2026", action: "All to Quicksilver", targetRemaining: 13068 },
  { month: 5, label: "Jan 2027", action: "Kill Quicksilver. Rest to auto.", targetRemaining: 10763 },
  { month: 6, label: "Feb 2027", action: "All to auto", targetRemaining: 8435 },
  { month: 7, label: "Mar 2027", action: "All to auto", targetRemaining: 6091 },
  { month: 8, label: "Apr 2027", action: "All to auto", targetRemaining: 3732 },
  { month: 9, label: "May 2027", action: "All to auto", targetRemaining: 1356 },
  { month: 10, label: "Jun 2027", action: "Auto paid off. Debt-free.", targetRemaining: 0 },
] as const;

export const FITNESS_SCHEDULE = [
  { day: 1, label: "Mon", focus: "Lower A — squat focus", scheduleType: "lift" as const, templateName: "Lower A" },
  { day: 2, label: "Tue", focus: "Upper A — bench focus", scheduleType: "lift" as const, templateName: "Upper A" },
  { day: 3, label: "Wed", focus: "Rest", scheduleType: "rest" as const, templateName: null },
  { day: 4, label: "Thu", focus: "Lower B — deadlift focus", scheduleType: "lift" as const, templateName: "Lower B" },
  { day: 5, label: "Fri", focus: "Upper B — overhead press focus", scheduleType: "lift" as const, templateName: "Upper B" },
  { day: 6, label: "Sat", focus: "Run", scheduleType: "run" as const, templateName: null },
  { day: 7, label: "Sun", focus: "Walk / rest", scheduleType: "rest" as const, templateName: null },
] as const;

export const DEFAULT_TEMPLATES = [
  {
    name: "Lower A",
    workout_type: "lift" as const,
    exercises: [
      { name: "Squat", sets: 4, reps: 6 },
      { name: "Romanian Deadlift", sets: 3, reps: 8 },
      { name: "Leg Press", sets: 3, reps: 10 },
      { name: "Calf Raise", sets: 3, reps: 12 },
    ],
  },
  {
    name: "Upper A",
    workout_type: "lift" as const,
    exercises: [
      { name: "Bench Press", sets: 4, reps: 6 },
      { name: "Barbell Row", sets: 3, reps: 8 },
      { name: "Incline DB Press", sets: 3, reps: 10 },
      { name: "Tricep Pushdown", sets: 3, reps: 12 },
    ],
  },
  {
    name: "Lower B",
    workout_type: "lift" as const,
    exercises: [
      { name: "Deadlift", sets: 4, reps: 5 },
      { name: "Front Squat", sets: 3, reps: 8 },
      { name: "Walking Lunges", sets: 3, reps: 10 },
      { name: "Core", sets: 3, reps: 15 },
    ],
  },
  {
    name: "Upper B",
    workout_type: "lift" as const,
    exercises: [
      { name: "Overhead Press", sets: 4, reps: 6 },
      { name: "Pull-ups", sets: 3, reps: 8 },
      { name: "Lateral Raise", sets: 3, reps: 12 },
      { name: "Curls", sets: 3, reps: 12 },
    ],
  },
] as const;

export const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export const STRENGTH_TARGETS = [
  { exercise: "Squat", min: 275, max: 315 },
  { exercise: "Bench", min: 205, max: 225 },
  { exercise: "Deadlift", min: 355, max: 405 },
  { exercise: "Overhead Press", min: 135, max: 145 },
] as const;

export const PLAN_START_DATE = "2026-09-01";
export const PLAN_END_DATE = "2028-08-01";
export const MONTHLY_DEBT_TARGET = 2000;
export const FITNESS_WEEKLY_TARGET = 4;

export const SAVINGS_STARTING_CASH = 1800;
export const DOWN_PAYMENT_TARGET = 30000;
export const GOOGLE_REVIEW_TARGET = 20;
export const GOOGLE_REVIEW_DEADLINE = "2026-12-31";
export const COMMISSION_REVENUE_PER_1000 = 8300;

export const SAVINGS_MILESTONES = [
  { amount: 6000, date: "2027-08-01", label: "Aug 2027", description: "$6K emergency fund" },
  { amount: 18600, date: "2028-01-01", label: "Jan 2028", description: "$18.6K saved" },
  { amount: 30600, date: "2028-06-01", label: "Jun 2028", description: "$30.6K down payment" },
  { amount: 35400, date: "2028-08-01", label: "Aug 2028", description: "$35.4K — close on duplex" },
] as const;

export const HABIT_FLOORS = [
  { key: "training", name: "Training", description: "Full: 4 sessions. Floor: walk 10 min." },
  { key: "business", name: "Business", description: "Full: prospecting day. Floor: 3 follow-up texts." },
  { key: "money", name: "Money", description: "Full: extra payment + review. Floor: autopay runs." },
  { key: "eating", name: "Eating", description: "Full: 170g protein. Floor: one protein-heavy meal." },
] as const;

export const STARTING_SNAPSHOT = [
  { label: "Take-home", value: "~$4,000/mo (base + 12% commission)" },
  { label: "Expenses", value: "$1,887/mo" },
  { label: "Rent", value: "$0" },
  { label: "Monthly surplus", value: "~$2,113" },
  { label: "Starting savings", value: "$1,800" },
  { label: "Starting debt", value: "$21,846.05" },
] as const;

export const DUPLEX_CASH_BREAKDOWN = [
  { amount: 10500, label: "3.5% FHA down on a ~$300K duplex" },
  { amount: 9000, label: "Closing costs" },
  { amount: 10000, label: "Reserves, repairs, and moving" },
] as const;

export const POST_DEBT_MONTHLY_CAPACITY = 2400;

export const BUSINESS_QUARTER_TARGETS = [
  { label: "Q1 · Sep–Nov 2026", target: "Systems in place, baseline known, 20 Google reviews." },
  { label: "Q2 · Dec 2026–Feb 2027", target: "+$3,000–5,000/mo residential revenue. Commission +$360–600/mo." },
  { label: "Q3 · Mar–May 2027", target: "+$8,000/mo residential revenue. Commission +$1,000/mo." },
  { label: "Q4 · Jun–Aug 2027", target: "Maintenance/service plan live. Process written down." },
  { label: "Year 2 · Sep 2027–Aug 2028", target: "Scale what works. Residential +$1,500+/mo commission by mid-2028." },
] as const;

export const HABIT_FLOOR_TABLE = [
  { habit: "Training", full: "4 sessions", floor: "Walk 10 minutes" },
  { habit: "Business", full: "Full prospecting day", floor: "Send 3 follow-up texts" },
  { habit: "Money", full: "Extra payment + review", floor: "The autopay runs itself" },
  { habit: "Eating", full: "Hit protein (170g)", floor: "One protein-heavy meal" },
] as const;

export const WEEKLY_REVIEW_QUESTIONS = [
  "What's my current debt total? (Watch it go down. This is the motivation engine.)",
  "Did I hit 4 training sessions, or my floor?",
  "How many leads and how many closes this week?",
  "What's one thing I'm going to do differently?",
  "How am I actually doing?",
] as const;

export const PAYOFF_RATIONALE =
  "Small accounts die first because two zeros in month one beat $12 of interest optimization. Amazon is next because $1,458 on a $1,900 limit is 77% utilization — that score is what determines whether the duplex happens.";

export const QUARTERLY_PLAN = [
  {
    quarter: 1,
    label: "Q1 · Sep–Nov 2026",
    range: "Sep–Nov 2026",
    money: "Kill 3 accounts. Fix credit reporting. Automate.",
    business: "Track leads. GBP. 20 reviews. Follow-up system.",
    body: "Learn the lifts. 4x/week habit.",
  },
  {
    quarter: 2,
    label: "Q2 · Dec 2026–Feb 2027",
    range: "Dec 2026–Feb 2027",
    money: "Quicksilver dead by Jan. Start on the car.",
    business: "Referrals + reactivate old customers.",
    body: "Strength base. Start Couch-to-5K.",
  },
  {
    quarter: 3,
    label: "Q3 · Mar–May 2027",
    range: "Mar–May 2027",
    money: "Car loan down to ~$1,400.",
    business: "Turn on paid ads. Track CPA.",
    body: "Consistent 4 days. Running 3x.",
  },
  {
    quarter: 4,
    label: "Q4 · Jun–Aug 2027",
    range: "Jun–Aug 2027",
    money: "DEBT-FREE. Emergency fund to $6K.",
    business: "Recurring service plans. Systematize.",
    body: "Run a 5K. Begin lean phase.",
  },
  {
    quarter: 5,
    label: "Q5 · Sep–Nov 2027",
    range: "Sep–Nov 2027",
    money: "~$14K saved.",
    business: "Scale what works, cut what doesn't.",
    body: "Build phase. Strength push.",
  },
  {
    quarter: 6,
    label: "Q6 · Dec 2027–Feb 2028",
    range: "Dec 2027–Feb 2028",
    money: "~$21K saved. Talk to a lender.",
    business: "Add capacity if leads outrun it.",
    body: "10K training block.",
  },
  {
    quarter: 7,
    label: "Q7 · Mar–May 2028",
    range: "Mar–May 2028",
    money: "~$28K. Pre-approved. Touring duplexes.",
    business: "Residential at +$1,500/mo commission.",
    body: "Final cut phase.",
  },
  {
    quarter: 8,
    label: "Q8 · Jun–Aug 2028",
    range: "Jun–Aug 2028",
    money: "Close on the duplex. Move out.",
    business: "Handoff/systems so it runs without heroics.",
    body: "Hit strength targets.",
  },
] as const;

export const FOUR_OUTCOMES = [
  { key: "debt", title: "Debt-free", target: "June 2027", metric: "$0 consumer debt" },
  { key: "duplex", title: "Duplex in Columbus", target: "June–Aug 2028", metric: "Closed, one side rented" },
  { key: "business", title: "Business income up", target: "Ongoing", metric: "+$1,000–1,500/mo commission" },
  { key: "fitness", title: "In shape", target: "Ongoing", metric: "Strength + body comp + 10K" },
] as const;

export const FITNESS_PHASES = [
  { name: "Base", months: "1–6", focus: "Learn the lifts, build the habit. Maintenance calories. Walk 20 min daily. Start Couch-to-5K in month 4." },
  { name: "Lean out", months: "7–12", focus: "Slight deficit (~300 cal). Keep lifting heavy. Run a 5K by month 12." },
  { name: "Build", months: "13–18", focus: "Slight surplus. Push strength. Build to a 10K." },
  { name: "Sharpen", months: "19–24", focus: "Small cut to reveal the muscle. 10K PR or half-marathon." },
] as const;

export const PROTEIN_TARGET_G = 170;
export const STARTING_WEIGHT_LBS = 183;
export const TARGET_WEIGHT_LBS = 180;

export const PLAN_CHECKLIST = [
  { key: "pull_credit_reports", section: "first_two_weeks", label: "Pull all three credit reports + actual FICO", detail: "annualcreditreport.com. Need 580 FHA min, realistically 620+." },
  { key: "resolve_disconnected", section: "first_two_weeks", label: "Resolve disconnected accounts", detail: "Call Quicksilver, Citizens One, and Savor. Charge-off is a mortgage-killer." },
  { key: "get_actual_aprs", section: "first_two_weeks", label: "Get actual APRs on all five accounts", detail: "From statements. Payoff order may shift." },
  { key: "setup_autopay", section: "first_two_weeks", label: "Autopay every minimum", detail: "Extra payment stays manual. A bad week can never cost a late fee." },
  { key: "open_savings_account", section: "first_two_weeks", label: "Open a separate savings account + auto-transfer on payday", detail: "Different bank than checking." },
  { key: "watch_columbus", section: "mortgage", label: "Start watching Columbus inventory (month 12)", detail: "Learn neighborhoods, price per unit, actual rents. Not to buy yet." },
  { key: "talk_to_lender", section: "mortgage", label: "Talk to a lender (month 15)", detail: "No-obligation pre-qual. Commission often needs a 2-year average." },
  { key: "no_new_credit", section: "mortgage", label: "No new credit 12 months before applying", detail: "No new cards, no financing a truck." },
  { key: "confirm_w2_1099", section: "mortgage", label: "Confirm W-2 vs 1099 at Clear Solutions", detail: "1099 means two years of returns after write-offs." },
  { key: "ask_fha_house_hack", section: "mortgage", label: "Ask lender about FHA house-hacking 2–4 units", detail: "Live in one side a year; other side rent can help qualify." },
  { key: "gbp_claimed", section: "business", label: "Claim and fully fill Google Business Profile", detail: "Categories, photos of actual jobs weekly." },
  { key: "review_engine", section: "business", label: "Review engine: ask every job by text the day it completes", detail: "20+ new Google reviews by December 2026." },
  { key: "follow_up_rule", section: "business", label: "Follow-up rule: day 2, 7, and 21 on every unclosed quote", detail: "The app queue tracks this. You still have to send the texts." },
  { key: "referral_program", section: "business", label: "Referral program (Q2)", detail: "$50 off or cash for a referral that books." },
  { key: "reactivate_customers", section: "business", label: "Reactivate past customers (Q2)", detail: "Anyone not serviced in 12+ months." },
  { key: "nail_offer", section: "business", label: "One clear packaged residential offer", detail: "Ambiguous pricing kills residential sales." },
  { key: "paid_ads", section: "business", label: "Turn on paid only after tracking + reviews (Q3)", detail: "LSA if eligible. $500–750 Google Ads. Kill in 60 days if CPA fails." },
  { key: "nextdoor_facebook", section: "business", label: "Nextdoor and local Facebook groups (Q3)", detail: "Free, and disproportionately effective for residential home services." },
  { key: "service_plans", section: "business", label: "Maintenance / service plan (Q4)", detail: "Recurring revenue. Write the residential process down." },
  { key: "commission_in_writing", section: "business", label: "Commission structure in writing", detail: "Does it change as residential grows?" },
  { key: "dad_conversation", section: "business", label: "Conversation with dad: ownership, partnership, or employee?", detail: "Don't pour two years into an asset with no claim." },
  { key: "mental_health_q1", section: "capacity", label: "Mental health as a Q1 line item", detail: "Therapist, doctor, whoever fits. Capacity is infrastructure." },
  { key: "credit_repair_if_needed", section: "credit_repair", label: "If FICO is under 620: treat credit repair as a Q1 track", detail: "Stay current on disconnected accounts, kill Amazon utilization, dispute report errors." },
] as const;
