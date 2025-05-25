import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { vacancyFormSchema } from "@/lib/schemas";
import { verifyAdmin } from "@/lib/utils/supabase/role_stuff_fuck_naming_things";

/**
 * Get a vacancy by id
 * @param param.id - The id of the vacancy
 * @returns
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id || isNaN(parseInt(id))) {
    return NextResponse.json(
      {
        message: "Invalid id",
      },
      {
        status: 400,
      }
    );
  }

  try {
    const vacancy = await prisma.vacancy.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!vacancy) {
      return NextResponse.json(
        {
          message: "Vacancy not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        message: "Vacancy retrieved successfully",
        data: vacancy,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error retrieving vacancy",
        error,
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * Update a vacancy by id
 * @param request - The request object
 * @param param.id - The id of the vacancy
 * @returns
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  await verifyAdmin(request);
  const { id } = params;

  if (!id || isNaN(parseInt(id))) {
    return NextResponse.json(
      {
        message: "Invalid id",
      },
      {
        status: 400,
      }
    );
  }

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
    const vacancy = await prisma.vacancy.update({
      where: {
        id: parseInt(id),
      },
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
        message: "Vacancy updated successfully",
        data: vacancy,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error updating vacancy",
        error,
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * Delete a vacancy by id
 * @param param.id - The id of the vacancy
 * @returns
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  await verifyAdmin(request);
  const { id } = params;

  if (!id || isNaN(parseInt(id))) {
    return NextResponse.json(
      {
        message: "Invalid id",
      },
      {
        status: 400,
      }
    );
  }

  try {
    const vacancy = await prisma.vacancy.delete({
      where: {
        id: parseInt(id),
      },
    });

    return NextResponse.json(
      {
        message: "Vacancy deleted successfully",
        data: vacancy,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error deleting vacancy",
        error,
      },
      {
        status: 500,
      }
    );
  }
}
