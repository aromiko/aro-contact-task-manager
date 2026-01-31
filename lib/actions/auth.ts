import { SupabaseClient } from "@supabase/supabase-js";

export const requireUser = async (supabase: SupabaseClient) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  return user;
};
