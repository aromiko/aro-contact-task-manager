import { SupabaseClient } from "@supabase/supabase-js";

export const verifyBusinessOwnership = async (
  supabase: SupabaseClient,
  businessId: string,
  userId: string,
) => {
  const { data, error } = await supabase
    .from("businesses")
    .select("id, owner_id")
    .eq("id", businessId)
    .eq("owner_id", userId)
    .single();

  if (error || !data) {
    throw new Error("Not authorized to access this business");
  }

  return data;
};

export const verifyPersonOwnership = async (
  supabase: SupabaseClient,
  personId: string,
  userId: string,
) => {
  const { data: person, error } = await supabase
    .from("people")
    .select("id, business_id")
    .eq("id", personId)
    .single();

  if (error || !person) {
    throw new Error("Person not found");
  }

  await verifyBusinessOwnership(supabase, person.business_id, userId);

  return person;
};
