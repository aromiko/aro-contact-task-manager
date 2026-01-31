"use server";

import {
  assignTaskSchema,
  completeTaskSchema,
  createTaskSchema,
  deleteTaskSchema,
  reopenTaskSchema,
} from "@/lib/schemas/validation";
import { createSupabaseServerActionClient } from "@/lib/supabase/server-actions";
import { TaskAssignPayload } from "@/lib/types/task";
import { handleActionError } from "@/lib/utils/action-error";
import { revalidatePath } from "next/cache";

import { requireUser } from "./guards/auth";
import { assertBusinessOwnership } from "./guards/business";
import { assertTaskAccess } from "./guards/tasks";

export const completeTask = async (taskId: string) => {
  try {
    const validated = completeTaskSchema.parse({ taskId });
    const supabase = await createSupabaseServerActionClient();
    const user = await requireUser(supabase);

    const task = await assertTaskAccess(supabase, validated.taskId, user.id);

    const { error } = await supabase
      .from("tasks")
      .update({ status: "completed" })
      .eq("id", validated.taskId)
      .eq("business_id", task.business_id);

    if (error) {
      throw new Error("Failed to complete task");
    }

    revalidatePath("/tasks");
    revalidatePath(`/businesses/${task.business_id}`);
  } catch (error) {
    const actionError = handleActionError(error);
    throw new Error(actionError.message);
  }
};

export const reopenTask = async (taskId: string) => {
  try {
    const validated = reopenTaskSchema.parse({ taskId });
    const supabase = await createSupabaseServerActionClient();
    const user = await requireUser(supabase);

    const task = await assertTaskAccess(supabase, validated.taskId, user.id);

    const { error } = await supabase
      .from("tasks")
      .update({ status: "open" })
      .eq("id", validated.taskId)
      .eq("business_id", task.business_id);

    if (error) {
      throw new Error("Failed to reopen task");
    }

    revalidatePath("/tasks");
    revalidatePath(`/businesses/${task.business_id}`);
  } catch (error) {
    const actionError = handleActionError(error);
    throw new Error(actionError.message);
  }
};

export const assignTask = async (
  taskId: string,
  payload: TaskAssignPayload,
) => {
  try {
    const validated = assignTaskSchema.parse({
      taskId,
      personId: payload.personId,
      businessId: payload.businessId,
    });

    if (validated.personId && validated.businessId) {
      throw new Error("Task can only be assigned to one target");
    }

    const supabase = await createSupabaseServerActionClient();
    const user = await requireUser(supabase);
    const task = await assertTaskAccess(supabase, validated.taskId, user.id);

    const { error: deleteError } = await supabase
      .from("task_assignments")
      .delete()
      .eq("task_id", validated.taskId);

    if (deleteError) {
      throw new Error("Failed to assign task");
    }

    if (validated.personId) {
      const { error } = await supabase.from("task_assignments").insert({
        task_id: validated.taskId,
        person_id: validated.personId,
        business_id: null,
      });

      if (error) {
        throw new Error("Failed to assign task");
      }
    }

    if (validated.businessId) {
      const { error } = await supabase.from("task_assignments").insert({
        task_id: validated.taskId,
        person_id: null,
        business_id: validated.businessId,
      });

      if (error) {
        throw new Error("Failed to assign task");
      }
    }

    revalidatePath("/tasks");
    revalidatePath(`/businesses/${task.business_id}`);
  } catch (error) {
    const actionError = handleActionError(error);
    throw new Error(actionError.message);
  }
};

export const createTask = async (input: unknown) => {
  try {
    const validated = createTaskSchema.parse(input);
    const supabase = await createSupabaseServerActionClient();
    const user = await requireUser(supabase);

    if (!validated.businessId) {
      throw new Error("Business is required");
    }

    await assertBusinessOwnership(supabase, validated.businessId, user.id);

    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .insert({
        title: validated.title,
        status: "open",
        business_id: validated.businessId,
      })
      .select("id")
      .single();

    if (taskError || !task) {
      throw new Error("Failed to create task");
    }

    const assignment = validated.personId
      ? {
          task_id: task.id,
          person_id: validated.personId,
          business_id: null,
        }
      : {
          task_id: task.id,
          person_id: null,
          business_id: validated.businessId,
        };

    const { error: assignmentError } = await supabase
      .from("task_assignments")
      .insert(assignment);

    if (assignmentError) {
      throw new Error("Failed to assign task");
    }

    revalidatePath("/tasks");
    revalidatePath(`/businesses/${validated.businessId}`);
    return task.id;
  } catch (error) {
    const actionError = handleActionError(error);
    const errorMessage = actionError.fields
      ? Object.entries(actionError.fields)
          .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
          .join("\n")
      : actionError.message;
    throw new Error(errorMessage);
  }
};

export const deleteTask = async (taskId: string) => {
  try {
    const validated = deleteTaskSchema.parse({ id: taskId });
    const supabase = await createSupabaseServerActionClient();
    const user = await requireUser(supabase);

    const task = await assertTaskAccess(supabase, validated.id, user.id);

    const { error: deleteAssignmentsError } = await supabase
      .from("task_assignments")
      .delete()
      .eq("task_id", validated.id);

    if (deleteAssignmentsError) {
      throw new Error("Failed to delete task");
    }

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", validated.id)
      .eq("business_id", task.business_id);

    if (error) {
      throw new Error("Failed to delete task");
    }

    revalidatePath("/tasks");
    revalidatePath(`/businesses/${task.business_id}`);
  } catch (error) {
    const actionError = handleActionError(error);
    throw new Error(actionError.message);
  }
};
