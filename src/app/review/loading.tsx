import { AppShell } from "@/components/layout/app-shell";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function ReviewLoading() {
  return (
    <AppShell>
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <SkeletonCard className="h-64" />
        <SkeletonCard className="h-48" />
      </div>
    </AppShell>
  );
}
