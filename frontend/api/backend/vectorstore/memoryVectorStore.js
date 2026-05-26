import { cosineSimilarity } from "../utils/similarity.js";

const chunkStore = [];

export function addChunkRecords(records) {
  const storedRecords = records.map((record) => ({
    ...record,
    vectorId: `${record.documentId}-${record.chunkIndex}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  }));

  chunkStore.push(...storedRecords);
  return storedRecords;
}

export function searchSimilarChunks(queryEmbedding, topK = 3, filters = {}) {
  const scoredChunks = chunkStore
    .filter((record) => {
      if (!filters.documentId) {
        return true;
      }

      return record.documentId === filters.documentId;
    })
    .map((record) => ({
      ...record,
      score: cosineSimilarity(queryEmbedding, record.embedding),
    }))
    .sort((left, right) => right.score - left.score);

  return scoredChunks.slice(0, topK);
}

export function listChunksByDocument(documentId) {
  return chunkStore
    .filter((record) => record.documentId === documentId)
    .map(({ embedding, ...rest }) => rest);
}

export function resetVectorStore() {
  chunkStore.length = 0;
}

export function getVectorStoreSize() {
  return chunkStore.length;
}
