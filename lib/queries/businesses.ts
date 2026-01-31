import { SupabaseClient } from "@supabase/supabase-js";

import { PaginationRange } from "../types/pagination";

export const getBusinessCount = async (
  supabase: SupabaseClient,
  userId: string,
) => {
  const { count, error } = await supabase
    .from("businesses")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", userId); // Scope by user

  if (error) throw error;
  return count ?? 0;
};

export const getBusinesses = async (
  supabase: SupabaseClient,
  userId: string,
  range: PaginationRange,
) => {
  const { data, error } = await supabase
    .from("businesses")
    .select(
      `
      id,
      name,
      created_at,
      business_tags (
        tags (
          id,
          name
        )
      ),
      business_categories (
        categories (
          id,
          name
        )
      )
    `,
    )
    .eq("owner_id", userId) // Scope by user
    .range(range.from, range.to)
    .order("created_at", { ascending: false });

  if (error) return { data: null, error };

  const normalized = data.map((business) => ({
    id: business.id,
    name: business.name,
    created_at: business.created_at,
    tags: business.business_tags.map((bt) => bt.tags).flat(),
    categories: business.business_categories.map((bc) => bc.categories).flat(),
  }));

  return { data: normalized, error: null };
};
