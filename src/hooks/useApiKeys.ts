"use client";

import { useState, useEffect, useCallback } from "react";
import { ApiKey, ApiKeyFormData } from "@/types/api-key";
import {
  fetchApiKeys as fetchApiKeysService,
  createApiKey as createApiKeyService,
  updateApiKey as updateApiKeyService,
  deleteApiKey as deleteApiKeyService,
  generateApiKey as generateApiKeyService,
} from "@/services/api-keys";

interface UseApiKeysOptions {
  showNotifications?: boolean;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function useApiKeys(options: UseApiKeysOptions = {}) {
  const { showNotifications = false, onSuccess, onError } = options;
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApiKeys = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchApiKeysService();
      setApiKeys(data);
    } catch (err: any) {
      console.error("Error fetching API keys:", err);
      
      let errorMessage = err.message || "Failed to fetch API keys";
      
      if (err.message?.includes("fetch failed") || err.message?.includes("ENOTFOUND") || err.message?.includes("DNS")) {
        errorMessage = "Cannot connect to Supabase. Please check:\n" +
          "1. Your Supabase project URL is correct in .env.local\n" +
          "2. Your network connection\n" +
          "3. The Supabase project exists and is active\n\n" +
          "See SUPABASE_SETUP.md for configuration instructions.";
      }
      
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  const createApiKey = useCallback(async (formData: ApiKeyFormData) => {
    try {
      setError(null);
      const newKey = await createApiKeyService(formData);
      setApiKeys((prev) => [newKey, ...prev]);
      const successMsg = `API key "${formData.name}" created successfully`;
      if (onSuccess) onSuccess(successMsg);
      return newKey;
    } catch (err: any) {
      console.error("Error creating API key:", err);
      const errorMsg = err.message || "Failed to create API key";
      setError(errorMsg);
      if (onError) onError(errorMsg);
      throw err;
    }
  }, [onSuccess, onError]);

  const updateApiKey = useCallback(async (id: string, formData: ApiKeyFormData, existingKey?: string) => {
    try {
      setError(null);
      const updatedKey = await updateApiKeyService(id, formData, existingKey);
      setApiKeys((prev) => prev.map((key) => (key.id === id ? updatedKey : key)));
      const successMsg = `API key "${formData.name}" updated successfully`;
      if (onSuccess) onSuccess(successMsg);
      return updatedKey;
    } catch (err: any) {
      console.error("Error updating API key:", err);
      const errorMsg = err.message || "Failed to update API key";
      setError(errorMsg);
      if (onError) onError(errorMsg);
      throw err;
    }
  }, [onSuccess, onError]);

  const deleteApiKey = useCallback(async (id: string, name?: string) => {
    try {
      setError(null);
      await deleteApiKeyService(id);
      setApiKeys((prev) => prev.filter((key) => key.id !== id));
      const successMsg = name ? `API key "${name}" deleted successfully` : "API key deleted successfully";
      if (onSuccess) onSuccess(successMsg);
    } catch (err: any) {
      console.error("Error deleting API key:", err);
      const errorMsg = err.message || "Failed to delete API key";
      setError(errorMsg);
      if (onError) onError(errorMsg);
      throw err;
    }
  }, [onSuccess, onError]);

  return {
    apiKeys,
    loading,
    error,
    fetchApiKeys,
    createApiKey,
    updateApiKey,
    deleteApiKey,
    generateApiKey: generateApiKeyService,
  };
}

