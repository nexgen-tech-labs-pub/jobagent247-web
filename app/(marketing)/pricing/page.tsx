import { Navbar } from '@/components/layout/Navbar'
import { GradientButton } from '@/components/ui/GradientButton'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { PricingTable } from '@/components/pricing/PricingTable'
import { Check, X } from 'lucide-react'

const plans = [
  {
    key: 'free' as const,
    name: 'Free',
    priceMonth: '£0',
    priceYear: '£0',
    yearlyEqMonth: '£0',
    desc: 'For exploring and building your first profile',
    features: ['1 CV upload', 'Basic CV feedback', '3 job description analyses', 'Basic job tracker', 'Limited AI generations (5/day)'],
    notIncluded: ['Unlimited CV improvements', 'Cover letters', 'Interview prep', 'LinkedIn optimisation'],
    cta: 'Start free',
  },
  {
    key: 'pro' as const,
    name: 'Pro',
    priceMonth: '£9.99',
    priceYear: '£95.88',
    yearlyEqMonth: '£7.99',
    desc: 'For active job seekers who want better applications',
    features: ['Unlimited CV improvements', 'Unlimited job match analysis', 'Tailored cover letters', 'Recruiter messages', 'Interview prep', 'Application tracker', 'LinkedIn optimisation', 'Follow-up suggestions'],
    notIncluded: ['Multiple CV versions', 'Mock interview workflows', 'Weekly job-search plan'],
    cta: 'Get Pro',
    highlight: true,
    badge: 'Best value',
  },
  {
    key: 'accelerator' as const,
    name: 'Career Accelerator',
    priceMonth: '£29.99',
    priceYear: '£287.88',
    yearlyEqMonth: '£23.99',
    desc: 'For serious job seekers and career switchers',
    features: ['Everything in Pro', 'Advanced role strategy', 'Multiple CV versions', 'Mock interview workflows', 'Weekly job-search plan', 'Priority AI processing', 'Exportable documents'],
    notIncluded: [],
    cta: 'Accelerate my search',
  },
]

const comparisonRows = [
  'CV upload & parsing',
  'Basic CV feedback',
  'Job description analysis',
  'Unlimited job match scoring',
  'Tailored cover letters',
  'Recruiter outreach messages',
  'Interview question generation',
  'STAR framework answers',
  'Application tracker',
  'Follow-up reminders',
  'LinkedIn profile optimisation',
  'Multiple CV versions',
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

export default function PricingPage() {
  return (
    <main>
      <Navbar />
      <div className="pt-24 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Pricing"
            heading="Choose the plan that fits your job search"
            subheading="Start free. Upgrade when you're ready. Cancel anytime."
            centered
          />

          <div className="mb-20">
            <PricingTable plans={plans} locale="uk" />
          </div>

          {/* Full comparison table */}
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

          <div className="text-center mt-12">
            <p className="text-sm mb-6" style={{ color: '#64748B' }}>No credit card required to start · Cancel anytime · Human review add-on coming soon</p>
            <GradientButton href="/signup" size="lg">Start free today</GradientButton>
          </div>
        </div>
      </div>
    </main>
  )
}
