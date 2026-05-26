import { useEffect, useMemo, useState } from 'react';

import AnswerPanel from '../components/AnswerPanel.jsx';
import PipelineOverview from '../components/PipelineOverview.jsx';
import QuestionPanel from '../components/QuestionPanel.jsx';
import UploadPanel from '../components/UploadPanel.jsx';
import { api } from '../services/api.js';

const emptyLoadingState = {
  uploading: false,
  processing: false,
  asking: false,
  loadingDocuments: true,
};

export default function HomePage() {
  const [documents, setDocuments] = useState([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [retrievedChunks, setRetrievedChunks] = useState([]);
  const [loading, setLoading] = useState(emptyLoadingState);
  const [notice, setNotice] = useState('');

  const selectedDocument = useMemo(
    () => documents.find((document) => document.documentId === selectedDocumentId) || null,
    [documents, selectedDocumentId],
  );

  async function refreshDocuments(nextSelectedId = null) {
    setLoading((current) => ({ ...current, loadingDocuments: true }));

    try {
      const payload = await api.listDocuments();
      setDocuments(payload.documents || []);

      const firstDocument = payload.documents?.[0] || null;
      if (nextSelectedId) {
        setSelectedDocumentId(nextSelectedId);
      } else if (!selectedDocumentId && firstDocument) {
        setSelectedDocumentId(firstDocument.documentId);
      }
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoading((current) => ({ ...current, loadingDocuments: false }));
    }
  }

  useEffect(() => {
    refreshDocuments();
  }, []);

  async function handleUpload() {
    if (!selectedFile) {
      setNotice('Choose a file before uploading.');
      return;
    }

    setLoading((current) => ({ ...current, uploading: true }));
    setNotice('');

    try {
      const payload = await api.uploadDocument(selectedFile);
      setNotice(payload.message);
      setSelectedFile(null);
      await refreshDocuments(payload.document.documentId);

      // Automatically process the uploaded document so users can ask questions immediately.
      setLoading((current) => ({ ...current, processing: true }));
      const processedPayload = await api.processDocument(payload.document.documentId);
      setNotice(processedPayload.message);
      await refreshDocuments(payload.document.documentId);
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoading((current) => ({ ...current, uploading: false, processing: false }));
    }
  }

  async function ensureProcessedDocument(documentId) {
    const document = documents.find((item) => item.documentId === documentId);

    if (!document) {
      throw new Error('Upload and select a document first.');
    }

    if (document.status === 'processed') {
      return document;
    }

    setLoading((current) => ({ ...current, processing: true }));

    try {
      await api.processDocument(documentId);
      await refreshDocuments(documentId);
      return documents.find((item) => item.documentId === documentId) || document;
    } finally {
      setLoading((current) => ({ ...current, processing: false }));
    }
  }

  async function handleProcess() {
    if (!selectedDocumentId) {
      setNotice('Upload a document first, then select it to process.');
      return;
    }

    setLoading((current) => ({ ...current, processing: true }));
    setNotice('');

    try {
      const payload = await api.processDocument(selectedDocumentId);
      setNotice(payload.message);
      await refreshDocuments(selectedDocumentId);
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoading((current) => ({ ...current, processing: false }));
    }
  }

  async function handleAsk() {
    if (!question.trim()) {
      setNotice('Type a question before asking.');
      return;
    }

    setLoading((current) => ({ ...current, asking: true }));
    setNotice('');

    try {
      await ensureProcessedDocument(selectedDocumentId);

      const payload = await api.askQuestion({
        question,
        documentId: selectedDocumentId || null,
      });

      setAnswer(payload.answer);
      setRetrievedChunks(payload.retrievedChunks || []);
      setNotice('Answer generated from retrieved context.');
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoading((current) => ({ ...current, asking: false }));
    }
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-panel">
          <div className="brand-row">
            <span className="brand-badge">Naive RAG</span>
            <span className="status-pill status-pill--ready">Beginner-friendly architecture</span>
          </div>
          <h1>Learn the complete RAG loop in one small app.</h1>
          <p className="hero-copy">
            Upload a document, process it into chunks and embeddings, then ask questions against the retrieved context.
            The backend is mounted under <strong>/api/backend</strong> so the frontend can call it with relative routes.
          </p>
          <div className="stack-row">
            <span>React</span>
            <span>Express</span>
            <span>In-memory vector store</span>
            <span>OpenAI optional</span>
          </div>
          {notice ? <div className="notice">{notice}</div> : null}
        </div>

        <aside className="hero-panel hero-panel--compact">
          <p className="eyebrow">Current selection</p>
          <h2>{selectedDocument ? selectedDocument.originalName : 'No document selected'}</h2>
          <p className="hero-side-copy">
            {selectedDocument
              ? `${selectedDocument.status} · ${selectedDocument.chunkCount} chunk(s) · ${selectedDocument.textLength} characters`
              : 'Upload a file to start the pipeline.'}
          </p>
          <div className="mini-stats">
            <div>
              <strong>{documents.length}</strong>
              <span>documents</span>
            </div>
            <div>
              <strong>{retrievedChunks.length}</strong>
              <span>retrieved chunks</span>
            </div>
            <div>
              <strong>{loading.loadingDocuments ? '...' : 'Ready'}</strong>
              <span>backend state</span>
            </div>
          </div>
        </aside>
      </section>

      <PipelineOverview />

      <section className="content-grid">
        <UploadPanel
          documents={documents}
          selectedDocumentId={selectedDocumentId}
          selectedFile={selectedFile}
          onFileChange={setSelectedFile}
          onUpload={handleUpload}
          onSelectDocument={setSelectedDocumentId}
          onProcess={handleProcess}
          uploading={loading.uploading}
          processing={loading.processing}
          loadingDocuments={loading.loadingDocuments}
        />

        <div className="stack-column">
          <QuestionPanel
            question={question}
            onQuestionChange={setQuestion}
            onAsk={handleAsk}
            asking={loading.asking}
            selectedDocumentLabel={selectedDocument?.originalName || ''}
          />

          <AnswerPanel
            answer={answer}
            retrievedChunks={retrievedChunks}
            loading={loading.asking}
          />
        </div>
      </section>
    </main>
  );
}
