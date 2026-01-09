import { ApiKey, ApiKeyFormData } from "@/types/api-key";
import { generateApiKey } from "./generateApiKey";

interface CreateApiKeyRequest {
  name: string;
  type: string;
  key: string;
  monthly_limit: number | null;
  limit_monthly_usage: boolean;
  enable_pii: boolean;
}

interface CreateApiKeyResponse {
  data: ApiKey;
  error?: string;
}

/**
 * Creates a new API key
 * @param formData - The form data for the API key
 * @returns Promise resolving to the created API key
 * @throws Error if validation fails or the creation fails
 */
export async function createApiKey(formData: ApiKeyFormData): Promise<ApiKey> {
  if (!formData.name.trim()) {
    throw new Error("Please enter a name for the API key");
  }

  const keyData: CreateApiKeyRequest = {
    name: formData.name,
    type: formData.keyType === "dev" ? "dev" : "prod",
    key: formData.key || generateApiKey(formData.keyType),
    monthly_limit: formData.limitMonthlyUsage ? formData.monthlyLimit : null,
    limit_monthly_usage: formData.limitMonthlyUsage,
    enable_pii: formData.enablePII,
  };

  const response = await fetch("/api/keys", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(keyData),
  });

  const result: CreateApiKeyResponse = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to create API key");
  }

  return result.data;
}

