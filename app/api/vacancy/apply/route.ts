import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { createClient } from "@/lib/utils/supabase/server";
import { getApplicationConfirmationTemplate, sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const internshipId = formData.get("internshipId");
    const vacancyId = formData.get("vacancyId");
    const cv = formData.get("cv") as File | null;
    const portfolio = formData.get("portfolio") as string | null;
    const reason = formData.get("reason") as string | null;

    // Basic validation
    if (!internshipId || !vacancyId || !cv || !portfolio) {
      return NextResponse.json(
        {
          message: "Missing required fields",
        },
        {
          status: 400,
        }
      );
    }

    const numericInternshipId = Number(internshipId);
    const numericVacancyId = Number(vacancyId);

    // Verify that the internship and vacancy exist
    const internship = await prisma.internship.findUnique({
      where: { id: numericInternshipId },
    });

    const vacancy = await prisma.vacancy.findUnique({
      where: { id: numericVacancyId },
      include: {
        position: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!internship || !vacancy) {
      return NextResponse.json(
        {
          message: !internship ? "Internship not found" : "Vacancy not found",
        },
        {
          status: 404,
        }
      );
    }

    // Check if the vacancy is still open
    if (vacancy.status !== "OPEN") {
      return NextResponse.json(
        {
          message: "This vacancy is no longer open for applications",
        },
        {
          status: 400,
        }
      );
    }

    // Check if user has already applied to this vacancy
    const existingApplication = await prisma.application.findFirst({
      where: {
        internshipId: numericInternshipId,
        vacancyId: numericVacancyId,
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        {
          message: "You have already applied for this position",
        },
        {
          status: 400,
        }
      );
    }

    // Initialize Supabase client
    const supabase = await createClient();

    // Upload CV file if provided
    let cvUrl: string | null = null;
    if (cv) {
      const fileName = `${internship.userId}-${vacancyId}-cv-${Date.now()}`;
      const { error: cvError } = await supabase.storage
        .from("all")
        .upload(`applications/cv/${fileName}`, cv);

      if (cvError) {
        return NextResponse.json(
          {
            message: "Error uploading CV",
            error: cvError.message,
          },
          {
            status: 400,
          }
        );
      }

      const { data: cvPublicUrlData } = supabase.storage
        .from("all")
        .getPublicUrl(`applications/cv/${fileName}`);

      cvUrl = cvPublicUrlData.publicUrl;
    }

    // Create the application in the database
    const application = await prisma.application.create({
      data: {
        status: "PENDING",
        cv: cvUrl,
        portfolio: portfolio,
        reason: reason,
        internshipId: numericInternshipId,
        vacancyId: numericVacancyId,
      },
    });

    // Create notification for user
    await prisma.notification.create({
      data: {
        title: "Application Submitted",
        message: `Your application for ${vacancy.title} has been submitted and is under review.`,
        userId: internship.userId as string,
      },
    });

    // Send confirmation email to user
    const user = await prisma.user.findUnique({
      where: { id: internship.userId as string },
    });

    if (user && user.email) {
      const emailHtml = getApplicationConfirmationTemplate({
        userName: user.name || "Applicant",
        positionTitle: vacancy.position?.title || "the position",
      });

      sendEmail(user.email, "Application Confirmation", emailHtml);
    }

    return NextResponse.json(
      {
        message: "Application submitted successfully",
        applicationId: application.id,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Error submitting application:", error);
    return NextResponse.json(
      {
        message: "Failed to submit application",
        error: error,
      },
      {
        status: 500,
      }
    );
  }
}
