import { createClient } from "@/lib/utils/supabase/server";
import { NextResponse } from "next/server";

export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }

  return { user, error: null };
}
