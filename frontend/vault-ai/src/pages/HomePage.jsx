import { useVault } from "../context/VaultContext";
import { Sidebar, UploadZone, DocumentViewer, NewFolderDialog, FolderSelectDialog } from "../components";

export default function HomePage({ isSidebarOpen, onCloseSidebar }) {
  const {
    documents,
    folders,
    selectedDoc,
    selectedDocId,
    selectedFolderId,
    loading,
    selectDocument,
    selectFolder,
    deleteDocument,
    deleteFolder,
    createFolder,
    initiateUpload,
    handleFolderSelectedForUpload,
    cancelUpload,
    pendingFiles,
    showNewFolderDialog,
    setShowNewFolderDialog,
    showFolderSelectDialog,
    clearSelection
  } = useVault();

  const handleSelectDocument = (id) => {
    selectDocument(id);
    onCloseSidebar();
  };

  const handleSelectFolder = (id) => {
    selectFolder(id);
    onCloseSidebar();
  };

  const handleUploadClick = () => {
    clearSelection();
    onCloseSidebar();
  };

  const hasContent = documents.length > 0 || folders.length > 0;

  return (
    <div className="app-body">
      <Sidebar
        documents={documents}
        folders={folders}
        selectedId={selectedDocId}
        selectedFolderId={selectedFolderId}
        onSelectDocument={handleSelectDocument}
        onSelectFolder={handleSelectFolder}
        onDeleteDocument={deleteDocument}
        onDeleteFolder={deleteFolder}
        onUploadClick={handleUploadClick}
        onNewFolderClick={() => setShowNewFolderDialog(true)}
        isOpen={isSidebarOpen}
        onClose={onCloseSidebar}
      />

      <main className="main-content" id="main-content" role="main" aria-label="Document content area">
        {selectedDoc ? (
          <DocumentViewer document={selectedDoc} />
        ) : (
          <div className="upload-section">
            <UploadZone onUpload={initiateUpload} />
            {!loading && hasContent && !selectedDocId && (
              <p className="select-hint" role="status">
                Select a document from the sidebar to view details
              </p>
            )}
          </div>
        )}
      </main>

      <NewFolderDialog
        isOpen={showNewFolderDialog}
        onClose={() => setShowNewFolderDialog(false)}
        onSubmit={createFolder}
        folders={folders}
        parentFolderId={selectedFolderId}
      />

      <FolderSelectDialog
        isOpen={showFolderSelectDialog}
        onClose={cancelUpload}
        onSubmit={handleFolderSelectedForUpload}
        folders={folders}
        files={pendingFiles}
      />
    </div>
  );
}
