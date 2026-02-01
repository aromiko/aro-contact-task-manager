"use server";

import {
  createBusinessSchema,
  updateBusinessSchema,
} from "@/lib/schemas/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { handleActionError } from "@/lib/utils/action-error";
import { revalidatePath } from "next/cache";

import type { TablesInsert, TablesUpdate } from "../types/database";
import { requireUser } from "./guards/auth";
import { assertBusinessOwnership } from "./guards/business";

const revalidateBusinessPaths = (businessId?: string) => {
  revalidatePath("/businesses");

  if (businessId) {
    revalidatePath(`/businesses/${businessId}`);
  }
};

export const createBusiness = async (input: unknown) => {
  try {
    const validated = createBusinessSchema.parse(input);

    const supabase = await createSupabaseServerClient();
    const user = await requireUser(supabase);

    const insert: TablesInsert<"businesses"> = {
      name: validated.name,
      owner_id: user.id,
    };

    const { data, error } = await supabase
      .from("businesses")
      .insert(insert)
      .select("id")
      .single<{ id: string }>();

    if (error) {
      throw new Error("Failed to create business");
    }

    revalidateBusinessPaths();
    return data.id;
  } catch (error) {
    const actionError = handleActionError(error);
    const errorMessage = actionError.fields
      ? Object.entries(actionError.fields)
          .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
          .join("\n")
      : actionError.message;

    throw new Error(errorMessage);
  }
};

export const updateBusiness = async (id: string, input: unknown) => {
  try {
    const validated = updateBusinessSchema.parse({
      id,
      ...(typeof input === "object" && input !== null ? input : {}),
    });

    const supabase = await createSupabaseServerClient();
    const user = await requireUser(supabase);

    await assertBusinessOwnership(supabase, validated.id, user.id);

    const updates: TablesUpdate<"businesses"> = {
      name: validated.name,
    };

    const { error } = await supabase
      .from("businesses")
      .update(updates)
      .eq("id", validated.id)
      .eq("owner_id", user.id);

    if (error) {
      throw new Error("Failed to update business");
    }

    revalidateBusinessPaths(validated.id);
  } catch (error) {
    const actionError = handleActionError(error);
    const errorMessage = actionError.fields
      ? Object.entries(actionError.fields)
          .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
          .join("\n")
      : actionError.message;

    throw new Error(errorMessage);
  }
};

export const updateBusinessTags = async (
  businessId: string,
  tagIds: string[],
) => {
  try {
    if (!businessId) {
      throw new Error("Invalid business ID");
    }

    if (!Array.isArray(tagIds)) {
      throw new Error("Invalid tag IDs");
    }

    const supabase = await createSupabaseServerClient();
    const user = await requireUser(supabase);

    await assertBusinessOwnership(supabase, businessId, user.id);

    const uniqueTagIds = Array.from(new Set(tagIds.filter(Boolean)));

    const { error: deleteError } = await supabase
      .from("business_tags")
      .delete()
      .eq("business_id", businessId);

    if (deleteError) throw deleteError;

    if (uniqueTagIds.length > 0) {
      const rows: TablesInsert<"business_tags">[] = uniqueTagIds.map(
        (tagId) => ({
          business_id: businessId,
          tag_id: tagId,
        }),
      );

      const { error: insertError } = await supabase
        .from("business_tags")
        .insert(rows);

      if (insertError) throw insertError;
    }

    revalidateBusinessPaths(businessId);
  } catch (error) {
    const actionError = handleActionError(error);
    const errorMessage = actionError.fields
      ? Object.entries(actionError.fields)
          .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
          .join("\n")
      : actionError.message;

    throw new Error(errorMessage);
  }
};

export const updateBusinessCategories = async (
  businessId: string,
  categoryIds: string[],
) => {
  try {
    if (!businessId) {
      throw new Error("Invalid business ID");
    }

    if (!Array.isArray(categoryIds)) {
      throw new Error("Invalid category IDs");
    }

    const supabase = await createSupabaseServerClient();
    const user = await requireUser(supabase);

    await assertBusinessOwnership(supabase, businessId, user.id);

    const uniqueCategoryIds = Array.from(new Set(categoryIds.filter(Boolean)));

    const { error: deleteError } = await supabase
      .from("business_categories")
      .delete()
      .eq("business_id", businessId);

    if (deleteError) throw deleteError;

    if (uniqueCategoryIds.length > 0) {
      const rows: TablesInsert<"business_categories">[] = uniqueCategoryIds.map(
        (categoryId) => ({
          business_id: businessId,
          category_id: categoryId,
        }),
      );

      const { error: insertError } = await supabase
        .from("business_categories")
        .insert(rows);

      if (insertError) throw insertError;
    }

    revalidateBusinessPaths(businessId);
  } catch (error) {
    const actionError = handleActionError(error);
    const errorMessage = actionError.fields
      ? Object.entries(actionError.fields)
          .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
          .join("\n")
      : actionError.message;

    throw new Error(errorMessage);
  }
};

export const deleteBusiness = async (id: string) => {
  try {
    if (!id) {
      throw new Error("Invalid business ID");
    }

    const supabase = await createSupabaseServerClient();
    const user = await requireUser(supabase);

    await assertBusinessOwnership(supabase, id, user.id);

    const { error } = await supabase
      .from("businesses")
      .delete()
      .eq("id", id)
      .eq("owner_id", user.id);

    if (error) {
      throw new Error("Failed to delete business");
    }

    revalidateBusinessPaths();
  } catch (error) {
    const actionError = handleActionError(error);
    const errorMessage = actionError.fields
      ? Object.entries(actionError.fields)
          .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
          .join("\n")
      : actionError.message;

    throw new Error(errorMessage);
  }
};
