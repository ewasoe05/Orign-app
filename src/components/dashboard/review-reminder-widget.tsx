import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ReviewReminderWidget({ isDue }: { isDue: boolean }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Weekly Review</CardTitle>
        {isDue && <Badge variant="warning">Due today</Badge>}
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-sm text-zinc-400">
          {isDue
            ? "Sunday review time — 20 minutes to keep the plan alive."
            : "Your next Sunday review keeps the plan on track."}
        </p>
        <Link href="/review">
          <Button variant="outline" size="sm" className="w-full">
            {isDue ? "Start review" : "View reviews"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
