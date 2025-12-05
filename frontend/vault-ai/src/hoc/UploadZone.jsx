import { useState, useRef } from "react";
import { Icon, Button } from "../components";

export default function UploadZone({ onUpload }) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
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
    // Pass files to parent for folder selection
    onUpload(files);
    setFiles([]);
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
              <Button
                variant="icon"
                className="remove-btn"
                onClick={() => removeFile(index)}
                ariaLabel={`Remove ${item.file.name}`}>
                <Icon name="x" size={14} ariaHidden={true} />
              </Button>
            </div>
          ))}
          <Button
            variant="primary"
            className="upload-btn"
            onClick={uploadFiles}
            ariaLabel={`Upload ${files.length} file${files.length > 1 ? "s" : ""}`}>
            <Icon name="upload" size={16} ariaHidden={true} />
            Upload {files.length} file{files.length > 1 ? "s" : ""}
          </Button>
        </div>
      )}
    </div>
  );
}
