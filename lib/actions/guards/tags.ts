import { SupabaseClient } from "@supabase/supabase-js";

export const assertTagOwnership = async (
  supabase: SupabaseClient,
  tagId: string,
  userId: string,
) => {
  const { data, error } = await supabase
    .from("tags")
    .select("id, user_id")
    .eq("id", tagId)
    .single();

  if (error || !data) {
    throw new Error("Tag not found");
  }

  if (data.user_id !== userId) {
    throw new Error("Not authorized to access this tag");
  }

  return data;
};
