/**
 * Narrative and reference copy for /plan and feature pages.
 * Operational seeds (accounts, templates, schedules) live in src/lib/seed.ts.
 */

export const PLAN_PAGE = {
  title: "The 2-year plan",
  paragraphs: [
    "Sept 2026 → Aug 2028. You pay no rent and clear ~$2,100/month. Convert that into assets before it disappears. Budget on $4,000 base — commission overage goes to debt, then savings.",
    "Design principle: the plan must work on your worst weeks, not just your best ones. Hit the floor. Never miss twice.",
  ],
} as const;

export type ChecklistTrackKey =
  | "first_two_weeks"
  | "mortgage"
  | "business"
  | "capacity"
  | "credit_repair";

export const CHECKLIST_TRACKS: Record<
  ChecklistTrackKey,
  { title: string; description: string }
> = {
  first_two_weeks: {
    title: "First two weeks",
    description: "Do these before the surplus becomes lifestyle.",
  },
  mortgage: {
    title: "Mortgage prep",
    description: "Start month 15, not month 22. Watch inventory at month 12.",
  },
  business: {
    title: "Residential business",
    description: "Q1 capture → Q2 mine → Q3 paid → Q4 recurring. Then the dad conversation.",
  },
  capacity: {
    title: "Capacity",
    description: "Mental health is a Q1 line item, not a side project.",
  },
  credit_repair: {
    title: "Credit repair (if needed)",
    description: "Only required if FICO is under 620. 580 is the FHA floor; 620+ is realistic.",
  },
};

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
  {
    id: "debt_total",
    label: "What's my current debt total?",
    detail: "Watch it go down. This is the motivation engine.",
    type: "input" as const,
  },
  {
    id: "training_sessions",
    label: "Did I hit 4 training sessions, or my floor?",
    type: "textarea" as const,
  },
  {
    id: "leads_closes",
    label: "How many leads and how many closes this week?",
    type: "textarea" as const,
  },
  {
    id: "do_differently",
    label: "What's one thing I'm going to do differently?",
    type: "textarea" as const,
  },
  {
    id: "how_doing",
    label: "How am I actually doing?",
    type: "textarea" as const,
  },
] as const;

export const PAYOFF_RATIONALE =
  "Small accounts die first because two zeros in month one beat $12 of interest optimization. Amazon is next because $1,458 on a $1,900 limit is 77% utilization — that score is what determines whether the duplex happens.";

export const PAYOFF_RATIONALE_FOOTNOTE =
  "Budget every month on $4,000 base. Commission overage goes to debt, then savings — never a new lifestyle baseline.";

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
  {
    name: "Base",
    months: "1–6",
    focus:
      "Learn the lifts, build the habit. Maintenance calories. Walk 20 min daily. Start Couch-to-5K in month 4.",
  },
  {
    name: "Lean out",
    months: "7–12",
    focus: "Slight deficit (~300 cal). Keep lifting heavy. Run a 5K by month 12.",
  },
  {
    name: "Build",
    months: "13–18",
    focus: "Slight surplus. Push strength. Build to a 10K.",
  },
  {
    name: "Sharpen",
    months: "19–24",
    focus: "Small cut to reveal the muscle. 10K PR or half-marathon.",
  },
] as const;

export const FITNESS_BODY_TARGETS = {
  title: "Aug 2028 body targets",
  description: "The scale barely moves. You are trading fat for muscle, not shrinking. 10K comfortably.",
  longestRun: "10K, comfortably",
  body: "~180 lbs, leaner and stronger",
} as const;

