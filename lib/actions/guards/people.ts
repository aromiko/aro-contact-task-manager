import { SupabaseClient } from "@supabase/supabase-js";

import { assertBusinessOwnership } from "./business";

export const assertPersonAccess = async (
  supabase: SupabaseClient,
  personId: string,
  userId: string,
) => {
  const { data: person, error: personError } = await supabase
    .from("people")
    .select("id, business_id")
    .eq("id", personId)
    .single();

  if (personError || !person) {
    throw new Error("Person not found");
  }

  if (!person.business_id) {
    throw new Error("Person is not associated with a business");
  }

  await assertBusinessOwnership(supabase, person.business_id, userId);

  return {
    id: person.id,
    business_id: person.business_id,
  };
};
