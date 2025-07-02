import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Get all applications with quiz results for admin dashboard
 */
export async function GET(request: Request) {
  try {
    // TODO: Add admin verification here
    // await verifyAdmin(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const vacancyId = searchParams.get("vacancyId");
    const status = searchParams.get("status");

    const skip = (page - 1) * limit;

    const where: any = {};
    if (vacancyId) {
      where.vacancyId = parseInt(vacancyId);
    }
    if (status) {
      where.status = status;
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        skip,
        take: limit,
        where,
        include: {
          internship: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phoneNumber: true,
                },
              },
            },
          },
          Vacancy: {
            select: {
              id: true,
              title: true,
              location: true,
            },
          },
          ApplicantAnswer: {
            include: {
              answer: {
                select: {
                  isCorrect: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.application.count({ where }),
    ]);

    // Calculate quiz scores for each application
    const applicationsWithScores = applications.map((application: any) => {
      const totalAnswers = application.ApplicantAnswer.length;
      const correctAnswers = application.ApplicantAnswer.filter(
        (aa: any) => aa.answer?.isCorrect
      ).length;
      const score =
        totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : null;

      return {
        id: application.id,
        status: application.status,
        createdAt: application.createdAt,
        applicant: {
          id: application.internship?.user?.id,
          name: application.internship?.user?.name,
          email: application.internship?.user?.email,
          phoneNumber: application.internship?.user?.phoneNumber,
          company: application.internship?.company,
          degree: application.internship?.degree,
          semester: application.internship?.semester,
        },
        vacancy: application.Vacancy,
        quiz: {
          hasAnswered: totalAnswers > 0,
          totalAnswers,
          correctAnswers,
          score: score ? score.toFixed(1) : null,
        },
        files: {
          cv: application.cv,
          portfolio: application.portfolio,
        },
      };
    });

    return NextResponse.json(
      {
        message: "Applications fetched successfully",
        data: applicationsWithScores,
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
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      {
        message: "Error fetching applications",
        error: error,
      },
      {
        status: 500,
      }
    );
  }
}
