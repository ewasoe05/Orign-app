import { AppShell } from "@/components/layout/app-shell";
import { Skeleton, SkeletonCard, SkeletonChart } from "@/components/ui/skeleton";

export default function FitnessLoading() {
  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex gap-3">
          <Skeleton className="h-20 flex-1 rounded-lg" />
          <Skeleton className="h-20 flex-1 rounded-lg" />
          <Skeleton className="h-20 flex-1 rounded-lg" />
        </div>
        <SkeletonCard className="h-28" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SkeletonCard className="h-24" />
          <SkeletonCard className="h-24" />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SkeletonChart />
          <SkeletonChart />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SkeletonChart />
          <SkeletonCard className="h-48" />
        </div>
      </div>
    </AppShell>
  );
}
