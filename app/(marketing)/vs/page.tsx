import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { COMPETITORS } from '@/lib/data/competitors'
import { ArrowRight, Star } from 'lucide-react'

export const metadata: Metadata = {
  metadataBase: new URL('https://jobagent247.co'),
  title: 'JobAgent247 vs Competitors — CV Builder Comparison UK | JobAgent247',
  description: 'See how JobAgent247 compares to Jobscan, Rezi, Resume.io, Kickresume, and ChatGPT. Honest feature comparison for UK job seekers.',
  alternates: { canonical: 'https://jobagent247.co/vs' },
  openGraph: {
    title: 'JobAgent247 vs Competitors — Honest Comparison',
    description: 'How does JobAgent247 stack up against Jobscan, Rezi, Resume.io, and the rest?',
    url: 'https://jobagent247.co/vs',
    siteName: 'JobAgent247',
    type: 'website',
  },
}

export default function VsHubPage() {
  return (
    <div className="min-h-screen" style={{
      background: 'radial-gradient(circle at top left, rgba(139,92,246,0.18) 0%, transparent 40%), radial-gradient(circle at top right, rgba(6,182,212,0.12) 0%, transparent 40%), linear-gradient(180deg, #05070D 0%, #0B1020 100%)',
    }}>
      <Navbar />

      <section className="pt-28 pb-14 px-4 max-w-4xl mx-auto text-center">
        <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-widest rounded-full mb-5"
          style={{ background: 'rgba(139,92,246,0.15)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.3)' }}>
          Comparisons
        </span>
        <h1 className="font-heading font-bold text-4xl lg:text-5xl text-white leading-tight mb-4">
          JobAgent247 vs the alternatives
        </h1>
        <p className="text-lg max-w-2xl mx-auto mb-8" style={{ color: '#CBD5E1' }}>
          Honest comparisons for UK job seekers. See how we stack up against the most popular CV builders, ATS tools, and AI job search platforms.
        </p>
        <GradientButton href="/signup" size="lg">
          Try JobAgent247 free <ArrowRight className="w-4 h-4" />
        </GradientButton>
      </section>

      <section className="px-4 max-w-4xl mx-auto pb-16">
        <div className="grid md:grid-cols-2 gap-4">
          {COMPETITORS.map(c => (
            <Link key={c.slug} href={`/vs/${c.slug}`}>
              <GlassCard hover className="p-5 h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-heading font-semibold text-white text-lg">vs {c.name}</p>
                    <p className="text-xs mt-1" style={{ color: '#64748B' }}>{c.tagline}</p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ml-3"
                    style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}>
                    {c.rating.overall}/10
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-auto pt-3">
                  {[
                    { label: 'ATS accuracy', val: c.rating.atsAccuracy },
                    { label: 'UK focus', val: c.rating.ukFocus },
                  ].map(r => (
                    <div key={r.label} className="text-xs" style={{ color: '#64748B' }}>
                      <span>{r.label}: </span>
                      <span className="font-semibold" style={{ color: '#94A3B8' }}>{r.val}/10</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1 mt-3 text-xs font-medium" style={{ color: '#8B5CF6' }}>
                  Read comparison <ArrowRight className="w-3 h-3" />
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      </section>

      {/* Overall comparison table */}
      <section className="px-4 max-w-5xl mx-auto pb-16">
        <h2 className="font-heading font-bold text-2xl text-white mb-6 text-center">Feature comparison at a glance</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th className="text-left py-3 pr-4 text-white font-semibold">Feature</th>
                <th className="py-3 px-3 text-center font-semibold" style={{ color: '#8B5CF6' }}>JobAgent247</th>
                <th className="py-3 px-3 text-center" style={{ color: '#64748B' }}>Jobscan</th>
                <th className="py-3 px-3 text-center" style={{ color: '#64748B' }}>Rezi</th>
                <th className="py-3 px-3 text-center" style={{ color: '#64748B' }}>Resume.io</th>
                <th className="py-3 px-3 text-center" style={{ color: '#64748B' }}>ChatGPT</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['ATS score checker', true, true, true, false, false],
                ['AI CV rewriting', true, false, 'partial', false, 'partial'],
                ['Cover letter generator', true, false, false, 'partial', 'partial'],
                ['Job search & matching', true, false, false, false, false],
                ['Interview preparation', true, false, false, false, 'partial'],
                ['Application tracker', true, 'partial', false, false, false],
                ['UK job sites (Reed, Adzuna)', true, false, false, false, false],
                ['UK CV formatting', true, false, false, 'partial', false],
                ['Free to start', true, true, 'partial', false, true],
              ].map(([feature, ...vals]) => (
                <tr key={String(feature)} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td className="py-3 pr-4" style={{ color: '#CBD5E1' }}>{feature}</td>
                  {vals.map((v, i) => (
                    <td key={i} className="py-3 px-3 text-center">
                      {v === true ? <Star className="w-4 h-4 mx-auto" style={{ color: '#22C55E' }} />
                        : v === 'partial' ? <span className="text-xs" style={{ color: '#F59E0B' }}>Partial</span>
                        : <span style={{ color: '#475569' }}>—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="py-8 text-center text-xs" style={{ color: '#475569' }}>
        © {new Date().getFullYear()} JobAgent247 Ltd · <Link href="/privacy" className="hover:text-white">Privacy</Link> · <Link href="/terms" className="hover:text-white">Terms</Link>
      </footer>
    </div>
  )
}
