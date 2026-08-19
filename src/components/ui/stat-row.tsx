import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Metric } from "@/components/ui/metric";
import { cn } from "@/lib/utils";

export type StatItem = {
  label: string;
  value: string | number;
};

export function StatRow({
  title,
  stats,
  className,
}: {
  title?: string;
  stats: StatItem[];
  className?: string;
}) {
  return (
    <Card className={className}>
      {title ? (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      ) : null}
      <CardContent className={cn(!title && "pt-0")}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-md border border-border-subtle bg-surface-inset p-3">
              <p className="text-caption text-text-secondary">{stat.label}</p>
              <Metric variant="widget" className="mt-1">
                {stat.value}
              </Metric>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
