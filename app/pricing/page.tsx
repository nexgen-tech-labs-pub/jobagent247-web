import { Navbar } from '@/components/layout/Navbar'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { SecondaryButton } from '@/components/ui/SecondaryButton'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Check, X, Zap } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: '£0',
    period: '/month',
    desc: 'For exploring and building your first profile',
    features: ['1 CV upload', 'Basic CV feedback', '3 job description analyses', 'Basic job tracker', 'Limited AI generations (5/day)'],
    notIncluded: ['Unlimited CV improvements', 'Cover letters', 'Interview prep', 'LinkedIn optimisation'],
    cta: 'Start free',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '£9.99',
    period: '/month',
    desc: 'For active job seekers who want better applications',
    features: ['Unlimited CV improvements', 'Unlimited job match analysis', 'Tailored cover letters', 'Recruiter messages', 'Interview prep', 'Application tracker', 'LinkedIn optimisation', 'Follow-up suggestions'],
    notIncluded: ['Multiple CV versions', 'Mock interview workflows', 'Weekly job-search plan'],
    cta: 'Get Pro',
    highlight: true,
    badge: 'Best value',
  },
  {
    name: 'Career Accelerator',
    price: '£29.99',
    period: '/month',
    desc: 'For serious job seekers and career switchers',
    features: ['Everything in Pro', 'Advanced role strategy', 'Multiple CV versions', 'Mock interview workflows', 'Weekly job-search plan', 'Priority AI processing', 'Exportable documents'],
    notIncluded: [],
    cta: 'Accelerate my search',
    highlight: false,
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

          {/* Pricing cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {plans.map((plan) => (
              <div key={plan.name} className="glass-card p-8 flex flex-col relative"
                style={plan.highlight ? { border: '1px solid rgba(139,92,246,0.5)', boxShadow: '0 0 40px rgba(139,92,246,0.15)' } : {}}>
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1"
                    style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)', color: 'white' }}>
                    <Zap className="w-3 h-3" /> {plan.badge}
                  </span>
                )}
                <div className="mb-6">
                  <h3 className="font-heading font-bold text-xl text-white mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="font-heading font-bold text-4xl text-white">{plan.price}</span>
                    <span className="text-sm" style={{ color: '#64748B' }}>{plan.period}</span>
                  </div>
                  <p className="text-sm" style={{ color: '#94A3B8' }}>{plan.desc}</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm" style={{ color: '#CBD5E1' }}>
                      <Check className="w-4 h-4 shrink-0" style={{ color: '#22C55E' }} />{f}
                    </li>
                  ))}
                  {plan.notIncluded.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm" style={{ color: '#3F4A5A' }}>
                      <X className="w-4 h-4 shrink-0" style={{ color: '#3F4A5A' }} />{f}
                    </li>
                  ))}
                </ul>
                {plan.highlight
                  ? <GradientButton href="/dashboard" className="w-full justify-center">{plan.cta}</GradientButton>
                  : <SecondaryButton href="/dashboard" className="w-full justify-center">{plan.cta}</SecondaryButton>}
              </div>
            ))}
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
            <GradientButton href="/dashboard" size="lg">Start free today</GradientButton>
          </div>
        </div>
      </div>
    </main>
  )
}
