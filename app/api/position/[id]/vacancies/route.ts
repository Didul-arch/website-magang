import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

/**
 * Fetch vacancies for a specific position
 * @param request
 * @param params
 * @returns
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const positionId = parseInt(params.id, 10);

  if (isNaN(positionId)) {
    return NextResponse.json(
      { message: "Invalid Position ID" },
      { status: 400 }
    );
  }

  try {
    const vacancies = await prisma.vacancy.findMany({
      where: {
        positionId: positionId,
      },
      // Optionally include position details if needed, though it might be redundant
      // include: {
      //   position: {
      //     select: {
      //       id: true,
      //       title: true,
      //     },
      //   },
      // },
    });

    return NextResponse.json(
      {
        message: "Vacancies for position fetched successfully",
        data: vacancies,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      `Error fetching vacancies for position ${positionId}:`,
      error
    );
    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: "Failed to fetch vacancies",
      },
      { status: 500 }
    );
  }
}
