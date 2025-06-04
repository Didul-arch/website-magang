import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { positionFormSchema } from "@/lib/schemas";
import { createClient } from "@/lib/utils/supabase/server";
import { verifyAdmin } from "@/lib/utils/supabase/role_stuff_fuck_naming_things";

/**
 * Insert a new internship
 * @description This endpoint is used to create a new internship data.
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
 * Fetch internship with pagination and optional search query
 * @returns
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const searchQuery = searchParams.get("search")?.trim() || "";

    const skip = (page - 1) * limit;

    const where = searchQuery
      ? {
          user: {
            is: {
              name: {
                contains: searchQuery,
                mode: "insensitive" as const,
              },
            },
          },
        }
      : undefined;

    const [internships, total] = await Promise.all([
      prisma.internship.findMany({
        skip,
        take: limit,
        where,
        include: {
          user: true,
        },
      }),
      prisma.internship.count({ where }),
    ]);

    return NextResponse.json(
      {
        message: "Internships fetched successfully",
        data: internships,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error fetching internships:", error);
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
