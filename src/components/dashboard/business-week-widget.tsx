import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { BusinessWeekStats } from "@/lib/types";

export function BusinessWeekWidget({ stats }: { stats: BusinessWeekStats }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Business This Week</CardTitle>
        <Badge variant={stats.closes > 0 ? "success" : "default"}>
          {stats.leads}/{stats.closes}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-2xl font-semibold">
          {stats.leads} lead{stats.leads === 1 ? "" : "s"} / {stats.closes} close
          {stats.closes === 1 ? "" : "s"}
        </p>
        <p className="text-sm text-zinc-400">
          Quoted {formatCurrency(stats.quoted)} · Won {formatCurrency(stats.won)}
        </p>
        <Link href="/business">
          <Button variant="outline" size="sm" className="w-full">
            Log a lead
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
