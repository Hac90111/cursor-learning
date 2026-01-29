"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { ApiKey, ApiKeyFormData } from "@/types/api-key";

interface UseApiKeysOptions {
  showNotifications?: boolean;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

/**
 * Custom hook for managing API keys using REST endpoints
 * Uses NextAuth session for authentication via cookies
 */
export function useApiKeys(options: UseApiKeysOptions = {}) {
  const { showNotifications = false, onSuccess, onError } = options;
  const { data: session, status } = useSession();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Makes an authenticated fetch request
   * Cookies are automatically included for same-origin requests
   */
  const authenticatedFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      if (status === "loading") {
        throw new Error("Session is loading");
      }

      if (!session) {
        throw new Error("Not authenticated. Please sign in.");
      }

      const response = await fetch(url, {
        ...options,
        credentials: "include", // Include cookies for authentication
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      return response;
    },
    [session, status]
  );

  const fetchApiKeys = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (status === "loading") {
        return;
      }

      if (!session) {
        setError("Not authenticated. Please sign in.");
        setLoading(false);
        return;
      }

      const response = await authenticatedFetch("/api/keys");
      const result = await response.json();
      setApiKeys(result.data || []);
    } catch (err: any) {
      console.error("Error fetching API keys:", err);

      let errorMessage = err.message || "Failed to fetch API keys";

      if (err.message?.includes("fetch failed") || err.message?.includes("ENOTFOUND") || err.message?.includes("DNS")) {
        errorMessage =
          "Cannot connect to Supabase. Please check:\n" +
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
  }, [session, status, authenticatedFetch, onError]);

  useEffect(() => {
    if (status !== "loading") {
      fetchApiKeys();
    }
  }, [fetchApiKeys, status]);

  const createApiKey = useCallback(
    async (formData: ApiKeyFormData) => {
      try {
        setError(null);

        const requestBody = {
          name: formData.name,
          type: formData.keyType,
          key: formData.key || undefined,
          // monthly_limit and limit_monthly_usage are now set from database defaults
          enable_pii: formData.enablePII,
        };

        const response = await authenticatedFetch("/api/keys", {
          method: "POST",
          body: JSON.stringify(requestBody),
        });

        const result = await response.json();
        const newKey = result.data;
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
    },
    [authenticatedFetch, onSuccess, onError]
  );

  const updateApiKey = useCallback(
    async (id: string, formData: ApiKeyFormData, existingKey?: string) => {
      try {
        setError(null);

        const requestBody: any = {
          name: formData.name,
          type: formData.keyType,
          // monthly_limit and limit_monthly_usage are not user-configurable
          enable_pii: formData.enablePII,
        };

        if (formData.key && formData.key !== existingKey) {
          requestBody.key = formData.key;
        }

        const response = await authenticatedFetch(`/api/keys/${id}`, {
          method: "PUT",
          body: JSON.stringify(requestBody),
        });

        const result = await response.json();
        const updatedKey = result.data;
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
    },
    [authenticatedFetch, onSuccess, onError]
  );

  const deleteApiKey = useCallback(
    async (id: string, name?: string) => {
      try {
        setError(null);

        await authenticatedFetch(`/api/keys/${id}`, {
          method: "DELETE",
        });

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
    },
    [authenticatedFetch, onSuccess, onError]
  );

  const generateApiKey = useCallback((type: "dev" | "prod" = "dev"): string => {
    const prefix = type === "prod" ? "dattus-prod" : "himan-dev";
    return `${prefix}-${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  }, []);

  return {
    apiKeys,
    loading,
    error,
    fetchApiKeys,
    createApiKey,
    updateApiKey,
    deleteApiKey,
    generateApiKey,
  };
}