export const PLAN_CHECKLIST = [
  {
    key: "pull_credit_reports",
    section: "first_two_weeks",
    label: "Pull all three credit reports + actual FICO",
    detail: "annualcreditreport.com. Need 580 FHA min, realistically 620+.",
  },
  {
    key: "resolve_disconnected",
    section: "first_two_weeks",
    label: "Resolve disconnected accounts",
    detail: "Call Quicksilver, Citizens One, and Savor. Charge-off is a mortgage-killer.",
  },
  {
    key: "get_actual_aprs",
    section: "first_two_weeks",
    label: "Get actual APRs on all five accounts",
    detail: "From statements. Payoff order may shift.",
  },
  {
    key: "setup_autopay",
    section: "first_two_weeks",
    label: "Autopay every minimum",
    detail: "Extra payment stays manual. A bad week can never cost a late fee.",
  },
  {
    key: "open_savings_account",
    section: "first_two_weeks",
    label: "Open a separate savings account + auto-transfer on payday",
    detail: "Different bank than checking.",
  },
  {
    key: "watch_columbus",
    section: "mortgage",
    label: "Start watching Columbus inventory (month 12)",
    detail: "Learn neighborhoods, price per unit, actual rents. Not to buy yet.",
  },
  {
    key: "talk_to_lender",
    section: "mortgage",
    label: "Talk to a lender (month 15)",
    detail: "No-obligation pre-qual. Commission often needs a 2-year average.",
  },
  {
    key: "no_new_credit",
    section: "mortgage",
    label: "No new credit 12 months before applying",
    detail: "No new cards, no financing a truck.",
  },
  {
    key: "confirm_w2_1099",
    section: "mortgage",
    label: "Confirm W-2 vs 1099 at Clear Solutions",
    detail: "1099 means two years of returns after write-offs.",
  },
  {
    key: "ask_fha_house_hack",
    section: "mortgage",
    label: "Ask lender about FHA house-hacking 2–4 units",
    detail: "Live in one side a year; other side rent can help qualify.",
  },
  {
    key: "gbp_claimed",
    section: "business",
    label: "Claim and fully fill Google Business Profile",
    detail: "Categories, photos of actual jobs weekly.",
  },
  {
    key: "review_engine",
    section: "business",
    label: "Review engine: ask every job by text the day it completes",
    detail: "20+ new Google reviews by December 2026.",
  },
  {
    key: "follow_up_rule",
    section: "business",
    label: "Follow-up rule: day 2, 7, and 21 on every unclosed quote",
    detail: "The app queue tracks this. You still have to send the texts.",
  },
  {
    key: "referral_program",
    section: "business",
    label: "Referral program (Q2)",
    detail: "$50 off or cash for a referral that books.",
  },
  {
    key: "reactivate_customers",
    section: "business",
    label: "Reactivate past customers (Q2)",
    detail: "Anyone not serviced in 12+ months.",
  },
  {
    key: "nail_offer",
    section: "business",
    label: "One clear packaged residential offer",
    detail: "Ambiguous pricing kills residential sales.",
  },
  {
    key: "paid_ads",
    section: "business",
    label: "Turn on paid only after tracking + reviews (Q3)",
    detail: "LSA if eligible. $500–750 Google Ads. Kill in 60 days if CPA fails.",
  },
  {
    key: "nextdoor_facebook",
    section: "business",
    label: "Nextdoor and local Facebook groups (Q3)",
    detail: "Free, and disproportionately effective for residential home services.",
  },
  {
    key: "service_plans",
    section: "business",
    label: "Maintenance / service plan (Q4)",
    detail: "Recurring revenue. Write the residential process down.",
  },
  {
    key: "commission_in_writing",
    section: "business",
    label: "Commission structure in writing",
    detail: "Does it change as residential grows?",
  },
  {
    key: "dad_conversation",
    section: "business",
    label: "Conversation with dad: ownership, partnership, or employee?",
    detail: "Don't pour two years into an asset with no claim.",
  },
  {
    key: "mental_health_q1",
    section: "capacity",
    label: "Mental health as a Q1 line item",
    detail: "Therapist, doctor, whoever fits. Capacity is infrastructure.",
  },
  {
    key: "credit_repair_if_needed",
    section: "credit_repair",
    label: "If FICO is under 620: treat credit repair as a Q1 track",
    detail: "Stay current on disconnected accounts, kill Amazon utilization, dispute report errors.",
  },
] as const;

export function itemsForChecklistTrack<T extends { section: string }>(
  items: T[],
  track: ChecklistTrackKey,
): T[] {
  return items.filter((item) => item.section === track);
}
