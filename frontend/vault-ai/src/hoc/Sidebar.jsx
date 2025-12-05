import { Icon, Button, FolderTree } from "../components";

export default function Sidebar({
  documents,
  folders,
  selectedId,
  selectedFolderId,
  onSelectDocument,
  onSelectFolder,
  onDeleteDocument,
  onDeleteFolder,
  onUploadClick,
  onNewFolderClick,
  isOpen,
  onClose
}) {
  const totalItems = documents.length + folders.length;

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`sidebar ${isOpen ? "open" : ""}`} role="complementary" aria-label="Document list">
        <div className="sidebar-header">
          <h2 id="sidebar-heading">Vault</h2>
          <span className="doc-count" aria-label={`${totalItems} items`}>{totalItems}</span>
        </div>

        <div className="sidebar-actions">
          <Button
            variant="primary"
            className="upload-new-btn"
            onClick={onUploadClick}
            ariaLabel="Upload new document"
          >
            <Icon name="upload" size={16} ariaHidden={true} />
            Upload New
          </Button>
          <Button
            variant="secondary"
            className="new-folder-btn"
            onClick={onNewFolderClick}
            ariaLabel="Create new folder"
          >
            <Icon name="folderPlus" size={16} ariaHidden={true} />
            New Folder
          </Button>
        </div>

        <nav className="doc-list" aria-labelledby="sidebar-heading">
          <FolderTree
            folders={folders}
            documents={documents}
            selectedId={selectedId}
            selectedFolderId={selectedFolderId}
            onSelectDocument={onSelectDocument}
            onSelectFolder={onSelectFolder}
            onDeleteDocument={onDeleteDocument}
            onDeleteFolder={onDeleteFolder}
          />
        </nav>
      </aside>
    </>
  );
}
