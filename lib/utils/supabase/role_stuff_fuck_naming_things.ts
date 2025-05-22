import { NextResponse } from "next/server";
import { createClient } from "./server";
import prisma from "@/lib/prisma";

export async function getUserRole(
  request: Request
): Promise<"USER" | "ADMIN" | Response | null> {
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

  const dbUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  return dbUser?.role as "USER" | "ADMIN";
}

export async function verifyAdmin(
  request: Request
): Promise<"USER" | "ADMIN" | Response | null> {
  const role = await getUserRole(request);

  if (role === "USER") {
    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  return role;
}
