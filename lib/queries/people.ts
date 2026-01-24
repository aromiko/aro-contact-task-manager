import { SupabaseClient } from "@supabase/supabase-js";

import { PaginationRange } from "../types/pagination";

export const getPeopleCount = async (supabase: SupabaseClient) => {
  const { count, error } = await supabase
    .from("people")
    .select("id", { count: "exact", head: true });

  if (error) {
    throw error;
  }

  return count ?? 0;
};

export const getPeople = async (
  supabase: SupabaseClient,
  range: { from: number; to: number },
) => {
  const { data, error } = await supabase
    .from("people")
    .select(
      `
      id,
      name,
      email,
      phone,
      created_at,
      business:businesses (
        id,
        name
      ),
      person_tags (
        tag:tags (
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
    data?.map((p) => ({
      ...p,
      business: p.business?.[0] ?? null,
      tags:
        p.person_tags?.flatMap((pt) =>
          Array.isArray(pt.tag) ? pt.tag : [pt.tag],
        ) ?? [],
    })) ?? [];

  return { data: normalized, error: null };
};

export const getPeopleByBusiness = async (
  supabase: SupabaseClient,
  businessId: string,
  range: PaginationRange,
) => {
  return supabase
    .from("people")
    .select(
      `
      id,
      name,
      email,
      phone,
      created_at,
      business:businesses (
        id,
        name
      )
    `,
    )
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .range(range.from, range.to);
};
