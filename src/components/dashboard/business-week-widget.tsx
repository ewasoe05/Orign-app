import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardHeaderRow } from "@/components/ui/card-header-row";
import { Metric } from "@/components/ui/metric";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { BusinessWeekStats, FollowUpItem } from "@/lib/types";

export function BusinessWeekWidget({
  stats,
  followUps,
}: {
  stats: BusinessWeekStats;
  followUps: FollowUpItem[];
}) {
  const dueCount = followUps.filter((item) => item.overdue || item.daysUntilDue <= 0).length;

  return (
    <Card>
      <CardHeader>
        <CardHeaderRow
          action={
            <div className="flex flex-wrap gap-2">
              {dueCount > 0 && (
                <Badge variant={followUps.some((item) => item.overdue) ? "danger" : "warning"}>
                  {dueCount} follow-up{dueCount === 1 ? "" : "s"}
                </Badge>
              )}
              <Badge variant={stats.closes > 0 ? "success" : "default"}>
                {stats.leads}/{stats.closes}
              </Badge>
            </div>
          }
        >
          <CardTitle>Business This Week</CardTitle>
        </CardHeaderRow>
      </CardHeader>
      <CardContent>
        <Metric variant="widget">
          {stats.leads} lead{stats.leads === 1 ? "" : "s"} / {stats.closes} close
          {stats.closes === 1 ? "" : "s"}
        </Metric>
        <p className="text-caption text-text-secondary">
          Quoted {formatCurrency(stats.quoted)} · Won {formatCurrency(stats.won)}
        </p>
        <Link href="/business">
          <Button variant="outline" size="sm" className="w-full">
            {dueCount > 0 ? "View follow-ups" : "Log a lead"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
