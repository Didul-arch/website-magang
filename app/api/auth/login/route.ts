import { NextResponse } from "next/server";

import { createClient } from "@/lib/utils/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;
  const supabase = await createClient();

  const response = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (response.error) {
    console.error("Error during sign in:", response.error.message);
    return NextResponse.json(
      {
        message: "Error during sign in",
        error:
          response.error.message?.toLowerCase() === "email not confirmed"
            ? "Tolong konfirmasi email anda"
            : response.error.message,
      },
      {
        status: 400,
      }
    );
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    return NextResponse.json(
      {
        message: "Error during sign in",
        error: error,
      },
      {
        status: 400,
      }
    );
  }

  if (data.session) {
    const { user } = data.session;
    const { id, email, user_metadata } = user;

    return NextResponse.json(
      {
        message: "Login successful",
        user: {
          id,
          email,
          name: user_metadata.full_name,
        },
      },
      {
        status: 200,
      }
    );
  }

  return NextResponse.json(
    {
      message: "Invalid credentials",
    },
    {
      status: 401,
    }
  );
}
