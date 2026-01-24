import { SupabaseClient } from "@supabase/supabase-js";

export const getPeopleAndBusinesses = async (supabase: SupabaseClient) => {
  const [{ data: people }, { data: businesses }] = await Promise.all([
    supabase.from("people").select("id, name").order("name"),
    supabase.from("businesses").select("id, name").order("name"),
  ]);

  return {
    people: people ?? [],
    businesses: businesses ?? [],
  };
};
