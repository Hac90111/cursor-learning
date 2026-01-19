import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { summarizeReadme, type ReadmeSummary } from './chain';

/**
 * Validates an API key
 * API key must be provided in the Authorization header
 */
async function validateApiKey(
  apiKey: string | null
): Promise<{ valid: boolean; data?: any; error?: string }> {
  try {
    if (!apiKey || !apiKey.trim()) {
      return {
        valid: false,
        error: 'API key is required. Provide it in Authorization header as: Authorization: Bearer <your-api-key>',
      };
    }

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('api_keys')
      .select('id, name, type, key, monthly_limit, limit_monthly_usage, usage')
      .eq('key', apiKey.trim())
      .single();

    if (error) {
      console.error('Supabase error:', error);
      
      // Provide more specific error messages
      let errorMessage = error.message || 'API key is invalid';
      
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        errorMessage = 'Database table "api_keys" does not exist. Please run the SQL schema from supabase-schema.sql in your Supabase SQL Editor.';
      } else if (error.code === '42501' || error.message.includes('permission denied')) {
        errorMessage = 'Row Level Security (RLS) policy is blocking access. Please check your RLS policies in Supabase.';
      }
      
      return {
        valid: false,
        error: errorMessage,
      };
    }

    if (!data) {
      return {
        valid: false,
        error: 'API key is invalid',
      };
    }

    // Check monthly limit if enabled
    if (data.limit_monthly_usage && data.monthly_limit !== null) {
      if (data.usage >= data.monthly_limit) {
        return {
          valid: false,
          error: 'API key has reached its monthly usage limit',
        };
      }
    }

    return {
      valid: true,
      data: {
        id: data.id,
        name: data.name,
        type: data.type,
        usage: data.usage,
        monthly_limit: data.monthly_limit,
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
 * Extracts API key from Authorization header only
 * Supports both "Bearer <key>" and direct key formats
 */
function extractApiKeyFromHeader(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return null;
  }

  // Support "Bearer <key>" format
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  // Also support API key directly in Authorization header without Bearer prefix
  return authHeader.trim();
}

// POST /api/github-summerizer - GitHub summarizer endpoint with API key validation
export async function POST(request: NextRequest) {
  try {
    // Extract and validate API key from header only
    const apiKey = extractApiKeyFromHeader(request);
    const validation = await validateApiKey(apiKey);
    
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'API key validation failed' },
        { status: 401 }
      );
    }

    // Parse request body for actual request data (not API key)
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // Request body might not be JSON or might be empty
      body = {};
    }

    const githubUrl = body.url || body.githubUrl;
    
    if (!githubUrl) {
      return NextResponse.json(
        { error: 'GitHub URL is required. Provide it in the request body as "url" or "githubUrl".' },
        { status: 400 }
      );
    }

    // Validate GitHub URL format
    const urlPattern = /^https:\/\/github\.com\/([^/]+)\/([^/]+)(\/.*)?$/;
    if (!urlPattern.test(githubUrl)) {
      return NextResponse.json(
        { error: 'Invalid GitHub URL format. Expected format: https://github.com/owner/repo' },
        { status: 400 }
      );
    }

    // Extract repo name from URL
    const match = githubUrl.match(urlPattern);
    const repoName = match ? match[2] : undefined;

    // Fetch README content
    const readmeContent = await fetchReadmeFromGithubUrl(githubUrl);
    
    if (!readmeContent) {
      return NextResponse.json(
        { error: 'README.md file not found in the repository or repository does not exist.' },
        { status: 404 }
      );
    }

    // Summarize the README
    let summaryResult: ReadmeSummary;
    try {
      summaryResult = await summarizeReadme(readmeContent, repoName);
    } catch (error: any) {
      console.error('Summarization error:', error);
      return NextResponse.json(
        { error: `Failed to summarize README: ${error.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    // Increment API key usage
    if (validation.data?.id) {
      await incrementApiKeyUsage(validation.data.id);
    }

    return NextResponse.json({
      success: true,
      data: {
        repository: {
          url: githubUrl,
          name: repoName,
          owner: match ? match[1] : undefined,
        },
        readmeLength: readmeContent.length,
        summary: summaryResult.summary,
        cool_facts: summaryResult.cool_facts,
      },
    });
  } catch (error: any) {
    console.error('GitHub summarizer API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process GitHub summarizer request' },
      { status: 500 }
    );
  }
}

// GET /api/github-summerizer - GitHub summarizer endpoint with API key validation
export async function GET(request: NextRequest) {
  try {
    // Extract and validate API key from header only
    const apiKey = extractApiKeyFromHeader(request);
    const validation = await validateApiKey(apiKey);
    
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'API key validation failed' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const githubUrl = searchParams.get('url');
    const repo = searchParams.get('repo');

    if (!githubUrl) {
      return NextResponse.json(
        { error: 'GitHub URL is required. Provide it as a query parameter: ?url=https://github.com/owner/repo' },
        { status: 400 }
      );
    }

    // Validate GitHub URL format
    const urlPattern = /^https:\/\/github\.com\/([^/]+)\/([^/]+)(\/.*)?$/;
    if (!urlPattern.test(githubUrl)) {
      return NextResponse.json(
        { error: 'Invalid GitHub URL format. Expected format: https://github.com/owner/repo' },
        { status: 400 }
      );
    }

    // Extract repo name from URL
    const match = githubUrl.match(urlPattern);
    const repoName = match ? match[2] : (repo || undefined);

    // Fetch README content
    const readmeContent = await fetchReadmeFromGithubUrl(githubUrl);
    
    if (!readmeContent) {
      return NextResponse.json(
        { error: 'README.md file not found in the repository or repository does not exist.' },
        { status: 404 }
      );
    }

    // Summarize the README
    let summaryResult: ReadmeSummary;
    try {
      summaryResult = await summarizeReadme(readmeContent, repoName);
    } catch (error: any) {
      console.error('Summarization error:', error);
      return NextResponse.json(
        { error: `Failed to summarize README: ${error.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    // Increment API key usage
    if (validation.data?.id) {
      await incrementApiKeyUsage(validation.data.id);
    }

    return NextResponse.json({
      success: true,
      data: {
        repository: {
          url: githubUrl,
          name: repoName,
          owner: match ? match[1] : undefined,
        },
        readmeLength: readmeContent.length,
        summary: summaryResult.summary,
        cool_facts: summaryResult.cool_facts,
      },
    });
  } catch (error: any) {
    console.error('GitHub summarizer API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process GitHub summarizer request' },
      { status: 500 }
    );
  }
}

/**
 * Increments API key usage count in the database
 */
async function incrementApiKeyUsage(apiKeyId: string): Promise<void> {
  try {
    const supabase = createServerSupabaseClient();
    
    // Get current usage count
    const { data: currentKey, error: fetchError } = await supabase
      .from('api_keys')
      .select('usage')
      .eq('id', apiKeyId)
      .single();
    
    if (fetchError || !currentKey) {
      console.error('Failed to fetch current API key usage:', fetchError);
      return;
    }
    
    // Increment usage count
    const { error: updateError } = await supabase
      .from('api_keys')
      .update({ usage: (currentKey.usage || 0) + 1 })
      .eq('id', apiKeyId);
    
    if (updateError) {
      console.error('Failed to update API key usage:', updateError);
    }
  } catch (error) {
    // Log but don't fail the request if usage tracking fails
    console.error('Failed to increment API key usage:', error);
  }
}

/**
 * Fetches the content of a README.md file from a GitHub repository URL
 * @param githubUrl {string} The GitHub repository URL (e.g. https://github.com/user/repo)
 * @returns {Promise<string | null>} The content of the README.md file, or null if not found/error.
 */
async function fetchReadmeFromGithubUrl(githubUrl: string): Promise<string | null> {
  try {
    if (!githubUrl) return null;

    // Parse the GitHub URL to extract user and repo
    const urlPattern = /^https:\/\/github\.com\/([^/]+)\/([^/]+)(\/.*)?$/;
    const match = githubUrl.match(urlPattern);
    if (!match) return null;

    const owner = match[1];
    const repo = match[2];

    // Try default README locations, preferring main branch, then master
    const branches = ['main', 'master'];
    for (const branch of branches) {
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`;
      const res = await fetch(rawUrl);
      if (res.ok) {
        return await res.text();
      }
    }
    
    // If not found, try GitHub API as fallback (case-insensitive filenames, etc.)
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/readme`;
    const apiRes = await fetch(apiUrl, {
      headers: {
        Accept: 'application/vnd.github.v3.raw',
      },
    });
    if (apiRes.ok) {
      return await apiRes.text();
    }


    return null;
  } catch (error) {
    console.error('Failed to fetch README.md from GitHub:', error);
    return null;
  }
}

