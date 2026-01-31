"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

import { requireUser } from "./auth";

const MAX_CATEGORY_LENGTH = 50;

export const createCategory = async (name: string) => {
  const supabase = await createSupabaseServerClient();
  const user = await requireUser(supabase);

  const value = name?.trim();

  if (!value) {
    throw new Error("Category name is required");
  }

  if (value.length > MAX_CATEGORY_LENGTH) {
    throw new Error("Category name is too long");
  }

  const { error } = await supabase.from("categories").insert({
    name: value,
    user_id: user.id,
  });

  if (error) {
    console.error("createCategory failed", error);
    throw new Error("Unable to create category");
  }

  revalidatePath("/categories");
};

export const updateCategory = async (id: string, name: string) => {
  const supabase = await createSupabaseServerClient();
  await requireUser(supabase);

  if (!id) {
    throw new Error("Invalid category");
  }

  const value = name?.trim();

  if (!value) {
    throw new Error("Category name is required");
  }

  if (value.length > MAX_CATEGORY_LENGTH) {
    throw new Error("Category name is too long");
  }

  const { error } = await supabase
    .from("categories")
    .update({ name: value })
    .eq("id", id);

  if (error) {
    console.error("updateCategory failed", error);
    throw new Error("Unable to update category");
  }

  revalidatePath("/categories");
};

export const deleteCategory = async (id: string) => {
  const supabase = await createSupabaseServerClient();
  await requireUser(supabase);

  if (!id) {
    throw new Error("Invalid category");
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    console.error("deleteCategory failed", error);
    throw new Error("Unable to delete category");
  }

  revalidatePath("/categories");
};
