import { getPineconeIndex, getTemporaryPineconeIndex } from './pinecone-client';
import { generateEmbeddings } from './embeddings';
import { env } from '@/env';

interface RetrievedContext {
  text: string;
  source: string;
  score: number;
}

// Retrieve context from the main knowledge base
export async function retrieveContext(query: string, topK: number = 5): Promise<RetrievedContext[]> {
  try {
    // Generate embeddings for the query
    const queryEmbedding = await generateEmbeddings(query);
    
    // Get the Pinecone index
    const index = await getPineconeIndex();
    
    // Query the index
    const results = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    });
    
    // Format the results
    return results.matches.map((match) => ({
      text: match.metadata?.text as string || '',
      source: match.metadata?.source as string || 'UAE Tax Knowledge Base',
      score: match.score,
    }));
  } catch (error) {
    console.error('Error retrieving context from knowledge base:', error);
    return [];
  }
}

// Retrieve context from temporary document storage (for the current chat session)
export async function retrieveTemporaryContext(
  query: string, 
  sessionId: string,
  topK: number = 3
): Promise<RetrievedContext[]> {
  try {
    // Generate embeddings for the query
    const queryEmbedding = await generateEmbeddings(query);
    
    // Get the temporary Pinecone index with the session namespace
    const tempIndex = await getTemporaryPineconeIndex(`session-${sessionId}`);
    
    // Query the index
    const results = await tempIndex.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    });
    
    // Format the results
    return results.matches.map((match) => ({
      text: match.metadata?.text as string || '',
      source: match.metadata?.filename as string || 'Uploaded Document',
      score: match.score,
    }));
  } catch (error) {
    console.error('Error retrieving context from temporary storage:', error);
    return [];
  }
}

// Store document chunks in temporary storage
export async function storeTemporaryDocumentChunks(
  chunks: string[],
  sessionId: string,
  filename: string
): Promise<void> {
  try {
    // Get the temporary Pinecone index with the session namespace
    const tempIndex = await getTemporaryPineconeIndex(`session-${sessionId}`);
    
    // Process chunks in batches to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      
      // Generate embeddings for each chunk
      const embeddingPromises = batch.map(chunk => generateEmbeddings(chunk));
      const embeddings = await Promise.all(embeddingPromises);
      
      // Prepare vectors for upsert
      const vectors = batch.map((chunk, index) => ({
        id: `${sessionId}-${i + index}`,
        values: embeddings[index],
        metadata: {
          text: chunk,
          filename,
          sessionId,
          chunkIndex: i + index,
        },
      }));
      
      // Upsert vectors to Pinecone
      await tempIndex.upsert(vectors);
    }
  } catch (error) {
    console.error('Error storing document chunks:', error);
    throw new Error('Failed to store document chunks');
  }
}

// Delete temporary document chunks for a session
export async function deleteTemporaryDocumentChunks(sessionId: string): Promise<void> {
  try {
    // Get the temporary Pinecone index with the session namespace
    const tempIndex = await getTemporaryPineconeIndex(`session-${sessionId}`);
    
    // Delete all vectors in the namespace
    await tempIndex.deleteAll();
  } catch (error) {
    console.error('Error deleting temporary document chunks:', error);
    // Don't throw here, just log the error
  }
}

// Combine retrieved contexts into a prompt context
export function formatRetrievedContextForPrompt(contexts: RetrievedContext[]): string {
  if (contexts.length === 0) {
    return '';
  }
  
  return contexts.map(context => {
    return `
Source: ${context.source}
---
${context.text}
---
`;
  }).join('\n');
}
