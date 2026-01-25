import { SupabaseClient } from "@supabase/supabase-js";

export const getCategories = async (supabase: SupabaseClient) => {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  if (error) throw error;
  return data ?? [];
};
