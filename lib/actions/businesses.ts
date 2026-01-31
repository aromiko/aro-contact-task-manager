"use server";

import {
  createBusinessSchema,
  updateBusinessSchema,
} from "@/lib/schemas/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { handleActionError } from "@/lib/utils/action-error";
import { revalidatePath } from "next/cache";

import { requireUser } from "./guards/auth";
import { assertBusinessOwnership } from "./guards/business";

export const createBusiness = async (input: unknown) => {
  try {
    const validated = createBusinessSchema.parse(input);

    const supabase = await createSupabaseServerClient();
    const user = await requireUser(supabase);

    const { data, error } = await supabase
      .from("businesses")
      .insert({
        name: validated.name,
        owner_id: user.id,
      })
      .select("id")
      .single();

    if (error) {
      throw new Error("Failed to create business");
    }

    revalidatePath("/businesses");
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

    const { error } = await supabase
      .from("businesses")
      .update({ name: validated.name })
      .eq("id", validated.id)
      .eq("owner_id", user.id);

    if (error) {
      throw new Error("Failed to update business");
    }

    revalidatePath("/businesses");
    revalidatePath(`/businesses/${validated.id}`);
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
    const supabase = await createSupabaseServerClient();
    const user = await requireUser(supabase);

    // Validate IDs
    if (!businessId || typeof businessId !== "string") {
      throw new Error("Invalid business ID");
    }

    if (!Array.isArray(tagIds)) {
      throw new Error("Invalid tag IDs");
    }

    await assertBusinessOwnership(supabase, businessId, user.id);

    const uniqueTagIds = Array.from(new Set(tagIds.filter(Boolean)));

    const { error: deleteError } = await supabase
      .from("business_tags")
      .delete()
      .eq("business_id", businessId);

    if (deleteError) {
      throw new Error("Failed to update business tags");
    }

    if (uniqueTagIds.length > 0) {
      const { error: insertError } = await supabase
        .from("business_tags")
        .insert(
          uniqueTagIds.map((tagId) => ({
            business_id: businessId,
            tag_id: tagId,
          })),
        );

      if (insertError) {
        throw new Error("Failed to update business tags");
      }
    }

    revalidatePath("/businesses");
    revalidatePath(`/businesses/${businessId}`);
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
    const supabase = await createSupabaseServerClient();
    const user = await requireUser(supabase);

    if (!businessId || typeof businessId !== "string") {
      throw new Error("Invalid business ID");
    }

    if (!Array.isArray(categoryIds)) {
      throw new Error("Invalid category IDs");
    }

    await assertBusinessOwnership(supabase, businessId, user.id);

    const uniqueCategoryIds = Array.from(new Set(categoryIds.filter(Boolean)));

    const { error: deleteError } = await supabase
      .from("business_categories")
      .delete()
      .eq("business_id", businessId);

    if (deleteError) {
      throw new Error("Failed to update business categories");
    }

    if (uniqueCategoryIds.length > 0) {
      const { error: insertError } = await supabase
        .from("business_categories")
        .insert(
          uniqueCategoryIds.map((categoryId) => ({
            business_id: businessId,
            category_id: categoryId,
          })),
        );

      if (insertError) {
        throw new Error("Failed to update business categories");
      }
    }

    revalidatePath("/businesses");
    revalidatePath(`/businesses/${businessId}`);
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
    const supabase = await createSupabaseServerClient();
    const user = await requireUser(supabase);

    if (!id || typeof id !== "string") {
      throw new Error("Invalid business ID");
    }

    await assertBusinessOwnership(supabase, id, user.id);

    const { error } = await supabase
      .from("businesses")
      .delete()
      .eq("id", id)
      .eq("owner_id", user.id);

    if (error) {
      throw new Error("Failed to delete business");
    }

    revalidatePath("/businesses");
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
