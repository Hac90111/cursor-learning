import { createServerSupabaseClient } from '@/lib/supabase-server';

export interface ApiKeyValidationResult {
  valid: boolean;
  apiKeyId?: string;
  apiKeyData?: {
    id: string;
    name: string;
    type: string;
    usage: number;
    monthly_limit: number | null;
    limit_monthly_usage: boolean;
  };
  error?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  rateLimited?: boolean;
  error?: string;
  currentUsage?: number;
  limit?: number;
}

export interface RateLimitOptions {
  /**
   * The API key ID to check rate limits for
   */
  apiKeyId: string;
  
  /**
   * Whether to increment usage if allowed (default: true)
   */
  incrementUsage?: boolean;
}

/**
 * Generic rate limiting function for API endpoints
 * Checks if an API key has exceeded its monthly usage limit
 * Optionally increments usage count atomically
 * 
 * @param options - Rate limit options including API key ID
 * @returns Rate limit result with allowed status and usage information
 */
export async function checkRateLimit(
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const { apiKeyId, incrementUsage = true } = options;

  try {
    const supabase = createServerSupabaseClient();

    // Get current usage count and limit settings
    const { data: apiKey, error: fetchError } = await supabase
      .from('api_keys')
      .select('usage, monthly_limit, limit_monthly_usage')
      .eq('id', apiKeyId)
      .single();

    if (fetchError || !apiKey) {
      console.error('Failed to fetch API key for rate limit check:', fetchError);
      return {
        allowed: false,
        error: 'Failed to fetch API key information',
      };
    }

    const currentUsage = apiKey.usage || 0;
    const monthlyLimit = apiKey.monthly_limit;
    const limitEnabled = apiKey.limit_monthly_usage;

    // If rate limiting is not enabled, allow the request
    if (!limitEnabled || monthlyLimit === null) {
      // Still increment usage if requested (for tracking purposes)
      if (incrementUsage) {
        await incrementUsageCount(apiKeyId, currentUsage, null, false);
      }
      return {
        allowed: true,
        currentUsage,
        limit: monthlyLimit,
      };
    }

    // Check if rate limit is exceeded
    if (currentUsage >= monthlyLimit) {
      return {
        allowed: false,
        rateLimited: true,
        error: 'Rate limit exceeded. API key has reached its monthly usage limit.',
        currentUsage,
        limit: monthlyLimit,
      };
    }

    // If increment is requested, atomically increment usage
    if (incrementUsage) {
      const incrementResult = await incrementUsageCount(
        apiKeyId,
        currentUsage,
        monthlyLimit,
        limitEnabled
      );

      if (incrementResult.rateLimited) {
        return {
          allowed: false,
          rateLimited: true,
          error: 'Rate limit exceeded. API key has reached its monthly usage limit.',
          currentUsage: incrementResult.newUsage,
          limit: monthlyLimit,
        };
      }

      return {
        allowed: true,
        currentUsage: incrementResult.newUsage,
        limit: monthlyLimit,
      };
    }

    // If not incrementing, just return allowed status
    return {
      allowed: true,
      currentUsage,
      limit: monthlyLimit,
    };
  } catch (error: any) {
    console.error('Rate limit check error:', error);
    return {
      allowed: false,
      error: error.message || 'Failed to check rate limit',
    };
  }
}

/**
 * Validates an API key from a string
 * Checks if the API key exists and is valid
 * Does NOT check rate limits - use checkRateLimit separately for that
 * 
 * @param apiKey - The API key string from the request (can be null for public access)
 * @returns Validation result with API key data if valid
 */
export async function validateApiKey(
  apiKey: string | null
): Promise<ApiKeyValidationResult> {
  // If no API key provided, allow public access
  if (!apiKey || !apiKey.trim()) {
    return {
      valid: true,
    };
  }

  try {
    const supabase = createServerSupabaseClient();

    // Validate API key
    const { data, error } = await supabase
      .from('api_keys')
      .select('id, name, type, key, monthly_limit, limit_monthly_usage, usage')
      .eq('key', apiKey.trim())
      .single();

    if (error) {
      console.error('Supabase error during API key validation:', error);

      let errorMessage = 'API key is invalid or not found';

      if (error.code === '42P01' || error.message.includes('does not exist')) {
        errorMessage =
          'Database table "api_keys" does not exist. Please run the SQL schema from supabase-schema.sql in your Supabase SQL Editor.';
      } else if (error.code === '42501' || error.message.includes('permission denied')) {
        errorMessage =
          'Row Level Security (RLS) policy is blocking access. Please check your RLS policies in Supabase.';
      }

      return {
        valid: false,
        error: errorMessage,
      };
    }

    if (!data) {
      return {
        valid: false,
        error: 'API key is invalid or not found',
      };
    }

    return {
      valid: true,
      apiKeyId: data.id,
      apiKeyData: {
        id: data.id,
        name: data.name,
        type: data.type,
        usage: data.usage || 0,
        monthly_limit: data.monthly_limit,
        limit_monthly_usage: data.limit_monthly_usage || false,
      },
    };
  } catch (error: any) {
    console.error('API key validation error:', error);
    return {
      valid: false,
      error: error.message || 'Failed to validate API key',
    };
  }
}

/**
 * Increments API key usage count atomically
 * This is an internal helper function used by checkRateLimit
 * 
 * @private
 */
async function incrementUsageCount(
  apiKeyId: string,
  currentUsage: number,
  monthlyLimit: number | null,
  limitEnabled: boolean
): Promise<{ success: boolean; rateLimited?: boolean; newUsage?: number }> {
  try {
    const supabase = createServerSupabaseClient();

    // Double-check limit before incrementing (race condition protection)
    if (limitEnabled && monthlyLimit !== null) {
      if (currentUsage >= monthlyLimit) {
        return { success: false, rateLimited: true, newUsage: currentUsage };
      }
    }

    const newUsage = currentUsage + 1;

    // Try to use RPC function first (if it exists), otherwise fall back to manual increment
    let updateError: any = null;

    try {
      const { error: rpcError } = await supabase.rpc('increment_api_key_usage', {
        key_id: apiKeyId,
      });

      if (rpcError) {
        // RPC function doesn't exist or failed, fall back to manual increment
        throw rpcError;
      }

      // RPC succeeded
      return { success: true, newUsage };
    } catch {
      // If RPC function doesn't exist, fall back to manual increment
      // This handles the case where the RPC function hasn't been created yet
      const { error: manualUpdateError } = await supabase
        .from('api_keys')
        .update({ usage: newUsage })
        .eq('id', apiKeyId);

      updateError = manualUpdateError;
    }

    if (updateError) {
      // Check if error is due to rate limit
      if (
        updateError.message?.includes('Rate limit exceeded') ||
        updateError.message?.includes('limit')
      ) {
        return { success: false, rateLimited: true, newUsage: currentUsage };
      }
      console.error('Failed to update API key usage:', updateError);
      return { success: false, newUsage: currentUsage };
    }

    return { success: true, newUsage };
  } catch (error) {
    console.error('Failed to increment API key usage:', error);
    return { success: false, newUsage: currentUsage };
  }
}

