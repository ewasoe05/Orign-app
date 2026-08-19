import { AppShell } from "@/components/layout/app-shell";
import { BusinessStats } from "@/components/business/business-stats";
import { LeadForm } from "@/components/business/lead-form";
import { LeadList } from "@/components/business/lead-list";
import { FollowUpQueue } from "@/components/business/follow-up-queue";
import { ReviewCounter } from "@/components/business/review-counter";
import {
  getLeads,
  getBusinessWeekStats,
  getFollowUpQueue,
  getGoogleReviewCount,
} from "@/lib/actions/business";
import { getPlanChecklist } from "@/lib/actions/plan";
import { ChecklistTrack } from "@/components/plan/checklist-track";
import { BusinessTargets } from "@/components/plan/plan-reference";
import { seedUserData } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";

export default async function BusinessPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) await seedUserData(user.id);

  const [leads, stats, followUps, reviewCount, checklist] = await Promise.all([
    getLeads(),
    getBusinessWeekStats(),
    getFollowUpQueue(),
    getGoogleReviewCount(),
    getPlanChecklist(),
  ]);

  return (
    <AppShell>
      <div className="space-y-4">
        <BusinessStats stats={stats} />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
          <div className="space-y-4">
            <LeadForm />
            <ReviewCounter count={reviewCount} />
            <BusinessTargets />
            <ChecklistTrack track="business" items={checklist} />
          </div>
          <div className="space-y-4">
            <FollowUpQueue items={followUps} />
            <LeadList leads={leads} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
