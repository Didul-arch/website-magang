import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const vacancyId = searchParams.get("vacancyId");

  if (!vacancyId) {
    return NextResponse.json(
      { message: "Vacancy ID is required" },
      { status: 400 }
    );
  }

  try {
    // 1. Get the internshipId for the current user
    const internship = await prisma.internship.findUnique({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
      },
    });

    // If user has no internship profile, they couldn't have applied.
    if (!internship) {
      return NextResponse.json({ status: "NOT_APPLIED" });
    }

    // 2. Check for an existing application
    const application = await prisma.application.findFirst({
      where: {
        internshipId: internship.id,
        vacancyId: parseInt(vacancyId),
      },
      select: {
        id: true,
        testSubmittedAt: true,
      },
    });

    if (!application) {
      return NextResponse.json({ status: "NOT_APPLIED" });
    }

    if (application.testSubmittedAt) {
      return NextResponse.json({ status: "COMPLETED" });
    } else {
      return NextResponse.json({
        status: "PENDING_TEST",
        applicationId: application.id,
      });
    }
  } catch (error: any) {
    console.error("Failed to check application status:", error);
    return NextResponse.json(
      { message: "Failed to check application status", error: error.message },
      { status: 500 }
    );
  }
}
