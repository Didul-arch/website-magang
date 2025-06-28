import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const questionsSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string().min(1, "Question is required"),
        answers: z
          .array(
            z.object({
              answer: z.string().min(1, "Answer is required"),
              isCorrect: z.boolean(),
            })
          )
          .min(2, "At least 2 answers are required")
          .refine(
            (answers) => answers.filter((a) => a.isCorrect).length === 1,
            "Exactly one answer must be marked as correct"
          ),
      })
    )
    .min(1, "At least one question is required"),
});

/**
 * Create multiple questions for a specific vacancy
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add admin verification here
    // await verifyAdmin(request);

    const vacancyId = parseInt(params.id);
    const body = await request.json();
    const parsedBody = questionsSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          message: "Invalid data",
          errors: parsedBody.error.flatten(),
        },
        { status: 400 }
      );
    }

    // Verify vacancy exists
    const vacancy = await prisma.vacancy.findUnique({
      where: { id: vacancyId },
    });

    if (!vacancy) {
      return NextResponse.json(
        { message: "Vacancy not found" },
        { status: 404 }
      );
    }

    // Create questions with answers
    const createdQuestions = await Promise.all(
      parsedBody.data.questions.map(async (questionData) => {
        return await prisma.question.create({
          data: {
            question: questionData.question,
            answer: questionData.answers.find((a) => a.isCorrect)?.answer || "",
            vacancyId: vacancyId,
            answers: {
              create: questionData.answers,
            },
          },
          include: {
            answers: true,
          },
        });
      })
    );

    return NextResponse.json(
      {
        message: "Questions created successfully",
        data: createdQuestions,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating questions:", error);
    return NextResponse.json(
      {
        message: "Failed to create questions",
        error,
      },
      { status: 500 }
    );
  }
}

/**
 * Get all questions for a specific vacancy
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add admin verification here
    // await verifyAdmin(request);

    const vacancyId = parseInt(params.id);

    // Verify vacancy exists
    const vacancy = await prisma.vacancy.findUnique({
      where: { id: vacancyId },
    });

    if (!vacancy) {
      return NextResponse.json(
        { message: "Vacancy not found" },
        { status: 404 }
      );
    }

    const questions = await prisma.question.findMany({
      where: { vacancyId },
      include: {
        answers: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(
      {
        message: "Questions fetched successfully",
        data: questions,
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
