import { Pinecone } from '@pinecone-database/pinecone';
import { env } from '@/env';

// Initialize the Pinecone client
let pineconeClient: Pinecone | null = null;

export async function getPineconeClient() {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: env.PINECONE_API_KEY,
      environment: env.PINECONE_ENVIRONMENT,
    });
  }

  return pineconeClient;
}

// Get the Pinecone index for the main knowledge base
export async function getPineconeIndex() {
  const pinecone = await getPineconeClient();
  return pinecone.index(env.PINECONE_INDEX);
}

// Get a namespace-specific Pinecone index for temporary document context
export async function getTemporaryPineconeIndex(namespace: string) {
  const pinecone = await getPineconeClient();
  const index = pinecone.index(env.PINECONE_INDEX);
  
  // Return the index with the specified namespace
  return {
    ...index,
    namespace,
  };
}
