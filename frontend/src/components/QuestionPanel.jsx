export default function QuestionPanel({ question, onQuestionChange, onAsk, asking, selectedDocumentLabel }) {
  return (
    <section className="surface control-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Ask a question</p>
          <h2>Query the uploaded knowledge</h2>
        </div>
        <p className="panel-copy">
          The backend will embed the question, retrieve similar chunks, and send the context to the LLM.
        </p>
      </div>

      <label className="question-box">
        <span>Question</span>
        <textarea
          value={question}
          onChange={(event) => onQuestionChange(event.target.value)}
          placeholder="What does the uploaded document say about the timeline?"
          rows={5}
        />
      </label>

      <div className="button-row button-row--spread">
        <p className="helper-text">
          {selectedDocumentLabel ? `Current document: ${selectedDocumentLabel}` : 'No specific document selected; the app can search all processed chunks.'}
        </p>
        <button className="primary-button" type="button" onClick={onAsk} disabled={asking || !question.trim()}>
          {asking ? 'Thinking...' : 'Ask question'}
        </button>
      </div>
    </section>
  );
}
