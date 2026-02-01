import { SupabaseClient } from "@supabase/supabase-js";

import { Database } from "../types/database";

export const getCategories = async (supabase: SupabaseClient<Database>) => {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  if (error) throw error;
  return data ?? [];
};
