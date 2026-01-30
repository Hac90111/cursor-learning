import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, checkRateLimit } from '@/lib/rate-limit';
import { summarizeReadme, type ReadmeSummary } from './chain';
import { fetchRepositoryMetadata, fetchReadmeFromGithubUrl } from './github-utils';


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

// POST /api/github-summerizer - GitHub summarizer endpoint (protected, requires API key)
export async function POST(request: NextRequest) {
  try {
    // Extract API key from header (required)
    const apiKey = extractApiKeyFromHeader(request);
    
    // Require API key - reject if not provided
    if (!apiKey || !apiKey.trim()) {
      return NextResponse.json(
        { 
          error: 'API key is required. Please provide it in the Authorization header as "Bearer <key>" or directly as the API key.',
          code: 'API_KEY_REQUIRED'
        },
        { status: 401 }
      );
    }
    
    // Step 1: Validate API key
    const validationResult = await validateApiKey(apiKey);
    
    // Reject if API key is invalid
    if (!validationResult.valid) {
      return NextResponse.json(
        { 
          error: validationResult.error || 'API key validation failed',
          code: 'INVALID_API_KEY'
        },
        { status: 401 }
      );
    }

    // Step 2: Check rate limit (required since API key is mandatory)
    if (!validationResult.apiKeyId) {
      return NextResponse.json(
        { 
          error: 'API key validation failed - no API key ID found',
          code: 'INVALID_API_KEY'
        },
        { status: 401 }
      );
    }

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
    const owner = match ? match[1] : undefined;

    // Fetch README content and repository metadata in parallel for better performance
    const [readmeContent, repositoryMetadata] = await Promise.all([
      fetchReadmeFromGithubUrl(githubUrl),
      owner && repoName 
        ? fetchRepositoryMetadata(owner, repoName)
        : Promise.resolve({ stars: null, latestVersion: null, websiteUrl: null, license: null }),
    ]);
    
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
          owner: owner,
          stars: repositoryMetadata.stars,
          latestVersion: repositoryMetadata.latestVersion,
          websiteUrl: repositoryMetadata.websiteUrl,
          license: repositoryMetadata.license,
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

// GET /api/github-summerizer - GitHub summarizer endpoint (protected, requires API key)
export async function GET(request: NextRequest) {
  try {
    // Extract API key from header (required)
    const apiKey = extractApiKeyFromHeader(request);
    
    // Require API key - reject if not provided
    if (!apiKey || !apiKey.trim()) {
      return NextResponse.json(
        { 
          error: 'API key is required. Please provide it in the Authorization header as "Bearer <key>" or directly as the API key.',
          code: 'API_KEY_REQUIRED'
        },
        { status: 401 }
      );
    }
    
    // Step 1: Validate API key
    const validationResult = await validateApiKey(apiKey);
    
    // Reject if API key is invalid
    if (!validationResult.valid) {
      return NextResponse.json(
        { 
          error: validationResult.error || 'API key validation failed',
          code: 'INVALID_API_KEY'
        },
        { status: 401 }
      );
    }

    // Step 2: Check rate limit (required since API key is mandatory)
    if (!validationResult.apiKeyId) {
      return NextResponse.json(
        { 
          error: 'API key validation failed - no API key ID found',
          code: 'INVALID_API_KEY'
        },
        { status: 401 }
      );
    }

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
    const owner = match ? match[1] : undefined;

    // Fetch README content and repository metadata in parallel for better performance
    const [readmeContent, repositoryMetadata] = await Promise.all([
      fetchReadmeFromGithubUrl(githubUrl),
      owner && repoName 
        ? fetchRepositoryMetadata(owner, repoName)
        : Promise.resolve({ stars: null, latestVersion: null, websiteUrl: null, license: null }),
    ]);
    
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
          owner: owner,
          stars: repositoryMetadata.stars,
          latestVersion: repositoryMetadata.latestVersion,
          websiteUrl: repositoryMetadata.websiteUrl,
          license: repositoryMetadata.license,
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

