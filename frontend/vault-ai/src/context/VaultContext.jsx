import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useDocuments } from "../hooks/useDocuments";
import { useFolders } from "../hooks/useFolders";

const VaultContext = createContext(null);

export function VaultProvider({ children }) {
  const {
    documents,
    loading: docsLoading,
    error: docsError,
    uploadDocument,
    deleteDocument,
    getDocumentById
  } = useDocuments();

  const {
    folders,
    loading: foldersLoading,
    error: foldersError,
    createFolder,
    deleteFolder
  } = useFolders();

  // Selection state
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Dialog state
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [showFolderSelectDialog, setShowFolderSelectDialog] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);

  // Polling ref for selected document
  const docPollingRef = useRef(null);

  // Fetch selected document details
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

    // Poll if document is processing
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

  // Selection handlers
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

  // Document operations
  const handleDeleteDocument = useCallback(async (id) => {
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
  }, [deleteDocument, selectedDocId, clearSelection]);

  // Folder operations
  const handleDeleteFolder = useCallback(async (id) => {
    if (!window.confirm("Are you sure you want to delete this folder?")) return false;

    try {
      await deleteFolder(id);
      if (selectedFolderId === id) {
        setSelectedFolderId(null);
      }
      return true;
    } catch (err) {
      alert(err.message || "Failed to delete folder");
      return false;
    }
  }, [deleteFolder, selectedFolderId]);

  const handleCreateFolder = useCallback(async (name, parentId) => {
    try {
      await createFolder(name, parentId);
      setShowNewFolderDialog(false);
      return true;
    } catch (err) {
      alert(err.message || "Failed to create folder");
      return false;
    }
  }, [createFolder]);

  // Upload flow
  const initiateUpload = useCallback((files) => {
    if (folders.length === 0) {
      // No folders, upload directly to root
      Promise.all(files.map((f) => uploadDocument(f.file, null)))
        .then((results) => {
          if (results.length > 0) {
            selectDocument(results[0].id);
          }
        });
    } else {
      setPendingFiles(files);
      setShowFolderSelectDialog(true);
    }
  }, [folders, uploadDocument, selectDocument]);

  const handleFolderSelectedForUpload = useCallback(async (folderId) => {
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
  }, [pendingFiles, uploadDocument, selectDocument]);

  const cancelUpload = useCallback(() => {
    setPendingFiles([]);
    setShowFolderSelectDialog(false);
  }, []);

  const value = {
    // Data
    documents,
    folders,
    selectedDoc,
    selectedDocId,
    selectedFolderId,

    // Loading/Error states
    loading: docsLoading || foldersLoading,
    error: docsError || foldersError,

    // Selection
    selectDocument,
    selectFolder,
    clearSelection,

    // Document operations
    deleteDocument: handleDeleteDocument,

    // Folder operations
    createFolder: handleCreateFolder,
    deleteFolder: handleDeleteFolder,

    // Upload flow
    initiateUpload,
    handleFolderSelectedForUpload,
    cancelUpload,
    pendingFiles,

    // Dialog state
    showNewFolderDialog,
    setShowNewFolderDialog,
    showFolderSelectDialog
  };

  return (
    <VaultContext.Provider value={value}>
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error("useVault must be used within a VaultProvider");
  }
  return context;
}
