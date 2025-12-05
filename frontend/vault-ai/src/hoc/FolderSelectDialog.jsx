import { useState } from "react";
import { Icon, Button } from "../components";

function FolderOption({ folder, folders, selectedId, onSelect, level = 0 }) {
  const childFolders = folders.filter((f) => f.parentId === folder.id);

  return (
    <>
      <li
        className={`folder-option ${selectedId === folder.id ? "selected" : ""}`}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
        onClick={() => onSelect(folder.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(folder.id);
          }
        }}
        role="option"
        aria-selected={selectedId === folder.id}
        tabIndex={0}
      >
        <Icon name="folder" size={18} className="folder-icon" ariaHidden={true} />
        <span>{folder.name}</span>
      </li>
      {childFolders.map((child) => (
        <FolderOption
          key={child.id}
          folder={child}
          folders={folders}
          selectedId={selectedId}
          onSelect={onSelect}
          level={level + 1}
        />
      ))}
    </>
  );
}

export default function FolderSelectDialog({ isOpen, onClose, onSubmit, folders, files }) {
  const [selectedFolderId, setSelectedFolderId] = useState(null);

  const rootFolders = folders.filter((f) => !f.parentId);

  const handleSubmit = () => {
    onSubmit(selectedFolderId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div
        className="dialog folder-select-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <div className="dialog-header">
          <h3 id="dialog-title">
            <Icon name="upload" size={20} ariaHidden={true} />
            Select Destination Folder
          </h3>
          <Button variant="icon" onClick={onClose} ariaLabel="Close dialog">
            <Icon name="x" size={18} ariaHidden={true} />
          </Button>
        </div>

        <div className="dialog-body">
          <p className="upload-files-info">
            Uploading {files.length} file{files.length > 1 ? "s" : ""}:
            <span className="file-names">
              {files.map((f) => f.file.name).join(", ")}
            </span>
          </p>

          <div className="folder-list-container">
            <p className="folder-list-label">Choose a folder:</p>
            <ul className="folder-list" role="listbox" aria-label="Select folder">
              <li
                className={`folder-option root-option ${selectedFolderId === null ? "selected" : ""}`}
                onClick={() => setSelectedFolderId(null)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedFolderId(null);
                  }
                }}
                role="option"
                aria-selected={selectedFolderId === null}
                tabIndex={0}
              >
                <Icon name="folder" size={18} className="folder-icon" ariaHidden={true} />
                <span>Root (No folder)</span>
              </li>
              {rootFolders.map((folder) => (
                <FolderOption
                  key={folder.id}
                  folder={folder}
                  folders={folders}
                  selectedId={selectedFolderId}
                  onSelect={setSelectedFolderId}
                />
              ))}
            </ul>
          </div>
        </div>

        <div className="dialog-footer">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            <Icon name="upload" size={16} ariaHidden={true} />
            Upload Here
          </Button>
        </div>
      </div>
    </div>
  );
}
