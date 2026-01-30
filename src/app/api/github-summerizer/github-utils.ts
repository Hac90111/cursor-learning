/**
 * Fetches repository metadata (stars, latest version, website URL, and license) from GitHub API
 * All API calls are made in parallel for better performance
 * @param owner {string} The repository owner
 * @param repo {string} The repository name
 * @returns {Promise<{stars: number | null, latestVersion: string | null, websiteUrl: string | null, license: string | null}>} Repository metadata
 */
export async function fetchRepositoryMetadata(owner: string, repo: string): Promise<{stars: number | null, latestVersion: string | null, websiteUrl: string | null, license: string | null}> {
  try {
    // Fetch all data in parallel for better performance
    const repoUrl = `https://api.github.com/repos/${owner}/${repo}`;
    const latestReleaseUrl = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
    const tagsUrl = `https://api.github.com/repos/${owner}/${repo}/tags`;

    const [repoRes, releaseRes, tagsRes] = await Promise.allSettled([
      fetch(repoUrl),
      fetch(latestReleaseUrl),
      fetch(tagsUrl),
    ]);

    // Extract stars, website URL, and license from repository info
    let stars: number | null = null;
    let websiteUrl: string | null = null;
    let license: string | null = null;
    
    if (repoRes.status === 'fulfilled' && repoRes.value.ok) {
      const repoData = await repoRes.value.json();
      stars = repoData.stargazers_count ?? null;
      websiteUrl = repoData.homepage ?? null;
      
      // Extract license - prefer spdx_id (e.g., "MIT"), fallback to name (e.g., "MIT License")
      if (repoData.license) {
        license = repoData.license.spdx_id ?? repoData.license.name ?? null;
      }
    }

    // Extract latest version - prefer release over tags
    let latestVersion: string | null = null;
    
    if (releaseRes.status === 'fulfilled' && releaseRes.value.ok) {
      const releaseData = await releaseRes.value.json();
      latestVersion = releaseData.tag_name ?? null;
    } else if (tagsRes.status === 'fulfilled' && tagsRes.value.ok) {
      // Fallback to tags if no releases found
      const tagsData = await tagsRes.value.json();
      if (Array.isArray(tagsData) && tagsData.length > 0) {
        latestVersion = tagsData[0].name ?? null;
      }
    }

    return { stars, latestVersion, websiteUrl, license };
  } catch (error) {
    console.error('Failed to fetch repository metadata from GitHub:', error);
    return { stars: null, latestVersion: null, websiteUrl: null, license: null };
  }
}

/**
 * Fetches the content of a README.md file from a GitHub repository URL
 * @param githubUrl {string} The GitHub repository URL (e.g. https://github.com/user/repo)
 * @returns {Promise<string | null>} The content of the README.md file, or null if not found/error.
 */
export async function fetchReadmeFromGithubUrl(githubUrl: string): Promise<string | null> {
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

