const API_BASE = "http://localhost:5000/api";

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP error ${response.status}`);
  }
  return response.json();
};

export const documentsApi = {
  getAll: () => fetch(`${API_BASE}/documents`).then(handleResponse),

  getById: (id) => fetch(`${API_BASE}/documents/${id}`).then(handleResponse),

  upload: async (file, onProgress) => {
    const formData = new FormData();
    formData.append("file", file);

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
