"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export const createBusiness = async (input: { name: string }) => {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("businesses")
    .insert(input)
    .select("id")
    .single();

  if (error) throw error;

  revalidatePath("/businesses");
  return data.id;
};

export const updateBusiness = async (id: string, input: { name: string }) => {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("businesses")
    .update(input)
    .eq("id", id);

  if (error) throw error;

  revalidatePath("/businesses");
  revalidatePath(`/businesses/${id}`);
};

export const updateBusinessTags = async (
  businessId: string,
  tagIds: string[],
) => {
  const supabase = await createSupabaseServerClient();

  await supabase.from("business_tags").delete().eq("business_id", businessId);

  if (tagIds.length) {
    await supabase.from("business_tags").insert(
      tagIds.map((tagId) => ({
        business_id: businessId,
        tag_id: tagId,
      })),
    );
  }

  revalidatePath("/businesses");
};

export const updateBusinessCategories = async (
  businessId: string,
  categoryIds: string[],
) => {
  const supabase = await createSupabaseServerClient();

  await supabase
    .from("business_categories")
    .delete()
    .eq("business_id", businessId);

  if (categoryIds.length) {
    await supabase.from("business_categories").insert(
      categoryIds.map((categoryId) => ({
        business_id: businessId,
        category_id: categoryId,
      })),
    );
  }

  revalidatePath("/businesses");
};

export const deleteBusiness = async (id: string) => {
  const supabase = await createSupabaseServerClient();

  await supabase.from("businesses").delete().eq("id", id);

  revalidatePath("/businesses");
};
