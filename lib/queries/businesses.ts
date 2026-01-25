import { SupabaseClient } from "@supabase/supabase-js";

import { PaginationRange } from "../types/pagination";

export const getBusinessCount = async (supabase: SupabaseClient) => {
  const { count, error } = await supabase
    .from("businesses")
    .select("id", { count: "exact", head: true });

  if (error) throw error;
  return count ?? 0;
};

export const getBusinesses = async (
  supabase: SupabaseClient,
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
        tag:tags (
          id,
          name
        )
      ),
      business_categories (
        category:categories (
          id,
          name
        )
      )
    `,
    )
    .order("created_at", { ascending: false })
    .range(range.from, range.to);

  if (error) return { data: null, error };

  const normalized =
    data?.map((b) => ({
      ...b,
      tags:
        b.business_tags?.flatMap((bt) =>
          Array.isArray(bt.tag) ? bt.tag : [bt.tag],
        ) ?? [],
      categories:
        b.business_categories?.flatMap((bc) =>
          Array.isArray(bc.category) ? bc.category : [bc.category],
        ) ?? [],
    })) ?? [];

  return { data: normalized, error: null };
};
