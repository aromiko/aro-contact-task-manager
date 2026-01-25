import { SupabaseClient } from "@supabase/supabase-js";

export const getTags = async (supabase: SupabaseClient) => {
  const { data, error } = await supabase
    .from("tags")
    .select("id, name")
    .order("name");

  if (error) throw error;
  return data ?? [];
};
