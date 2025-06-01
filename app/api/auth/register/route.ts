import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { registerFormSchemaBackend } from "@/lib/schemas";
import { createClient } from "@/lib/utils/supabase/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const body: any = {};
  formData.forEach((value, key) => {
    body[key] = value;
  });

  const parsedBody = registerFormSchemaBackend.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      {
        message: "Invalid data",
        errors: parsedBody.error.flatten(),
      },
      {
        status: 400,
      }
    );
  }

  const { email, password, phoneNumber, university, major, semester, idCard } =
    parsedBody.data;

  let idCardUrl: string | null = null;
  if (idCard) {
    // add file to supabase storage bucket
    const supabase = await createClient();
    const { error } = await supabase.storage
      .from("all")
      .upload(`id-cards/${email}`, idCard);
    if (error) {
      return NextResponse.json(
        {
          message: "Error uploading ID card",
          error: error.message,
        },
        {
          status: 400,
        }
      );
    }
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from("all")
      .getPublicUrl(`id-cards/${email}`);
    idCardUrl = publicUrlData.publicUrl;
  }

  const supabase = await createClient();

  try {
    const signUpSupaResponse = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_API_URL}/api/auth/callback`,
      },
    });

    if (signUpSupaResponse.error) {
      return NextResponse.json(
        {
          message: "Error during sign up",
          error: signUpSupaResponse.error,
        },
        {
          status: 400,
        }
      );
    }

    await prisma.user.create({
      data: {
        id: signUpSupaResponse.data.user?.id,
        email,
        name: email,
        phoneNumber: phoneNumber,
        role: "USER",
        createdAt: new Date(),
        updatedAt: new Date(),
        internship: {
          create: {
            company: university,
            degree: major,
            semester: semester,
            idCard: idCardUrl ?? "",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "User registered successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      {
        message: "Registration failed",
        error: error,
      },
      {
        status: 500,
      }
    );
  }
}
