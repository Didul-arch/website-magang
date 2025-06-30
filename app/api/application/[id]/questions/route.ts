import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

/**
 * Get questions for a specific application (for internship applicants)
 * or check if the test has already been completed.
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const applicationId = parseInt(params.id);

    // Get application details
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: {
        testSubmittedAt: true,
        score: true,
        internship: {
          select: {
            userId: true,
          },
        },
        Vacancy: {
          select: {
            title: true,
            questions: {
              select: {
                id: true,
                question: true,
                answers: {
                  select: {
                    id: true,
                    answer: true,
                  },
                },
              },
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { message: "Application not found" },
        { status: 404 }
      );
    }

    // Verify user owns this application
    if (application.internship?.userId !== user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // If test has been submitted, return the result
    if (application.testSubmittedAt) {
      return NextResponse.json({
        message: "Test already completed",
        data: {
          hasAnswered: true,
          score: application.score,
          vacancyTitle: application.Vacancy?.title,
        },
      });
    }

    // If test has not been submitted, return the questions
    return NextResponse.json({
      message: "Questions fetched successfully",
      data: {
        hasAnswered: false,
        questions: application.Vacancy?.questions || [],
        vacancyTitle: application.Vacancy?.title,
      },
    });
  } catch (error: any) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch questions",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
