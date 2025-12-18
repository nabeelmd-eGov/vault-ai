import { useEffect, useState } from "react";
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
  onClose,
}) {
  const totalItems = documents.length + folders.length;
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState(null);

  const searchItem = (params) => {
    // const filtereDoc = documents?.filter((i) => i?.originalName?.includes(params));
    // console.log(filtereDoc, "documents", documents, folders);
    setQuery(params);
  };

  useEffect(() => {
    if (query) {
      const filtereDoc = documents?.filter((i) => i?.originalName?.includes(query));
      setResults(filtereDoc);
    }
  }, [query]);
  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? "open" : ""}`} onClick={onClose} aria-hidden="true" />
      <aside className={`sidebar ${isOpen ? "open" : ""}`} role="complementary" aria-label="Document list">
        <div className="sidebar-header">
          <h2 id="sidebar-heading">Vault</h2>
          <span className="doc-count" aria-label={`${totalItems} items`}>
            {totalItems}
          </span>
        </div>

        <div className="sidebar-actions">
          <Button variant="primary" className="upload-new-btn" onClick={onUploadClick} ariaLabel="Upload new document">
            <Icon name="upload" size={16} ariaHidden={true} />
            Upload New
          </Button>
          <Button variant="secondary" className="new-folder-btn" onClick={onNewFolderClick} ariaLabel="Create new folder">
            <Icon name="folderPlus" size={16} ariaHidden={true} />
            New Folder
          </Button>
        </div>
        <input onChange={(e) => searchItem(e.target.value)} title="Search" />
        <nav className="doc-list" aria-labelledby="sidebar-heading">
          <FolderTree
            folders={folders}
            documents={query ? results : documents}
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
