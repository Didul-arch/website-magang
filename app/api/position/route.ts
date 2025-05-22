import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { positionFormSchema } from "@/lib/schemas";
import { createClient } from "@/lib/utils/supabase/server";
import { verifyAdmin } from "@/lib/utils/supabase/role_stuff_fuck_naming_things";

/**
 * Insert a new position
 * @description This endpoint is used to create a new position like a job title or role.
 * @param request - The request object
 * @returns
 */
export async function POST(request: Request) {
  await verifyAdmin(request);

  const body = await request.json();
  const parsedBody = positionFormSchema.safeParse(body);

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

  const { title, description } = parsedBody.data;

  try {
    const response = await prisma.position.create({
      data: {
        title,
        description,
      },
    });

    return NextResponse.json(
      {
        message: "Position created successfully",
        data: response,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error creating position",
        error,
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * Fetch all positions
 * @returns
 */
export async function GET(request: Request) {
  try {
    const positions = await prisma.position.findMany();

    return NextResponse.json(
      {
        message: "Positions fetched successfully",
        data: positions,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error fetching positions",
        error,
      },
      {
        status: 500,
      }
    );
  }
}
