// const { GoogleGenerativeAI } = require("@google/generative-ai");

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const OPENROUTER_API_KEY = process.env.OPEN_ROUTER_API_KEY;
/**
 * Generate summary and markdown from document text
 * @param {string} text - The extracted text content
 * @param {string} filename - Original filename for context
 * @returns {Promise<{summary: string, markdown: string}>}
 */
async function processDocument(text, filename) {
  const prompt = `You are a document processing assistant. Analyze the following document and provide:

1. **Summary**: A concise 2-3 sentence summary of the document's main points.
2. **Markdown**: A clean, well-structured markdown version of the document content. Preserve the key information but improve formatting with proper headings, lists, and structure.

Document filename: ${filename}

Document content:
---
${text}
---

Respond in this exact JSON format (no markdown code blocks, just raw JSON):
{
  "summary": "Your summary here",
  "markdown": "Your markdown content here"
}`;

  try {
    const result = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await result.json();
    const response = data.choices?.[0]?.message?.content || "";

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || "Summary not available",
        markdown: parsed.markdown || text,
      };
    }

    // Fallback if JSON parsing fails
    return {
      summary: "Summary generation failed",
      markdown: text,
    };
  } catch (error) {
    console.error("AI processing error:", error.message);
    throw new Error(`AI processing failed: ${error.message}`);
  }
}

module.exports = { processDocument };
