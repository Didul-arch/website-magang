import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Get application results with quiz scores (for admin)
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add admin verification here
    // await verifyAdmin(request);

    const applicationId = parseInt(params.id);

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

    // Calculate results
    const totalQuestions = application.Vacancy?.questions.length || 0;
    const answeredQuestions = application.ApplicantAnswer.length;
    const correctAnswers = application.ApplicantAnswer.filter(
      (aa) => aa.answer?.isCorrect
    ).length;
    const score =
      answeredQuestions > 0 ? (correctAnswers / answeredQuestions) * 100 : 0;

    return NextResponse.json(
      {
        message: "Application results fetched successfully",
        data: {
          application: {
            id: application.id,
            status: application.status,
            createdAt: application.createdAt,
            cv: application.cv,
            portfolio: application.portfolio,
            reason: application.reason,
          },
          applicant: {
            id: application.internship?.user?.id,
            name: application.internship?.user?.name,
            email: application.internship?.user?.email,
            phoneNumber: application.internship?.user?.phoneNumber,
            company: application.internship?.company,
            degree: application.internship?.degree,
            semester: application.internship?.semester,
          },
          vacancy: {
            id: application.Vacancy?.id,
            title: application.Vacancy?.title,
            description: application.Vacancy?.description,
            location: application.Vacancy?.location,
          },
          quiz: {
            totalQuestions,
            answeredQuestions,
            correctAnswers,
            score: score.toFixed(1),
            hasAnswered: answeredQuestions > 0,
            details: application.ApplicantAnswer.map((aa) => ({
              questionId: aa.question?.id,
              question: aa.question?.question,
              selectedAnswerId: aa.answer?.id,
              selectedAnswer: aa.answer?.answer,
              isCorrect: aa.answer?.isCorrect,
              correctAnswer: aa.question?.answer,
            })),
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching application results:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch application results",
        error,
      },
      { status: 500 }
    );
  }
}
