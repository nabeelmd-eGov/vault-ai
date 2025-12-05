export const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  })}`;
};

export const sortByDate = (items, field, ascending = false) => {
  return [...items].sort((a, b) => {
    const dateA = new Date(a[field]);
    const dateB = new Date(b[field]);
    return ascending ? dateA - dateB : dateB - dateA;
  });
};
