import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const updateQuestionSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answers: z
    .array(
      z.object({
        id: z.number().optional(),
        answer: z.string().min(1, "Answer is required"),
        isCorrect: z.boolean(),
      })
    )
    .min(2, "At least 2 answers are required")
    .refine(
      (answers) => answers.filter((a) => a.isCorrect).length === 1,
      "Exactly one answer must be marked as correct"
    ),
});

/**
 * Get specific question by ID
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add admin verification here
    // await verifyAdmin(request);

    const questionId = parseInt(params.id);

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        answers: true,
        vacancy: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!question) {
      return NextResponse.json(
        {
          message: "Question not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        message: "Question fetched successfully",
        data: question,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json(
      {
        message: "Error fetching question",
        error: error,
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * Update specific question by ID
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add admin verification here
    // await verifyAdmin(request);

    const questionId = parseInt(params.id);
    const body = await request.json();
    const parsedBody = updateQuestionSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          message: "Invalid data",
          errors: parsedBody.error.flatten(),
        },
        {
          status: 400,
        }
      );
    }

    const { question, answers } = parsedBody.data;

    // Check if question exists
    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId },
      include: { answers: true },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        {
          message: "Question not found",
        },
        {
          status: 404,
        }
      );
    }

    // Delete existing answers
    await prisma.answer.deleteMany({
      where: { questionId },
    });

    // Update question with new answers
    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: {
        question,
        answer: answers.find((a) => a.isCorrect)?.answer || "",
        answers: {
          create: answers.map(({ id, ...answer }) => answer),
        },
      },
      include: {
        answers: true,
      },
    });

    return NextResponse.json(
      {
        message: "Question updated successfully",
        data: updatedQuestion,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      {
        message: "Failed to update question",
        error,
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * Delete specific question by ID
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add admin verification here
    // await verifyAdmin(request);

    const questionId = parseInt(params.id);

    // Check if question exists
    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        {
          message: "Question not found",
        },
        {
          status: 404,
        }
      );
    }

    // Delete question (this will cascade delete answers and applicant answers)
    await prisma.question.delete({
      where: { id: questionId },
    });

    return NextResponse.json(
      { message: "Question deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      {
        message: "Failed to delete question",
        error,
      },
      {
        status: 500,
      }
    );
  }
}
