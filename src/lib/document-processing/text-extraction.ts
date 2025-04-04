import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { getFileFromStorage } from './file-storage';

// Extract text from PDF file
export async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    const fileBuffer = await getFileFromStorage(filePath);
    const pdfData = await pdfParse(fileBuffer);
    return pdfData.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

// Extract text from DOCX file
export async function extractTextFromDOCX(filePath: string): Promise<string> {
  try {
    const fileBuffer = await getFileFromStorage(filePath);
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error('Failed to extract text from DOCX');
  }
}

// Extract text from DOC file (using mammoth with fallback)
export async function extractTextFromDOC(filePath: string): Promise<string> {
  try {
    // Attempt to use mammoth for DOC files as well
    return await extractTextFromDOCX(filePath);
  } catch (error) {
    console.error('Error extracting text from DOC:', error);
    throw new Error('Failed to extract text from DOC');
  }
}

// Extract text from TXT file
export async function extractTextFromTXT(filePath: string): Promise<string> {
  try {
    const fileBuffer = await getFileFromStorage(filePath);
    return fileBuffer.toString('utf-8');
  } catch (error) {
    console.error('Error extracting text from TXT:', error);
    throw new Error('Failed to extract text from TXT');
  }
}

// Extract text from file based on file type
export async function extractTextFromFile(filePath: string, fileType: string): Promise<string> {
  switch (fileType.toLowerCase()) {
    case 'application/pdf':
      return extractTextFromPDF(filePath);
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return extractTextFromDOCX(filePath);
    case 'application/msword':
      return extractTextFromDOC(filePath);
    case 'text/plain':
      return extractTextFromTXT(filePath);
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}
