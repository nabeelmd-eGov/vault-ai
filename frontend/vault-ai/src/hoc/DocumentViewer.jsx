import { useState, useCallback } from "react";
import Markdown from "react-markdown";
import { Icon, Spinner, Button, Card, CardHeader, CardContent, CardTitle, TabList, Tab, TabPanel } from "../components";
import { formatFileSize } from "../utils/formatters";
import { API_BASE } from "../config";

const getFileUrl = (docId) => `${API_BASE}/documents/${docId}/file`;
const isPdf = (mimetype) => mimetype === "application/pdf";
const isText = (mimetype) => ["text/plain", "text/markdown"].includes(mimetype);

function EmptyState() {
  return (
    <div className="viewer-empty" role="region" aria-label="Document viewer">
      <Icon name="fileText" size={48} ariaHidden />
      <h3>No document selected</h3>
      <p>Select a document from the sidebar or upload a new one</p>
    </div>
  );
}

function LoadingState({ documentName }) {
  return (
    <div className="viewer-loading" role="status" aria-live="polite">
      <Spinner size={48} label={`Processing ${documentName}`} />
      <h3>Processing document...</h3>
      <p>AI is analyzing "{documentName}"</p>
    </div>
  );
}

function ErrorState({ error }) {
  return (
    <div className="viewer-error" role="alert" aria-live="assertive">
      <Icon name="alertCircle" size={48} ariaLabel="Error" />
      <h3>Processing failed</h3>
      <p>{error || "An error occurred while processing the document"}</p>
    </div>
  );
}

function SummaryTab({ document, onCopy, copied }) {
  return (
    <div className="summary-view">
      <Card className="summary-card">
        <CardHeader>
          <CardTitle>AI Summary</CardTitle>
          <Button
            variant="icon"
            onClick={() => onCopy(document.summary)}
            ariaLabel={copied ? "Copied to clipboard" : "Copy summary to clipboard"}
          >
            <Icon name={copied ? "check" : "copy"} size={16} ariaHidden />
          </Button>
        </CardHeader>
        <CardContent>
          <p className="summary-text">{document.summary}</p>
        </CardContent>
      </Card>

      <Card className="meta-card">
        <CardHeader>
          <CardTitle>Document Info</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="meta-grid">
            <MetaItem label="File name" value={document.originalName} />
            <MetaItem label="Size" value={formatFileSize(document.size)} />
            <MetaItem label="Type" value={document.mimetype} />
            <MetaItem label="Uploaded" value={new Date(document.uploadedAt).toLocaleString()} />
            {document.processedAt && (
              <MetaItem label="Processed" value={new Date(document.processedAt).toLocaleString()} />
            )}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

function MetaItem({ label, value }) {
  return (
    <div className="meta-item">
      <dt className="meta-label">{label}</dt>
      <dd className="meta-value">{value}</dd>
    </div>
  );
}

function MarkdownTab({ document, onCopy, copied }) {
  return (
    <div className="markdown-view">
      <div className="markdown-header">
        <span id="markdown-heading">Formatted Content</span>
        <Button
          variant="icon"
          onClick={() => onCopy(document.markdown)}
          ariaLabel={copied ? "Copied to clipboard" : "Copy markdown to clipboard"}
        >
          <Icon name={copied ? "check" : "copy"} size={16} ariaHidden />
        </Button>
      </div>
      <article className="markdown-content" aria-labelledby="markdown-heading">
        <Markdown>{document.markdown}</Markdown>
      </article>
    </div>
  );
}

function OriginalTab({ document }) {
  const fileUrl = getFileUrl(document.id);

  return (
    <div className="original-view">
      <div className="original-header">
        <span id="original-heading">Original Document</span>
        <a
          href={fileUrl}
          download={document.originalName}
          className="download-btn"
          aria-label={`Download ${document.originalName}`}
        >
          <Icon name="download" size={16} ariaHidden />
          Download
        </a>
      </div>
      <div className="original-content">
        {isPdf(document.mimetype) ? (
          <iframe
            src={fileUrl}
            title={`PDF viewer for ${document.originalName}`}
            className="pdf-viewer"
          />
        ) : isText(document.mimetype) ? (
          <iframe
            src={fileUrl}
            title={`Text viewer for ${document.originalName}`}
            className="text-viewer"
          />
        ) : (
          <UnsupportedPreview document={document} fileUrl={fileUrl} />
        )}
      </div>
    </div>
  );
}

function UnsupportedPreview({ document, fileUrl }) {
  return (
    <div className="unsupported-preview">
      <Icon name="file" size={48} ariaHidden />
      <h3>Preview not available</h3>
      <p>This file type ({document.mimetype}) cannot be previewed in the browser.</p>
      <a href={fileUrl} download={document.originalName} className="download-link">
        <Icon name="download" size={18} ariaHidden />
        Download to view
      </a>
    </div>
  );
}

export default function DocumentViewer({ document }) {
  const [activeTab, setActiveTab] = useState("summary");
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async (text) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  if (!document) return <EmptyState />;
  if (document.status === "processing") return <LoadingState documentName={document.originalName} />;
  if (document.status === "failed") return <ErrorState error={document.error} />;

  return (
    <div className="document-viewer" role="region" aria-label={`Viewing document: ${document.originalName}`}>
      <div className="viewer-header">
        <div className="doc-title">
          <Icon name="fileText" size={24} ariaHidden />
          <h2>{document.originalName}</h2>
        </div>
        <TabList>
          <Tab
            active={activeTab === "summary"}
            onClick={() => setActiveTab("summary")}
            id="tab-summary"
            panelId="panel-summary"
          >
            Summary
          </Tab>
          <Tab
            active={activeTab === "markdown"}
            onClick={() => setActiveTab("markdown")}
            id="tab-markdown"
            panelId="panel-markdown"
          >
            Markdown
          </Tab>
          <Tab
            active={activeTab === "original"}
            onClick={() => setActiveTab("original")}
            id="tab-original"
            panelId="panel-original"
          >
            Original
          </Tab>
        </TabList>
      </div>

      <div className="viewer-content">
        <TabPanel active={activeTab === "summary"} id="panel-summary" tabId="tab-summary">
          <SummaryTab document={document} onCopy={copyToClipboard} copied={copied} />
        </TabPanel>

        <TabPanel active={activeTab === "markdown"} id="panel-markdown" tabId="tab-markdown">
          <MarkdownTab document={document} onCopy={copyToClipboard} copied={copied} />
        </TabPanel>

        <TabPanel active={activeTab === "original"} id="panel-original" tabId="tab-original">
          <OriginalTab document={document} />
        </TabPanel>
      </div>
    </div>
  );
}
