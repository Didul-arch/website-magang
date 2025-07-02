import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/utils/supabase/verifyAdminRole";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const adminCheck = await verifyAdmin(request);
  if (adminCheck) return adminCheck; // Return response if verification fails

  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { message: "User ID is required" },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        internship: {
          include: {
            applications: {
              include: {
                Vacancy: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
                ApplicantAnswer: true,
              },
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Transform data to match the structure the frontend expects
    const responseData = {
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        company: user.internship?.company ?? "N/A",
        degree: user.internship?.degree ?? "N/A",
        semester: user.internship?.semester ?? 0,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      applications:
        user.internship?.applications.map((app: any) => ({
          id: app.id,
          status: app.status,
          createdAt: app.createdAt,
          vacancy: {
            id: app.Vacancy?.id,
            title: app.Vacancy?.title,
          },
          quiz: {
            hasAnswered: app.ApplicantAnswer.length > 0,
            score: null, // Score calculation is complex and deferred for now
          },
        })) || [],
    };

    return NextResponse.json({ data: responseData });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
