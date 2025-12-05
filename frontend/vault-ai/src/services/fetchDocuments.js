import { API_BASE } from "../config";

const handleResponse = async (response) => {
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || data.message || `HTTP error ${response.status}`);
  }
  return response.json();
};

export const documentsApi = {
  getAll: () => fetch(`${API_BASE}/documents`).then(handleResponse),

  getById: (id) => fetch(`${API_BASE}/documents/${id}`).then(handleResponse),

  upload: async (file, onProgress, folderId = null) => {
    const formData = new FormData();
    formData.append("file", file);
    if (folderId) {
      formData.append("folderId", folderId);
    }

    // Note: fetch doesn't support upload progress natively
    // For progress, you'd need XMLHttpRequest
    if (onProgress) onProgress(50); // Simulate progress

    const response = await fetch(`${API_BASE}/documents/upload`, {
      method: "POST",
      body: formData,
    });

    if (onProgress) onProgress(100);
    return handleResponse(response);
  },

  delete: (id) =>
    fetch(`${API_BASE}/documents/${id}`, { method: "DELETE" }).then(handleResponse),
};

export const foldersApi = {
  getAll: () => fetch(`${API_BASE}/folders`).then(handleResponse),

  getById: (id) => fetch(`${API_BASE}/folders/${id}`).then(handleResponse),

  create: (name, parentId = null) =>
    fetch(`${API_BASE}/folders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, parentId }),
    }).then(handleResponse),

  update: (id, updates) =>
    fetch(`${API_BASE}/folders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }).then(handleResponse),

  delete: (id) =>
    fetch(`${API_BASE}/folders/${id}`, { method: "DELETE" }).then(handleResponse),
};
