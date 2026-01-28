'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, GitBranch, Star, Zap } from 'lucide-react'

export function Features() {
  const features = [
    {
      icon: BarChart3,
      title: 'Repository Insights',
      description: 'Get comprehensive analytics and metrics for any GitHub repository at a glance.',
    },
    {
      icon: Star,
      title: 'Star Tracking',
      description: 'Monitor star counts and track growth trends over time for your projects.',
    },
    {
      icon: GitBranch,
      title: 'Pull Request Analysis',
      description: 'View pull request statistics, merge rates, and contributor activity.',
    },
    {
      icon: Zap,
      title: 'Version Updates',
      description: 'Stay informed about the latest releases and version changes automatically.',
    },
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">
            Powerful Features for Developers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Everything you need to understand and analyze GitHub repositories in one place.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card 
                key={index} 
                className="border-border hover:border-yellow-300 dark:hover:border-yellow-700 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-100/50 dark:hover:shadow-yellow-900/20 group"
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400/20 via-yellow-300/20 to-yellow-500/20 dark:from-yellow-900/30 dark:via-yellow-800/30 dark:to-yellow-700/30 flex items-center justify-center mb-4 group-hover:from-yellow-400/30 group-hover:via-yellow-300/30 group-hover:to-yellow-500/30 transition-all duration-300">
                    <Icon className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
                  </div>
                  <CardTitle className="group-hover:text-yellow-600 dark:group-hover:text-yellow-500 transition-colors">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

