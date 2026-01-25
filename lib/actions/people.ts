"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type PersonInput = {
  name: string;
  email: string | null;
  phone: string | null;
  business_id: string | null;
};

export const createPerson = async (input: PersonInput) => {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("people").insert(input);

  if (error) {
    throw error;
  }

  revalidatePath("/people");
};

export const updatePerson = async (personId: string, input: PersonInput) => {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("people")
    .update(input)
    .eq("id", personId);

  if (error) {
    throw error;
  }

  revalidatePath("/people");
};

export const deletePerson = async (personId: string) => {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("people").delete().eq("id", personId);

  if (error) {
    throw error;
  }

  revalidatePath("/people");
};
