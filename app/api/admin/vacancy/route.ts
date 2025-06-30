import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Get all vacancies for admin (used in dropdowns)
 */
export async function GET(request: Request) {
  try {
    // TODO: Add admin verification here
    // await verifyAdmin(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const searchQuery = searchParams.get("search")?.trim() || "";

    const skip = (page - 1) * limit;

    const where = searchQuery
      ? {
          OR: [
            {
              title: {
                contains: searchQuery,
                mode: "insensitive" as const,
              },
            },
            {
              description: {
                contains: searchQuery,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : undefined;

    const [vacancies, total] = await Promise.all([
      prisma.vacancy.findMany({
        skip,
        take: limit,
        where,
        include: {
          position: {
            select: {
              title: true,
            },
          },
          _count: {
            select: {
              applications: true,
              questions: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.vacancy.count({ where }),
    ]);

    return NextResponse.json(
      {
        message: "Vacancies fetched successfully",
        data: vacancies,
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
    console.error("Error fetching vacancies:", error);
    return NextResponse.json(
      {
        message: "Error fetching vacancies",
        error: error,
      },
      {
        status: 500,
      }
    );
  }
}
