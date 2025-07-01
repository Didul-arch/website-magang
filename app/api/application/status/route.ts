import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const vacancyId = searchParams.get("vacancyId");
  const applicationId = searchParams.get("id"); // from test page

  try {
    const internship = await prisma.internship.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!internship) {
      return NextResponse.json(
        {
          data: {
            canTakeTest: false,
            message: "Profil magang tidak ditemukan.",
            status: "ERROR",
          },
        },
        { status: 404 }
      );
    }

    // Scenario 1: Checking status for the test page (using applicationId)
    if (applicationId) {
      const application = await prisma.application.findFirst({
        where: {
          id: parseInt(applicationId),
          internshipId: internship.id, // Security check
        },
      });

      if (!application) {
        return NextResponse.json({
          data: { canTakeTest: false, message: "Lamaran tidak ditemukan." },
        });
      }

      if (application.testSubmittedAt) {
        return NextResponse.json({
          data: {
            canTakeTest: false,
            message: "Anda sudah pernah mengerjakan tes untuk lamaran ini.",
          },
        });
      }

      return NextResponse.json({ data: { canTakeTest: true } });
    }

    // Scenario 2: Checking status from home page (using vacancyId)
    if (vacancyId) {
      const application = await prisma.application.findFirst({
        where: {
          internshipId: internship.id,
          vacancyId: parseInt(vacancyId),
        },
        select: { id: true, testSubmittedAt: true },
      });

      if (!application) {
        return NextResponse.json({ data: { status: "NOT_APPLIED" } });
      }

      if (application.testSubmittedAt) {
        return NextResponse.json({ data: { status: "COMPLETED" } });
      } else {
        return NextResponse.json({
          data: { status: "PENDING_TEST", applicationId: application.id },
        });
      }
    }

    // If neither ID is provided
    return NextResponse.json(
      { data: { message: "Vacancy ID or Application ID is required" } },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("Failed to check application status:", err);
    return NextResponse.json(
      { data: { message: "Failed to check application status", error: err.message } },
      { status: 500 }
    );
  }
}
