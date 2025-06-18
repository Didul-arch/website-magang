import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { createClient } from "@/lib/utils/supabase/server";

/**
 * Get the current user data
 * @returns
 */
export async function GET(request: Request) {
  const supabase = await createClient();

  const token = request.headers.get("Authorization")?.split(" ")[1];
  const { data, error } = await supabase.auth.getUser(token);

  if (error) {
    return NextResponse.json(
      {
        message: "Invalid token",
        error,
      },
      {
        status: 401,
      }
    );
  }

  if (!data.user) {
    return NextResponse.json(
      {
        message: "User not found",
      },
      {
        status: 401,
      }
    );
  }

  const { id: userId } = data.user;

  try {
    const dbUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        role: true,
        internship: {
          select: {
            id: true,
            portfolio: true,
          },
        }
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        {
          message: "User not found in database",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        message: "User retrieved successfully",
        data: dbUser,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error retrieving user",
        error,
      },
      {
        status: 500,
      }
    );
  }
}
