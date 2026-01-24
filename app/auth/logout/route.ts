import { createSupabaseServerActionClient } from "@/lib/supabase/server-actions";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  const supabase = await createSupabaseServerActionClient();
  await supabase.auth.signOut();

  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
};
