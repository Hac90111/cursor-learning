'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for individual developers',
    price: 'Free',
    period: 'forever',
    cta: 'Get Started',
    features: [
      'Limited to 200 requests',
      'Star tracking',
      'Latest 5 pull requests',
      'Community access',
    ],
  },
  {
    name: 'Pro',
    description: 'For teams and active maintainers',
    price: '$29',
    period: '/month',
    cta: 'Start Free Trial',
    featured: true,
    comingSoon: true,
    features: [
      'Unlimited repository analysis',
      'AI-powered summaries',
      'Advanced star analytics',
      'All pull request insights',
      'Version tracking',
      'Cool facts & achievements',
      'Real-time notifications',
      'Custom integrations',
    ],
  },
  {
    name: 'Enterprise',
    description: 'For large organizations',
    price: 'Custom',
    period: 'pricing',
    cta: 'Contact Sales',
    comingSoon: true,
    features: [
      'Everything in Pro',
      'Dedicated account manager',
      'API access',
      'SSO & SAML',
      'Custom dashboards',
      'Advanced analytics',
      'SLA guarantee',
      'Phone support',
    ],
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-balance">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto text-balance px-2">
            Choose the perfect plan for your needs. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative bg-background border-border transition-all duration-300 ${
                plan.comingSoon 
                  ? 'opacity-75 border-gray-300 dark:border-gray-700' 
                  : plan.featured 
                    ? 'lg:scale-105 lg:shadow-xl border-yellow-400/50 dark:border-yellow-600/50 hover:border-yellow-500 dark:hover:border-yellow-500' 
                    : 'hover:border-yellow-200 dark:hover:border-yellow-800'
              }`}
            >
              {plan.featured && !plan.comingSoon && (
                <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 px-3 sm:px-4 py-1 rounded-full text-xs font-semibold text-black shadow-lg whitespace-nowrap">
                  Most Popular
                </div>
              )}
              {plan.comingSoon && (
                <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 bg-gray-500 dark:bg-gray-600 px-3 sm:px-4 py-1 rounded-full text-xs font-semibold text-white shadow-lg whitespace-nowrap">
                  Coming Soon
                </div>
              )}
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl">{plan.name}</CardTitle>
                <CardDescription className="text-sm">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground text-xs sm:text-sm">{plan.period}</span>}
                  </div>
                </div>

                <Button 
                  disabled={plan.comingSoon}
                  className={`w-full min-h-[44px] sm:min-h-[40px] px-4 py-3 sm:py-2 text-sm sm:text-base font-semibold touch-manipulation ${
                    plan.comingSoon
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-60'
                      : plan.featured 
                        ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 text-black shadow-lg hover:shadow-xl border-0' 
                        : ''
                  }`} 
                  variant={plan.comingSoon ? 'outline' : plan.featured ? 'default' : 'outline'}
                >
                  {plan.comingSoon ? 'Coming Soon' : plan.cta}
                </Button>

                <div className="space-y-2.5 sm:space-y-3 pt-4 border-t border-border">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-2 sm:gap-3">
                      <Check className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 ${
                        plan.featured 
                          ? 'text-yellow-600 dark:text-yellow-500' 
                          : 'text-accent'
                      }`} />
                      <span className="text-xs sm:text-sm leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 sm:mt-12 text-center px-2">
          <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4">
            All plans include 30-day free trial. No credit card required.
          </p>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Need custom pricing?{' '}
            <button className="text-yellow-600 dark:text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-400 hover:underline font-medium transition-colors touch-manipulation min-h-[44px] inline-flex items-center">Contact our sales team</button>
          </p>
        </div>
      </div>
    </section>
  )
}
