import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const params = await context.params;
    const internshipId = parseInt(params.id);

    if (isNaN(internshipId)) {
      return NextResponse.json(
        { success: false, message: "Invalid internship ID" },
        { status: 400 }
      );
    }

    // Fetch all applications for this internship
    const applications = await prisma.application.findMany({
      where: {
        internshipId: internshipId,
      },
      include: {
        Vacancy: {
          select: {
            id: true,
            title: true,
            location: true,
          },
        },
        ApplicantAnswer: {
          include: {
            question: true,
            answer: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Process applications to include quiz information
    const processedApplications = applications.map((application: any) => {
      const totalQuestions =
        application.ApplicantAnswer.length > 0
          ? [
              ...new Set(
                application.ApplicantAnswer.map((a: any) => a.questionId)
              ),
            ].length
          : 0;

      const answeredQuestions = application.ApplicantAnswer.length;

      const correctAnswers = application.ApplicantAnswer.filter(
        (applicantAnswer: any) => {
          return applicantAnswer.answer && applicantAnswer.answer.isCorrect;
        }
      ).length;

      const score =
        totalQuestions > 0
          ? Math.round((correctAnswers / totalQuestions) * 100)
          : 0;

      const hasAnswered = answeredQuestions > 0;

      return {
        id: application.id,
        status: application.status,
        createdAt: application.createdAt.toISOString(),
        cv: application.cv,
        portfolio: application.portfolio,
        vacancy: application.Vacancy,
        quiz: {
          hasAnswered,
          score: hasAnswered ? score.toString() : null,
          totalQuestions,
          answeredQuestions,
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: processedApplications,
    });
  } catch (error) {
    console.error("Error fetching user applications:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
