import { NextResponse } from "next/server";
import { processDocumentForRag, clearTemporaryRagContext } from "@/lib/rag";
import { saveUploadedFile, deleteFileFromStorage } from "@/lib/document-processing";
import { extractTextFromFile } from "@/lib/document-processing";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get form data with files
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Validate file types and sizes
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "image/jpeg",
      "image/png",
    ];

    const maxSize = 10 * 1024 * 1024; // 10MB
    const fileIds = [];

    // Process each file
    for (const file of files) {
      // Validate file type
      if (!validTypes.includes(file.type)) {
        continue; // Skip invalid files
      }

      // Validate file size
      if (file.size > maxSize) {
        continue; // Skip files that are too large
      }

      // Save file to temporary storage
      const filePath = await saveUploadedFile(file);

      try {
        // Extract text from file (if not an image)
        if (!file.type.startsWith("image/")) {
          const text = await extractTextFromFile(filePath, file.type);

          // Process document for RAG
          await processDocumentForRag(text, session.user.id, file.name);
        }

        // Add file ID to response
        fileIds.push(file.name);

        // Clean up the temporary file
        await deleteFileFromStorage(filePath);
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        // Continue with other files even if one fails
        await deleteFileFromStorage(filePath);
      }
    }

    return NextResponse.json({
      fileIds,
      message: `${fileIds.length} files processed successfully`,
    });
  } catch (error) {
    console.error("Error processing temporary documents:", error);
    return NextResponse.json(
      { error: "Failed to process documents" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Clear temporary RAG context for the user's session
    await clearTemporaryRagContext(session.user.id);

    return NextResponse.json({
      message: "Temporary documents cleared successfully",
    });
  } catch (error) {
    console.error("Error clearing temporary documents:", error);
    return NextResponse.json(
      { error: "Failed to clear temporary documents" },
      { status: 500 }
    );
  }
}
