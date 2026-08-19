import { CHECKLIST_TRACKS, itemsForChecklistTrack, type ChecklistTrackKey } from "@/content/plan";
import { PlanChecklist } from "@/components/plan/plan-checklist";
import type { PlanChecklistItem } from "@/lib/types";

export function ChecklistTrack({
  track,
  items,
}: {
  track: ChecklistTrackKey;
  items: PlanChecklistItem[];
}) {
  const meta = CHECKLIST_TRACKS[track];
  return (
    <PlanChecklist
      title={meta.title}
      description={meta.description}
      items={itemsForChecklistTrack(items, track)}
    />
  );
}
