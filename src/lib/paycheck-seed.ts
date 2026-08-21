import {
  DEFAULT_FUN_PERCENT,
  EMERGENCY_FUND_TARGET,
  ESSENTIALS_PER_CHECK,
  EXTRA_TARGET_PER_CHECK,
  MILESTONE_MID_PERCENT,
  MILESTONE_NEAR_PERCENT,
} from "./seed";
import { isMissingRelation } from "./supabase/errors";

export async function seedPaycheckData(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  userId: string,
) {
  const { count, error } = await supabase
    .from("paycheck_settings")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    if (isMissingRelation(error)) return;
    throw error;
  }

  if (!count) {
    const { error: insertError } = await supabase.from("paycheck_settings").insert({
      user_id: userId,
      essentials_per_check: ESSENTIALS_PER_CHECK,
      extra_target: EXTRA_TARGET_PER_CHECK,
      unswept_buffer: 0,
      confirmed: false,
      fun_percent: DEFAULT_FUN_PERCENT,
      fun_allocated_total: 0,
      emergency_fund_target: EMERGENCY_FUND_TARGET,
      milestone_mid_percent: MILESTONE_MID_PERCENT,
      milestone_near_percent: MILESTONE_NEAR_PERCENT,
    });
    if (insertError && !isMissingRelation(insertError)) {
      throw insertError;
    }
  }
}
