import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const questionSchema = z.object({
  question: z.string().min(1, "Question is required"),
  vacancyId: z.number().int().positive("Valid vacancy ID is required"),
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
});

/**
 * Create a new question with answers for a vacancy
 */
export async function POST(request: Request) {
  try {
    // TODO: Add admin verification here
    // await verifyAdmin(request);

    const body = await request.json();
    const parsedBody = questionSchema.safeParse(body);

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

    const { question, vacancyId, answers } = parsedBody.data;

    // Verify vacancy exists
    const vacancy = await prisma.vacancy.findUnique({
      where: { id: vacancyId },
    });

    if (!vacancy) {
      return NextResponse.json(
        {
          message: "Vacancy not found",
        },
        {
          status: 404,
        }
      );
    }

    // Create question with answers
    const createdQuestion = await prisma.question.create({
      data: {
        question,
        vacancyId,
        answer: answers.find((a) => a.isCorrect)?.answer || "",
        answers: {
          create: answers,
        },
      },
      include: {
        answers: true,
        vacancy: {
          select: {
            title: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Question created successfully",
        data: createdQuestion,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      {
        message: "Error creating question",
        error: error,
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * Get all questions for admin with pagination
 */
export async function GET(request: Request) {
  try {
    // TODO: Add admin verification here
    // await verifyAdmin(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const vacancyId = searchParams.get("vacancyId");

    const skip = (page - 1) * limit;

    const where = vacancyId ? { vacancyId: parseInt(vacancyId) } : {};

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        skip,
        take: limit,
        where,
        include: {
          answers: true,
          vacancy: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.question.count({ where }),
    ]);

    return NextResponse.json(
      {
        message: "Questions fetched successfully",
        data: questions,
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
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      {
        message: "Error fetching questions",
        error: error,
      },
      {
        status: 500,
      }
    );
  }
}
