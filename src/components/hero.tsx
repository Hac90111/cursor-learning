'use client'

import { Button } from '@/components/ui/button'
import { Github, Sparkles, TrendingUp } from 'lucide-react'

export function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-yellow-200/30 dark:bg-yellow-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-0 w-72 h-72 bg-yellow-100/20 dark:bg-yellow-800/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-yellow-300/10 via-yellow-200/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-100 via-yellow-50 to-yellow-100 border border-yellow-200/50 mb-6 shadow-sm">
          <Sparkles className="w-4 h-4 text-yellow-600" />
          <span className="text-sm font-medium text-yellow-700">Powered by advanced analytics</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 whitespace-nowrap leading-normal bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent py-1">
          Unlock Github Insights with Dattus
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground mb-10 text-balance max-w-2xl mx-auto">
          Get AI-powered insights on any GitHub repository. Analyze summaries, stars, pull requests, version history, and
          cool facts in seconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16 px-2">
          <Button 
            size="lg" 
            className="w-full sm:w-auto min-h-[44px] px-6 py-3 sm:py-2.5 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 text-black font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border-0 touch-manipulation text-base sm:text-lg"
          >
            Get Started Free
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="w-full sm:w-auto min-h-[44px] px-6 py-3 sm:py-2.5 border-2 border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 backdrop-blur-sm font-medium touch-manipulation text-base sm:text-lg"
          >
            View Demo
          </Button>
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 text-center px-2">
          <div>
            <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-1 sm:mb-2">10K+</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Repositories Analyzed</p>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-1 sm:mb-2">500+</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Active Users</p>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-1 sm:mb-2">99.9%</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Uptime</p>
          </div>
        </div>
      </div>
    </section>
  )
}
