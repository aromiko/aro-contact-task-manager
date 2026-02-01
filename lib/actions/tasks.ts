"use server";

import {
  assignTaskSchema,
  completeTaskSchema,
  createTaskSchema,
  deleteTaskSchema,
  reopenTaskSchema,
} from "@/lib/schemas/validation";
import { createSupabaseServerActionClient } from "@/lib/supabase/server-actions";
import { handleActionError } from "@/lib/utils/action-error";
import { revalidatePath } from "next/cache";

import type { TablesInsert, TablesUpdate } from "../types/database";
import { AssignTaskPayload, CreateTaskInput } from "../types/task";
import { requireUser } from "./guards/auth";
import { assertBusinessOwnership } from "./guards/business";
import { assertTaskAccess } from "./guards/tasks";

const revalidateTaskPaths = (businessId: string) => {
  revalidatePath("/tasks");
  revalidatePath(`/businesses/${businessId}`);
};

export const completeTask = async (taskId: string) => {
  try {
    const validated = completeTaskSchema.parse({ taskId });
    const supabase = await createSupabaseServerActionClient();
    const user = await requireUser(supabase);

    const task = await assertTaskAccess(supabase, validated.taskId, user.id);

    const updates: TablesUpdate<"tasks"> = {
      status: "completed",
    };

    const { error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", validated.taskId)
      .eq("business_id", task.business_id);

    if (error) throw error;

    revalidateTaskPaths(task.business_id);
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

    const updates: TablesUpdate<"tasks"> = {
      status: "open",
    };

    const { error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", validated.taskId)
      .eq("business_id", task.business_id);

    if (error) throw error;

    revalidateTaskPaths(task.business_id);
  } catch (error) {
    const actionError = handleActionError(error);
    throw new Error(actionError.message);
  }
};

export const assignTask = async (
  taskId: string,
  payload: AssignTaskPayload,
) => {
  try {
    const validated = assignTaskSchema.parse({
      taskId,
      personId: payload.person_id,
      businessId: payload.business_id,
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
      const assignment: TablesInsert<"task_assignments"> = {
        task_id: validated.taskId,
        person_id: validated.personId,
        business_id: null,
      };

      const { error: insertError } = await supabase
        .from("task_assignments")
        .insert(assignment);

      if (insertError) {
        throw new Error("Failed to assign task");
      }
    }

    if (validated.businessId) {
      const assignment: TablesInsert<"task_assignments"> = {
        task_id: validated.taskId,
        person_id: null,
        business_id: validated.businessId,
      };

      const { error: insertError } = await supabase
        .from("task_assignments")
        .insert(assignment);

      if (insertError) {
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

export const createTask = async (input: CreateTaskInput) => {
  try {
    const validated = createTaskSchema.parse(input);
    const supabase = await createSupabaseServerActionClient();
    const user = await requireUser(supabase);

    if (!validated.businessId) {
      throw new Error("Business ID is required");
    }

    await assertBusinessOwnership(supabase, validated.businessId, user.id);

    const taskInsert: TablesInsert<"tasks"> = {
      title: validated.title,
      status: "open",
      business_id: validated.businessId,
    };

    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .insert(taskInsert)
      .select("id")
      .single<{ id: string }>();

    if (taskError || !task) throw taskError;

    const assignment: TablesInsert<"task_assignments"> = {
      task_id: task.id,
      person_id: validated.personId ?? null,
      business_id: validated.personId ? null : validated.businessId,
    };

    const { error: assignmentError } = await supabase
      .from("task_assignments")
      .insert(assignment);

    if (assignmentError) throw assignmentError;

    revalidateTaskPaths(validated.businessId);
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

    if (deleteAssignmentsError) throw deleteAssignmentsError;

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", validated.id)
      .eq("business_id", task.business_id);

    if (error) throw error;

    revalidateTaskPaths(task.business_id);
  } catch (error) {
    const actionError = handleActionError(error);
    throw new Error(actionError.message);
  }
};
