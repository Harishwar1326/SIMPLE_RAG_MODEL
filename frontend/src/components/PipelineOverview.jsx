const pipelineSteps = [
  {
    title: 'Load Documents',
    description: 'Upload a PDF, TXT, DOC, or DOCX file so the backend can extract text from it.',
    why: 'RAG starts by turning documents into raw text the system can work with.',
  },
  {
    title: 'Clean Text',
    description: 'Normalize whitespace and remove noisy characters before chunking.',
    why: 'Clean text improves chunk quality and retrieval consistency.',
  },
  {
    title: 'Chunk Documents',
    description: 'Split the document into smaller overlapping chunks.',
    why: 'Smaller chunks are easier to embed and retrieve accurately.',
  },
  {
    title: 'Create Embeddings',
    description: 'Convert each chunk into a numeric vector using an embedding model.',
    why: 'Embeddings let us compare chunks and questions by meaning.',
  },
  {
    title: 'Store in Vector DB',
    description: 'Keep the chunk embeddings in an in-memory vector store for similarity search.',
    why: 'The vector store lets the app fetch the most relevant context for a question.',
  },
];

export default function PipelineOverview() {
  return (
    <section className="surface pipeline-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">RAG workflow</p>
          <h2>What happens behind the scenes</h2>
        </div>
        <p className="panel-copy">
          This demo follows a plain Naive RAG pipeline so beginners can see the core loop without extra machinery.
        </p>
      </div>

      <div className="pipeline-grid">
        {pipelineSteps.map((step, index) => (
          <article className="pipeline-card" key={step.title}>
            <div className="pipeline-card__index">0{index + 1}</div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
            <span>{step.why}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
