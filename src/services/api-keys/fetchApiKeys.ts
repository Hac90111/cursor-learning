import { ApiKey } from "@/types/api-key";

interface FetchApiKeysResponse {
  data: ApiKey[];
  error?: string;
}

/**
 * Fetches all API keys from the server
 * @returns Promise resolving to an array of API keys
 * @throws Error if the fetch fails
 */
export async function fetchApiKeys(): Promise<ApiKey[]> {
  const response = await fetch("/api/keys");

  if (!response.ok) {
    let errorMessage = `Failed to fetch API keys (${response.status})`;
    try {
      const result: FetchApiKeysResponse = await response.json();
      errorMessage = result.error || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  const result: FetchApiKeysResponse = await response.json();
  return result.data || [];
}

