import { DOWN_PAYMENT_TARGET, SAVINGS_STARTING_CASH } from "./seed";
import { isMissingRelation } from "./supabase/errors";

export async function seedPhase2Data(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  userId: string,
) {
  const { count, error } = await supabase
    .from("savings_settings")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    if (isMissingRelation(error)) return;
    throw error;
  }

  if (!count) {
    const { error: insertError } = await supabase.from("savings_settings").insert({
      user_id: userId,
      starting_cash: SAVINGS_STARTING_CASH,
      down_payment_target: DOWN_PAYMENT_TARGET,
    });
    if (insertError && !isMissingRelation(insertError)) {
      throw insertError;
    }
  }
}
