const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

/**
 * Extract text content from a file based on its mimetype
 * @param {string} filePath - Path to the file
 * @param {string} mimetype - File MIME type
 * @returns {Promise<string>} - Extracted text content
 */
async function extractText(filePath, mimetype) {
  switch (mimetype) {
    case "application/pdf":
      return extractFromPdf(filePath);

    case "application/msword":
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return extractFromDocx(filePath);

    case "text/plain":
    case "text/markdown":
      return fs.promises.readFile(filePath, "utf-8");

    default:
      throw new Error(`Unsupported file type: ${mimetype}`);
  }
}

async function extractFromPdf(filePath) {
  const dataBuffer = await fs.promises.readFile(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

async function extractFromDocx(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

module.exports = { extractText };
