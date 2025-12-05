import { useState, useRef, useEffect } from "react";
import { Icon, Button } from "../components";

export default function NewFolderDialog({ isOpen, onClose, onSubmit, folders, parentFolderId }) {
  const [folderName, setFolderName] = useState("");
  const [selectedParentId, setSelectedParentId] = useState(parentFolderId || "");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setFolderName("");
      setSelectedParentId(parentFolderId || "");
      setError("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, parentFolderId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = folderName.trim();
    if (!trimmedName) {
      setError("Folder name is required");
      return;
    }
    onSubmit(trimmedName, selectedParentId || null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div
        className="dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <div className="dialog-header">
          <h3 id="dialog-title">
            <Icon name="folderPlus" size={20} ariaHidden={true} />
            New Folder
          </h3>
          <Button variant="icon" onClick={onClose} ariaLabel="Close dialog">
            <Icon name="x" size={18} ariaHidden={true} />
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="dialog-body">
            <div className="form-group">
              <label htmlFor="folder-name">Folder Name</label>
              <input
                ref={inputRef}
                id="folder-name"
                type="text"
                value={folderName}
                onChange={(e) => {
                  setFolderName(e.target.value);
                  setError("");
                }}
                placeholder="Enter folder name"
                autoComplete="off"
              />
              {error && <span className="form-error">{error}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="parent-folder">Parent Folder (optional)</label>
              <select
                id="parent-folder"
                value={selectedParentId}
                onChange={(e) => setSelectedParentId(e.target.value)}
              >
                <option value="">Root (No parent)</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="dialog-footer">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              <Icon name="folderPlus" size={16} ariaHidden={true} />
              Create Folder
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
