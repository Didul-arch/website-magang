import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { vacancyFormSchema } from "@/lib/schemas";
import { createClient } from "@/lib/utils/supabase/server";
import { verifyAdmin } from "@/lib/utils/supabase/role_stuff_fuck_naming_things";

/**
 * Insert a new job vacancy
 * @description This endpoint is used to open a new job vacancy.
 * @param request - The request object
 * @returns
 */
export async function POST(request: Request) {
  await verifyAdmin(request);

  const body = await request.json();
  const parsedBody = vacancyFormSchema.safeParse(body);

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

  const {
    title,
    description,
    location,
    status,
    startDate,
    endDate,
    thumbnail,
    positionId,
  } = parsedBody.data;

  try {
    const response = await prisma.vacancy.create({
      data: {
        title,
        description,
        location,
        status,
        startDate,
        endDate,
        thumbnail,
        position: {
          connect: {
            id: positionId,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Vacancy created successfully",
        data: response,
      },
      {
        status: 201,
      }
    );
  } catch (error: any) {
    console.error("Error creating vacancy:", error);
    return NextResponse.json(
      {
        message: "Error creating vacancy",
        error: error.message || "An unknown error occurred",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * Fetch all vacancies
 * @returns
 */
export async function GET(request: Request) {
  try {
    const vacancies = await prisma.vacancy.findMany({
      omit: {
        positionId: true,
      },
      include: {
        position: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Vacancies fetched successfully",
        data: vacancies,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error fetching vacancies",
        error,
      },
      {
        status: 500,
      }
    );
  }
}
