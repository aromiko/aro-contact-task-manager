// actions/guards/tasks.ts
import { SupabaseClient } from "@supabase/supabase-js";

import { assertBusinessOwnership } from "./business";

export const assertTaskAccess = async (
  supabase: SupabaseClient,
  taskId: string,
  userId: string,
) => {
  const { data: task, error } = await supabase
    .from("tasks")
    .select("id, business_id")
    .eq("id", taskId)
    .single();

  if (error || !task) {
    throw new Error("Task not found");
  }

  if (!task.business_id) {
    throw new Error("Task is not associated with a business");
  }

  await assertBusinessOwnership(supabase, task.business_id, userId);

  return {
    id: task.id,
    business_id: task.business_id,
  };
};
