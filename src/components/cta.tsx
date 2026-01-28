'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function CTA() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50 border-t border-border">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-balance">
          Ready to understand your repositories?
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
          Join hundreds of developers and maintainers using Dattus to get insights on their open source projects.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 text-black font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border-0"
          >
            Start Free Trial
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="border-2 border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 backdrop-blur-sm font-medium"
          >
            Schedule Demo
          </Button>
        </div>
      </div>
    </section>
  )
}
