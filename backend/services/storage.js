const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "../data/documents.json");
const FOLDERS_FILE = path.join(__dirname, "../data/folders.json");

// Ensure data directory exists
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize empty documents file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// Initialize empty folders file if it doesn't exist
if (!fs.existsSync(FOLDERS_FILE)) {
  fs.writeFileSync(FOLDERS_FILE, JSON.stringify([], null, 2));
}

/**
 * Ensure the data file exists
 */
function ensureDataFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
}

/**
 * Ensure the folders file exists
 */
function ensureFoldersFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(FOLDERS_FILE)) {
    fs.writeFileSync(FOLDERS_FILE, JSON.stringify([], null, 2));
  }
}

/**
 * Get all documents
 */
function getAllDocuments() {
  ensureDataFile();
  const data = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(data);
}

/**
 * Get a single document by ID
 */
function getDocumentById(id) {
  const documents = getAllDocuments();
  return documents.find((doc) => doc.id === id);
}

/**
 * Save a new document
 */
function saveDocument(document) {
  const documents = getAllDocuments();
  documents.push(document);
  fs.writeFileSync(DATA_FILE, JSON.stringify(documents, null, 2));
  return document;
}

/**
 * Update a document
 */
function updateDocument(id, updates) {
  const documents = getAllDocuments();
  const index = documents.findIndex((doc) => doc.id === id);
  if (index === -1) return null;

  documents[index] = { ...documents[index], ...updates };
  fs.writeFileSync(DATA_FILE, JSON.stringify(documents, null, 2));
  return documents[index];
}

/**
 * Delete a document
 */
function deleteDocument(id) {
  const documents = getAllDocuments();
  const filtered = documents.filter((doc) => doc.id !== id);
  fs.writeFileSync(DATA_FILE, JSON.stringify(filtered, null, 2));
  return filtered.length < documents.length;
}

// ==================== FOLDER FUNCTIONS ====================

/**
 * Get all folders
 */
function getAllFolders() {
  ensureFoldersFile();
  const data = fs.readFileSync(FOLDERS_FILE, "utf-8");
  return JSON.parse(data);
}

/**
 * Get a single folder by ID
 */
function getFolderById(id) {
  const folders = getAllFolders();
  return folders.find((folder) => folder.id === id);
}

/**
 * Save a new folder
 */
function saveFolder(folder) {
  const folders = getAllFolders();
  folders.push(folder);
  fs.writeFileSync(FOLDERS_FILE, JSON.stringify(folders, null, 2));
  return folder;
}

/**
 * Update a folder
 */
function updateFolder(id, updates) {
  const folders = getAllFolders();
  const index = folders.findIndex((folder) => folder.id === id);
  if (index === -1) return null;

  folders[index] = { ...folders[index], ...updates };
  fs.writeFileSync(FOLDERS_FILE, JSON.stringify(folders, null, 2));
  return folders[index];
}

/**
 * Delete a folder
 */
function deleteFolder(id) {
  const folders = getAllFolders();
  const filtered = folders.filter((folder) => folder.id !== id);
  fs.writeFileSync(FOLDERS_FILE, JSON.stringify(filtered, null, 2));
  return filtered.length < folders.length;
}

module.exports = {
  getAllDocuments,
  getDocumentById,
  saveDocument,
  updateDocument,
  deleteDocument,
  getAllFolders,
  getFolderById,
  saveFolder,
  updateFolder,
  deleteFolder,
};
