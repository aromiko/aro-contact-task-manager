"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

import { requireUser } from "./auth";

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
  business_id: string;
}) => {
  const supabase = await createSupabaseServerClient();

  if (!input.business_id) {
    throw new Error("Business is required");
  }

  const { data, error } = await supabase
    .from("people")
    .insert(input)
    .select("id")
    .single();

  if (error) {
    console.error("createPerson failed", error);
    throw new Error("Unable to create person");
  }

  revalidatePath("/people");
  return data.id;
};

export const updatePerson = async (personId: string, input: PersonInput) => {
  const supabase = await createSupabaseServerClient();
  await requireUser(supabase);

  if (!personId) {
    throw new Error("Invalid person");
  }

  const name = input.name?.trim();

  if (!name) {
    throw new Error("Name is required");
  }

  if (name.length > 100) {
    throw new Error("Name is too long");
  }

  const email = input.email?.trim() || null;
  const phone = input.phone?.trim() || null;

  const { error } = await supabase
    .from("people")
    .update({
      name,
      email,
      phone,
      business_id: input.business_id,
    })
    .eq("id", personId);

  if (error) {
    console.error("updatePerson failed", error);
    throw new Error("Unable to update person");
  }

  revalidatePath("/people");
};

export const deletePerson = async (personId: string) => {
  const supabase = await createSupabaseServerClient();
  await requireUser(supabase);

  if (!personId) {
    throw new Error("Invalid person");
  }

  const { error } = await supabase.from("people").delete().eq("id", personId);

  if (error) {
    console.error("deletePerson failed", error);
    throw new Error("Unable to delete person");
  }

  revalidatePath("/people");
};

export const updatePersonTags = async (personId: string, tagIds: string[]) => {
  const supabase = await createSupabaseServerClient();
  await requireUser(supabase);

  if (!personId) {
    throw new Error("Invalid person");
  }

  const uniqueTagIds = Array.from(new Set(tagIds.filter(Boolean)));

  await supabase.from("person_tags").delete().eq("person_id", personId);

  if (uniqueTagIds.length > 0) {
    const rows = uniqueTagIds.map((tagId) => ({
      person_id: personId,
      tag_id: tagId,
    }));

    const { error } = await supabase.from("person_tags").insert(rows);

    if (error) {
      console.error("updatePersonTags failed", error);
      throw new Error("Unable to update person tags");
    }
  }

  revalidatePath("/people");
};
