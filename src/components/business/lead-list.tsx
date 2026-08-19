"use client";

import { useActionState } from "react";
import { updateLeadStatus } from "@/lib/actions/business";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardHeaderRow } from "@/components/ui/card-header-row";
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
        <CardContent className="py-8 text-center text-body text-text-secondary">
          No leads yet. Track every quote — that&apos;s the scoreboard.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-label text-text-secondary">Lead sheet</h2>
      {leads.map((lead) => (
        <Card key={lead.id}>
          <CardHeader>
            <CardHeaderRow
              action={
                <Badge
                  variant={
                    lead.status === "won" ? "success" : lead.status === "lost" ? "warning" : "default"
                  }
                >
                  {lead.status}
                </Badge>
              }
            >
              <div>
                <CardTitle>{lead.service}</CardTitle>
                <p className="text-caption text-text-tertiary">
                  {lead.lead_date} · {lead.source}
                </p>
              </div>
            </CardHeaderRow>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-body">{formatCurrency(Number(lead.quoted_amount))}</p>
            {lead.why_lost && <p className="text-caption text-text-secondary">{lead.why_lost}</p>}
            {lead.status === "open" && (
              <div className="flex flex-col gap-2 sm:flex-row">
                <form action={action} className="flex-1">
                  <input type="hidden" name="lead_id" value={lead.id} />
                  <input type="hidden" name="status" value="won" />
                  <Button type="submit" variant="outline" size="touch" className="w-full">
                    Won
                  </Button>
                </form>
                <form action={action} className="flex flex-1 flex-col gap-2 sm:flex-row">
                  <input type="hidden" name="lead_id" value={lead.id} />
                  <input type="hidden" name="status" value="lost" />
                  <Input name="why_lost" placeholder="Why lost?" required />
                  <Button type="submit" size="touch" variant="ghost" className="w-full sm:w-auto">
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
