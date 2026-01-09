import { createClient } from '@supabase/supabase-js';

/**
 * Creates a custom fetch function that handles network errors better
 * and provides helpful error messages for DNS/connectivity issues
 */
function createCustomFetch() {
  return async (url: string | Request | URL, options?: RequestInit) => {
    try {
      // Use native fetch
      const response = await fetch(url, options);
      return response;
    } catch (error: any) {
      // Enhance error messages for DNS/network issues
      if (error.code === 'ENOTFOUND' || error.message?.includes('ENOTFOUND')) {
        const urlStr = typeof url === 'string' ? url : url.toString();
        const hostname = new URL(urlStr).hostname;
        throw new Error(
          `DNS resolution failed for ${hostname}. This usually means:\n` +
          `1. Corporate firewall/proxy is blocking the connection\n` +
          `2. Network connectivity issues\n` +
          `3. DNS server cannot resolve the domain\n\n` +
          `Please check:\n` +
          `- Your network connection\n` +
          `- Corporate proxy settings (may need to configure HTTP_PROXY/HTTPS_PROXY)\n` +
          `- Firewall rules allowing access to Supabase\n` +
          `- Try accessing ${hostname} in a browser to verify connectivity\n\n` +
          `Original error: ${error.message}`
        );
      }
      throw error;
    }
  };
}

/**
 * Creates a Supabase client for server-side use (API routes)
 * This function creates a new client instance each time it's called
 * to ensure environment variables are properly loaded
 * 
 * Note: SSL certificate issues in corporate environments are handled via
 * NODE_TLS_REJECT_UNAUTHORIZED=0 in the dev script (development only)
 */
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env.local file.'
    );
  }

  if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
    throw new Error(
      `Invalid Supabase URL format. Expected URL starting with http:// or https://, got: ${supabaseUrl}`
    );
  }

  // Create client with custom fetch for better error handling
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: createCustomFetch(),
    },
  });
}

