"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { handleActionError } from "@/lib/utils/action-error";
import { revalidatePath } from "next/cache";

import type { TablesInsert, TablesUpdate } from "../types/database";
import { requireUser } from "./guards/auth";
import { assertTagOwnership } from "./guards/tags";

const MAX_TAG_LENGTH = 50;

const normalizeTagName = (name: string) => {
  const value = name?.trim();

  if (!value) {
    throw new Error("Tag name is required");
  }

  if (value.length > MAX_TAG_LENGTH) {
    throw new Error("Tag name is too long");
  }

  return value;
};

export const createTag = async (name: string) => {
  try {
    const value = normalizeTagName(name);

    const supabase = await createSupabaseServerClient();
    const user = await requireUser(supabase);

    const insert: TablesInsert<"tags"> = {
      name: value,
      user_id: user.id,
    };

    const { error } = await supabase.from("tags").insert(insert);

    if (error) {
      throw new Error("Failed to create tag");
    }

    revalidatePath("/tags");
  } catch (error) {
    const actionError = handleActionError(error);
    throw new Error(actionError.message);
  }
};

export const updateTag = async (id: string, name: string) => {
  try {
    if (!id) {
      throw new Error("Invalid tag");
    }

    const value = normalizeTagName(name);
    if (!value) {
      throw new Error("Tag name is required");
    }

    if (value.length > MAX_TAG_LENGTH) {
      throw new Error("Tag name is too long");
    }

    const supabase = await createSupabaseServerClient();
    const user = await requireUser(supabase);

    await assertTagOwnership(supabase, id, user.id);

    const updates: TablesUpdate<"tags"> = {
      name: value,
    };

    const { error } = await supabase
      .from("tags")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      throw new Error("Failed to update tag");
    }

    revalidatePath("/tags");
  } catch (error) {
    const actionError = handleActionError(error);
    throw new Error(actionError.message);
  }
};

export const deleteTag = async (id: string) => {
  try {
    if (!id) {
      throw new Error("Invalid tag");
    }

    const supabase = await createSupabaseServerClient();
    const user = await requireUser(supabase);

    await assertTagOwnership(supabase, id, user.id);

    const { data, error } = await supabase
      .from("tags")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id");

    if (error) {
      throw new Error("Failed to delete tag");
    }

    if (!data || data.length === 0) {
      throw new Error("Tag no longer exists or was already deleted");
    }

    revalidatePath("/tags");
  } catch (error) {
    const actionError = handleActionError(error);
    throw new Error(actionError.message);
  }
};
