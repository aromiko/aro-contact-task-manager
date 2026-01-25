"use server";

import { createSupabaseServerActionClient } from "@/lib/supabase/server-actions";
import { TaskAssignPayload } from "@/lib/types/task";
import { revalidatePath } from "next/cache";

export const completeTask = async (taskId: string) => {
  const supabase = await createSupabaseServerActionClient();

  const { error } = await supabase
    .from("tasks")
    .update({ status: "completed" })
    .eq("id", taskId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/tasks");
};

export const reopenTask = async (taskId: string) => {
  const supabase = await createSupabaseServerActionClient();

  const { error } = await supabase
    .from("tasks")
    .update({ status: "open" })
    .eq("id", taskId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/tasks");
};

export const assignTask = async (
  taskId: string,
  payload: TaskAssignPayload,
) => {
  const supabase = await createSupabaseServerActionClient();

  await supabase.from("task_assignments").delete().eq("task_id", taskId);

  const { error } = await supabase.from("task_assignments").insert({
    task_id: taskId,
    person_id: payload.personId ?? null,
    business_id: payload.businessId ?? null,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/tasks");
};

export const createTask = async (input: {
  title: string;
  personId?: string;
  businessId?: string;
}) => {
  const supabase = await createSupabaseServerActionClient();

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      title: input.title,
      status: "open",
    })
    .select("id")
    .single();

  if (error) throw error;

  if (input.personId || input.businessId) {
    await supabase.from("task_assignments").insert({
      task_id: task.id,
      person_id: input.personId ?? null,
      business_id: input.businessId ?? null,
    });
  }

  revalidatePath("/tasks");
  revalidatePath(`/people/${input.personId}`);

  return task.id;
};

export const deleteTask = async (taskId: string) => {
  const supabase = await createSupabaseServerActionClient();

  await supabase.from("task_assignments").delete().eq("task_id", taskId);

  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) throw new Error(error.message);

  revalidatePath("/tasks");
};
