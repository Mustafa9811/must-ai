import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { env } from '@/env';

// Initialize the Google Generative AI client
let geminiClient: GoogleGenerativeAI | null = null;

export function getGeminiClient() {
  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }
  
  return geminiClient;
}

// System prompt for UAE Tax Advisor
const UAE_TAX_ADVISOR_PROMPT = `You are MusTax AI, a specialized UAE Corporate Tax advisor. Your role is to analyze financial documents and provide detailed tax insights based on UAE tax regulations.

When analyzing documents:
1. Identify key financial metrics relevant to UAE Corporate Tax calculations
2. Determine applicable tax treatments under UAE Corporate Tax law
3. Highlight potential tax optimization opportunities
4. Identify any compliance risks or issues
5. Provide clear, actionable recommendations

Your analysis should be comprehensive, accurate, and tailored to UAE Corporate Tax regulations. Format your response as a well-structured HTML report with proper headings, sections, and formatting.

The report should include:
- Executive Summary
- Key Financial Findings
- Tax Implications
- Recommendations
- Compliance Considerations

Use professional language and cite specific UAE tax regulations where applicable.`;

// Generate document analysis using Gemini
export async function generateDocumentAnalysis(documentText: string): Promise<{
  analysisHtml: string;
  summary: string;
}> {
  try {
    const gemini = getGeminiClient();
    
    // Use Gemini Pro model
    const model = gemini.getGenerativeModel({
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
    
    // Generate analysis with system prompt
    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: UAE_TAX_ADVISOR_PROMPT }] },
        { role: "model", parts: [{ text: "I understand my role as MusTax AI. I'll analyze the document and provide a comprehensive HTML report following the guidelines." }] },
        { role: "user", parts: [{ text: `Please analyze this financial document for UAE Corporate Tax implications:\n\n${documentText}` }] },
      ],
    });
    
    const response = result.response;
    const analysisHtml = response.text();
    
    // Generate a summary using the same model
    const summaryResult = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: "Based on the analysis you just performed, provide a brief summary (3-5 sentences) of the key findings and recommendations." }] },
      ],
      generationConfig: {
        maxOutputTokens: 200,
      },
    });
    
    const summary = summaryResult.response.text();
    
    return {
      analysisHtml,
      summary,
    };
  } catch (error) {
    console.error('Error generating document analysis:', error);
    
    // Fallback error report
    const errorHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>MusTax AI Analysis Error</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #e53e3e; }
        .error-box { background-color: #fff5f5; border-left: 4px solid #e53e3e; padding: 15px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <h1>Analysis Error</h1>
      <div class="error-box">
        <p>We encountered an error while analyzing your document. This could be due to:</p>
        <ul>
          <li>Complex document formatting</li>
          <li>Temporary service disruption</li>
          <li>Insufficient data in the document</li>
        </ul>
      </div>
      <p>Please try again with a different document or contact support if the issue persists.</p>
    </body>
    </html>
    `;
    
    return {
      analysisHtml: errorHtml,
      summary: "An error occurred during document analysis. Please try again with a different document or contact support if the issue persists.",
    };
  }
}

// Generate answer to follow-up question about analyzed document
export async function generateFollowUpAnswer(question: string, analysisContext: string): Promise<string> {
  try {
    const gemini = getGeminiClient();
    
    // Use Gemini Pro model
    const model = gemini.getGenerativeModel({
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
    
    // Generate answer with context
    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: `You are MusTax AI, a specialized UAE Corporate Tax advisor. You previously analyzed a financial document and generated this analysis:\n\n${analysisContext}\n\nNow answer the following question about this document:\n\n${question}` }] },
      ],
    });
    
    return result.response.text();
  } catch (error) {
    console.error('Error generating follow-up answer:', error);
    return "I'm sorry, I encountered an error while trying to answer your question. Please try asking in a different way or contact support if the issue persists.";
  }
}
