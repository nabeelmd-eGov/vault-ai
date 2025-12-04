import { Icon, Spinner, Button } from "../components";

const StatusIcon = ({ status }) => {
  const statusLabels = {
    processing: "Processing",
    completed: "Completed",
    failed: "Failed"
  };

  switch (status) {
    case "processing":
      return <Spinner className="status-icon" size={14} label="Processing document" />;
    case "completed":
      return <Icon name="checkCircle" className="status-icon success" size={14} ariaLabel={statusLabels.completed} />;
    case "failed":
      return <Icon name="xCircle" className="status-icon error" size={14} ariaLabel={statusLabels.failed} />;
    default:
      return null;
  }
};

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function Sidebar({ documents, selectedId, onSelect, onDelete }) {
  return (
    <aside className="sidebar" role="complementary" aria-label="Document list">
      <div className="sidebar-header">
        <h2 id="sidebar-heading">Documents</h2>
        <span className="doc-count" aria-label={`${documents.length} documents`}>{documents.length}</span>
      </div>

      <div className="sidebar-actions">
        <Button
          variant="primary"
          className="upload-new-btn"
          onClick={() => onSelect(null)}
          ariaLabel="Upload new document">
          <Icon name="upload" size={16} ariaHidden={true} />
          Upload New
        </Button>
      </div>

      <nav className="doc-list" aria-labelledby="sidebar-heading">
        {documents.length === 0 ? (
          <div className="empty-state" role="status">
            <Icon name="fileText" size={32} ariaHidden={true} />
            <p>No documents yet</p>
            <span>Upload files to get started</span>
          </div>
        ) : (
          <ul role="listbox" aria-label="Documents">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className={`doc-item ${selectedId === doc.id ? "selected" : ""}`}
                onClick={() => onSelect(doc.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(doc.id);
                  }
                }}
                role="option"
                aria-selected={selectedId === doc.id}
                tabIndex={0}>
                <div className="doc-icon">
                  <Icon name="fileText" size={20} ariaHidden={true} />
                </div>
                <div className="doc-info">
                  <div className="doc-name" title={doc.originalName}>
                    {doc.originalName}
                  </div>
                  <div className="doc-meta">
                    <span aria-label={`Size: ${formatFileSize(doc.size)}`}>{formatFileSize(doc.size)}</span>
                    <span aria-label={`Uploaded: ${formatDate(doc.uploadedAt)}`}>{formatDate(doc.uploadedAt)}</span>
                  </div>
                </div>
                <div className="doc-actions">
                  <StatusIcon status={doc.status} />
                  <Button
                    variant="icon"
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(doc.id);
                    }}
                    ariaLabel={`Delete ${doc.originalName}`}>
                    <Icon name="trash" size={14} ariaHidden={true} />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </aside>
  );
}
