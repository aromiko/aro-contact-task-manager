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

export const getTaskCountByPerson = async (
  supabase: SupabaseClient,
  personId: string,
) => {
  const { count, error } = await supabase
    .from("task_assignments")
    .select("task_id", { count: "exact", head: true })
    .eq("person_id", personId);

  if (error) throw error;

  return count ?? 0;
};

export const getTasksByPerson = async (
  supabase: SupabaseClient,
  personId: string,
  range: { from: number; to: number },
) => {
  return supabase
    .from("tasks")
    .select(
      `
      id,
      title,
      status,
      created_at,
      task_assignments!inner (
        person:people ( id, name ),
        business:businesses ( id, name )
      )
    `,
    )
    .eq("task_assignments.person_id", personId)
    .order("created_at", { ascending: false })
    .range(range.from, range.to);
};

export const getTaskCountByBusiness = async (
  supabase: SupabaseClient,
  businessId: string,
) => {
  const { count, error } = await supabase
    .from("task_assignments")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId);

  if (error) {
    console.error(error);
    return 0;
  }

  return count ?? 0;
};

export const getTasksByBusiness = async (
  supabase: SupabaseClient,
  businessId: string,
  range: { from: number; to: number },
) => {
  return supabase
    .from("tasks")
    .select(
      `
      id,
      title,
      status,
      created_at,
      task_assignments!inner (
        person:people!inner ( id, name, business_id ),
        business:businesses ( id, name )
      )
    `,
    )
    .eq("task_assignments.person.business_id", businessId)
    .order("created_at", { ascending: false })
    .range(range.from, range.to);
};
