import { AppShell } from "@/components/layout/app-shell";
import { Skeleton, SkeletonCard, SkeletonChart } from "@/components/ui/skeleton";

export default function DebtLoading() {
  return (
    <AppShell>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <SkeletonCard className="h-56" />
          <SkeletonCard className="h-32" />
          <SkeletonCard className="h-40" />
        </div>
        <div className="space-y-4">
          <SkeletonChart />
          <SkeletonCard className="h-48" />
          <SkeletonCard className="h-32" />
        </div>
      </div>
    </AppShell>
  );
}
