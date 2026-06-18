import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { getRolesByCategory } from '@/lib/data/cv-roles'
import { ArrowRight, CheckCircle, Zap } from 'lucide-react'

export const metadata: Metadata = {
  metadataBase: new URL('https://jobagent247.co'),
  title: 'AI CV Builder UK — Tailored CV for Every Role | JobAgent247',
  description: 'Build an ATS-optimised CV tailored to your role. JobAgent247 scores your CV against job descriptions and rewrites it to score 90+ — for software engineers, data scientists, nurses, teachers, and 100+ more roles.',
  alternates: {
    canonical: 'https://jobagent247.co/cv-builder',
  },
  openGraph: {
    title: 'AI CV Builder UK — Tailored CV for Every Role',
    description: 'Score 90+ on ATS for any UK job. AI-powered CV tailoring for 100+ roles.',
    url: 'https://jobagent247.co/cv-builder',
    siteName: 'JobAgent247',
    type: 'website',
  },
}

const BENEFITS = [
  'Tailored CV rewritten for your exact job description',
  'ATS score check before you apply',
  'Keyword gap analysis included',
  'UK CV formatting (A4, 2-page, no photo)',
  'Matching cover letter generated in one click',
  'DOCX and PDF export',
]

export default function CvBuilderHubPage() {
  return (
    <div className="min-h-screen" style={{
      background: 'radial-gradient(circle at top left, rgba(139,92,246,0.18) 0%, transparent 40%), radial-gradient(circle at top right, rgba(6,182,212,0.12) 0%, transparent 40%), linear-gradient(180deg, #05070D 0%, #0B1020 100%)',
    }}>
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 px-4 max-w-5xl mx-auto text-center">
        <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-widest rounded-full mb-5"
          style={{ background: 'rgba(139,92,246,0.15)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.3)' }}>
          AI CV Builder UK
        </span>
        <h1 className="font-heading font-bold text-4xl lg:text-6xl text-white leading-tight mb-5">
          The AI CV builder built for{' '}
          <span className="gradient-text">your specific role</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto mb-8" style={{ color: '#CBD5E1' }}>
          Generic CVs score 50–60% on ATS. A tailored CV scores 90+. JobAgent247 rewrites your CV for each job description in under 60 seconds — with the right keywords, structure, and UK formatting.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <GradientButton href="/signup" size="lg">
            Build my CV free <ArrowRight className="w-4 h-4" />
          </GradientButton>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
          {BENEFITS.map(b => (
            <div key={b} className="flex items-center gap-2 text-sm text-left" style={{ color: '#94A3B8' }}>
              <CheckCircle className="w-4 h-4 shrink-0" style={{ color: '#22C55E' }} />
              {b}
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 px-4 max-w-4xl mx-auto">
        <h2 className="font-heading font-bold text-2xl text-white text-center mb-8">How it works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: '1', heading: 'Upload your CV', body: 'Upload your existing CV in any format. We parse it and build your profile.' },
            { step: '2', heading: 'Paste a job description', body: 'Copy the job posting URL or paste the description. We analyse the ATS requirements.' },
            { step: '3', heading: 'Get your tailored CV', body: 'We rewrite your CV to score 90+ on ATS for that specific role — in under 60 seconds.' },
          ].map(s => (
            <GlassCard key={s.step} className="p-6 text-center">
              <div className="w-10 h-10 rounded-full font-bold text-white flex items-center justify-center mx-auto mb-4 text-lg"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' }}>
                {s.step}
              </div>
              <h3 className="font-heading font-semibold text-white mb-2">{s.heading}</h3>
              <p className="text-sm" style={{ color: '#94A3B8' }}>{s.body}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Role directory */}
      <section className="py-12 px-4 max-w-5xl mx-auto">
        <h2 className="font-heading font-bold text-2xl text-white mb-3">CV guides by role</h2>
        <p className="mb-10 text-sm" style={{ color: '#94A3B8' }}>
          Select your role for ATS keywords, common CV mistakes, salary benchmarks, and tailored advice for the UK job market.
        </p>
        {Object.entries(getRolesByCategory()).map(([category, roles]) => (
          <div key={category} className="mb-10">
            <h3 className="font-heading font-semibold text-sm uppercase tracking-widest mb-4" style={{ color: '#8B5CF6' }}>
              {category}
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {roles.map(role => (
                <Link key={role.slug} href={`/cv-builder/${role.slug}`}>
                  <GlassCard hover className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-white">{role.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{role.avgSalaryUK}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 shrink-0 ml-2" style={{ color: '#64748B' }} />
                  </GlassCard>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center">
        <GlassCard className="max-w-xl mx-auto p-10">
          <Zap className="w-8 h-8 mx-auto mb-4" style={{ color: '#8B5CF6' }} />
          <h2 className="font-heading font-bold text-2xl text-white mb-3">Ready to score 90+ on ATS?</h2>
          <p className="text-sm mb-6" style={{ color: '#94A3B8' }}>
            Free to start. No credit card required. First 100 users get 30 days Pro free.
          </p>
          <GradientButton href="/signup" size="lg" className="w-full justify-center">
            Start free <ArrowRight className="w-4 h-4" />
          </GradientButton>
        </GlassCard>
      </section>

      <footer className="py-8 text-center text-xs" style={{ color: '#475569' }}>
        © {new Date().getFullYear()} JobAgent247 Ltd · <Link href="/privacy" className="hover:text-white">Privacy</Link> · <Link href="/terms" className="hover:text-white">Terms</Link>
      </footer>
    </div>
  )
}
