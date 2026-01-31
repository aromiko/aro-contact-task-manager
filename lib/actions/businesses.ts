"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

import { requireUser } from "./auth";

export const createBusiness = async (input: { name: string }) => {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("businesses")
    .insert({
      name: input.name,
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
  await requireUser(supabase);

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

  const { error } = await supabase
    .from("businesses")
    .update({ name })
    .eq("id", id);

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
  await requireUser(supabase);

  if (!businessId) {
    throw new Error("Invalid business");
  }

  const uniqueTagIds = Array.from(new Set(tagIds.filter(Boolean)));

  await supabase.from("business_tags").delete().eq("business_id", businessId);

  if (uniqueTagIds.length > 0) {
    const { error } = await supabase.from("business_tags").insert(
      uniqueTagIds.map((tagId) => ({
        business_id: businessId,
        tag_id: tagId,
      })),
    );

    if (error) {
      console.error("updateBusinessTags failed", error);
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
  await requireUser(supabase);

  if (!businessId) {
    throw new Error("Invalid business");
  }

  const uniqueCategoryIds = Array.from(new Set(categoryIds.filter(Boolean)));

  await supabase
    .from("business_categories")
    .delete()
    .eq("business_id", businessId);

  if (uniqueCategoryIds.length > 0) {
    const { error } = await supabase.from("business_categories").insert(
      uniqueCategoryIds.map((categoryId) => ({
        business_id: businessId,
        category_id: categoryId,
      })),
    );

    if (error) {
      console.error("updateBusinessCategories failed", error);
      throw new Error("Unable to update business categories");
    }
  }

  revalidatePath("/businesses");
  revalidatePath(`/businesses/${businessId}`);
};

export const deleteBusiness = async (id: string) => {
  const supabase = await createSupabaseServerClient();
  await requireUser(supabase);

  if (!id) {
    throw new Error("Invalid business");
  }

  const { error } = await supabase.from("businesses").delete().eq("id", id);

  if (error) {
    console.error("deleteBusiness failed", error);
    throw new Error("Unable to delete business");
  }

  revalidatePath("/businesses");
};
