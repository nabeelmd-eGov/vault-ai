import { useState, useEffect, useCallback, useRef } from "react";
import { documentsApi } from "../services/fetchDocuments";
import { sortByDate } from "../utils/formatters";

const POLL_INTERVAL = 2000;

export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pollingRef = useRef(null);

  const fetchDocuments = useCallback(async () => {
    try {
      const docs = await documentsApi.getAll();
      setDocuments(sortByDate(docs, "uploadedAt"));
      setError(null);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadDocument = useCallback(async (file, folderId = null) => {
    try {
      const result = await documentsApi.upload(file, null, folderId);
      await fetchDocuments();
      return result.document;
    } catch (err) {
      console.error("Upload failed:", err);
      throw err;
    }
  }, [fetchDocuments]);

  const deleteDocument = useCallback(async (id) => {
    try {
      await documentsApi.delete(id);
      await fetchDocuments();
      return true;
    } catch (err) {
      console.error("Delete failed:", err);
      throw err;
    }
  }, [fetchDocuments]);

  const getDocumentById = useCallback(async (id) => {
    try {
      return await documentsApi.getById(id);
    } catch (err) {
      console.error("Failed to fetch document:", err);
      throw err;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Poll for processing documents
  useEffect(() => {
    const hasProcessing = documents.some((d) => d.status === "processing");

    if (hasProcessing) {
      pollingRef.current = setInterval(fetchDocuments, POLL_INTERVAL);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [documents, fetchDocuments]);

  return {
    documents,
    loading,
    error,
    uploadDocument,
    deleteDocument,
    getDocumentById,
    refetch: fetchDocuments
  };
}
