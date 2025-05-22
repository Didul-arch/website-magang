import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

/**
 * Fetch vacancies with filters
 * @description This endpoint is used to fetch job vacancies with filters.
 * @param request - The request object
 * @param params - The request parameters
 * @returns
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, location, startDate, endDate } = body;

    const vacancies = await prisma.vacancy.findMany({
      where: {
        title: title ? { contains: title, mode: "insensitive" } : undefined,
        location: location
          ? { contains: location, mode: "insensitive" }
          : undefined,
        startDate: startDate ? { gte: new Date(startDate) } : undefined,
        endDate: endDate ? { lte: new Date(endDate) } : undefined,
        status: "OPEN",
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
