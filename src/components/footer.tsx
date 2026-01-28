'use client'

import Link from 'next/link'
import { Github } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border bg-background/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Github className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Dattus</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              The ultimate GitHub repository analyzer for open source maintainers.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#features" className="hover:text-yellow-600 dark:hover:text-yellow-500 transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-yellow-600 dark:hover:text-yellow-500 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-yellow-600 dark:hover:text-yellow-500 transition-colors">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-yellow-600 dark:hover:text-yellow-500 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-yellow-600 dark:hover:text-yellow-500 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-yellow-600 dark:hover:text-yellow-500 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-yellow-600 dark:hover:text-yellow-500 transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-yellow-600 dark:hover:text-yellow-500 transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-yellow-600 dark:hover:text-yellow-500 transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            © 2024 Dattus. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-muted-foreground hover:text-yellow-600 dark:hover:text-yellow-500 transition-colors">
              <Github className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-yellow-600 dark:hover:text-yellow-500 transition-colors">
              Twitter
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-yellow-600 dark:hover:text-yellow-500 transition-colors">
              LinkedIn
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
