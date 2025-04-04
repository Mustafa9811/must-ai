# MusTax AI Documentation

## Overview

MusTax AI is a specialized UAE Corporate Tax assistant application that provides two main functionalities:

1. **MusTax AI Chat**: An interactive chatbot for UAE Corporate Tax regulations
2. **MusTax AI Analyze**: A document analysis feature for financial documents

## Architecture

The application is built using the following technologies:

- **Frontend**: Next.js with React and Framer Motion
- **UI**: Shadcn UI components with Tailwind CSS (dark theme)
- **Authentication**: NextAuth.js with JWT strategy
- **Database**: Drizzle ORM with D1 database
- **AI Models**: Google Gemini Pro and OpenAI
- **Vector Database**: Pinecone for RAG system
- **Document Processing**: PDF-parse and Mammoth for text extraction

## Project Structure

```
mustax-ai/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── chat/
│   │   │   ├── analyze/
│   │   │   └── temp-documents/
│   │   ├── globals.css
│   │   └── providers.tsx
│   ├── components/
│   │   ├── auth/
│   │   ├── chat/
│   │   ├── analyze/
│   │   └── ui/
│   ├── lib/
│   │   ├── db/
│   │   ├── rag/
│   │   ├── document-processing/
│   │   ├── utils.ts
│   │   └── theme.ts
│   └── env.ts
├── public/
├── tailwind.config.js
└── deployment.md
```

## Features

### Authentication System

- User registration and login
- Secure password hashing
- Protected routes with session management
- User profile management

### Chat Interface

- Real-time chat with AI assistant
- Chat history grouped by time periods
- Markdown rendering with syntax highlighting
- File attachment for context

### Document Analysis

- File upload with validation
- Text extraction from PDF, DOC, DOCX, and TXT
- AI-powered analysis of financial documents
- Follow-up questions about analyzed documents

### RAG System

- Vector embeddings for knowledge retrieval
- Context-aware responses
- Temporary document storage for session context
- Fallback mechanisms for error handling

## API Endpoints

- `/api/auth/*`: Authentication endpoints
- `/api/chat`: Chat with AI assistant
- `/api/analyze/document`: Upload and analyze documents
- `/api/analyze/question`: Ask follow-up questions about analyzed documents
- `/api/temp-documents`: Handle temporary document uploads for chat context

## Environment Variables

The application requires the following environment variables:

```
# Authentication
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-nextauth-secret

# Database
DATABASE_URL=your-database-url

# AI Models
OPENAI_API_KEY=your-openai-api-key
GEMINI_API_KEY=your-gemini-api-key

# Vector Database
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=your-pinecone-environment
PINECONE_INDEX=your-pinecone-index
```

## Deployment

See `deployment.md` for detailed deployment instructions.

## Maintenance

### Adding New Features

1. Create new components in the appropriate directories
2. Add new API endpoints in the `/api` directory
3. Update the database schema if necessary
4. Test thoroughly before deploying

### Updating AI Models

1. Update the model name in the appropriate files
2. Adjust prompt templates if necessary
3. Test with various inputs to ensure quality

### Troubleshooting

- Check application logs for errors
- Verify environment variables are correctly set
- Ensure API keys are valid and have sufficient quota
- Check database connection and migrations
