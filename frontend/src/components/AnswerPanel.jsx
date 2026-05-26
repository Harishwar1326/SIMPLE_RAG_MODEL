export default function AnswerPanel({ answer, retrievedChunks, loading }) {
  return (
    <section className="surface answer-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Response</p>
          <h2>Generated answer</h2>
        </div>
        <p className="panel-copy">
          The answer is built from the retrieved context plus the question.
        </p>
      </div>

      <div className="answer-box">
        {loading ? (
          <p>Generating answer...</p>
        ) : answer ? (
          <p>{answer}</p>
        ) : (
          <p>Ask a question to see the generated answer here.</p>
        )}
      </div>

      <div className="retrieved-section">
        <div className="document-list__header">
          <h3>Retrieved chunks</h3>
          <span>{retrievedChunks.length} used for this answer</span>
        </div>

        {retrievedChunks.length === 0 ? (
          <div className="empty-state">
            <p>No chunks yet.</p>
            <span>Process a document and ask a question to populate this section.</span>
          </div>
        ) : (
          <div className="chunk-grid">
            {retrievedChunks.map((chunk) => (
              <article className="chunk-card" key={`${chunk.documentId}-${chunk.chunkIndex}`}>
                <div className="chunk-card__meta">
                  <strong>Chunk {chunk.chunkIndex + 1}</strong>
                  {typeof chunk.score === 'number' ? <span>{chunk.score.toFixed(3)} similarity</span> : null}
                </div>
                <p>{chunk.text}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
