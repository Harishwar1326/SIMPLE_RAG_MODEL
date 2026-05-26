# Simple Naive RAG App

A beginner-friendly Retrieval-Augmented Generation demo that shows the core RAG loop without advanced retrieval tricks.

This version uses:

- React frontend
- Express backend mounted under `frontend/api/backend`
- Google Gemini for embeddings and generation
- Chroma Cloud as the primary vector database
- LangSmith tracing behind an environment flag

## What this project teaches

- How documents become text
- How text is cleaned and chunked
- How chunks are converted to embeddings
- How a vector store enables similarity search
- How retrieved chunks are injected into an LLM prompt
- How a React frontend talks to backend API routes with relative URLs

## Project Structure

```bash
project/
├── frontend/
│   ├── api/
│   │   └── backend/
│   │       ├── controllers/
│   │       ├── routes/
│   │       ├── services/
│   │       ├── utils/
│   │       ├── vectorstore/
│   │       ├── uploads/
│   │       └── index.js
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## RAG Flow Implemented

### Document Processing Pipeline

1. Load documents from upload input.
2. Clean text to remove noise and normalize spacing.
3. Chunk documents into small overlapping sections.
4. Create embeddings for each chunk.
5. Store embeddings in an in-memory vector store.

### Question Answering Pipeline

1. User asks a question.
2. The question is converted into an embedding.
3. The vector store runs similarity search.
4. The top matching chunks are retrieved.
5. The retrieved chunks are inserted into the prompt.
6. The LLM generates the final answer.
7. The frontend displays the answer and the retrieved chunks.

## Backend Design

The backend lives in `frontend/api/backend` and is mounted into the Vite dev server, so the frontend can call:

- `GET /api/backend/health`
- `GET /api/backend/documents`
- `POST /api/backend/upload`
- `POST /api/backend/process`
- `POST /api/backend/ask`
- `GET /api/backend/chunks/:documentId`

This keeps the app simple for learning and keeps the frontend and backend in one project.

## Environment Variables

Create a `.env` file inside `frontend/` to connect the cloud services.

```bash
GOOGLE_API_KEY=your_google_api_key_here
GEMINI_EMBEDDING_MODEL=gemini-embedding-001  # Gemini Embedding 1
GEMINI_CHAT_MODEL=gemini-2.0-flash

LANGSMITH_TRACING=true
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
LANGSMITH_API_KEY=your_langsmith_api_key_here
LANGSMITH_PROJECT=RAG_MODEL

CHROMA_HOST=api.trychroma.com
CHROMA_API_KEY=your_chroma_api_key_here
CHROMA_TENANT=ffe9bf8a-1be9-4311-b859-92e27dc28782
CHROMA_DATABASE=GENAI
CHROMA_COLLECTION=RAG_MODEL

VITE_API_BASE_URL=/api/backend
```

If `GOOGLE_API_KEY` is not set, the app falls back to a local hash-based embedding and a simple answer fallback so the demo still works.

## Setup

1. Open the `frontend/` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the app:
   ```bash
   npm run dev
   ```
4. Open the Vite URL shown in the terminal.

No separate backend terminal is needed during development because the backend is mounted into Vite.

## How to Use

1. Upload a PDF, TXT, DOC, or DOCX file.
2. Select the uploaded document.
3. Click **Process selected doc** to run the RAG document pipeline.
4. Ask a question in the chat box.
5. Review the generated answer and the retrieved chunks.

## Learning Notes

- This is a Naive RAG system on purpose.
- It uses one vector store and one retrieval path.
- It does not include hybrid search, reranking, graph RAG, multi-agent orchestration, or parent-child retrieval.
- The goal is to understand the core architecture, not to build a production RAG stack.

## Deployment Note

The code is organized so the backend lives under `frontend/api/backend`, which makes it easy to adapt to serverless route deployments on platforms like Vercel or Netlify.

For Vercel, the `frontend/vercel.json` file keeps the SPA rewrite in place while the `/api/backend/*` routes are served from the `frontend/api/backend` folder.

For production deployment, keep the same route contract and provide the environment variables above in the hosting dashboard.

## Vercel Deployment (Recommended)

1. Import this GitHub repository in Vercel.
2. In project settings, set **Root Directory** to `frontend`.
3. Build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variables from the **Environment Variables** section in this README.
5. Deploy.

After deployment, verify:

- `GET /api/backend/health` returns `{ ok: true, ... }`
- Frontend requests to `/api/backend/*` succeed without CORS changes
