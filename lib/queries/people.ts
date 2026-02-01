import { SupabaseClient } from "@supabase/supabase-js";

import { Database } from "../types/database";
import { PaginationRange } from "../types/pagination";

export const getPeopleCount = async (
  supabase: SupabaseClient<Database>,
  userId: string,
) => {
  const { data: userBusinesses, error: bizError } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", userId);

  if (bizError) {
    throw bizError;
  }

  const businessIds = userBusinesses?.map((b) => b.id) ?? [];

  const { count, error } = await supabase
    .from("people")
    .select("id", { count: "exact", head: true })
    .in("business_id", businessIds);

  if (error) {
    throw error;
  }

  return count ?? 0;
};

export const getPeople = async (
  supabase: SupabaseClient<Database>,
  userId: string,
  range: { from: number; to: number },
) => {
  const { data: userBusinesses, error: bizError } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", userId);

  if (bizError) throw bizError;

  const businessIds = userBusinesses?.map((b) => b.id) ?? [];

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
    .in("business_id", businessIds)
    .order("created_at", { ascending: false })
    .range(range.from, range.to);

  if (error) return { data: null, error };

  const normalized =
    data?.map((p) => ({
      ...p,
      business: Array.isArray(p.business)
        ? (p.business[0] ?? null)
        : (p.business ?? null),
      tags:
        p.person_tags?.flatMap((pt) =>
          Array.isArray(pt.tag) ? pt.tag : [pt.tag],
        ) ?? [],
    })) ?? [];

  return { data: normalized, error: null };
};

export const getPeopleByBusiness = async (
  supabase: SupabaseClient<Database>,
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
