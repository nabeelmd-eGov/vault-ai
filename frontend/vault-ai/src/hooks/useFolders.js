import { useState, useEffect, useCallback } from "react";
import { foldersApi } from "../services/fetchDocuments";
import { sortByDate } from "../utils/formatters";

export function useFolders() {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFolders = useCallback(async () => {
    try {
      const flds = await foldersApi.getAll();
      setFolders(sortByDate(flds, "createdAt", true));
      setError(null);
    } catch (err) {
      console.error("Failed to fetch folders:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createFolder = useCallback(async (name, parentId = null) => {
    try {
      const folder = await foldersApi.create(name, parentId);
      await fetchFolders();
      return folder;
    } catch (err) {
      console.error("Failed to create folder:", err);
      throw err;
    }
  }, [fetchFolders]);

  const deleteFolder = useCallback(async (id) => {
    try {
      await foldersApi.delete(id);
      await fetchFolders();
      return true;
    } catch (err) {
      console.error("Failed to delete folder:", err);
      throw err;
    }
  }, [fetchFolders]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  return {
    folders,
    loading,
    error,
    createFolder,
    deleteFolder,
    refetch: fetchFolders
  };
}
