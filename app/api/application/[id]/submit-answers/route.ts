import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

const submitAnswersSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.number(),
      answerId: z.number(),
    })
  ),
});

/**
 * Submit answers for application questions
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const applicationId = parseInt(params.id);
    const body = await request.json();
    const parsedBody = submitAnswersSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          message: "Invalid data",
          errors: parsedBody.error.flatten(),
        },
        { status: 400 }
      );
    }

    // Get application and verify ownership
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
        ApplicantAnswer: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { message: "Application not found" },
        { status: 404 }
      );
    }

    if (application.internship?.user?.id !== user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Check if test was already submitted
    if (application.testSubmittedAt) {
      return NextResponse.json(
        { message: "Test already submitted" },
        { status: 400 }
      );
    }

    // Create applicant answers, update application, and create notification in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Calculate score
      let correctAnswersCount = 0;
      for (const answerData of parsedBody.data.answers) {
        const correctAnswer = await tx.answer.findFirst({
          where: {
            id: answerData.answerId,
            questionId: answerData.questionId,
            isCorrect: true,
          },
        });
        if (correctAnswer) {
          correctAnswersCount++;
        }
      }

      const totalQuestions = application.Vacancy?.questions.length || 0;
      const score =
        totalQuestions > 0 ? (correctAnswersCount / totalQuestions) * 100 : 0;

      // 1. Create ApplicantAnswer records
      await tx.applicantAnswer.createMany({
        data: parsedBody.data.answers.map((answerData) => ({
          applicationId,
          questionId: answerData.questionId,
          answerId: answerData.answerId,
        })),
      });

      // 2. Update the application with the score and submission timestamp
      const updatedApplication = await tx.application.update({
        where: { id: applicationId },
        data: {
          score: score,
          testSubmittedAt: new Date(),
          status: "PENDING", // Or another appropriate status
        },
      });

      // 3. Create a notification for the user
      await tx.notification.create({
        data: {
          title: "Tes Selesai",
          message: `Anda telah menyelesaikan tes untuk posisi ${
            application.Vacancy?.title
          }. Skor Anda: ${score.toFixed(2)}`,
          userId: user.id,
        },
      });

      return {
        score,
        totalQuestions,
        correctAnswers: correctAnswersCount,
      };
    });

    return NextResponse.json(
      {
        message: "Answers submitted successfully",
        data: {
          score: result.score.toFixed(2),
          totalQuestions: result.totalQuestions,
          correctAnswers: result.correctAnswers,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting answers:", error);
    return NextResponse.json(
      {
        message: "Failed to submit answers",
        error,
      },
      { status: 500 }
    );
  }
}
