import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MilestoneWidget({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Next Milestone</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-medium text-emerald-400">{title}</p>
        <p className="mt-1 text-sm text-zinc-400">{description}</p>
      </CardContent>
    </Card>
  );
}
