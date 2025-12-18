import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useDocuments } from "../hooks/useDocuments";
import { useFolders } from "../hooks/useFolders";
import { useToast } from "./ToastContext";

const VaultContext = createContext(null);

export function VaultProvider({ children }) {
  const toast = useToast();

  const { documents, loading: docsLoading, error: docsError, uploadDocument, deleteDocument, getDocumentById } = useDocuments();

  const { folders, loading: foldersLoading, error: foldersError, createFolder, deleteFolder } = useFolders();

  const [selectedDocId, setSelectedDocId] = useState(null);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [showFolderSelectDialog, setShowFolderSelectDialog] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const docPollingRef = useRef(null);

  useEffect(() => {
    if (!selectedDocId) {
      setSelectedDoc(null);
      return;
    }

    const fetchSelectedDoc = async () => {
      try {
        const doc = await getDocumentById(selectedDocId);
        setSelectedDoc(doc);
      } catch {
        setSelectedDoc(null);
      }
    };

    fetchSelectedDoc();

    const doc = documents.find((d) => d.id === selectedDocId);
    if (doc?.status === "processing") {
      docPollingRef.current = setInterval(fetchSelectedDoc, 2000);
    }

    return () => {
      if (docPollingRef.current) {
        clearInterval(docPollingRef.current);
        docPollingRef.current = null;
      }
    };
  }, [selectedDocId, documents, getDocumentById]);

  const selectDocument = useCallback((id) => {
    setSelectedDocId(id);
    setSelectedFolderId(null);
  }, []);

  const selectFolder = useCallback((id) => {
    setSelectedFolderId(id);
    setSelectedDocId(null);
    setSelectedDoc(null);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedDocId(null);
    setSelectedFolderId(null);
    setSelectedDoc(null);
  }, []);

  const handleDeleteDocument = useCallback(
    async (id) => {
      if (!window.confirm("Are you sure you want to delete this document?")) return false;

      try {
        await deleteDocument(id);
        if (selectedDocId === id) {
          clearSelection();
        }
        return true;
      } catch {
        return false;
      }
    },
    [deleteDocument, selectedDocId, clearSelection]
  );

  const handleDeleteFolder = useCallback(
    async (id) => {
      if (!window.confirm("Are you sure you want to delete this folder?")) return false;

      try {
        await deleteFolder(id);
        if (selectedFolderId === id) {
          setSelectedFolderId(null);
        }
        toast.success("Folder deleted successfully");
        return true;
      } catch (err) {
        toast.error(err.message || "Failed to delete folder");
        return false;
      }
    },
    [deleteFolder, selectedFolderId, toast]
  );

  const handleCreateFolder = useCallback(
    async (name, parentId) => {
      try {
        await createFolder(name, parentId);
        setShowNewFolderDialog(false);
        toast.success("Folder created successfully");
        return true;
      } catch (err) {
        toast.error(err.message || "Failed to create folder");
        return false;
      }
    },
    [createFolder, toast]
  );

  const initiateUpload = useCallback(
    (files) => {
      if (folders.length === 0) {
        Promise.all(files.map((f) => uploadDocument(f.file, null))).then((results) => {
          if (results.length > 0) {
            selectDocument(results[0].id);
          }
        });
      } else {
        setPendingFiles(files);
        setShowFolderSelectDialog(true);
      }
    },
    [folders, uploadDocument, selectDocument]
  );

  const handleFolderSelectedForUpload = useCallback(
    async (folderId) => {
      const results = [];
      for (const fileItem of pendingFiles) {
        const doc = await uploadDocument(fileItem.file, folderId);
        results.push(doc);
      }
      setPendingFiles([]);
      setShowFolderSelectDialog(false);

      if (results.length > 0) {
        selectDocument(results[0].id);
      }
    },
    [pendingFiles, uploadDocument, selectDocument]
  );

  const cancelUpload = useCallback(() => {
    setPendingFiles([]);
    setShowFolderSelectDialog(false);
  }, []);

  const value = {
    documents,
    folders,
    selectedDoc,
    selectedDocId,
    selectedFolderId,
    loading: docsLoading || foldersLoading,
    error: docsError || foldersError,
    selectDocument,
    selectFolder,
    clearSelection,
    deleteDocument: handleDeleteDocument,
    createFolder: handleCreateFolder,
    deleteFolder: handleDeleteFolder,
    initiateUpload,
    handleFolderSelectedForUpload,
    cancelUpload,
    pendingFiles,
    showNewFolderDialog,
    setShowNewFolderDialog,
    showFolderSelectDialog,
    setShowFolderSelectDialog,
  };

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

export function useVault() {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error("useVault must be used within a VaultProvider");
  }
  return context;
}
