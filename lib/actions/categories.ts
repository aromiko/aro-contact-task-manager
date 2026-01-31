"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

import { requireUser } from "./auth";

export const createCategory = async (name: string) => {
  const supabase = await createSupabaseServerClient();
  const user = await requireUser(supabase);

  const { error } = await supabase.from("categories").insert({
    name,
    user_id: user.id,
  });

  if (error) throw error;

  revalidatePath("/categories");
};

export const updateCategory = async (id: string, name: string) => {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("categories")
    .update({ name })
    .eq("id", id);

  if (error) throw error;

  revalidatePath("/categories");
};

export const deleteCategory = async (id: string) => {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) throw error;

  revalidatePath("/categories");
};
