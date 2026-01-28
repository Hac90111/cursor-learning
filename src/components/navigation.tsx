'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Github, LayoutDashboard } from 'lucide-react'
import GoogleLoginButton from './GoogleLoginButton'

export function Navigation() {
  return (
    <nav className="fixed top-0 w-full bg-background/95 border-b border-border backdrop-blur-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Github className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Dattus</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
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
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button 
                variant="outline" 
                className="hidden sm:flex bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 text-black font-semibold border-0 shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg px-4 py-2 gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Button>
            </Link>
            <GoogleLoginButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
