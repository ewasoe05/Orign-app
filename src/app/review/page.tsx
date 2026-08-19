import { AppShell } from "@/components/layout/app-shell";
import { ReviewForm } from "@/components/review/review-form";
import { ReviewHistory } from "@/components/review/review-history";
import { QuarterlyForm } from "@/components/review/quarterly-form";
import { QuarterlyHistory } from "@/components/review/quarterly-history";
import { WeeklyReviewReference } from "@/components/plan/plan-reference";
import { getWeeklyReviews, getReviewDefaults } from "@/lib/actions/review";
import { getQuarterlyReviews } from "@/lib/actions/quarterly";
import { getCurrentQuarter } from "@/lib/quarterly";
import { getUserSettings } from "@/lib/actions/debt";
import { PLAN_START_DATE } from "@/lib/seed";
import { seedUserData } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";

export default async function ReviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) await seedUserData(user.id);

  const [reviews, defaults, quarterly, settings] = await Promise.all([
    getWeeklyReviews(),
    getReviewDefaults(),
    getQuarterlyReviews(),
    getUserSettings(),
  ]);

  const currentQuarter = getCurrentQuarter(settings?.plan_start_date ?? PLAN_START_DATE);

  return (
    <AppShell>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
        <ReviewForm defaults={defaults} />
        <ReviewHistory reviews={reviews} />
        <WeeklyReviewReference />
        <QuarterlyForm currentQuarter={currentQuarter} />
        <QuarterlyHistory reviews={quarterly} />
      </div>
    </AppShell>
  );
}
