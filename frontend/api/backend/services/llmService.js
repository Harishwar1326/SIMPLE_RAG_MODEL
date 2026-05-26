import { traceStep } from "../utils/tracing.js";

const GOOGLE_CHAT_MODEL =
  process.env.GEMINI_CHAT_MODEL || "gemini-flash-latest";

function renderContext(retrievedChunks = []) {
  return retrievedChunks
    .map((chunk, index) => `Chunk ${index + 1}: ${chunk.text}`)
    .join("\n\n");
}

function buildFallbackAnswer(question, retrievedChunks, reason = "") {
  if (retrievedChunks.length === 0) {
    return reason
      ? `LLM unavailable (${reason}). I could not find relevant context for: ${question}`
      : `I could not find relevant context for: ${question}`;
  }

  const topChunk = retrievedChunks[0];
  return [
    reason
      ? `LLM unavailable (${reason}), so this demo used a local fallback answer.`
      : "No LLM API key is configured, so this demo used a local fallback answer.",
    `Most relevant chunk: ${topChunk.text}`,
    `Question: ${question}`,
  ].join("\n\n");
}

function getGoogleApiKey() {
  return process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "";
}

async function fetchGeminiChatCompletion(question, retrievedChunks) {
  const context = renderContext(retrievedChunks);
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GOOGLE_CHAT_MODEL}:generateContent?key=${getGoogleApiKey()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        generationConfig: {
          temperature: 0.2,
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text:
                  `You are a helpful assistant for a simple Naive RAG demo. Answer only from the provided context. ` +
                  `If the context does not contain the answer, say that the document does not mention it.\n\n` +
                  `Context:\n${context || "No context available."}\n\nQuestion: ${question}`,
              },
            ],
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const apiMessage =
      payload?.error?.message ||
      `LLM request failed with status ${response.status}`;
    throw new Error(apiMessage);
  }

  const payload = await response.json();
  return (
    payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .join("")
      .trim() || buildFallbackAnswer(question, retrievedChunks)
  );
}

export async function generateAnswer({ question, retrievedChunks = [] }) {
  return traceStep("generate_answer", async () => {
    if (!getGoogleApiKey()) {
      return buildFallbackAnswer(question, retrievedChunks);
    }

    try {
      return await fetchGeminiChatCompletion(question, retrievedChunks);
    } catch (error) {
      // The fallback keeps the app usable for learners even when the external API fails.
      return buildFallbackAnswer(
        question,
        retrievedChunks,
        error?.message || "Gemini API unavailable",
      );
    }
  });
}
