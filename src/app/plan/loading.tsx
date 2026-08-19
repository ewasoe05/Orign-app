import { AppShell } from "@/components/layout/app-shell";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function PlanLoading() {
  return (
    <AppShell>
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <div className="space-y-3">
          <SkeletonCard className="h-16" />
          <SkeletonCard className="h-16" />
          <SkeletonCard className="h-16" />
          <SkeletonCard className="h-16" />
          <SkeletonCard className="h-16" />
        </div>
      </div>
    </AppShell>
  );
}
