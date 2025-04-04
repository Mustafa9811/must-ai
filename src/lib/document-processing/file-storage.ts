import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

// Define file storage options
const TEMP_DIR = path.join(os.tmpdir(), 'mustax-ai');

// Ensure temp directory exists
async function ensureTempDir() {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating temp directory:', error);
    throw new Error('Failed to create temporary storage directory');
  }
}

// Save uploaded file to temporary storage
export async function saveUploadedFile(file: File): Promise<string> {
  await ensureTempDir();
  
  // Generate a unique filename
  const fileId = uuidv4();
  const fileExtension = path.extname(file.name);
  const fileName = `${fileId}${fileExtension}`;
  const filePath = path.join(TEMP_DIR, fileName);
  
  try {
    // Convert file to buffer and save
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);
    
    return filePath;
  } catch (error) {
    console.error('Error saving uploaded file:', error);
    throw new Error('Failed to save uploaded file');
  }
}

// Get file from temporary storage
export async function getFileFromStorage(filePath: string): Promise<Buffer> {
  try {
    return await fs.readFile(filePath);
  } catch (error) {
    console.error('Error reading file from storage:', error);
    throw new Error('Failed to read file from storage');
  }
}

// Delete file from temporary storage
export async function deleteFileFromStorage(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error deleting file from storage:', error);
    // Don't throw here, just log the error
  }
}

// Clean up temporary files older than a certain age (e.g., 24 hours)
export async function cleanupTempFiles(maxAgeMs: number = 24 * 60 * 60 * 1000): Promise<void> {
  try {
    const now = Date.now();
    const files = await fs.readdir(TEMP_DIR);
    
    for (const file of files) {
      const filePath = path.join(TEMP_DIR, file);
      const stats = await fs.stat(filePath);
      
      // If file is older than maxAgeMs, delete it
      if (now - stats.mtimeMs > maxAgeMs) {
        await fs.unlink(filePath);
      }
    }
  } catch (error) {
    console.error('Error cleaning up temp files:', error);
    // Don't throw here, just log the error
  }
}
