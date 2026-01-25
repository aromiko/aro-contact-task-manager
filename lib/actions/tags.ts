"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export const createTag = async (name: string) => {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("tags").insert({ name });

  if (error) throw error;

  revalidatePath("/tags");
};

export const updateTag = async (id: string, name: string) => {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("tags").update({ name }).eq("id", id);

  if (error) throw error;

  revalidatePath("/tags");
};

export const deleteTag = async (id: string) => {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("tags").delete().eq("id", id);

  if (error) throw error;

  revalidatePath("/tags");
};
