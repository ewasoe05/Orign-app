import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PaycheckHelp() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>How to use this</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-caption text-text-secondary">
        <p>Route the paycheck the same day it hits. Type the number, tap the button. That is the whole job.</p>
        <p>Sweep leftover checking on a fixed day — the 28th is a good default. One sweep, not a daily decision.</p>
        <p>
          Never miss twice. A skipped paycheck does not need fixing. Just route the next one that arrives.
        </p>
        <p>
          The dial resets to your Settings default every visit. Nudging it for one paycheck never quietly
          changes the plan going forward.
        </p>
      </CardContent>
    </Card>
  );
}
