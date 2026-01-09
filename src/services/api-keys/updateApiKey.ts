import { ApiKey, ApiKeyFormData } from "@/types/api-key";
import { generateApiKey } from "./generateApiKey";

interface UpdateApiKeyRequest {
  name: string;
  type: string;
  key: string;
  monthly_limit: number | null;
  limit_monthly_usage: boolean;
  enable_pii: boolean;
}

interface UpdateApiKeyResponse {
  data: ApiKey;
  error?: string;
}

/**
 * Updates an existing API key
 * @param id - The ID of the API key to update
 * @param formData - The form data for the API key
 * @param existingKey - The existing API key value (optional)
 * @returns Promise resolving to the updated API key
 * @throws Error if validation fails or the update fails
 */
export async function updateApiKey(
  id: string,
  formData: ApiKeyFormData,
  existingKey?: string
): Promise<ApiKey> {
  if (!formData.name.trim()) {
    throw new Error("Please enter a name for the API key");
  }

  const updateData: UpdateApiKeyRequest = {
    name: formData.name,
    type: formData.keyType === "dev" ? "dev" : "prod",
    key: formData.key || existingKey || generateApiKey(formData.keyType),
    monthly_limit: formData.limitMonthlyUsage ? formData.monthlyLimit : null,
    limit_monthly_usage: formData.limitMonthlyUsage,
    enable_pii: formData.enablePII,
  };

  const response = await fetch(`/api/keys/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateData),
  });

  const result: UpdateApiKeyResponse = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to update API key");
  }

  return result.data;
}

