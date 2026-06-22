import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { GradientButton } from '@/components/ui/GradientButton'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { PricingTable } from '@/components/pricing/PricingTable'
import { Check, X } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pricing India — JobAgent247',
  description: 'Simple INR pricing for India. Free plan available. Pro from ₹500/mo, Career Accelerator from ₹1,000/mo. Cancel anytime.',
}

const comparisonRows = [
  'Resume upload & parsing',
  'Basic resume feedback',
  'Job description analysis',
  'Unlimited job match scoring',
  'Tailored cover letters',
  'Recruiter outreach messages',
  'Interview question generation',
  'STAR framework answers',
  'Application tracker',
  'Follow-up reminders',
  'LinkedIn profile optimisation',
  'Multiple resume versions',
  'Mock interview workflows',
  'Weekly job-search plan',
  'Priority AI processing',
  'Exportable PDF/DOCX',
]

const planSupport: Record<string, boolean[]> = {
  Free: [true, true, true, false, false, false, false, false, true, false, false, false, false, false, false, false],
  Pro: [true, true, true, true, true, true, true, true, true, true, true, false, false, false, false, false],
  'Career Accelerator': [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
}

const plans = [
  {
    key: 'free' as const,
    name: 'Free',
    priceMonth: '₹0',
    priceYear: '₹0',
    yearlyEqMonth: '₹0',
    desc: 'For exploring and building your first profile',
    features: ['1 resume upload', 'Basic resume feedback', '3 job description analyses', 'Basic job tracker', 'Limited AI generations (5/day)'],
    notIncluded: ['Unlimited resume improvements', 'Cover letters', 'Interview prep', 'LinkedIn optimisation'],
    cta: 'Start free',
  },
  {
    key: 'pro' as const,
    name: 'Pro',
    priceMonth: '₹500',
    priceYear: '₹4,800',
    yearlyEqMonth: '₹400',
    desc: 'For active job seekers who want better applications',
    features: ['Unlimited resume improvements', 'Unlimited job match analysis', 'Tailored cover letters', 'Recruiter messages', 'Interview prep', 'Application tracker', 'LinkedIn optimisation', 'Follow-up suggestions'],
    notIncluded: ['Multiple resume versions', 'Mock interview workflows', 'Weekly job-search plan'],
    cta: 'Get Pro',
    highlight: true,
    badge: 'Best value',
  },
  {
    key: 'accelerator' as const,
    name: 'Career Accelerator',
    priceMonth: '₹1,000',
    priceYear: '₹9,600',
    yearlyEqMonth: '₹800',
    desc: 'For serious job seekers and career switchers',
    features: ['Everything in Pro', 'Advanced role strategy', 'Multiple resume versions', 'Mock interview workflows', 'Weekly job-search plan', 'Priority AI processing', 'Exportable documents'],
    notIncluded: [],
    cta: 'Accelerate my search',
  },
]

export default function IndiaPricingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <SectionHeader
          badge="Pricing — India"
          heading="Simple, transparent pricing"
          subheading="Start free. Upgrade when you're ready to accelerate your job search."
          centered
        />
        <div className="mt-16">
          <PricingTable plans={plans} locale="in" />
        </div>
        <p className="text-center text-xs mt-10" style={{ color: '#475569' }}>
          Prices in INR (Indian Rupee). Includes GST where applicable. Cancel anytime.
        </p>

        {/* Full comparison table */}
        <div className="mt-20">
          <SectionHeader badge="Compare" heading="Full feature comparison" centered />
          <div className="glass-card overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th className="text-left py-4 px-6 text-sm font-semibold w-1/2" style={{ color: '#64748B' }}>Feature</th>
                  {plans.map((plan) => (
                    <th key={plan.name} className="py-4 px-4 text-center text-sm font-semibold"
                      style={plan.highlight ? { color: '#8B5CF6' } : { color: '#64748B' }}>
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={row} style={{ borderBottom: i < comparisonRows.length - 1 ? '1px solid rgba(255,255,255,0.05)' : undefined }}>
                    <td className="py-3 px-6 text-sm text-white">{row}</td>
                    {plans.map((plan) => (
                      <td key={plan.name} className="py-3 px-4 text-center">
                        {planSupport[plan.name][i]
                          ? <Check className="w-4 h-4 mx-auto" style={{ color: plan.highlight ? '#22C55E' : '#64748B' }} />
                          : <X className="w-4 h-4 mx-auto" style={{ color: '#3F4A5A' }} />}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-sm mb-6" style={{ color: '#64748B' }}>No credit card required to start · Cancel anytime · Stripe-secured checkout</p>
          <GradientButton href="/in/signup" size="lg">Start free today</GradientButton>
        </div>
      </div>
    </div>
  )
}
