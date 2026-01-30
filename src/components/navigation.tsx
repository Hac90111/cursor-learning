'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Github, LayoutDashboard } from 'lucide-react'
import GoogleLoginButton from './GoogleLoginButton'

export function Navigation() {
  return (
    <nav className="fixed top-0 w-full bg-background/95 border-b border-border backdrop-blur-sm z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16 gap-2">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-shrink hover:opacity-80 transition-opacity cursor-pointer">
            <Github className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent truncate">Dattus</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 flex-shrink-0">
            <Link href="#features" className="text-sm hover:text-yellow-600 dark:hover:text-yellow-500 transition-colors font-medium">
              Features
            </Link>
            <Link href="#pricing" className="text-sm hover:text-yellow-600 dark:hover:text-yellow-500 transition-colors font-medium">
              Pricing
            </Link>
            <Link href="#" className="text-sm hover:text-yellow-600 dark:hover:text-yellow-500 transition-colors font-medium">
              Docs
            </Link>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0 min-w-0">
            <Link href="/dashboard">
              <Button 
                variant="outline" 
                className="flex items-center justify-center bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 text-black font-semibold border-0 shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg px-2 sm:px-4 py-2 min-h-[44px] gap-1 sm:gap-2 touch-manipulation"
              >
                <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                <span className="hidden min-[380px]:inline text-xs sm:text-sm">Dashboard</span>
              </Button>
            </Link>
            <GoogleLoginButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
