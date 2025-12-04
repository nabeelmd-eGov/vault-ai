import { useState, useEffect, useCallback } from "react";
import { documentsApi } from "../services/fetchDocuments";
import { Sidebar, UploadZone, DocumentViewer } from "../components";

export default function HomePage() {
  const [documents, setDocuments] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    try {
      const docs = await documentsApi.getAll();
      setDocuments(docs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)));
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    const processingDocs = documents.filter((d) => d.status === "processing");
    if (processingDocs.length === 0) return;

    const interval = setInterval(() => {
      fetchDocuments();
    }, 2000);

    return () => clearInterval(interval);
  }, [documents, fetchDocuments]);

  useEffect(() => {
    if (!selectedId) {
      setSelectedDoc(null);
      return;
    }

    const fetchDoc = async () => {
      try {
        const doc = await documentsApi.getById(selectedId);
        setSelectedDoc(doc);
      } catch (err) {
        console.error("Failed to fetch document:", err);
        setSelectedDoc(null);
      }
    };

    fetchDoc();

    const doc = documents.find((d) => d.id === selectedId);
    if (doc?.status === "processing") {
      const interval = setInterval(fetchDoc, 2000);
      return () => clearInterval(interval);
    }
  }, [selectedId, documents]);

  const handleUpload = async (file, onProgress) => {
    try {
      const result = await documentsApi.upload(file, onProgress);
      await fetchDocuments();
      setSelectedId(result.document.id);
    } catch (err) {
      console.error("Upload failed:", err);
      throw err;
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      await documentsApi.delete(id);
      if (selectedId === id) {
        setSelectedId(null);
      }
      await fetchDocuments();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="app-body">
      <Sidebar
        documents={documents}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onDelete={handleDelete}
      />

      <main className="main-content" id="main-content" role="main" aria-label="Document content area">
        {selectedDoc ? (
          <DocumentViewer document={selectedDoc} />
        ) : (
          <div className="upload-section">
            <UploadZone onUpload={handleUpload} />
            {!loading && documents.length > 0 && !selectedId && (
              <p className="select-hint" role="status">Select a document from the sidebar to view details</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
