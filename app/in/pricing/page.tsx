import { Navbar } from '@/components/layout/Navbar'
import { GradientButton } from '@/components/ui/GradientButton'
import { SecondaryButton } from '@/components/ui/SecondaryButton'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Check, X } from 'lucide-react'

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
    name: 'Free',
    price: '₹0',
    period: '/month',
    desc: 'For exploring and building your first profile',
    features: ['1 resume upload', 'Basic resume feedback', '3 job description analyses', 'Basic job tracker', 'Limited AI generations (5/day)'],
    notIncluded: ['Unlimited resume improvements', 'Cover letters', 'Interview prep', 'LinkedIn optimisation'],
    cta: 'Start free',
    ctaHref: '/dashboard',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '₹500',
    period: '/month',
    desc: 'For active job seekers who want better applications',
    features: ['Unlimited resume improvements', 'Unlimited job match analysis', 'Tailored cover letters', 'Recruiter messages', 'Interview prep', 'Application tracker', 'LinkedIn optimisation', 'Follow-up suggestions'],
    notIncluded: ['Multiple resume versions', 'Mock interview workflows', 'Weekly job-search plan'],
    cta: 'Get Pro',
    ctaHref: '/dashboard',
    highlight: true,
    badge: 'Best value',
  },
  {
    name: 'Career Accelerator',
    price: '₹1,000',
    period: '/month',
    desc: 'For serious job seekers and career switchers',
    features: ['Everything in Pro', 'Advanced role strategy', 'Multiple resume versions', 'Mock interview workflows', 'Weekly job-search plan', 'Priority AI processing', 'Exportable documents'],
    notIncluded: [],
    cta: 'Accelerate my search',
    ctaHref: '/dashboard',
    highlight: false,
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
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="rounded-2xl p-8 flex flex-col"
              style={plan.highlight
                ? { background: 'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(6,182,212,0.10))', border: '1px solid rgba(139,92,246,0.45)' }
                : { background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.10)' }}
            >
              {'badge' in plan && plan.badge && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full self-start mb-4"
                  style={{ background: 'rgba(139,92,246,0.2)', color: '#8B5CF6' }}>{plan.badge}</span>
              )}
              <h3 className="font-heading font-bold text-xl text-white mb-1">{plan.name}</h3>
              <p className="text-sm mb-4" style={{ color: '#94A3B8' }}>{plan.desc}</p>
              <div className="mb-6">
                <span className="font-heading font-bold text-4xl text-white">{plan.price}</span>
                <span className="text-sm ml-1" style={{ color: '#64748B' }}>{plan.period}</span>
              </div>
              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm" style={{ color: '#CBD5E1' }}>
                    <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#22C55E' }} /> {f}
                  </li>
                ))}
                {plan.notIncluded.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm" style={{ color: '#475569' }}>
                    <X className="w-4 h-4 shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
              {plan.highlight
                ? <GradientButton href={plan.ctaHref} size="md" className="w-full justify-center">{plan.cta}</GradientButton>
                : <SecondaryButton href={plan.ctaHref} size="md" className="w-full justify-center">{plan.cta}</SecondaryButton>}
            </div>
          ))}
        </div>
        <p className="text-center text-xs mt-10" style={{ color: '#475569' }}>
          Prices in INR (Indian Rupee). Includes GST where applicable. Billed monthly. Cancel anytime.
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
            <p className="text-sm mb-6" style={{ color: '#64748B' }}>No credit card required to start · Cancel anytime · Paddle-secured checkout</p>
            <GradientButton href="/dashboard" size="lg">Start free today</GradientButton>
          </div>
      </div>
    </div>
  )
}
