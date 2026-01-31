import { SupabaseClient } from "@supabase/supabase-js";

export const assertCategoryOwnership = async (
  supabase: SupabaseClient,
  categoryId: string,
  userId: string,
) => {
  const { data, error } = await supabase
    .from("categories")
    .select("id, user_id")
    .eq("id", categoryId)
    .single();

  if (error || !data) {
    throw new Error("Category not found");
  }

  if (data.user_id !== userId) {
    throw new Error("Not authorized to access this category");
  }

  return data;
};
