import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { BusinessWeekStats } from "@/lib/types";

export function BusinessStats({ stats }: { stats: BusinessWeekStats }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-zinc-400">Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">{stats.leads}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-zinc-400">Closes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">{stats.closes}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-zinc-400">Quoted</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">{formatCurrency(stats.quoted)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-zinc-400">Won</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">{formatCurrency(stats.won)}</p>
          <p className="text-xs text-zinc-500">
            ~{formatCurrency(stats.estimatedCommission)} commission
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
