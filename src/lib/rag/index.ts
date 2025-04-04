import { generateEmbeddings, splitTextIntoChunks } from './embeddings';
import { storeTemporaryDocumentChunks, deleteTemporaryDocumentChunks, retrieveContext, retrieveTemporaryContext, formatRetrievedContextForPrompt } from './context-retrieval';

// Main RAG function to retrieve context for a query
export async function retrieveRagContext(query: string, sessionId?: string): Promise<string> {
  try {
    // Initialize contexts array
    let contexts = [];
    
    // If sessionId is provided, first try to retrieve context from temporary storage
    if (sessionId) {
      const tempContexts = await retrieveTemporaryContext(query, sessionId, 3);
      contexts.push(...tempContexts);
    }
    
    // Always retrieve context from the main knowledge base
    const kbContexts = await retrieveContext(query, 5);
    contexts.push(...kbContexts);
    
    // Sort contexts by score (highest first)
    contexts.sort((a, b) => b.score - a.score);
    
    // Take top 5 contexts overall
    contexts = contexts.slice(0, 5);
    
    // Format contexts for prompt
    return formatRetrievedContextForPrompt(contexts);
  } catch (error) {
    console.error('Error in RAG context retrieval:', error);
    // Return fallback message in case of error
    return `
Source: UAE Tax Knowledge Base (Fallback)
---
The UAE Corporate Tax regime is designed to be simple and imposes minimal compliance burden on businesses. The standard statutory Corporate Tax rate is 9%, with a 0% rate for taxable income up to AED 375,000 to support small businesses and startups. The Corporate Tax applies to all businesses and commercial activities alike, except for the extraction of natural resources which remains subject to Emirate level taxation.
---
`;
  }
}

// Process and store document for RAG
export async function processDocumentForRag(
  text: string,
  sessionId: string,
  filename: string
): Promise<void> {
  try {
    // Split text into chunks
    const chunks = splitTextIntoChunks(text, 1000);
    
    // Store chunks in temporary storage
    await storeTemporaryDocumentChunks(chunks, sessionId, filename);
    
    return;
  } catch (error) {
    console.error('Error processing document for RAG:', error);
    throw new Error('Failed to process document for RAG');
  }
}

// Clear temporary RAG context for a session
export async function clearTemporaryRagContext(sessionId: string): Promise<void> {
  try {
    await deleteTemporaryDocumentChunks(sessionId);
  } catch (error) {
    console.error('Error clearing temporary RAG context:', error);
    // Don't throw here, just log the error
  }
}

export {
  generateEmbeddings,
  splitTextIntoChunks,
  storeTemporaryDocumentChunks,
  deleteTemporaryDocumentChunks,
  retrieveContext,
  retrieveTemporaryContext,
  formatRetrievedContextForPrompt,
};
