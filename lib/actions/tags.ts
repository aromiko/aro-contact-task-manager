"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

import { requireUser } from "./guards/auth";
import { assertTagOwnership } from "./guards/tags";

const MAX_TAG_LENGTH = 50;

export const createTag = async (name: string) => {
  const supabase = await createSupabaseServerClient();
  const user = await requireUser(supabase);

  const value = name?.trim();

  if (!value) {
    throw new Error("Tag name is required");
  }

  if (value.length > MAX_TAG_LENGTH) {
    throw new Error("Tag name is too long");
  }

  const { error } = await supabase.from("tags").insert({
    name: value,
    user_id: user.id,
  });

  if (error) {
    console.error("createTag failed", error);
    throw new Error("Unable to create tag");
  }

  revalidatePath("/tags");
};

export const updateTag = async (id: string, name: string) => {
  const supabase = await createSupabaseServerClient();
  const user = await requireUser(supabase);

  if (!id) {
    throw new Error("Invalid tag");
  }

  const value = name?.trim();
  if (!value) {
    throw new Error("Tag name is required");
  }

  if (value.length > MAX_TAG_LENGTH) {
    throw new Error("Tag name is too long");
  }

  await assertTagOwnership(supabase, id, user.id);

  const { error } = await supabase
    .from("tags")
    .update({ name: value })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("updateTag failed", error);
    throw new Error("Unable to update tag");
  }

  revalidatePath("/tags");
};

export const deleteTag = async (id: string) => {
  const supabase = await createSupabaseServerClient();
  const user = await requireUser(supabase);

  if (!id) {
    throw new Error("Invalid tag");
  }

  await assertTagOwnership(supabase, id, user.id);

  const { data, error } = await supabase
    .from("tags")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id");

  if (error) {
    console.error("deleteTag failed", error);
    throw new Error("Unable to delete tag");
  }

  if (!data || data.length === 0) {
    throw new Error("Tag no longer exists or was already deleted");
  }

  revalidatePath("/tags");
};
