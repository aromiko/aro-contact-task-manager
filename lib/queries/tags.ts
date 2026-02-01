import { SupabaseClient } from "@supabase/supabase-js";

import { Database } from "../types/database";

export const getTags = async (supabase: SupabaseClient<Database>) => {
  const { data, error } = await supabase
    .from("tags")
    .select("id, name")
    .order("name");

  if (error) throw error;
  return data ?? [];
};
