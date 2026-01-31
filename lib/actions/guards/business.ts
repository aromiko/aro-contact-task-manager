import { SupabaseClient } from "@supabase/supabase-js";

export const assertBusinessOwnership = async (
  supabase: SupabaseClient,
  businessId: string,
  userId: string,
) => {
  const { data, error } = await supabase
    .from("businesses")
    .select("id, owner_id")
    .eq("id", businessId)
    .single();

  if (error || !data) {
    throw new Error("Business not found");
  }

  if (data.owner_id !== userId) {
    throw new Error("Not authorized to modify this business");
  }

  return data;
};
