import { StatRow } from "@/components/ui/stat-row";
import { formatCurrency } from "@/lib/utils";
import type { BusinessWeekStats } from "@/lib/types";

export function BusinessStats({ stats }: { stats: BusinessWeekStats }) {
  return (
    <StatRow
      stats={[
        { label: "Leads", value: stats.leads },
        { label: "Closes", value: stats.closes },
        { label: "Quoted", value: formatCurrency(stats.quoted) },
        {
          label: "Won",
          value: formatCurrency(stats.won),
        },
      ]}
    />
  );
}
