"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { NotificationProvider, useNotification } from "@/contexts/NotificationContext";
import NotificationContainer from "@/components/Notification";
import { Loader2, FileText, Sparkles } from "lucide-react";

interface ApiResponse {
  success?: boolean;
  data?: {
    repository: {
      url: string;
      name: string;
      owner: string;
      stars: number | null;
      latestVersion: string | null;
      websiteUrl: string | null;
      license: string | null;
    };
    readmeLength: number;
    summary: string;
    cool_facts: string[];
  };
  error?: string;
  code?: string;
}

export default function PlaygroundPage() {
  return (
    <NotificationProvider>
      <SidebarProvider>
        <PlaygroundInner />
      </SidebarProvider>
    </NotificationProvider>
  );
}

function PlaygroundInner() {
  const { success, error: showError } = useNotification();
  const [apiKey, setApiKey] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      showError("Please enter an API key");
      return;
    }

    if (!githubUrl.trim()) {
      showError("Please enter a GitHub URL");
      return;
    }

    // Validate GitHub URL format
    const urlPattern = /^https:\/\/github\.com\/([^/]+)\/([^/]+)(\/.*)?$/;
    if (!urlPattern.test(githubUrl.trim())) {
      showError("Invalid GitHub URL format. Expected format: https://github.com/owner/repo");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setResponse(null);
    
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey.trim()}`,
      };

      const res = await fetch("/api/github-summerizer", {
        method: "POST",
        headers,
        body: JSON.stringify({ url: githubUrl.trim() }),
      });

      const data: ApiResponse = await res.json();

      if (!res.ok) {
        const errorMessage = data.error || `Request failed with status ${res.status}`;
        setError(errorMessage);
        showError(errorMessage);
      } else {
        setResponse(data);
        success("GitHub repository summarized successfully!");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to summarize GitHub repository";
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <NotificationContainer />
      <div className="min-h-screen bg-white flex">
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {/* Top Bar */}
          <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="px-6 lg:px-8 py-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400 mb-1 font-medium">Pages / API Playground</div>
                <h1 className="text-2xl font-semibold text-gray-900">API Playground</h1>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 lg:p-8 max-w-4xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  GitHub Repository Summarizer
                </h2>
                <p className="text-sm text-gray-600">
                  Enter your API key and a GitHub repository URL to get a summary and cool facts about the repository.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="apiKey" className="block text-sm font-medium text-gray-900 mb-2">
                    API Key
                  </label>
                  <input
                    id="apiKey"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm font-mono"
                    disabled={isSubmitting}
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Your API key will be used to authenticate the request.
                  </p>
                </div>

                <div>
                  <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-900 mb-2">
                    GitHub Repository URL
                  </label>
                  <input
                    id="githubUrl"
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/owner/repo"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm"
                    disabled={isSubmitting}
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Enter a valid GitHub repository URL (e.g., https://github.com/owner/repo).
                  </p>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 text-black font-semibold rounded-lg transition-all duration-200 text-sm shadow-lg hover:shadow-xl border-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Summarizing...
                      </>
                    ) : (
                      "Summarize Repository"
                    )}
                  </button>
                </div>
              </form>

              {/* Error Display */}
              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <div className="text-red-600 font-semibold">Error:</div>
                    <div className="text-red-700 text-sm flex-1">{error}</div>
                  </div>
                </div>
              )}

              {/* Results Display */}
              {response && response.data && (
                <div className="mt-8 space-y-6">
                  {/* Repository Info */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Repository Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 font-medium">Owner:</span>
                        <span className="ml-2 text-gray-900">{response.data.repository.owner}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 font-medium">Repository:</span>
                        <span className="ml-2 text-gray-900">{response.data.repository.name}</span>
                      </div>
                      {response.data.repository.stars !== null && (
                        <div>
                          <span className="text-gray-600 font-medium">Stars:</span>
                          <span className="ml-2 text-gray-900">{response.data.repository.stars.toLocaleString()}</span>
                        </div>
                      )}
                      {response.data.repository.license && (
                        <div>
                          <span className="text-gray-600 font-medium">License:</span>
                          <span className="ml-2 text-gray-900">{response.data.repository.license}</span>
                        </div>
                      )}
                      {response.data.repository.latestVersion && (
                        <div>
                          <span className="text-gray-600 font-medium">Latest Version:</span>
                          <span className="ml-2 text-gray-900">{response.data.repository.latestVersion}</span>
                        </div>
                      )}
                      {response.data.repository.websiteUrl && (
                        <div className="md:col-span-2">
                          <span className="text-gray-600 font-medium">Website:</span>
                          <a
                            href={response.data.repository.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-yellow-600 hover:text-yellow-700 underline"
                          >
                            {response.data.repository.websiteUrl}
                          </a>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600 font-medium">README Length:</span>
                        <span className="ml-2 text-gray-900">{response.data.readmeLength.toLocaleString()} characters</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400/20 via-yellow-300/20 to-yellow-500/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-yellow-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Summary</h3>
                    </div>
                    <p className="text-base text-gray-700 leading-relaxed">
                      {response.data.summary}
                    </p>
                  </div>

                  {/* Cool Facts Card */}
                  {response.data.cool_facts && response.data.cool_facts.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400/20 via-yellow-300/20 to-yellow-500/20 flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-yellow-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Cool Facts</h3>
                      </div>
                      <ul className="space-y-3">
                        {response.data.cool_facts.map((fact, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400/30 via-yellow-300/30 to-yellow-500/30 flex items-center justify-center mt-0.5">
                              <span className="text-yellow-600 text-xs font-bold">✓</span>
                            </div>
                            <p className="text-base text-gray-700 leading-relaxed flex-1">
                              {fact}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

