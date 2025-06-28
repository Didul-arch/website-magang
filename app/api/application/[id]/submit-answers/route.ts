import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/utils/supabase/server";

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

    // Get current user from Supabase
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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

    // Check if already answered
    if (application.ApplicantAnswer.length > 0) {
      return NextResponse.json(
        { message: "Questions already answered" },
        { status: 400 }
      );
    }

    // Validate all answers belong to the vacancy's questions
    const questionIds = application.Vacancy?.questions.map((q) => q.id) || [];
    const submittedQuestionIds = parsedBody.data.answers.map(
      (a) => a.questionId
    );

    const invalidQuestions = submittedQuestionIds.filter(
      (id) => !questionIds.includes(id)
    );
    if (invalidQuestions.length > 0) {
      return NextResponse.json(
        { message: "Invalid questions submitted" },
        { status: 400 }
      );
    }

    // Validate answer IDs belong to their respective questions
    for (const answerData of parsedBody.data.answers) {
      const question = application.Vacancy?.questions.find(
        (q) => q.id === answerData.questionId
      );
      const validAnswerIds = question?.answers.map((a) => a.id) || [];

      if (!validAnswerIds.includes(answerData.answerId)) {
        return NextResponse.json(
          { message: "Invalid answer ID for question" },
          { status: 400 }
        );
      }
    }

    // Create applicant answers
    const applicantAnswers = await Promise.all(
      parsedBody.data.answers.map(async (answerData) => {
        return await prisma.applicantAnswer.create({
          data: {
            applicationId,
            questionId: answerData.questionId,
            answerId: answerData.answerId,
          },
          include: {
            question: true,
            answer: true,
          },
        });
      })
    );

    // Calculate score
    const correctAnswers = applicantAnswers.filter(
      (aa) => aa.answer?.isCorrect
    );
    const score = (correctAnswers.length / applicantAnswers.length) * 100;

    // Update application status
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: "REVIEWED",
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        title: "Quiz Completed",
        message: `You have completed the quiz for ${
          application.Vacancy?.title
        }. Your score: ${score.toFixed(1)}%`,
        userId: user.id,
      },
    });

    return NextResponse.json(
      {
        message: "Answers submitted successfully",
        data: {
          answers: applicantAnswers,
          score: score.toFixed(1),
          totalQuestions: applicantAnswers.length,
          correctAnswers: correctAnswers.length,
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
