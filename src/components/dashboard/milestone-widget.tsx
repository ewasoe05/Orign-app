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
        <p className="text-body font-medium text-text-primary">{title}</p>
        <p className="mt-1 text-caption text-text-secondary">{description}</p>
      </CardContent>
    </Card>
  );
}
