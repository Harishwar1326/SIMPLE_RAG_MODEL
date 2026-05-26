import {
  addChunkRecords,
  listChunksByDocument,
  searchSimilarChunks,
} from "../vectorstore/index.js";
import { createEmbedding } from "./embeddingService.js";
import { generateAnswer } from "./llmService.js";
import { cleanText, chunkText } from "./textProcessingService.js";
import { getUploadedDocument, updateDocument } from "./documentService.js";
import { traceStep } from "../utils/tracing.js";

export async function processDocument(documentId) {
  return traceStep("process_document", async () => {
    const document = getUploadedDocument(documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    // Step 1: Clean text so chunking and retrieval see consistent content.
    const cleanedText = cleanText(document.rawText);
    if (!cleanedText) {
      throw new Error("Document text is empty after cleaning");
    }

    // Step 2: Split the document into smaller chunks for retrieval.
    const chunks = chunkText(cleanedText, { chunkSize: 180, overlap: 30 });
    if (chunks.length === 0) {
      throw new Error("Document could not be chunked");
    }

    // Step 3: Turn each chunk into an embedding so we can compare meaning later.
    const chunkRecords = [];
    for (let index = 0; index < chunks.length; index += 1) {
      const chunkTextValue = chunks[index];
      const embedding = await createEmbedding(
        chunkTextValue,
        "RETRIEVAL_DOCUMENT",
      );

      chunkRecords.push({
        documentId,
        documentName: document.originalName,
        chunkIndex: index,
        text: chunkTextValue,
        embedding,
        characterLength: chunkTextValue.length,
      });
    }

    // Step 4: Store chunk embeddings in the vector store.
    const storedChunks = await addChunkRecords(chunkRecords);

    updateDocument(documentId, {
      status: "processed",
      chunkCount: storedChunks.length,
      cleanedText,
    });

    return {
      documentId,
      documentName: document.originalName,
      chunkCount: storedChunks.length,
      message: "Document processed and embeddings stored successfully.",
    };
  });
}

export async function answerQuestion({ question, documentId = null }) {
  return traceStep("answer_question", async () => {
    if (!question || !question.trim()) {
      throw new Error("Question is required");
    }

    // Step 1: Convert the question to the same vector space as the document chunks.
    const questionEmbedding = await createEmbedding(
      question,
      "RETRIEVAL_QUERY",
    );

    // Step 2: Similarity search retrieves the chunks that are closest to the question meaning.
    const retrievedChunks = await searchSimilarChunks(questionEmbedding, 3, {
      documentId: documentId || undefined,
    });

    // Step 3: Inject the retrieved chunks into the prompt and generate the final answer.
    const answer = await generateAnswer({
      question,
      retrievedChunks,
    });

    return {
      question,
      answer,
      documentId,
      retrievedChunks: retrievedChunks.map(({ embedding, ...chunk }) => chunk),
    };
  });
}

export async function getChunksForDocument(documentId) {
  return listChunksByDocument(documentId);
}
