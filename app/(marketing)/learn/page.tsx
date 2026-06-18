import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { getTopicsByCategory } from '@/lib/data/learn-topics'
import { ArrowRight, Clock } from 'lucide-react'

export const metadata: Metadata = {
  metadataBase: new URL('https://jobagent247.co'),
  title: 'Job Search & CV Learning Centre UK | JobAgent247',
  description: 'Free guides on ATS scores, CV writing, cover letters, LinkedIn, and UK job search strategy. Everything you need to get more interviews.',
  alternates: { canonical: 'https://jobagent247.co/learn' },
  openGraph: {
    title: 'Job Search Learning Centre — Free UK Guides',
    description: 'Free guides on ATS, CV writing, cover letters, and UK job search strategy.',
    url: 'https://jobagent247.co/learn',
    siteName: 'JobAgent247',
    type: 'website',
  },
}

export default function LearnHubPage() {
  const byCategory = getTopicsByCategory()

  return (
    <div className="min-h-screen" style={{
      background: 'radial-gradient(circle at top left, rgba(139,92,246,0.18) 0%, transparent 40%), radial-gradient(circle at top right, rgba(6,182,212,0.12) 0%, transparent 40%), linear-gradient(180deg, #05070D 0%, #0B1020 100%)',
    }}>
      <Navbar />

      <section className="pt-28 pb-14 px-4 max-w-4xl mx-auto text-center">
        <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-widest rounded-full mb-5"
          style={{ background: 'rgba(139,92,246,0.15)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.3)' }}>
          Learning Centre
        </span>
        <h1 className="font-heading font-bold text-4xl lg:text-5xl text-white leading-tight mb-4">
          Everything you need to know about{' '}
          <span className="gradient-text">getting hired in the UK</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto mb-6" style={{ color: '#CBD5E1' }}>
          Free, practical guides on ATS systems, CV writing, cover letters, LinkedIn, and UK job search strategy — with actionable advice you can apply today.
        </p>
        <GradientButton href="/signup" size="lg">
          Try JobAgent247 free <ArrowRight className="w-4 h-4" />
        </GradientButton>
      </section>

      <section className="px-4 max-w-4xl mx-auto pb-16">
        {Object.entries(byCategory).map(([category, topics]) => (
          <div key={category} className="mb-12">
            <h2 className="font-heading font-semibold text-sm uppercase tracking-widest mb-5" style={{ color: '#8B5CF6' }}>
              {category}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {topics.map(topic => (
                <Link key={topic.slug} href={`/learn/${topic.slug}`}>
                  <GlassCard hover className="p-5 h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: '#64748B' }} />
                      <span className="text-xs" style={{ color: '#64748B' }}>{topic.readingTime} min read</span>
                    </div>
                    <h3 className="font-heading font-semibold text-white text-base leading-snug mb-2">{topic.title}</h3>
                    <p className="text-sm mt-auto pt-3 flex items-center gap-1" style={{ color: '#8B5CF6' }}>
                      Read guide <ArrowRight className="w-3 h-3" />
                    </p>
                  </GlassCard>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      <footer className="py-8 text-center text-xs" style={{ color: '#475569' }}>
        © {new Date().getFullYear()} JobAgent247 Ltd · <Link href="/privacy" className="hover:text-white">Privacy</Link> · <Link href="/terms" className="hover:text-white">Terms</Link>
      </footer>
    </div>
  )
}
