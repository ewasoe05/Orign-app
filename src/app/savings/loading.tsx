import { AppShell } from "@/components/layout/app-shell";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function SavingsLoading() {
  return (
    <AppShell>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard className="h-36" />
          <SkeletonCard className="h-36" />
          <SkeletonCard className="h-36" />
        </div>
        <SkeletonCard className="h-64" />
        <SkeletonCard className="h-48" />
      </div>
    </AppShell>
  );
}
