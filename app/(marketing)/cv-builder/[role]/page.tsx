import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { CV_ROLES, getRoleBySlug } from '@/lib/data/cv-roles'
import { ArrowRight, TrendingUp, AlertCircle, CheckCircle, Star, Building2, Zap } from 'lucide-react'

interface Props {
  params: Promise<{ role: string }>
}

export async function generateStaticParams() {
  return CV_ROLES.map(r => ({ role: r.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { role: roleSlug } = await params
  const role = getRoleBySlug(roleSlug)
  if (!role) return {}
  return {
    metadataBase: new URL('https://jobagent247.co'),
    title: `${role.title} CV — ATS Keywords, Mistakes & Tips UK | JobAgent247`,
    description: `Write an ATS-optimised ${role.title} CV for UK jobs. Discover the exact keywords, common mistakes, example bullet points, and salary benchmarks for ${role.title} roles.`,
    alternates: { canonical: `https://jobagent247.co/cv-builder/${role.slug}` },
    openGraph: {
      title: `${role.title} CV Guide — Score 90+ on ATS (UK)`,
      description: `ATS keywords, CV mistakes, example bullets, and salary data for ${role.title} roles in the UK.`,
      url: `https://jobagent247.co/cv-builder/${role.slug}`,
      siteName: 'JobAgent247',
      type: 'article',
    },
  }
}

const DEMAND_LABELS: Record<string, { label: string; color: string }> = {
  rising: { label: '↑ Rising demand', color: '#22C55E' },
  stable: { label: '→ Stable demand', color: '#06B6D4' },
  competitive: { label: '⚡ Highly competitive', color: '#F59E0B' },
}

export default async function RoleCvPage({ params }: Props) {
  const { role: roleSlug } = await params
  const role = getRoleBySlug(roleSlug)
  if (!role) notFound()

  const demand = DEMAND_LABELS[role.demandTrend]

  const schemaJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to Write a ${role.title} CV for UK Jobs`,
    description: `Step-by-step guide to writing an ATS-optimised ${role.title} CV with the right keywords and structure for UK job applications.`,
    step: [
      { '@type': 'HowToStep', name: 'Use the right ATS keywords', text: `Include these keywords in your ${role.title} CV: ${role.atsKeywords.join(', ')}` },
      { '@type': 'HowToStep', name: 'Avoid common mistakes', text: role.commonMistakes[0] },
      { '@type': 'HowToStep', name: 'Write strong bullet points', text: role.exampleBullets[0] },
    ],
  })

  return (
    <div className="min-h-screen" style={{
      background: 'radial-gradient(circle at top left, rgba(139,92,246,0.18) 0%, transparent 40%), radial-gradient(circle at top right, rgba(6,182,212,0.12) 0%, transparent 40%), linear-gradient(180deg, #05070D 0%, #0B1020 100%)',
    }}>
      {/* JSON-LD — static data, no user input */}
      <script type="application/ld+json" suppressHydrationWarning>{schemaJson}</script>
      <Navbar />

      {/* Header */}
      <section className="pt-28 pb-10 px-4 max-w-3xl mx-auto">
        <nav className="text-xs mb-6" style={{ color: '#64748B' }}>
          <Link href="/" className="hover:text-white">Home</Link>
          {' / '}
          <Link href="/cv-builder" className="hover:text-white">CV Builder</Link>
          {' / '}
          <span style={{ color: '#94A3B8' }}>{role.title}</span>
        </nav>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(139,92,246,0.15)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.3)' }}>
            {role.category}
          </span>
          <span className="text-xs font-semibold" style={{ color: demand.color }}>{demand.label}</span>
        </div>
        <h1 className="font-heading font-bold text-3xl lg:text-5xl text-white leading-tight mb-4">
          How to Write a{' '}
          <span className="gradient-text">{role.title} CV</span>
          {' '}for UK Jobs
        </h1>
        <p className="text-base mb-6" style={{ color: '#CBD5E1' }}>
          The ATS keywords, common mistakes, and example bullets that get {role.title} CVs to interview stage in the UK.
        </p>
        <GradientButton href="/signup">
          Score my {role.titleShort} CV free <ArrowRight className="w-4 h-4" />
        </GradientButton>
      </section>

      <div className="max-w-3xl mx-auto px-4 pb-16 space-y-8">

        {/* Salary strip */}
        <div className="grid grid-cols-2 gap-4">
          <GlassCard className="p-4">
            <p className="text-xs mb-1" style={{ color: '#64748B' }}>Average salary UK</p>
            <p className="font-heading font-bold text-white">{role.avgSalaryUK}</p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-xs mb-1" style={{ color: '#64748B' }}>Average salary India</p>
            <p className="font-heading font-bold text-white">{role.avgSalaryIN}</p>
          </GlassCard>
        </div>

        {/* ATS Keywords */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5" style={{ color: '#22C55E' }} />
            <h2 className="font-heading font-semibold text-white text-lg">ATS keywords for {role.title} CVs</h2>
          </div>
          <p className="text-sm mb-4" style={{ color: '#94A3B8' }}>
            Include these terms in your CV — match the exact wording used in the job description where possible.
          </p>
          <div className="flex flex-wrap gap-2">
            {role.atsKeywords.map(kw => (
              <span key={kw} className="text-xs px-3 py-1.5 rounded-full font-medium"
                style={{ background: 'rgba(139,92,246,0.12)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.25)' }}>
                {kw}
              </span>
            ))}
          </div>
        </GlassCard>

        {/* Common mistakes */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5" style={{ color: '#EF4444' }} />
            <h2 className="font-heading font-semibold text-white text-lg">Common mistakes on {role.title} CVs</h2>
          </div>
          <div className="space-y-3">
            {role.commonMistakes.map((m, i) => (
              <div key={i} className="flex gap-3 text-sm" style={{ color: '#CBD5E1' }}>
                <span className="shrink-0 font-bold" style={{ color: '#EF4444' }}>✗</span>
                <span>{m}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Example bullets */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5" style={{ color: '#F59E0B' }} />
            <h2 className="font-heading font-semibold text-white text-lg">Strong {role.title} CV bullet points</h2>
          </div>
          <p className="text-sm mb-4" style={{ color: '#94A3B8' }}>
            Great CV bullets follow the formula: action verb + what you did + measurable result.
          </p>
          <div className="space-y-3">
            {role.exampleBullets.map((b, i) => (
              <div key={i} className="flex gap-3 text-sm rounded-lg p-3"
                style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', color: '#E2E8F0' }}>
                <span className="shrink-0 font-bold" style={{ color: '#22C55E' }}>✓</span>
                <span>{b}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Top companies */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5" style={{ color: '#06B6D4' }} />
            <h2 className="font-heading font-semibold text-white text-lg">Top UK employers hiring {role.title}s</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {role.topCompaniesUK.map(co => (
              <span key={co} className="text-sm px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(6,182,212,0.08)', color: '#67E8F9', border: '1px solid rgba(6,182,212,0.2)' }}>
                {co}
              </span>
            ))}
          </div>
        </GlassCard>

        {/* Related roles */}
        {role.relatedRoles.length > 0 && (
          <div>
            <h2 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" style={{ color: '#8B5CF6' }} />
              Related role guides
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {role.relatedRoles.map(slug => {
                const related = CV_ROLES.find(r => r.slug === slug)
                if (!related) return null
                return (
                  <Link key={slug} href={`/cv-builder/${slug}`}>
                    <GlassCard hover className="p-4 flex items-center justify-between">
                      <p className="text-sm font-medium text-white">{related.title}</p>
                      <ArrowRight className="w-4 h-4 shrink-0 ml-2" style={{ color: '#64748B' }} />
                    </GlassCard>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        <GlassCard className="p-8 text-center">
          <Zap className="w-8 h-8 mx-auto mb-4" style={{ color: '#8B5CF6' }} />
          <h2 className="font-heading font-bold text-xl text-white mb-3">
            Get your {role.title} CV scored — free
          </h2>
          <p className="text-sm mb-6" style={{ color: '#94A3B8' }}>
            Upload your CV, paste a {role.title} job description, and get an instant ATS score with a rewritten version targeting 90+.
          </p>
          <GradientButton href="/signup" size="lg" className="w-full justify-center">
            Score my CV for free <ArrowRight className="w-4 h-4" />
          </GradientButton>
          <p className="text-xs mt-3" style={{ color: '#475569' }}>No credit card required · First 100 users get 30 days Pro free</p>
        </GlassCard>

      </div>

      <footer className="py-8 text-center text-xs" style={{ color: '#475569' }}>
        © {new Date().getFullYear()} JobAgent247 Ltd · <Link href="/privacy" className="hover:text-white">Privacy</Link> · <Link href="/terms" className="hover:text-white">Terms</Link>
      </footer>
    </div>
  )
}
