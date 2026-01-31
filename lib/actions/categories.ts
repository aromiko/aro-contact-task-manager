"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { handleActionError } from "@/lib/utils/action-error";
import { revalidatePath } from "next/cache";

import { requireUser } from "./guards/auth";
import { assertCategoryOwnership } from "./guards/categories";

const MAX_CATEGORY_LENGTH = 50;

export const createCategory = async (name: string) => {
  try {
    const value = name?.trim();

    if (!value) {
      throw new Error("Category name is required");
    }

    if (value.length > MAX_CATEGORY_LENGTH) {
      throw new Error("Category name is too long");
    }

    const supabase = await createSupabaseServerClient();
    const user = await requireUser(supabase);

    const { error } = await supabase.from("categories").insert({
      name: value,
      user_id: user.id,
    });

    if (error) {
      throw new Error("Failed to create category");
    }

    revalidatePath("/categories");
  } catch (error) {
    const actionError = handleActionError(error);
    throw new Error(actionError.message);
  }
};

export const updateCategory = async (id: string, name: string) => {
  try {
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

    const supabase = await createSupabaseServerClient();
    const user = await requireUser(supabase);

    await assertCategoryOwnership(supabase, id, user.id);

    const { error } = await supabase
      .from("categories")
      .update({ name: value })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      throw new Error("Failed to update category");
    }

    revalidatePath("/categories");
  } catch (error) {
    const actionError = handleActionError(error);
    throw new Error(actionError.message);
  }
};

export const deleteCategory = async (id: string) => {
  try {
    if (!id) {
      throw new Error("Invalid category");
    }

    const supabase = await createSupabaseServerClient();
    const user = await requireUser(supabase);

    await assertCategoryOwnership(supabase, id, user.id);

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      throw new Error("Failed to delete category");
    }

    revalidatePath("/categories");
  } catch (error) {
    const actionError = handleActionError(error);
    throw new Error(actionError.message);
  }
};
