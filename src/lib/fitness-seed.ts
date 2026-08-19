import { DEFAULT_TEMPLATES, FITNESS_SCHEDULE } from "./seed";

export async function seedFitnessData(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  userId: string,
) {
  const { count: templateCount } = await supabase
    .from("workout_templates")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const templateIds: Record<string, string> = {};

  if (!templateCount) {
    for (const template of DEFAULT_TEMPLATES) {
      const { data: created, error } = await supabase
        .from("workout_templates")
        .insert({
          user_id: userId,
          name: template.name,
          workout_type: template.workout_type,
          is_default: true,
        })
        .select()
        .single();

      if (error || !created) continue;

      templateIds[template.name] = created.id;

      await supabase.from("template_exercises").insert(
        template.exercises.map((exercise, index) => ({
          user_id: userId,
          template_id: created.id,
          exercise_name: exercise.name,
          default_sets: exercise.sets,
          default_reps: exercise.reps,
          sort_order: index,
        })),
      );
    }
  } else {
    const { data: existingTemplates } = await supabase
      .from("workout_templates")
      .select("id, name")
      .eq("user_id", userId);

    for (const template of existingTemplates ?? []) {
      templateIds[template.name] = template.id;
    }
  }

  const { count: scheduleCount } = await supabase
    .from("weekly_schedule")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (!scheduleCount) {
    await supabase.from("weekly_schedule").insert(
      FITNESS_SCHEDULE.map((day) => ({
        user_id: userId,
        day_of_week: day.day,
        schedule_type: day.scheduleType,
        template_id: day.templateName ? templateIds[day.templateName] ?? null : null,
        label: day.focus,
      })),
    );
  }
}
