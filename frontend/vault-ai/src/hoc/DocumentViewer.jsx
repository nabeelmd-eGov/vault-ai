import { useState } from "react";
import Markdown from "react-markdown";
import { Icon, Spinner, Button, Card, CardHeader, CardContent, CardTitle, TabList, Tab, TabPanel } from "../components";

export default function DocumentViewer({ document }) {
  const [activeTab, setActiveTab] = useState("summary");
  const [copied, setCopied] = useState(false);

  if (!document) {
    return (
      <div className="viewer-empty" role="region" aria-label="Document viewer">
        <Icon name="fileText" size={48} ariaHidden={true} />
        <h3>No document selected</h3>
        <p>Select a document from the sidebar or upload a new one</p>
      </div>
    );
  }

  const copyToClipboard = async (text) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (document.status === "processing") {
    return (
      <div className="viewer-loading" role="status" aria-live="polite" aria-label="Document processing">
        <Spinner size={48} label={`Processing ${document.originalName}`} />
        <h3>Processing document...</h3>
        <p>AI is analyzing "{document.originalName}"</p>
      </div>
    );
  }

  if (document.status === "failed") {
    return (
      <div className="viewer-error" role="alert" aria-live="assertive">
        <Icon name="alertCircle" size={48} ariaLabel="Error" />
        <h3>Processing failed</h3>
        <p>{document.error || "An error occurred while processing the document"}</p>
      </div>
    );
  }

  return (
    <div className="document-viewer" role="region" aria-label={`Viewing document: ${document.originalName}`}>
      <div className="viewer-header">
        <div className="doc-title">
          <Icon name="fileText" size={24} ariaHidden={true} />
          <h2>{document.originalName}</h2>
        </div>
        <TabList>
          <Tab active={activeTab === "summary"} onClick={() => setActiveTab("summary")} id="tab-summary" panelId="panel-summary">
            Summary
          </Tab>
          <Tab active={activeTab === "markdown"} onClick={() => setActiveTab("markdown")} id="tab-markdown" panelId="panel-markdown">
            Markdown
          </Tab>
        </TabList>
      </div>

      <div className="viewer-content">
        <TabPanel active={activeTab === "summary"} id="panel-summary" tabId="tab-summary">
          <div className="summary-view">
            <Card className="summary-card">
              <CardHeader>
                <CardTitle>AI Summary</CardTitle>
                <Button
                  variant="icon"
                  onClick={() => copyToClipboard(document.summary)}
                  ariaLabel={copied ? "Copied to clipboard" : "Copy summary to clipboard"}>
                  <Icon name={copied ? "check" : "copy"} size={16} ariaHidden={true} />
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
                  <div className="meta-item">
                    <dt className="meta-label">File name</dt>
                    <dd className="meta-value">{document.originalName}</dd>
                  </div>
                  <div className="meta-item">
                    <dt className="meta-label">Size</dt>
                    <dd className="meta-value">{(document.size / 1024).toFixed(1)} KB</dd>
                  </div>
                  <div className="meta-item">
                    <dt className="meta-label">Type</dt>
                    <dd className="meta-value">{document.mimetype}</dd>
                  </div>
                  <div className="meta-item">
                    <dt className="meta-label">Uploaded</dt>
                    <dd className="meta-value">{new Date(document.uploadedAt).toLocaleString()}</dd>
                  </div>
                  {document.processedAt && (
                    <div className="meta-item">
                      <dt className="meta-label">Processed</dt>
                      <dd className="meta-value">{new Date(document.processedAt).toLocaleString()}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          </div>
        </TabPanel>

        <TabPanel active={activeTab === "markdown"} id="panel-markdown" tabId="tab-markdown">
          <div className="markdown-view">
            <div className="markdown-header">
              <span id="markdown-heading">Formatted Content</span>
              <Button
                variant="icon"
                onClick={() => copyToClipboard(document.markdown)}
                ariaLabel={copied ? "Copied to clipboard" : "Copy markdown to clipboard"}>
                <Icon name={copied ? "check" : "copy"} size={16} ariaHidden={true} />
              </Button>
            </div>
            <article className="markdown-content" aria-labelledby="markdown-heading">
              <Markdown>{document.markdown}</Markdown>
            </article>
          </div>
        </TabPanel>
      </div>
    </div>
  );
}
