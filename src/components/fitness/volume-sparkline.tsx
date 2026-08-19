import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function VolumeSparkline({
  weeks,
}: {
  weeks: { weekStart: string; tonnage: number }[];
}) {
  const maxTonnage = Math.max(...weeks.map((week) => week.tonnage), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly volume</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2">
          {weeks.map((week) => {
            const height = week.tonnage > 0 ? Math.max(8, (week.tonnage / maxTonnage) * 72) : 4;
            const label = week.weekStart.slice(5);
            return (
              <div key={week.weekStart} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-caption text-text-tertiary">
                  {week.tonnage > 0 ? `${(week.tonnage / 1000).toFixed(1)}k` : "—"}
                </span>
                <div
                  className="w-full rounded-sm bg-accent-muted"
                  style={{ height: `${height}px` }}
                  title={`Week of ${week.weekStart}: ${week.tonnage.toLocaleString()} lbs`}
                />
                <span className="text-caption text-text-tertiary">{label}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-caption text-text-tertiary">Tonnage = sets × reps × weight (last 4 weeks)</p>
      </CardContent>
    </Card>
  );
}
