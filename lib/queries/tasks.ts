import { SupabaseClient } from "@supabase/supabase-js";

import { PaginationRange } from "../types/pagination";

export const getTaskCounts = async (supabase: SupabaseClient) => {
  const [{ count: openCount }, { count: completedCount }] = await Promise.all([
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),

    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed"),
  ]);

  return {
    openCount,
    completedCount,
  };
};

export const getOpenTasks = async (
  supabase: SupabaseClient,
  range: PaginationRange,
) => {
  return supabase
    .from("tasks")
    .select(
      `
      id,
      title,
      status,
      created_at,
      task_assignments (
        person:people ( id, name ),
        business:businesses ( id, name )
      )
    `,
    )
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .range(range.from, range.to);
};

export const getCompletedTasks = async (
  supabase: SupabaseClient,
  range: PaginationRange,
) => {
  return supabase
    .from("tasks")
    .select(
      `
      id,
      title,
      status,
      created_at,
      task_assignments (
        person:people ( id, name ),
        business:businesses ( id, name )
      )
    `,
    )
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .range(range.from, range.to);
};
