import { AppShell } from "@/components/layout/app-shell";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function PaycheckLoading() {
  return (
    <AppShell>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <Skeleton className="h-6 w-64" />
          <SkeletonCard className="h-72" />
          <SkeletonCard className="h-40" />
          <SkeletonCard className="h-48" />
        </div>
        <div className="space-y-4">
          <SkeletonCard className="h-56" />
          <SkeletonCard className="h-40" />
        </div>
      </div>
    </AppShell>
  );
}
