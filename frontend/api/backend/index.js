import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import path from "path";

import documentRoutes from "./routes/documentRoutes.js";
import ragRoutes from "./routes/ragRoutes.js";
import { getVectorStoreStatus } from "./vectorstore/index.js";

const envCandidates = [
  path.resolve(process.cwd(), ".env.local"),
  path.resolve(process.cwd(), ".env"),
];

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

const app = express();

// Keep the backend easy to use from the Vite frontend and from serverless deployments.
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.json({
    message: "Simple Naive RAG backend is running.",
    langsmithEnabled:
      process.env.LANGSMITH_TRACING === "true" &&
      Boolean(process.env.LANGSMITH_API_KEY),
    vectorStore: getVectorStoreStatus(),
  });
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    langsmithEnabled:
      process.env.LANGSMITH_TRACING === "true" &&
      Boolean(process.env.LANGSMITH_API_KEY),
    vectorStore: getVectorStoreStatus(),
  });
});

app.use("/", documentRoutes);
app.use("/", ragRoutes);

// Return JSON errors so the frontend can show readable messages.
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    message: error.message || "Internal server error",
  });
});

export default app;
