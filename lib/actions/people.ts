"use server";

import {
  createPersonSchema,
  updatePersonSchema,
} from "@/lib/schemas/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { handleActionError } from "@/lib/utils/action-error";
import { revalidatePath } from "next/cache";

import type { TablesInsert, TablesUpdate } from "../types/database";
import { requireUser } from "./guards/auth";
import { assertBusinessOwnership } from "./guards/business";
import { assertPersonAccess } from "./guards/people";

const revalidatePersonPaths = (businessId: string) => {
  revalidatePath("/people");
  revalidatePath(`/businesses/${businessId}`);
};

export const createPerson = async (input: unknown) => {
  try {
    const validated = createPersonSchema.parse(input);

    const supabase = await createSupabaseServerClient();
    const user = await requireUser(supabase);

    await assertBusinessOwnership(supabase, validated.business_id, user.id);

    const insert: TablesInsert<"people"> = {
      name: validated.name,
      email: validated.email ?? null,
      phone: validated.phone ?? null,
      business_id: validated.business_id,
    };

    const { data, error } = await supabase
      .from("people")
      .insert(insert)
      .select("id")
      .single<{ id: string }>();

    if (error) {
      throw new Error("Failed to create person");
    }

    revalidatePersonPaths(validated.business_id);
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

export const updatePerson = async (personId: string, input: unknown) => {
  try {
    const validated = updatePersonSchema.parse({
      personId,
      ...(typeof input === "object" && input !== null ? input : {}),
    });

    const supabase = await createSupabaseServerClient();
    const user = await requireUser(supabase);

    const person = await assertPersonAccess(
      supabase,
      validated.personId,
      user.id,
    );

    const updates: TablesUpdate<"people"> = {
      name: validated.name,
      email: validated.email ?? null,
      phone: validated.phone ?? null,
      business_id: validated.business_id ?? person.business_id,
    };

    const { error } = await supabase
      .from("people")
      .update(updates)
      .eq("id", validated.personId)
      .eq("business_id", person.business_id);

    if (error) {
      throw new Error("Failed to update person");
    }

    revalidatePersonPaths(person.business_id);
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

export const deletePerson = async (personId: string) => {
  try {
    if (!personId) {
      throw new Error("Invalid person");
    }

    const supabase = await createSupabaseServerClient();
    const user = await requireUser(supabase);

    const person = await assertPersonAccess(supabase, personId, user.id);

    const { error } = await supabase
      .from("people")
      .delete()
      .eq("id", personId)
      .eq("business_id", person.business_id);

    if (error) {
      throw new Error("Failed to delete person");
    }

    revalidatePersonPaths(person.business_id);
  } catch (error) {
    const actionError = handleActionError(error);
    throw new Error(actionError.message);
  }
};

export const updatePersonTags = async (personId: string, tagIds: string[]) => {
  try {
    if (!personId) {
      throw new Error("Invalid person");
    }

    const supabase = await createSupabaseServerClient();
    const user = await requireUser(supabase);

    const person = await assertPersonAccess(supabase, personId, user.id);

    const uniqueTagIds = Array.from(new Set(tagIds.filter(Boolean)));

    const { error: deleteError } = await supabase
      .from("person_tags")
      .delete()
      .eq("person_id", personId);

    if (deleteError) {
      throw new Error("Failed to update person tags");
    }

    if (uniqueTagIds.length > 0) {
      const rows: TablesInsert<"person_tags">[] = uniqueTagIds.map((tagId) => ({
        person_id: personId,
        tag_id: tagId,
      }));

      const { error: insertError } = await supabase
        .from("person_tags")
        .insert(rows);

      if (insertError) {
        throw new Error("Failed to update person tags");
      }
    }

    revalidatePersonPaths(person.business_id);
  } catch (error) {
    const actionError = handleActionError(error);
    throw new Error(actionError.message);
  }
};
