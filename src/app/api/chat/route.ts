import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { Message } from 'ai';
import { StreamingTextResponse } from 'ai/streaming';
import { env } from '@/env';
import { retrieveRagContext } from '@/lib/rag';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

// System prompt for UAE Tax Advisor chat
const UAE_TAX_ADVISOR_CHAT_PROMPT = `You are MusTax AI, a specialized UAE Corporate Tax advisor. Your role is to provide accurate, helpful information about UAE Corporate Tax regulations, compliance, registration, free zones, small business relief, calculations, and other related topics.

Your responses should be:
1. Accurate and up-to-date with UAE tax regulations
2. Clear and easy to understand, even for those without tax expertise
3. Practical and actionable
4. Professional but conversational in tone

When appropriate, cite specific UAE tax regulations or official sources. If you're unsure about something, acknowledge the limitations of your knowledge and suggest consulting with a human tax advisor for complex situations.`;

export async function POST(req: Request) {
  try {
    const { messages, chatId } = await req.json();
    
    // Get the last user message
    const lastUserMessage = messages.filter((m: Message) => m.role === 'user').pop();
    
    if (!lastUserMessage) {
      return new Response('No user message found', { status: 400 });
    }
    
    // Retrieve context from RAG system
    const sessionId = chatId || 'default-session';
    const ragContext = await retrieveRagContext(lastUserMessage.content, sessionId);
    
    // Format conversation history for Gemini
    const formattedMessages = messages.map((message: Message) => ({
      role: message.role === 'user' ? 'user' : 'model',
      parts: [{ text: message.content }],
    }));
    
    // Add system prompt at the beginning if not already present
    if (!formattedMessages.some(m => m.parts[0].text.includes('You are MusTax AI'))) {
      formattedMessages.unshift({
        role: 'user',
        parts: [{ text: UAE_TAX_ADVISOR_CHAT_PROMPT }],
      });
      
      formattedMessages.unshift({
        role: 'model',
        parts: [{ text: 'I understand my role as MusTax AI. I will provide accurate and helpful information about UAE Corporate Tax.' }],
      });
    }
    
    // Add RAG context to the last user message if available
    if (ragContext) {
      const lastUserMessageIndex = formattedMessages.findIndex(
        m => m.role === 'user' && m.parts[0].text === lastUserMessage.content
      );
      
      if (lastUserMessageIndex !== -1) {
        formattedMessages[lastUserMessageIndex] = {
          role: 'user',
          parts: [{ 
            text: `${lastUserMessage.content}\n\nRelevant context:\n${ragContext}` 
          }],
        };
      }
    }
    
    // Initialize Gemini model with safety settings
    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });
    
    // Generate streaming response
    const result = await model.generateContentStream({
      contents: formattedMessages,
    });
    
    // Convert to StreamingTextResponse
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        for await (const chunk of result.stream) {
          const text = chunk.text();
          controller.enqueue(encoder.encode(text));
        }
        
        controller.close();
      },
    });
    
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response('Error processing your request', { status: 500 });
  }
}
