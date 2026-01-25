"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type PersonInput = {
  name: string;
  email: string | null;
  phone: string | null;
  business_id: string | null;
};

export const createPerson = async (input: {
  name: string;
  email: string | null;
  phone: string | null;
  business_id: string | null;
}) => {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("people")
    .insert(input)
    .select("id")
    .single();

  if (error) throw error;

  revalidatePath("/people");

  return data.id;
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

export const updatePersonTags = async (personId: string, tagIds: string[]) => {
  const supabase = await createSupabaseServerClient();

  // remove existing tags
  await supabase.from("person_tags").delete().eq("person_id", personId);

  // insert new tags
  if (tagIds.length > 0) {
    const rows = tagIds.map((tagId) => ({
      person_id: personId,
      tag_id: tagId,
    }));

    const { error } = await supabase.from("person_tags").insert(rows);

    if (error) throw error;
  }

  revalidatePath("/people");
};
