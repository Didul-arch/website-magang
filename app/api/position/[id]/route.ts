import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { positionFormSchema } from "@/lib/schemas";
import { createClient } from "@/lib/utils/supabase/server";
import { verifyAdmin } from "@/lib/utils/supabase/role_stuff_fuck_naming_things";

/**
 * Get a position by id
 * @param param.id - The id of the position
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
    const position = await prisma.position.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!position) {
      return NextResponse.json(
        {
          message: "Position not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        message: "Position retrieved successfully",
        data: position,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error retrieving position",
        error,
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * Update a position by id
 * @param request - The request object
 * @param param.id - The id of the position
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
    const position = await prisma.position.update({
      where: {
        id: parseInt(id),
      },
      data: {
        title,
        description,
      },
    });

    return NextResponse.json(
      {
        message: "Position updated successfully",
        data: position,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error updating position",
        error,
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * Delete a position by id
 * @param param.id - The id of the position
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
    const position = await prisma.position.delete({
      where: {
        id: parseInt(id),
      },
    });

    return NextResponse.json(
      {
        message: "Position deleted successfully",
        data: position,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error deleting position",
        error,
      },
      {
        status: 500,
      }
    );
  }
}
