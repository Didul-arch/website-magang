import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import OpenAI from "openai";
import pdf from "pdf-parse";
import { verifyAdmin } from "@/lib/utils/supabase/verifyAdminRole";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the expected JSON structure from OpenAI
interface AnalysisResult {
  cv_match_analysis: string;
  reason_match_analysis: string;
  overall_recommendation: "RECOMMENDED" | "NOT_RECOMMENDED";
  recommendation_reason: string;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Verify Admin Role (Uncomment when ready)
    // await verifyAdmin(request);

    const applicationId = parseInt(params.id, 10);
    if (isNaN(applicationId)) {
      return NextResponse.json(
        { message: "Invalid application ID" },
        { status: 400 }
      );
    }

    // 2. Fetch all necessary data from the database
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        Vacancy: true, // FIX: Correct relation name is 'Vacancy' (uppercase V)
      },
    });

    if (!application || !application.Vacancy) {
      return NextResponse.json(
        { message: "Application data not found or incomplete" },
        { status: 404 }
      );
    }

    // FIX: Destructure from the correct objects. CV is on the application itself.
    const { Vacancy, reason, cv } = application;
    const cvUrl = cv;

    if (!cvUrl) {
      return NextResponse.json(
        { message: "CV URL not found for this applicant" },
        { status: 400 }
      );
    }

    // 3. Fetch and parse the CV
    let cvText = "";
    try {
      const response = await fetch(cvUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch CV: ${response.statusText}`);
      }
      const buffer = await response.arrayBuffer();
      const data = await pdf(Buffer.from(buffer));
      cvText = data.text;
    } catch (error) {
      console.error("Error parsing CV:", error);
      return NextResponse.json(
        { message: "Failed to read or parse CV file." },
        { status: 500 }
      );
    }

    // 4. Construct the prompt for OpenAI
    const prompt = `
      You are a highly meticulous virtual HR assistant. Your task is to analyze a candidate's suitability for an internship position.

      Here is the data you have:
      ---
      **Position Details:**
      - Title: ${Vacancy.title}
      - Description & Qualifications: ${Vacancy.description}
      ---
      **Candidate's Data:**
      - Reason for Applying (Cover Letter): ${reason || "Not provided."}
      - CV Content: ${cvText}
      ---

      **Your Task:**
      Based on the data above, provide an analysis in a strict JSON format. DO NOT add any other text or explanations outside the JSON format.

      The JSON format you must produce is as follows:
      {
        "cv_match_analysis": "A brief analysis of how well the CV content matches the required qualifications. Explain key matching or non-matching points.",
        "reason_match_analysis": "A brief analysis of how relevant and convincing the candidate's reason for applying is.",
        "overall_recommendation": "RECOMMENDED | NOT_RECOMMENDED",
        "recommendation_reason": "Briefly explain the main reason behind your recommendation (e.g., 'Candidate has strong experience in X and shows high motivation', or 'Candidate's qualifications do not align with the main requirements of the job description')."
      }
    `;

    // 5. Call the OpenAI API
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { message: "OpenAI API key is not configured on the server." },
        { status: 500 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const analysisResult = JSON.parse(
      response.choices[0].message.content || "{}"
    );

    // 6. Send the result back to the client
    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error("Error during AI analysis:", error);
    let errorMessage = "An unknown error occurred during AI analysis.";
    if (error instanceof OpenAI.APIError) {
      errorMessage = `OpenAI API Error: ${error.status} ${error.message}`;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { message: "Error during AI analysis", error: errorMessage },
      { status: 500 }
    );
  }
}
