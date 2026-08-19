import { AppShell } from "@/components/layout/app-shell";
import { ReviewForm } from "@/components/review/review-form";
import { ReviewHistory } from "@/components/review/review-history";
import { getWeeklyReviews, getReviewDefaults } from "@/lib/actions/review";
import { seedUserData } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";

export default async function ReviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) await seedUserData(user.id);

  const [reviews, defaults] = await Promise.all([getWeeklyReviews(), getReviewDefaults()]);

  return (
    <AppShell>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
        <ReviewForm defaults={defaults} />
        <ReviewHistory reviews={reviews} />
      </div>
    </AppShell>
  );
}
