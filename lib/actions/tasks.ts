"use server";

import { createSupabaseServerActionClient } from "@/lib/supabase/server-actions";
import { TaskAssignPayload } from "@/lib/types/task";
import { revalidatePath } from "next/cache";

export async function completeTask(taskId: string) {
  const supabase = await createSupabaseServerActionClient();

  const { error } = await supabase
    .from("tasks")
    .update({ status: "completed" })
    .eq("id", taskId);

  if (error) {
    throw new Error(error.message);
  }

  // Revalidate tasks page
  revalidatePath("/tasks");
}

export async function reopenTask(taskId: string) {
  const supabase = await createSupabaseServerActionClient();

  const { error } = await supabase
    .from("tasks")
    .update({ status: "open" })
    .eq("id", taskId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/tasks");
}

export async function assignTask(taskId: string, payload: TaskAssignPayload) {
  const supabase = await createSupabaseServerActionClient();

  // Ensure single assignment per task
  await supabase.from("task_assignments").delete().eq("task_id", taskId);

  const { error } = await supabase.from("task_assignments").insert({
    task_id: taskId,
    person_id: payload.personId ?? null,
    business_id: payload.businessId ?? null,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/tasks");
}
