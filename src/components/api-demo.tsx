'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardAction } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Send, BookOpen, Copy, Check, Loader2, FileText, Sparkles } from 'lucide-react'

const DEFAULT_PAYLOAD = {
  githubUrl: "https://github.com/github/copilot-sdk?utm_source=email-cli-sdk-repo-cta&utm_medium=email&utm_campaign=cli-sdk-jan-2026"
}

const API_ENDPOINT = '/api/github-summerizer'

interface ApiResponse {
  success?: boolean
  data?: {
    repository: {
      url: string
      name: string
      owner: string
    }
    readmeLength: number
    summary: string
    cool_facts: string[]
  }
  error?: string
}

export function ApiDemo() {
  const [payload, setPayload] = useState<string>(JSON.stringify(DEFAULT_PAYLOAD, null, 2))
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [showDocs, setShowDocs] = useState(false)

  const handleSend = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      // Parse and validate JSON payload
      let parsedPayload: { githubUrl?: string }
      try {
        parsedPayload = JSON.parse(payload)
      } catch (e) {
        setError('Invalid JSON format. Please check your payload.')
        setLoading(false)
        return
      }

      if (!parsedPayload.githubUrl) {
        setError('githubUrl is required in the payload.')
        setLoading(false)
        return
      }

      // Prepare headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      // Add API key to headers if provided
      if (apiKey.trim()) {
        headers['Authorization'] = `Bearer ${apiKey.trim()}`
      }

      // Make API call
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers,
        body: JSON.stringify(parsedPayload),
      })

      const data: ApiResponse = await res.json()

      if (!res.ok) {
        setError(data.error || `Request failed with status ${res.status}`)
      } else {
        setResponse(data)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send request')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(payload)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReset = () => {
    setPayload(JSON.stringify(DEFAULT_PAYLOAD, null, 2))
    setResponse(null)
    setError(null)
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">
            Try the API
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Test the GitHub Summarizer API with a live demo. Edit the payload and send requests.
          </p>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">GitHub Summarizer API</CardTitle>
                <CardDescription>
                  POST {API_ENDPOINT}
                </CardDescription>
              </div>
              <CardAction>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDocs(!showDocs)}
                  className="gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  {showDocs ? 'Hide' : 'Show'} Docs
                </Button>
              </CardAction>
            </div>

            {showDocs && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg text-left space-y-3">
                <div>
                  <h4 className="font-semibold mb-2">Endpoint</h4>
                  <code className="text-sm bg-background px-2 py-1 rounded">POST {API_ENDPOINT}</code>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Authentication</h4>
                  <p className="text-sm text-muted-foreground">
                    This endpoint is publicly accessible. API key is optional. If you want to track usage, include your API key in the Authorization header: <code className="bg-background px-1 rounded">Authorization: Bearer YOUR_API_KEY</code>
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Request Body</h4>
                  <pre className="text-xs bg-background p-3 rounded overflow-x-auto">
{`{
  "githubUrl": "https://github.com/owner/repo"
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Response</h4>
                  <p className="text-sm text-muted-foreground">
                    Returns a JSON object with repository information, summary, and cool facts.
                  </p>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {/* API Key Input (Optional) */}
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium mb-2">
                API Key (Required)
              </label>
              <input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This API is publicly accessible. Leave empty to use without authentication, or provide an API key to track your usage.
              </p>
            </div>

            {/* Request Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Request Body (JSON)</label>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyPayload}
                    className="h-7 px-2"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="h-7 px-2 text-xs"
                  >
                    Reset
                  </Button>
                </div>
              </div>
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                className="w-full h-48 px-4 py-3 border border-border rounded-md bg-background text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50 resize-y"
                spellCheck={false}
              />
            </div>

            {/* Send Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSend}
                disabled={loading}
                className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 text-black font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border-0 gap-2"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Request
                  </>
                )}
              </Button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <div className="flex items-start gap-2">
                  <div className="text-red-600 dark:text-red-400 font-semibold">Error:</div>
                  <div className="text-red-700 dark:text-red-300 text-sm flex-1">{error}</div>
                </div>
              </div>
            )}

            {/* Response Display - Modern Design */}
            {response && response.data && (
              <div className="space-y-6">
                {/* Summary Card */}
                <Card className="border-border hover:border-yellow-300 dark:hover:border-yellow-700 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-100/50 dark:hover:shadow-yellow-900/20 group">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400/20 via-yellow-300/20 to-yellow-500/20 dark:from-yellow-900/30 dark:via-yellow-800/30 dark:to-yellow-700/30 flex items-center justify-center group-hover:from-yellow-400/30 group-hover:via-yellow-300/30 group-hover:to-yellow-500/30 transition-all duration-300">
                        <FileText className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
                      </div>
                      <CardTitle className="group-hover:text-yellow-600 dark:group-hover:text-yellow-500 transition-colors">
                        Summary
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-base text-foreground leading-relaxed">
                      {response.data.summary}
                    </p>
                  </CardContent>
                </Card>

                {/* Cool Facts Card */}
                {response.data.cool_facts && response.data.cool_facts.length > 0 && (
                  <Card className="border-border hover:border-yellow-300 dark:hover:border-yellow-700 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-100/50 dark:hover:shadow-yellow-900/20 group">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400/20 via-yellow-300/20 to-yellow-500/20 dark:from-yellow-900/30 dark:via-yellow-800/30 dark:to-yellow-700/30 flex items-center justify-center group-hover:from-yellow-400/30 group-hover:via-yellow-300/30 group-hover:to-yellow-500/30 transition-all duration-300">
                          <Sparkles className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
                        </div>
                        <CardTitle className="group-hover:text-yellow-600 dark:group-hover:text-yellow-500 transition-colors">
                          Cool Facts
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-4">
                        {response.data.cool_facts.map((fact, index) => (
                          <li key={index} className="flex items-start gap-3 group/item">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400/30 via-yellow-300/30 to-yellow-500/30 dark:from-yellow-900/40 dark:via-yellow-800/40 dark:to-yellow-700/40 flex items-center justify-center mt-0.5 group-hover/item:from-yellow-400/50 group-hover/item:via-yellow-300/50 group-hover/item:to-yellow-500/50 transition-all duration-300">
                              <span className="text-yellow-600 dark:text-yellow-500 text-xs font-bold">✓</span>
                            </div>
                            <p className="text-base text-foreground leading-relaxed flex-1">
                              {fact}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

