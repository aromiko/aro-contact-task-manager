import { SupabaseClient } from "@supabase/supabase-js";

import { Database } from "../types/database";

export const getPeopleLookup = async (supabase: SupabaseClient<Database>) => {
  const { data, error } = await supabase
    .from("people")
    .select("id, name, business_id")
    .order("name");

  if (error) throw error;
  return data ?? [];
};

export const getBusinessesLookup = async (
  supabase: SupabaseClient<Database>,
) => {
  const { data, error } = await supabase
    .from("businesses")
    .select("id, name")
    .order("name");

  if (error) throw error;
  return data ?? [];
};

export const getTagsLookup = async (supabase: SupabaseClient<Database>) => {
  const { data, error } = await supabase
    .from("tags")
    .select("id, name")
    .order("name");

  if (error) throw error;
  return data ?? [];
};

export const getCategoriesLookup = async (
  supabase: SupabaseClient<Database>,
) => {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  if (error) throw error;
  return data ?? [];
};
