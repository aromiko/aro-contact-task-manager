"use server";

import { createSupabaseServerActionClient } from "@/lib/supabase/server-actions";
import { TaskAssignPayload } from "@/lib/types/task";
import { revalidatePath } from "next/cache";

import { requireUser } from "./guards/auth";
import { assertBusinessOwnership } from "./guards/business";
import { assertTaskAccess } from "./guards/tasks";

export const completeTask = async (taskId: string) => {
  const supabase = await createSupabaseServerActionClient();
  const user = await requireUser(supabase);

  if (!taskId) {
    throw new Error("Invalid task");
  }

  const task = await assertTaskAccess(supabase, taskId, user.id);

  const { error } = await supabase
    .from("tasks")
    .update({ status: "completed" })
    .eq("id", taskId)
    .eq("business_id", task.business_id);

  if (error) {
    console.error("completeTask failed", error);
    throw new Error("Unable to complete task");
  }

  revalidatePath("/tasks");
  revalidatePath(`/businesses/${task.business_id}`);
};

export const reopenTask = async (taskId: string) => {
  const supabase = await createSupabaseServerActionClient();
  const user = await requireUser(supabase);

  if (!taskId) {
    throw new Error("Invalid task");
  }

  const task = await assertTaskAccess(supabase, taskId, user.id);

  const { error } = await supabase
    .from("tasks")
    .update({ status: "open" })
    .eq("id", taskId)
    .eq("business_id", task.business_id);

  if (error) {
    console.error("reopenTask failed", error);
    throw new Error("Unable to reopen task");
  }

  revalidatePath("/tasks");
  revalidatePath(`/businesses/${task.business_id}`);
};

export const assignTask = async (
  taskId: string,
  payload: TaskAssignPayload,
) => {
  const supabase = await createSupabaseServerActionClient();
  const user = await requireUser(supabase);

  if (!taskId) {
    throw new Error("Invalid task");
  }

  if (payload.personId && payload.businessId) {
    throw new Error("Task can only be assigned to one target");
  }

  const task = await assertTaskAccess(supabase, taskId, user.id);

  const { error: deleteError } = await supabase
    .from("task_assignments")
    .delete()
    .eq("task_id", taskId);

  if (deleteError) {
    console.error("delete task_assignments failed", deleteError);
    throw new Error("Unable to assign task");
  }

  if (payload.personId) {
    const { error } = await supabase.from("task_assignments").insert({
      task_id: taskId,
      person_id: payload.personId,
      business_id: null,
    });

    if (error) {
      console.error("assignTask failed", error);
      throw new Error("Unable to assign task");
    }
  }

  if (payload.businessId) {
    const { error } = await supabase.from("task_assignments").insert({
      task_id: taskId,
      person_id: null,
      business_id: payload.businessId,
    });

    if (error) {
      console.error("assignTask failed", error);
      throw new Error("Unable to assign task");
    }
  }

  revalidatePath("/tasks");
  revalidatePath(`/businesses/${task.business_id}`);
};

export const createTask = async (input: {
  title: string;
  businessId: string;
  personId?: string;
}) => {
  const supabase = await createSupabaseServerActionClient();
  const user = await requireUser(supabase);

  const title = input.title?.trim();

  if (!title) {
    throw new Error("Task title is required");
  }

  if (!input.businessId) {
    throw new Error("Business is required");
  }

  await assertBusinessOwnership(supabase, input.businessId, user.id);

  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .insert({
      title,
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
    : {
        task_id: task.id,
        person_id: null,
        business_id: input.businessId,
      };

  const { error: assignmentError } = await supabase
    .from("task_assignments")
    .insert(assignment);

  if (assignmentError) {
    console.error(assignmentError);
    throw new Error("Unable to assign task");
  }

  revalidatePath("/tasks");
  revalidatePath(`/businesses/${input.businessId}`);
};

export const deleteTask = async (taskId: string) => {
  const supabase = await createSupabaseServerActionClient();
  const user = await requireUser(supabase);

  if (!taskId) {
    throw new Error("Invalid task");
  }

  const task = await assertTaskAccess(supabase, taskId, user.id);

  const { error: deleteAssignmentsError } = await supabase
    .from("task_assignments")
    .delete()
    .eq("task_id", taskId);

  if (deleteAssignmentsError) {
    console.error("delete task_assignments failed", deleteAssignmentsError);
    throw new Error("Unable to delete task");
  }

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("business_id", task.business_id);

  if (error) {
    console.error("deleteTask failed", error);
    throw new Error("Unable to delete task");
  }

  revalidatePath("/tasks");
  revalidatePath(`/businesses/${task.business_id}`);
};
