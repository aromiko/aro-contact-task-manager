"use server";

import { createSupabaseServerActionClient } from "@/lib/supabase/server-actions";
import { TaskAssignPayload } from "@/lib/types/task";
import { revalidatePath } from "next/cache";

import { requireUser } from "./auth";

export const completeTask = async (taskId: string) => {
  const supabase = await createSupabaseServerActionClient();
  await requireUser(supabase);

  if (!taskId) {
    throw new Error("Invalid task");
  }

  const { error } = await supabase
    .from("tasks")
    .update({ status: "completed" })
    .eq("id", taskId);

  if (error) {
    console.error("completeTask failed", error);
    throw new Error("Unable to complete task");
  }

  revalidatePath("/tasks");
};

export const reopenTask = async (taskId: string) => {
  const supabase = await createSupabaseServerActionClient();
  await requireUser(supabase);

  if (!taskId) {
    throw new Error("Invalid task");
  }

  const { error } = await supabase
    .from("tasks")
    .update({ status: "open" })
    .eq("id", taskId);

  if (error) {
    console.error("reopenTask failed", error);
    throw new Error("Unable to reopen task");
  }

  revalidatePath("/tasks");
};

export const assignTask = async (
  taskId: string,
  payload: TaskAssignPayload,
) => {
  const supabase = await createSupabaseServerActionClient();
  await requireUser(supabase);

  if (!taskId) {
    throw new Error("Invalid task");
  }

  if (payload.personId && payload.businessId) {
    throw new Error("Task can only be assigned to one target");
  }

  await supabase.from("task_assignments").delete().eq("task_id", taskId);

  if (payload.personId || payload.businessId) {
    const { error } = await supabase.from("task_assignments").insert({
      task_id: taskId,
      person_id: payload.personId ?? null,
      business_id: payload.businessId ?? null,
    });

    if (error) {
      console.error("assignTask failed", error);
      throw new Error("Unable to assign task");
    }
  }

  revalidatePath("/tasks");
};

export const createTask = async (input: {
  title: string;
  businessId: string;
  personId?: string;
}) => {
  const supabase = await createSupabaseServerActionClient();

  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .insert({
      title: input.title,
      status: "open",
      business_id: input.businessId,
    })
    .select("id")
    .single();

  if (taskError || !task) {
    console.error(taskError);
    throw new Error("Unable to create task");
  }

  const assignment = input.personId
    ? {
        task_id: task.id,
        person_id: input.personId,
        business_id: null,
      }
    : input.businessId
      ? {
          task_id: task.id,
          person_id: null,
          business_id: input.businessId,
        }
      : null;

  if (!assignment) {
    throw new Error("Task must be assigned");
  }

  const { error: assignmentError } = await supabase
    .from("task_assignments")
    .insert(assignment);

  if (assignmentError) {
    console.error(assignmentError);
    throw new Error("Unable to assign task");
  }

  revalidatePath("/tasks");
};

export const deleteTask = async (taskId: string) => {
  const supabase = await createSupabaseServerActionClient();
  await requireUser(supabase);

  if (!taskId) {
    throw new Error("Invalid task");
  }

  await supabase.from("task_assignments").delete().eq("task_id", taskId);

  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) {
    console.error("deleteTask failed", error);
    throw new Error("Unable to delete task");
  }

  revalidatePath("/tasks");
};
