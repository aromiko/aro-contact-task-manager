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

  await supabase.from("task_assignments").delete().eq("task_id", taskId);

  const { error } = await supabase.from("task_assignments").insert({
    task_id: taskId,
    person_id: payload.personId ?? null,
    business_id: payload.businessId ?? null,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/tasks");
}

export async function createTask(payload: {
  title: string;
  personId?: string;
  businessId?: string;
}) {
  const supabase = await createSupabaseServerActionClient();

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({ title: payload.title })
    .select("id")
    .single();

  if (error || !task) {
    throw new Error(error?.message ?? "Failed to create task");
  }

  if (payload.personId || payload.businessId) {
    await supabase.from("task_assignments").insert({
      task_id: task.id,
      person_id: payload.personId ?? null,
      business_id: payload.businessId ?? null,
    });
  }

  revalidatePath("/tasks");
}

export async function deleteTask(taskId: string) {
  const supabase = await createSupabaseServerActionClient();

  await supabase.from("task_assignments").delete().eq("task_id", taskId);

  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) throw new Error(error.message);

  revalidatePath("/tasks");
}
