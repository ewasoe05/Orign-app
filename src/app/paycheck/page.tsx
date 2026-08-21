import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhaseBadge } from "@/components/paycheck/phase-badge";
import { PaycheckRouteForm } from "@/components/paycheck/route-form";
import { UnsweptBufferCard } from "@/components/paycheck/buffer-card";
import { PaycheckSettingsPanel } from "@/components/paycheck/settings-panel";
import { PaycheckHistory } from "@/components/paycheck/history-list";
import { PaycheckHelp } from "@/components/paycheck/help-text";
import { PaycheckReceipt } from "@/components/paycheck/receipt";
import { getPaycheckPageData } from "@/lib/actions/paycheck";
import { seedUserData } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";

function nextTargetLabel(phase: "debt" | "savings", accounts: { name: string; current_balance: number }[]) {
  if (phase === "savings") return "Savings goal";
  const next = accounts.find((account) => Number(account.current_balance) > 0);
  return next ? next.name : "Savings goal";
}

export default async function PaycheckPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) await seedUserData(user.id);

  const { settings, accounts, entries, phase, debtLeft } = await getPaycheckPageData();

  return (
    <AppShell>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <PhaseBadge
            phase={phase}
            debtLeft={debtLeft}
            hysaBalance={Number(settings.hysa_balance)}
            hysaGoal={Number(settings.hysa_goal)}
            nextLabel={nextTargetLabel(phase, accounts)}
          />
          <PaycheckRouteForm
            key={`${settings.fun_percent}-${entries[0]?.id ?? "new"}`}
            settings={settings}
          />
          {entries[0] ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  {entries[0].kind === "sweep" ? "Latest sweep" : "Latest receipt"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PaycheckReceipt lines={entries[0].lines} milestone={entries[0].milestone} />
              </CardContent>
            </Card>
          ) : null}
          <UnsweptBufferCard amount={Number(settings.unswept_buffer)} confirmed={settings.confirmed} />
          <PaycheckSettingsPanel settings={settings} accounts={accounts} />
        </div>
        <div className="space-y-4">
          <PaycheckHistory entries={entries} />
          <PaycheckHelp />
        </div>
      </div>
    </AppShell>
  );
}
