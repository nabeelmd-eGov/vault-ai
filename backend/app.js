const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// Services
const { processDocument } = require("./services/ai");
const { extractText } = require("./services/textExtractor");
const documentStore = require("./services/storage");

const app = express();
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Allowed file types
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
];

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomhex-originalname
    const uniqueId = crypto.randomBytes(8).toString("hex");
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    cb(null, `${Date.now()}-${uniqueId}-${baseName}${ext}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Allowed types: PDF, DOC, DOCX, TXT, MD`), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter,
});

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "AI Document Vault API" });
});

// Upload single file
app.post("/api/documents/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file provided" });
  }

  // Validate folderId if provided
  const folderId = req.body.folderId || null;
  if (folderId) {
    const folder = documentStore.getFolderById(folderId);
    if (!folder) {
      return res.status(400).json({ error: "Folder not found" });
    }
  }

  const document = {
    id: crypto.randomBytes(16).toString("hex"),
    originalName: req.file.originalname,
    filename: req.file.filename,
    path: req.file.path,
    size: req.file.size,
    mimetype: req.file.mimetype,
    uploadedAt: new Date().toISOString(),
    status: "processing",
    summary: null,
    markdown: null,
    folderId: folderId,
  };

  // Save document immediately (status: processing)
  documentStore.saveDocument(document);
  console.log("File uploaded:", document.originalName);

  // Process with AI in background
  (async () => {
    try {
      // Extract text from document
      const text = await extractText(req.file.path, req.file.mimetype);
      console.log("Text extracted, sending to AI...");

      // Generate summary and markdown
      const aiResult = await processDocument(text, req.file.originalname);
      console.log("AI processing complete");

      // Update document with AI results
      documentStore.updateDocument(document.id, {
        status: "completed",
        summary: aiResult.summary,
        markdown: aiResult.markdown,
        processedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Processing error:", error.message);
      documentStore.updateDocument(document.id, {
        status: "failed",
        error: error.message,
      });
    }
  })();

  res.status(201).json({
    message: "File uploaded successfully. Processing in background.",
    document: document,
  });
});

// Get all documents
app.get("/api/documents", (req, res) => {
  const documents = documentStore.getAllDocuments();
  res.json(documents);
});

// Get single document by ID
app.get("/api/documents/:id", (req, res) => {
  const document = documentStore.getDocumentById(req.params.id);
  if (!document) {
    return res.status(404).json({ error: "Document not found" });
  }
  res.json(document);
});

// Serve document file (for PDF viewing, etc.)
app.get("/api/documents/:id/file", (req, res) => {
  const document = documentStore.getDocumentById(req.params.id);
  if (!document) {
    return res.status(404).json({ error: "Document not found" });
  }

  if (!fs.existsSync(document.path)) {
    return res.status(404).json({ error: "File not found on disk" });
  }

  // Set appropriate headers for inline viewing
  res.setHeader("Content-Type", document.mimetype);
  res.setHeader("Content-Disposition", `inline; filename="${document.originalName}"`);

  // Stream the file
  const fileStream = fs.createReadStream(document.path);
  fileStream.pipe(res);
});

// Delete document
app.delete("/api/documents/:id", (req, res) => {
  const document = documentStore.getDocumentById(req.params.id);
  if (!document) {
    return res.status(404).json({ error: "Document not found" });
  }

  // Delete file from disk
  if (fs.existsSync(document.path)) {
    fs.unlinkSync(document.path);
  }

  // Delete from storage
  documentStore.deleteDocument(req.params.id);
  res.json({ message: "Document deleted" });
});

// ==================== FOLDER ENDPOINTS ====================

// Create a new folder
app.post("/api/folders", (req, res) => {
  const { name, parentId } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Folder name is required" });
  }

  // Validate parent folder exists if specified
  if (parentId) {
    const parentFolder = documentStore.getFolderById(parentId);
    if (!parentFolder) {
      return res.status(400).json({ error: "Parent folder not found" });
    }
  }

  const folder = {
    id: crypto.randomBytes(16).toString("hex"),
    name: name.trim(),
    parentId: parentId || null,
    createdAt: new Date().toISOString(),
  };

  documentStore.saveFolder(folder);
  res.status(201).json(folder);
});

// Get all folders
app.get("/api/folders", (req, res) => {
  const folders = documentStore.getAllFolders();
  res.json(folders);
});

// Get single folder by ID
app.get("/api/folders/:id", (req, res) => {
  const folder = documentStore.getFolderById(req.params.id);
  if (!folder) {
    return res.status(404).json({ error: "Folder not found" });
  }
  res.json(folder);
});

// Update folder
app.patch("/api/folders/:id", (req, res) => {
  const folder = documentStore.getFolderById(req.params.id);
  if (!folder) {
    return res.status(404).json({ error: "Folder not found" });
  }

  const { name, parentId } = req.body;
  const updates = {};

  if (name) {
    updates.name = name.trim();
  }

  if (parentId !== undefined) {
    // Prevent setting self as parent
    if (parentId === req.params.id) {
      return res.status(400).json({ error: "Folder cannot be its own parent" });
    }
    // Validate parent folder exists if specified
    if (parentId) {
      const parentFolder = documentStore.getFolderById(parentId);
      if (!parentFolder) {
        return res.status(400).json({ error: "Parent folder not found" });
      }
    }
    updates.parentId = parentId;
  }

  const updatedFolder = documentStore.updateFolder(req.params.id, updates);
  res.json(updatedFolder);
});

// Delete folder
app.delete("/api/folders/:id", (req, res) => {
  const folder = documentStore.getFolderById(req.params.id);
  if (!folder) {
    return res.status(404).json({ error: "Folder not found" });
  }

  // Check if folder has child folders
  const allFolders = documentStore.getAllFolders();
  const hasChildren = allFolders.some((f) => f.parentId === req.params.id);
  if (hasChildren) {
    return res.status(400).json({ error: "Cannot delete folder with subfolders. Delete subfolders first." });
  }

  // Check if folder has documents
  const allDocuments = documentStore.getAllDocuments();
  const hasDocuments = allDocuments.some((d) => d.folderId === req.params.id);
  if (hasDocuments) {
    return res.status(400).json({ error: "Cannot delete folder with documents. Move or delete documents first." });
  }

  documentStore.deleteFolder(req.params.id);
  res.json({ message: "Folder deleted" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File too large. Max size is 10MB" });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

module.exports = app;
