'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardAction } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Send, BookOpen, Copy, Check, Loader2 } from 'lucide-react'

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
            Test the GitHub Summarizer API with a live demo. Edit the payload and see the response in real-time.
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
                API Key (Optional - for usage tracking)
              </label>
              <input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key to track usage (optional)"
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

            {/* Response Section */}
            {response && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Response</label>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                      200 OK
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-muted/30 rounded-md border border-border">
                  <pre className="text-sm font-mono overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </div>

                {/* Formatted Response Display */}
                {response.success && response.data && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-yellow-50/50 to-yellow-100/30 dark:from-yellow-900/10 dark:to-yellow-800/10 rounded-lg border border-yellow-200 dark:border-yellow-800 space-y-4">
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Repository</h4>
                      <div className="space-y-1 text-sm">
                        <div><span className="font-medium">Name:</span> {response.data.repository.name}</div>
                        <div><span className="font-medium">Owner:</span> {response.data.repository.owner}</div>
                        <div><span className="font-medium">URL:</span> <a href={response.data.repository.url} target="_blank" rel="noopener noreferrer" className="text-yellow-600 dark:text-yellow-400 hover:underline">{response.data.repository.url}</a></div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Summary</h4>
                      <p className="text-sm text-muted-foreground">{response.data.summary}</p>
                    </div>
                    {response.data.cool_facts && response.data.cool_facts.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-lg mb-2">Cool Facts</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {response.data.cool_facts.map((fact, index) => (
                            <li key={index}>{fact}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

