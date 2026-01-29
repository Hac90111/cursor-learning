import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, checkRateLimit } from '@/lib/rate-limit';
import { summarizeReadme, type ReadmeSummary } from './chain';


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

// POST /api/github-summerizer - GitHub summarizer endpoint (public access, optional API key)
export async function POST(request: NextRequest) {
  try {
    // Extract API key from header (optional)
    const apiKey = extractApiKeyFromHeader(request);
    
    // Step 1: Validate API key
    const validationResult = await validateApiKey(apiKey);
    
    // Reject if API key was provided but is invalid
    if (!validationResult.valid) {
      return NextResponse.json(
        { 
          error: validationResult.error || 'API key validation failed',
          code: 'INVALID_API_KEY'
        },
        { status: 401 }
      );
    }

    // Step 2: Check rate limit (only if API key was provided)
    if (validationResult.apiKeyId) {
      const rateLimitResult = await checkRateLimit({
        apiKeyId: validationResult.apiKeyId,
        incrementUsage: true, // Increment usage before processing
      });
      
      // Reject if rate limit exceeded
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { 
            error: rateLimitResult.error || 'Rate limit exceeded',
            code: 'RATE_LIMIT_EXCEEDED',
            currentUsage: rateLimitResult.currentUsage,
            limit: rateLimitResult.limit
          },
          { status: 429 }
        );
      }
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

    // Note: Usage was already incremented before processing the request
    // This ensures accurate usage tracking and rate limit enforcement

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

// GET /api/github-summerizer - GitHub summarizer endpoint (public access, optional API key)
export async function GET(request: NextRequest) {
  try {
    // Extract API key from header (optional)
    const apiKey = extractApiKeyFromHeader(request);
    
    // Step 1: Validate API key
    const validationResult = await validateApiKey(apiKey);
    
    // Reject if API key was provided but is invalid
    if (!validationResult.valid) {
      return NextResponse.json(
        { 
          error: validationResult.error || 'API key validation failed',
          code: 'INVALID_API_KEY'
        },
        { status: 401 }
      );
    }

    // Step 2: Check rate limit (only if API key was provided)
    if (validationResult.apiKeyId) {
      const rateLimitResult = await checkRateLimit({
        apiKeyId: validationResult.apiKeyId,
        incrementUsage: true, // Increment usage before processing
      });
      
      // Reject if rate limit exceeded
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { 
            error: rateLimitResult.error || 'Rate limit exceeded',
            code: 'RATE_LIMIT_EXCEEDED',
            currentUsage: rateLimitResult.currentUsage,
            limit: rateLimitResult.limit
          },
          { status: 429 }
        );
      }
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

    // Note: Usage was already incremented before processing the request
    // This ensures accurate usage tracking and rate limit enforcement

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

