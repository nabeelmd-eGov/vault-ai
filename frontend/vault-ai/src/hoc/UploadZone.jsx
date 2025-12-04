import { useState, useRef } from "react";
import { Icon, Spinner, Button } from "../components";

export default function UploadZone({ onUpload }) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles) => {
    const validFiles = newFiles.filter((file) => {
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "text/markdown",
      ];
      return validTypes.includes(file.type) || file.name.endsWith(".md");
    });
    setFiles((prev) => [...prev, ...validFiles.map((f) => ({ file: f, progress: 0 }))]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;
    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      try {
        await onUpload(files[i].file, (progress) => {
          setFiles((prev) => prev.map((f, idx) => (idx === i ? { ...f, progress } : f)));
        });
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }

    setFiles([]);
    setUploading(false);
  };

  return (
    <div className="upload-zone-container" role="region" aria-label="File upload area">
      <div
        className={`upload-zone ${isDragging ? "dragging" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Drop files here or click to browse. Supports PDF, DOC, DOCX, TXT, and MD files">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.md"
          onChange={handleFileSelect}
          style={{ display: "none" }}
          aria-label="File input"
        />
        <Icon name="upload" size={32} className="upload-icon" ariaHidden={true} />
        <p className="upload-text">
          Drag & drop files here, or <span>browse</span>
        </p>
        <p className="upload-hint" id="upload-hint">Supports PDF, DOC, DOCX, TXT, MD</p>
      </div>

      {files.length > 0 && (
        <div className="file-list" role="list" aria-label="Files to upload">
          {files.map((item, index) => (
            <div key={index} className="file-item" role="listitem">
              <Icon name="file" size={16} ariaHidden={true} />
              <span className="file-name">{item.file.name}</span>
              {item.progress > 0 && item.progress < 100 && (
                <div
                  className="progress-bar"
                  role="progressbar"
                  aria-valuenow={item.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Upload progress for ${item.file.name}`}>
                  <div className="progress" style={{ width: `${item.progress}%` }} />
                </div>
              )}
              {!uploading && (
                <Button
                  variant="icon"
                  className="remove-btn"
                  onClick={() => removeFile(index)}
                  ariaLabel={`Remove ${item.file.name}`}>
                  <Icon name="x" size={14} ariaHidden={true} />
                </Button>
              )}
            </div>
          ))}
          <Button
            variant="primary"
            className="upload-btn"
            onClick={uploadFiles}
            disabled={uploading}
            ariaLabel={uploading ? "Uploading files" : `Upload ${files.length} file${files.length > 1 ? "s" : ""}`}>
            {uploading ? (
              <>
                <Spinner size={16} label="Uploading" />
                <span aria-live="polite">Uploading...</span>
              </>
            ) : (
              <>
                <Icon name="upload" size={16} ariaHidden={true} />
                Upload {files.length} file{files.length > 1 ? "s" : ""}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
