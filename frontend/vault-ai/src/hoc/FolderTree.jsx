import { useState } from "react";
import { Icon, Button, StatusIcon } from "../components";
import { formatFileSize, formatDate } from "../utils/formatters";
import { useVault } from "../context/VaultContext";

function FolderItem({
  folder,
  documents,
  folders,
  selectedId,
  selectedFolderId,
  onSelectDocument,
  onSelectFolder,
  onDeleteDocument,
  onDeleteFolder,
  // setShowNewFolderDialog,
  level = 0,
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const childFolders = folders.filter((f) => f.parentId === folder.id);
  const childDocuments = documents.filter((d) => d.folderId === folder.id);
  const hasChildren = childFolders.length > 0 || childDocuments.length > 0;

  const handleToggle = (e) => {
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelectFolder(folder.id);
    }
  };

  return (
    <li className="folder-tree-item">
      <div
        className={`folder-row ${selectedFolderId === folder.id ? "selected" : ""}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelectFolder(folder.id)}
        onKeyDown={handleKeyDown}
        role="treeitem"
        aria-expanded={isExpanded}
        tabIndex={0}>
        <Button
          variant="icon"
          className="expand-btn"
          onClick={handleToggle}
          ariaLabel={isExpanded ? "Collapse folder" : "Expand folder"}
          style={{ visibility: hasChildren ? "visible" : "hidden" }}>
          <Icon name={isExpanded ? "chevronDown" : "chevronRight"} size={14} ariaHidden />
        </Button>

        <Icon name={isExpanded ? "folderOpen" : "folder"} size={18} className="folder-icon" ariaHidden />

        <span className="folder-name">{folder.name}</span>

        <Button
          variant="icon"
          className="delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteFolder(folder.id);
          }}
          ariaLabel={`Delete folder ${folder.name}`}>
          <Icon name="trash" size={14} ariaHidden />
        </Button>
      </div>

      {isExpanded && hasChildren && (
        <ul className="folder-children" role="group">
          {childFolders.map((child) => (
            <FolderItem
              key={child.id}
              folder={child}
              documents={documents}
              folders={folders}
              selectedId={selectedId}
              selectedFolderId={selectedFolderId}
              onSelectDocument={onSelectDocument}
              onSelectFolder={onSelectFolder}
              onDeleteDocument={onDeleteDocument}
              onDeleteFolder={onDeleteFolder}
              level={level + 1}
            />
          ))}
          {childDocuments.map((doc) => (
            <DocumentItem
              key={doc.id}
              doc={doc}
              isSelected={selectedId === doc.id}
              onSelect={onSelectDocument}
              onDelete={onDeleteDocument}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function DocumentItem({ doc, isSelected, onSelect, onDelete, level = 0 }) {
  const { setShowFolderSelectDialog } = useVault();
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(doc.id);
    }
  };

  // console.log("showNewFolderDialog", showNewFolderDialog);
  return (
    <li
      className={`doc-item tree-doc-item ${isSelected ? "selected" : ""}`}
      style={{ paddingLeft: `${level * 16 + 32}px` }}
      onClick={() => onSelect(doc.id)}
      onKeyDown={handleKeyDown}
      role="treeitem"
      aria-selected={isSelected}
      tabIndex={0}>
      <div className="doc-icon">
        <Icon name="fileText" size={18} ariaHidden />
      </div>

      <div className="doc-info">
        <div className="doc-name" title={doc.originalName}>
          {doc.originalName}
        </div>
        <div className="doc-meta">
          <span>{formatFileSize(doc.size)}</span>
          <span>{formatDate(doc.uploadedAt)}</span>
        </div>
      </div>

      <div className="doc-actions">
        <StatusIcon status={doc.status} />
        <Button
          variant="icon"
          className="delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            setShowFolderSelectDialog(doc);
            // showFolderSelectDialog,
            // onDelete(doc.id);
          }}
          // ariaLabel={`Delete ${doc.originalName}`}
        >
          Move
        </Button>
        <Button
          variant="icon"
          className="delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(doc.id);
          }}
          ariaLabel={`Delete ${doc.originalName}`}>
          <Icon name="trash" size={14} ariaHidden />
        </Button>
      </div>
    </li>
  );
}

export default function FolderTree({
  folders,
  documents,
  selectedId,
  selectedFolderId,
  onSelectDocument,
  onSelectFolder,
  onDeleteDocument,
  onDeleteFolder,
}) {
  const rootFolders = folders.filter((f) => !f.parentId);
  const rootDocuments = documents.filter((d) => !d.folderId);

  if (folders.length === 0 && documents.length === 0) {
    return (
      <div className="empty-state" role="status">
        <Icon name="folder" size={32} ariaHidden />
        <p>No folders or documents yet</p>
        <span>Create a folder or upload files to get started</span>
      </div>
    );
  }

  return (
    <ul className="folder-tree" role="tree" aria-label="Folder structure">
      {rootFolders.map((folder) => (
        <FolderItem
          key={folder.id}
          folder={folder}
          documents={documents}
          folders={folders}
          selectedId={selectedId}
          selectedFolderId={selectedFolderId}
          onSelectDocument={onSelectDocument}
          onSelectFolder={onSelectFolder}
          onDeleteDocument={onDeleteDocument}
          onDeleteFolder={onDeleteFolder}
        />
      ))}
      {rootDocuments.map((doc) => (
        <DocumentItem key={doc.id} doc={doc} isSelected={selectedId === doc.id} onSelect={onSelectDocument} onDelete={onDeleteDocument} />
      ))}
    </ul>
  );
}
