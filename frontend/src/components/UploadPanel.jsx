export default function UploadPanel({
  documents,
  selectedDocumentId,
  selectedFile,
  onFileChange,
  onUpload,
  onSelectDocument,
  onProcess,
  uploading,
  processing,
  loadingDocuments,
}) {
  return (
    <section className="surface control-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Documents</p>
          <h2>Upload and process source files</h2>
        </div>
        <p className="panel-copy">
          Upload a file, then process it to clean text, chunk it, embed it, and store the vectors.
        </p>
      </div>

      <div className="upload-box">
        <label className="file-picker">
          <span>Choose a document</span>
          <input
            type="file"
            accept=".pdf,.txt,.doc,.docx"
            onChange={(event) => onFileChange(event.target.files?.[0] || null)}
          />
          <strong>{selectedFile ? selectedFile.name : 'No file selected yet'}</strong>
        </label>

        <div className="button-row">
          <button className="primary-button" type="button" onClick={onUpload} disabled={uploading || !selectedFile}>
            {uploading ? 'Uploading...' : 'Upload document'}
          </button>
          <button
            className="secondary-button"
            type="button"
            onClick={onProcess}
            disabled={processing || !selectedDocumentId}
          >
            {processing ? 'Processing...' : 'Process selected doc'}
          </button>
        </div>
      </div>

      <div className="document-list">
        <div className="document-list__header">
          <h3>Uploaded documents</h3>
          <span>{loadingDocuments ? 'Refreshing...' : `${documents.length} item(s)`}</span>
        </div>

        {documents.length === 0 ? (
          <div className="empty-state">
            <p>No documents uploaded yet.</p>
            <span>Start with a PDF, TXT, DOC, or DOCX file.</span>
          </div>
        ) : (
          documents.map((document) => (
            <button
              key={document.documentId}
              type="button"
              className={`document-card ${selectedDocumentId === document.documentId ? 'document-card--active' : ''}`}
              onClick={() => onSelectDocument(document.documentId)}
            >
              <div className="document-card__top">
                <strong>{document.originalName}</strong>
                <span className={`status-pill status-pill--${document.status}`}>{document.status}</span>
              </div>
              <p>{document.textPreview}</p>
              <div className="document-card__meta">
                <span>{document.chunkCount} chunk(s)</span>
                <span>{document.textLength} chars</span>
              </div>
            </button>
          ))
        )}
      </div>
    </section>
  );
}
