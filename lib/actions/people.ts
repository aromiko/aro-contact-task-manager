"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

import { requireUser } from "./guards/auth";
import { assertBusinessOwnership } from "./guards/business";
import { assertPersonAccess } from "./guards/people";

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
  const user = await requireUser(supabase);

  const name = input.name?.trim();

  if (!name) {
    throw new Error("Name is required");
  }

  if (name.length > 100) {
    throw new Error("Name is too long");
  }

  if (!input.business_id) {
    throw new Error("Business is required");
  }

  await assertBusinessOwnership(supabase, input.business_id, user.id);

  const { data, error } = await supabase
    .from("people")
    .insert({
      name,
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      business_id: input.business_id,
    })
    .select("id")
    .single();

  if (error) {
    console.error("createPerson failed", error);
    throw new Error("Unable to create person");
  }

  revalidatePath("/people");
  revalidatePath(`/businesses/${input.business_id}`);
  return data.id;
};

export const updatePerson = async (personId: string, input: PersonInput) => {
  const supabase = await createSupabaseServerClient();
  const user = await requireUser(supabase);

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

  const person = await assertPersonAccess(supabase, personId, user.id);

  const email = input.email?.trim() || null;
  const phone = input.phone?.trim() || null;

  const { error } = await supabase
    .from("people")
    .update({
      name,
      email,
      phone,
      business_id: input.business_id ?? person.business_id,
    })
    .eq("id", personId)
    .eq("business_id", person.business_id);

  if (error) {
    console.error("updatePerson failed", error);
    throw new Error("Unable to update person");
  }

  revalidatePath("/people");
  revalidatePath(`/businesses/${person.business_id}`);
};

export const deletePerson = async (personId: string) => {
  const supabase = await createSupabaseServerClient();
  const user = await requireUser(supabase);

  if (!personId) {
    throw new Error("Invalid person");
  }

  const person = await assertPersonAccess(supabase, personId, user.id);

  const { error } = await supabase
    .from("people")
    .delete()
    .eq("id", personId)
    .eq("business_id", person.business_id);

  if (error) {
    console.error("deletePerson failed", error);
    throw new Error("Unable to delete person");
  }

  revalidatePath("/people");
  revalidatePath(`/businesses/${person.business_id}`);
};

export const updatePersonTags = async (personId: string, tagIds: string[]) => {
  const supabase = await createSupabaseServerClient();
  const user = await requireUser(supabase);

  if (!personId) {
    throw new Error("Invalid person");
  }

  const person = await assertPersonAccess(supabase, personId, user.id);

  const uniqueTagIds = Array.from(new Set(tagIds.filter(Boolean)));

  const { error: deleteError } = await supabase
    .from("person_tags")
    .delete()
    .eq("person_id", personId);

  if (deleteError) {
    console.error("delete person_tags failed", deleteError);
    throw new Error("Unable to update person tags");
  }

  if (uniqueTagIds.length > 0) {
    const rows = uniqueTagIds.map((tagId) => ({
      person_id: personId,
      tag_id: tagId,
    }));

    const { error: insertError } = await supabase
      .from("person_tags")
      .insert(rows);

    if (insertError) {
      console.error("insert person_tags failed", insertError);
      throw new Error("Unable to update person tags");
    }
  }

  revalidatePath("/people");
  revalidatePath(`/businesses/${person.business_id}`);
};
