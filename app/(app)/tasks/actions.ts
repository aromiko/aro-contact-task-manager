"use server";

import { createSupabaseServerActionClient } from "@/lib/supabase/server-actions";
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
