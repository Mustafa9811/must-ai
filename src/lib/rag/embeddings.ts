import { OpenAI } from 'openai';
import { env } from '@/env';

// Initialize the OpenAI client
let openaiClient: OpenAI | null = null;

export function getOpenAIClient() {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  return openaiClient;
}

// Generate embeddings for a text using OpenAI's text-embedding-3-small model
export async function generateEmbeddings(text: string): Promise<number[]> {
  try {
    const openai = getOpenAIClient();
    
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      dimensions: 1536, // Standard dimension for text-embedding-3-small
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw new Error('Failed to generate embeddings');
  }
}

// Split text into chunks for embedding
export function splitTextIntoChunks(text: string, maxChunkSize: number = 1000): string[] {
  // Simple splitting by sentences and then combining into chunks
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const sentence of sentences) {
    // If adding this sentence would exceed the max chunk size, start a new chunk
    if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = '';
    }
    
    currentChunk += sentence + ' ';
  }
  
  // Add the last chunk if it's not empty
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}
