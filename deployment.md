# MusTax AI Deployment Configuration

This file contains the deployment configuration for the MusTax AI application.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

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

## Build Configuration

The application uses Next.js with the following build configuration:

- Node.js version: 20.x or higher
- Build command: `npm run build`
- Output directory: `.next`
- Install command: `npm install`

## Deployment Options

### Option 1: Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy with default settings

### Option 2: Self-hosted

1. Build the application: `npm run build`
2. Start the production server: `npm start`
3. Use a process manager like PM2: `pm2 start npm --name "mustax-ai" -- start`

## Post-Deployment Steps

1. Set up a custom domain
2. Configure SSL certificates
3. Set up monitoring and analytics
4. Configure backup procedures
