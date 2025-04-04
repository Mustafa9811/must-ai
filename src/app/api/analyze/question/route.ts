import { NextResponse } from "next/server";
import { answerFollowUpQuestion } from "@/lib/document-processing";
import { db } from "@/lib/db";
import { analysisReports, eq } from "@/lib/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const { question, analysisId } = await req.json();

    if (!question) {
      return NextResponse.json({ error: "No question provided" }, { status: 400 });
    }

    if (!analysisId) {
      return NextResponse.json({ error: "No analysis ID provided" }, { status: 400 });
    }

    // Retrieve analysis from database
    const analysis = await db.query.analysisReports.findFirst({
      where: eq(analysisReports.id, analysisId),
    });

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    // Verify user owns this analysis
    if (analysis.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Generate answer to follow-up question
    const answer = await answerFollowUpQuestion(
      question,
      analysisId,
      analysis.content
    );

    return NextResponse.json({
      answer,
      message: "Question answered successfully",
    });
  } catch (error) {
    console.error("Error answering follow-up question:", error);
    return NextResponse.json(
      { error: "Failed to answer question" },
      { status: 500 }
    );
  }
}
