import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

const updateApplicationSchema = z.object({
  status: z.enum(["PENDING", "REVIEWED", "ACCEPTED", "REJECTED"], {
    errorMap: () => ({
      message: "Status must be PENDING, REVIEWED, ACCEPTED, or REJECTED",
    }),
  }),
  reason: z.string().optional(),
});

/**
 * Update application status (for admin)
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add admin verification here
    // await verifyAdmin(request);

    const applicationId = parseInt(params.id);
    const body = await request.json();
    const parsedBody = updateApplicationSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          message: "Invalid data",
          errors: parsedBody.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { status, reason } = parsedBody.data;

    // Get application with user and vacancy details
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        internship: {
          include: {
            user: true,
          },
        },
        Vacancy: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { message: "Application not found" },
        { status: 404 }
      );
    }

    // Update application status
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status,
        reason,
      },
    });

    // Send notification to user
    if (application.internship?.user?.id) {
      const notificationTitle = getNotificationTitle(status);
      const notificationMessage = getNotificationMessage(
        status,
        application.Vacancy?.title || "position",
        reason
      );

      await prisma.notification.create({
        data: {
          title: notificationTitle,
          message: notificationMessage,
          userId: application.internship.user.id,
        },
      });

      // Send email notification
      if (application.internship.user.email) {
        const emailSubject = `Application Update: ${application.Vacancy?.title}`;
        const emailHtml = getApplicationStatusEmailTemplate({
          userName: application.internship.user.name,
          positionTitle: application.Vacancy?.title || "position",
          status,
          reason,
        });

        await sendEmail(
          application.internship.user.email,
          emailSubject,
          emailHtml
        );
      }
    }

    return NextResponse.json(
      {
        message: "Application status updated successfully",
        data: updatedApplication,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating application status:", error);
    return NextResponse.json(
      {
        message: "Failed to update application status",
        error,
      },
      { status: 500 }
    );
  }
}

function getNotificationTitle(status: string): string {
  switch (status) {
    case "ACCEPTED":
      return "Application Accepted!";
    case "REJECTED":
      return "Application Update";
    case "REVIEWED":
      return "Application Reviewed";
    default:
      return "Application Status Update";
  }
}

function getNotificationMessage(
  status: string,
  positionTitle: string,
  reason?: string
): string {
  switch (status) {
    case "ACCEPTED":
      return `Congratulations! Your application for ${positionTitle} has been accepted. ${
        reason || ""
      }`;
    case "REJECTED":
      return `Your application for ${positionTitle} was not successful this time. ${
        reason || "Thank you for your interest."
      }`;
    case "REVIEWED":
      return `Your application for ${positionTitle} has been reviewed. ${
        reason || ""
      }`;
    default:
      return `Your application for ${positionTitle} status has been updated to ${status}. ${
        reason || ""
      }`;
  }
}

function getApplicationStatusEmailTemplate(data: {
  userName: string;
  positionTitle: string;
  status: string;
  reason?: string;
}): string {
  const { userName, positionTitle, status, reason } = data;

  const statusColor =
    status === "ACCEPTED"
      ? "#10b981"
      : status === "REJECTED"
      ? "#ef4444"
      : "#f59e0b";
  const statusText =
    status === "ACCEPTED"
      ? "Accepted"
      : status === "REJECTED"
      ? "Not Selected"
      : "Under Review";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Status Update</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: ${statusColor};
      padding: 20px;
      text-align: center;
      color: white;
      border-radius: 5px 5px 0 0;
    }
    .content {
      background-color: #f9f9f9;
      padding: 30px;
      border-radius: 0 0 5px 5px;
      border: 1px solid #e0e0e0;
      border-top: none;
    }
    .status-badge {
      display: inline-block;
      background-color: ${statusColor};
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      margin: 10px 0;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      font-size: 14px;
      color: #666;
    }
    .highlight {
      font-weight: 600;
      color: ${statusColor};
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Application Status Update</h1>
    </div>
    
    <div class="content">
      <p>Dear <span class="highlight">${userName}</span>,</p>
      
      <p>We wanted to update you on the status of your application for the <span class="highlight">${positionTitle}</span> position.</p>
      
      <div style="text-align: center; margin: 25px 0;">
        <div class="status-badge">${statusText}</div>
      </div>
      
      ${
        reason
          ? `<p><strong>Additional Information:</strong><br>${reason}</p>`
          : ""
      }
      
      ${
        status === "ACCEPTED"
          ? `
        <p>Congratulations! We are excited to have you join our team. We will be in touch soon with next steps.</p>
      `
          : status === "REJECTED"
          ? `
        <p>While we were impressed with your qualifications, we have decided to move forward with other candidates at this time. We encourage you to apply for future opportunities that match your skills and interests.</p>
      `
          : `
        <p>Thank you for your patience as we review applications. We will continue to keep you updated on any changes to your application status.</p>
      `
      }
      
      <p>Thank you for your interest in our internship program.</p>
      
      <p>Best regards,<br>
      The Recruitment Team</p>
    </div>
    
    <div class="footer">
      <p>This is an automated message, please do not reply to this email.</p>
      <p>© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}
