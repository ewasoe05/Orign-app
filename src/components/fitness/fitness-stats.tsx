import { StatRow } from "@/components/ui/stat-row";
import type { FitnessPhaseInfo } from "@/lib/fitness-metrics";

export function FitnessStats({
  phaseInfo,
  sessions,
  target,
  streak,
  hasFloor,
}: {
  phaseInfo: FitnessPhaseInfo;
  sessions: number;
  target: number;
  streak: number;
  hasFloor: boolean;
}) {
  const hitTarget = sessions >= target;
  const statusLabel = hitTarget
    ? "Target hit"
    : hasFloor
      ? "Floor hit"
      : `${target - sessions} to go`;

  return (
    <StatRow
      stats={[
        {
          label: `Phase · month ${phaseInfo.planMonth}`,
          value: phaseInfo.phase,
        },
        {
          label: "This week",
          value: `${sessions}/${target}`,
        },
        {
          label: "Streak",
          value: `${streak} wk${streak !== 1 ? "s" : ""}`,
        },
        {
          label: "Status",
          value: statusLabel,
        },
      ]}
    />
  );
}
