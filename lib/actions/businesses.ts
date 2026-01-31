"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

import { requireUser } from "./guards/auth";
import { assertBusinessOwnership } from "./guards/business";

export const createBusiness = async (input: { name: string }) => {
  const supabase = await createSupabaseServerClient();
  const user = await requireUser(supabase);

  const name = input.name?.trim();

  if (!name) {
    throw new Error("Business name is required");
  }

  if (name.length > 150) {
    throw new Error("Business name is too long");
  }

  const { data, error } = await supabase
    .from("businesses")
    .insert({
      name,
      owner_id: user.id,
    })
    .select("id")
    .single();

  if (error) {
    console.error("createBusiness failed", error);
    throw new Error("Unable to create business");
  }

  revalidatePath("/businesses");
  return data.id;
};

export const updateBusiness = async (id: string, input: { name: string }) => {
  const supabase = await createSupabaseServerClient();
  const user = await requireUser(supabase);

  if (!id) {
    throw new Error("Invalid business");
  }

  const name = input.name?.trim();

  if (!name) {
    throw new Error("Business name is required");
  }

  if (name.length > 150) {
    throw new Error("Business name is too long");
  }

  await assertBusinessOwnership(supabase, id, user.id);

  const { error } = await supabase
    .from("businesses")
    .update({ name })
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) {
    console.error("updateBusiness failed", error);
    throw new Error("Unable to update business");
  }

  revalidatePath("/businesses");
  revalidatePath(`/businesses/${id}`);
};

export const updateBusinessTags = async (
  businessId: string,
  tagIds: string[],
) => {
  const supabase = await createSupabaseServerClient();
  const user = await requireUser(supabase);

  if (!businessId) {
    throw new Error("Invalid business");
  }

  await assertBusinessOwnership(supabase, businessId, user.id);

  const uniqueTagIds = Array.from(new Set(tagIds.filter(Boolean)));

  const { error: deleteError } = await supabase
    .from("business_tags")
    .delete()
    .eq("business_id", businessId);

  if (deleteError) {
    console.error("delete business_tags failed", deleteError);
    throw new Error("Unable to update business tags");
  }

  if (uniqueTagIds.length > 0) {
    const { error: insertError } = await supabase.from("business_tags").insert(
      uniqueTagIds.map((tagId) => ({
        business_id: businessId,
        tag_id: tagId,
      })),
    );

    if (insertError) {
      console.error("insert business_tags failed", insertError);
      throw new Error("Unable to update business tags");
    }
  }

  revalidatePath("/businesses");
  revalidatePath(`/businesses/${businessId}`);
};

export const updateBusinessCategories = async (
  businessId: string,
  categoryIds: string[],
) => {
  const supabase = await createSupabaseServerClient();
  const user = await requireUser(supabase);

  if (!businessId) {
    throw new Error("Invalid business");
  }

  await assertBusinessOwnership(supabase, businessId, user.id);

  const uniqueCategoryIds = Array.from(new Set(categoryIds.filter(Boolean)));

  const { error: deleteError } = await supabase
    .from("business_categories")
    .delete()
    .eq("business_id", businessId);

  if (deleteError) {
    console.error("delete business_categories failed", deleteError);
    throw new Error("Unable to update business categories");
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
      console.error("insert business_categories failed", insertError);
      throw new Error("Unable to update business categories");
    }
  }

  revalidatePath("/businesses");
  revalidatePath(`/businesses/${businessId}`);
};

export const deleteBusiness = async (id: string) => {
  const supabase = await createSupabaseServerClient();
  const user = await requireUser(supabase);

  if (!id) {
    throw new Error("Invalid business");
  }

  await assertBusinessOwnership(supabase, id, user.id);

  const { error } = await supabase
    .from("businesses")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) {
    console.error("deleteBusiness failed", error);
    throw new Error("Unable to delete business");
  }

  revalidatePath("/businesses");
};
