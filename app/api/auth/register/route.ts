import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { registerFormSchema } from "@/lib/schemas";
import { createClient } from "@/lib/utils/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const parsedBody = registerFormSchema.safeParse(body);

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
            idCard: idCard!,
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

/**
 * model User {
  id            String      @id @default(cuid())
  name          String
  email         String?     @unique
  phoneNumber   String?
  role          String?     @default("USER")
  createdAt     DateTime    @default(now()) @map(name: "created_at")
  updatedAt     DateTime    @updatedAt @map(name: "updated_at")
  internship    Internship?
  @@map(name: "users")
}

model Internship {
  id            Int       @id @default(autoincrement())
  company       String
  degree        String
  semester      Int
  idCard        String
  cv            String
  portfolio     String
  createdAt     DateTime  @default(now()) @map(name: "created_at")
  updatedAt     DateTime  @updatedAt @map(name: "updated_at")
  user          User?     @relation(fields: [userId], references: [id])
  userId        String?      @unique
  @@map(name: "internships")
}
 */
