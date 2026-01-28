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
      'Analyze up to 10 repositories/month',
      'Basic repository summaries',
      'Star tracking',
      'Latest 5 pull requests',
      'Email support',
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
    features: [
      'Unlimited repository analysis',
      'AI-powered summaries',
      'Advanced star analytics',
      'All pull request insights',
      'Version tracking',
      'Cool facts & achievements',
      'Real-time notifications',
      'Priority email support',
      'Custom integrations',
    ],
  },
  {
    name: 'Enterprise',
    description: 'For large organizations',
    price: 'Custom',
    period: 'pricing',
    cta: 'Contact Sales',
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
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-balance">
            Choose the perfect plan for your needs. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative bg-background border-border transition-all duration-300 ${
                plan.featured ? 'md:scale-105 md:shadow-xl border-yellow-400/50 dark:border-yellow-600/50 hover:border-yellow-500 dark:hover:border-yellow-500' : 'hover:border-yellow-200 dark:hover:border-yellow-800'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 px-4 py-1 rounded-full text-xs font-semibold text-black shadow-lg">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground text-sm">{plan.period}</span>}
                  </div>
                </div>

                <Button 
                  className={`w-full ${
                    plan.featured 
                      ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 text-black font-semibold shadow-lg hover:shadow-xl border-0' 
                      : ''
                  }`} 
                  variant={plan.featured ? 'default' : 'outline'}
                >
                  {plan.cta}
                </Button>

                <div className="space-y-3 pt-4 border-t border-border">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        plan.featured 
                          ? 'text-yellow-600 dark:text-yellow-500' 
                          : 'text-accent'
                      }`} />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground text-sm mb-4">
            All plans include 30-day free trial. No credit card required.
          </p>
          <p className="text-muted-foreground text-sm">
            Need custom pricing?{' '}
            <button className="text-yellow-600 dark:text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-400 hover:underline font-medium transition-colors">Contact our sales team</button>
          </p>
        </div>
      </div>
    </section>
  )
}
