export interface ApiKey {
  id: string;
  name: string;
  type: string;
  usage: number;
  key: string;
  created_at: string;
  monthly_limit?: number;
  limit_monthly_usage?: boolean;
  enable_pii?: boolean;
}

export interface ApiKeyFormData {
  name: string;
  key: string;
  keyType: "dev" | "prod";
  limitMonthlyUsage: boolean;
  monthlyLimit: number;
  enablePII: boolean;
}

export const defaultFormData: ApiKeyFormData = {
  name: "",
  key: "",
  keyType: "dev",
  limitMonthlyUsage: false,
  monthlyLimit: 1000,
  enablePII: false,
};

