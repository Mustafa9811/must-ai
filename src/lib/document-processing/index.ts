import { saveUploadedFile, deleteFileFromStorage, cleanupTempFiles } from './file-storage';
import { extractTextFromFile } from './text-extraction';
import { generateDocumentAnalysis, generateFollowUpAnswer } from './analysis';
import { processDocumentForRag } from '../rag';

// Process uploaded document for analysis
export async function processDocumentForAnalysis(
  file: File,
  sessionId: string
): Promise<{
  analysisId: string;
  analysisHtml: string;
  summary: string;
}> {
  try {
    // Save file to temporary storage
    const filePath = await saveUploadedFile(file);
    
    // Extract text from file
    const text = await extractTextFromFile(filePath, file.type);
    
    // Process document for RAG (to enable follow-up questions)
    await processDocumentForRag(text, sessionId, file.name);
    
    // Generate analysis using Gemini
    const { analysisHtml, summary } = await generateDocumentAnalysis(text);
    
    // Generate a unique analysis ID
    const analysisId = sessionId;
    
    // Clean up the temporary file
    await deleteFileFromStorage(filePath);
    
    // Schedule cleanup of old temporary files
    cleanupTempFiles().catch(console.error);
    
    return {
      analysisId,
      analysisHtml,
      summary,
    };
  } catch (error) {
    console.error('Error processing document for analysis:', error);
    throw new Error('Failed to process document for analysis');
  }
}

// Answer follow-up question about analyzed document
export async function answerFollowUpQuestion(
  question: string,
  analysisId: string,
  analysisContext: string
): Promise<string> {
  try {
    return await generateFollowUpAnswer(question, analysisContext);
  } catch (error) {
    console.error('Error answering follow-up question:', error);
    throw new Error('Failed to answer follow-up question');
  }
}

export {
  saveUploadedFile,
  deleteFileFromStorage,
  cleanupTempFiles,
  extractTextFromFile,
  generateDocumentAnalysis,
  generateFollowUpAnswer,
};
