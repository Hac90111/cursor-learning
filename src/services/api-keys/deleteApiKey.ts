interface DeleteApiKeyResponse {
  error?: string;
  message?: string;
}

/**
 * Deletes an API key
 * @param id - The ID of the API key to delete
 * @returns Promise that resolves when the deletion is successful
 * @throws Error if the deletion fails
 */
export async function deleteApiKey(id: string): Promise<void> {
  const response = await fetch(`/api/keys/${id}`, {
    method: "DELETE",
  });

  const result: DeleteApiKeyResponse = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to delete API key");
  }
}

