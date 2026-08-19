"use client";

import { useActionState } from "react";
import { updateLeadStatus } from "@/lib/actions/business";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import type { Lead } from "@/lib/types";

export function LeadList({ leads }: { leads: Lead[] }) {
  const [, action] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return updateLeadStatus(formData);
    },
    null,
  );
  if (leads.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-zinc-400">
          No leads yet. Track every quote — that&apos;s the scoreboard.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-zinc-400">Lead sheet</h2>
      {leads.map((lead) => (
        <Card key={lead.id}>
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle className="text-sm">{lead.service}</CardTitle>
              <p className="text-xs text-zinc-500">
                {lead.lead_date} · {lead.source}
              </p>
            </div>
            <Badge
              variant={
                lead.status === "won" ? "success" : lead.status === "lost" ? "warning" : "default"
              }
            >
              {lead.status}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">{formatCurrency(Number(lead.quoted_amount))}</p>
            {lead.why_lost && <p className="text-xs text-zinc-400">{lead.why_lost}</p>}
            {lead.status === "open" && (
              <div className="flex flex-col gap-2 sm:flex-row">
                <form action={action}>
                  <input type="hidden" name="lead_id" value={lead.id} />
                  <input type="hidden" name="status" value="won" />
                  <Button type="submit" size="sm">
                    Won
                  </Button>
                </form>
                <form action={action} className="flex flex-1 gap-2">
                  <input type="hidden" name="lead_id" value={lead.id} />
                  <input type="hidden" name="status" value="lost" />
                  <Input name="why_lost" placeholder="Why lost?" className="h-8" required />
                  <Button type="submit" size="sm" variant="secondary">
                    Lost
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
