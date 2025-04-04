import { NextResponse } from "next/server";
import { processDocumentForAnalysis } from "@/lib/document-processing";
import { db } from "@/lib/db";
import { analysisReports } from "@/lib/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get form data with file
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload PDF, DOC, DOCX, or TXT files." },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File is too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Use user ID as session ID for document processing
    const sessionId = session.user.id;

    // Process document for analysis
    const { analysisId, analysisHtml, summary } = await processDocumentForAnalysis(
      file,
      sessionId
    );

    // Store analysis in database
    await db.insert(analysisReports).values({
      userId: session.user.id,
      title: file.name,
      content: analysisHtml,
      summary,
    });

    return NextResponse.json({
      analysisId,
      summary,
      message: "Document analyzed successfully",
    });
  } catch (error) {
    console.error("Error analyzing document:", error);
    return NextResponse.json(
      { error: "Failed to analyze document" },
      { status: 500 }
    );
  }
}
