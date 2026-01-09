/**
 * Generates a random API key with a prefix based on the key type
 * @param keyType - The type of API key ("dev" or "prod")
 * @returns A generated API key string
 */
export function generateApiKey(keyType: "dev" | "prod"): string {
  const prefix = keyType === "dev" ? "himan-dev" : "dattus-prod";
  return `${prefix}-${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
}

