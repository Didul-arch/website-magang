import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/utils/supabase/server";

/**
 * Get questions for a specific application (for internship applicants)
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = parseInt(params.id);

    // Get current user from Supabase
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get application with vacancy and questions
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        internship: {
          include: {
            user: true,
          },
        },
        Vacancy: {
          include: {
            questions: {
              include: {
                answers: true,
              },
              orderBy: { createdAt: "asc" },
            },
          },
        },
        ApplicantAnswer: {
          include: {
            question: true,
            answer: true,
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
    if (application.internship?.user?.id !== user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Check if questions are already answered
    const hasAnswered = application.ApplicantAnswer.length > 0;

    // If questions are answered, calculate the score
    let score = null;
    if (hasAnswered) {
      const correctAnswers = application.ApplicantAnswer.filter(
        (aa) => aa.answer?.isCorrect
      ).length;
      const totalQuestions = application.ApplicantAnswer.length;
      score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    }

    return NextResponse.json(
      {
        message: "Questions fetched successfully",
        data: {
          application: {
            id: application.id,
            status: application.status,
            vacancyTitle: application.Vacancy?.title,
          },
          questions: application.Vacancy?.questions || [],
          hasAnswered,
          score: score ? score.toFixed(1) : null,
          answers: hasAnswered ? application.ApplicantAnswer : [],
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch questions",
        error,
      },
      { status: 500 }
    );
  }
}
