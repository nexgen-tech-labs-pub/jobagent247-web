import Link from 'next/link'
import {
  ArrowRight, User, UserCircle, FileText, Target, Briefcase, BrainCircuit,
  TrendingUp, BookOpen, CheckSquare, Inbox, MessageSquare, Send, CheckCircle2,
  Clock, Zap, Sparkles,
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import type { HowItWorksCopy } from '@/lib/data/how-it-works'

const ICONS: Record<string, React.ElementType> = {
  User, UserCircle, FileText, Target, Briefcase, BrainCircuit,
  TrendingUp, BookOpen, CheckSquare, Inbox, MessageSquare, Send, CheckCircle2,
}

export function HowItWorksPage({ copy }: { copy: HowItWorksCopy }) {
  const schemaJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: copy.faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  })

  const baseHref = copy.locale === 'in' ? '/in' : ''

  return (
    <div className="min-h-screen" style={{
      background: 'radial-gradient(circle at top left, rgba(139,92,246,0.18) 0%, transparent 40%), radial-gradient(circle at top right, rgba(6,182,212,0.12) 0%, transparent 40%), linear-gradient(180deg, #05070D 0%, #0B1020 100%)',
    }}>
      {/* JSON-LD — static data, no user input */}
      <script type="application/ld+json" suppressHydrationWarning>{schemaJson}</script>
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 px-4 max-w-4xl mx-auto text-center">
        <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-widest rounded-full mb-5"
          style={{ background: 'rgba(139,92,246,0.15)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.3)' }}>
          How it works
        </span>
        <h1 className="font-heading font-bold text-4xl lg:text-6xl text-white leading-tight mb-5">
          {copy.heroTitle}{' '}
          <span className="gradient-text">{copy.heroTitleAccent}</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto mb-8" style={{ color: '#CBD5E1' }}>
          {copy.heroSubtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <GradientButton href={`${baseHref}/signup`} size="lg">
            Start free <ArrowRight className="w-4 h-4" />
          </GradientButton>
          <Link href="#stages" className="px-6 py-3 rounded-full text-sm font-semibold transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.12)' }}>
            See the flow
          </Link>
        </div>
      </section>

      {/* The 6-stage journey */}
      <section id="stages" className="py-12 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl text-white mb-3">The 6-stage journey</h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: '#94A3B8' }}>
            Each stage builds on the one before. Profile context flows forward, so every agent gets smarter the more you use it.
          </p>
        </div>
        <div className="space-y-5">
          {copy.stages.map(stage => {
            const Icon = ICONS[stage.iconName] ?? Sparkles
            return (
              <GlassCard key={stage.num} className="p-6 flex gap-5 items-start">
                <div className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' }}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold" style={{ color: '#8B5CF6' }}>STAGE {stage.num}</span>
                  </div>
                  <h3 className="font-heading font-semibold text-white text-lg mb-2">{stage.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#CBD5E1' }}>{stage.body}</p>
                </div>
              </GlassCard>
            )
          })}
        </div>
      </section>

      {/* Each agent */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-heading font-bold text-3xl text-white mb-3">The 10 agents in detail</h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: '#94A3B8' }}>
            Each agent does one thing well — and shares context with the others. Click any agent to try it once you&apos;ve signed up.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {copy.agents.map(agent => {
            const Icon = ICONS[agent.iconName] ?? Sparkles
            return (
              <GlassCard key={agent.slug} className="p-5">
                <div className="flex items-start gap-4 mb-4">
                  <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)' }}>
                    <Icon className="w-5 h-5" style={{ color: '#A78BFA' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading font-semibold text-white text-base">{agent.name}</h3>
                      <span className="text-xs font-semibold px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(6,182,212,0.10)', color: '#67E8F9', border: '1px solid rgba(6,182,212,0.2)' }}>
                        Stage {agent.stage}
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: '#94A3B8' }}>{agent.oneLiner}</p>
                  </div>
                </div>
                <ul className="space-y-1.5 mb-4">
                  {agent.whatYouGet.map((g, i) => (
                    <li key={i} className="flex gap-2 text-xs" style={{ color: '#CBD5E1' }}>
                      <span className="shrink-0 mt-0.5" style={{ color: '#22C55E' }}>✓</span>
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
                <Link href={`${baseHref}${agent.href}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold"
                  style={{ color: '#8B5CF6' }}>
                  Try {agent.name} <ArrowRight className="w-3 h-3" />
                </Link>
              </GlassCard>
            )
          })}
        </div>
      </section>

      {/* Timeline */}
      <section className="py-12 px-4 max-w-3xl mx-auto">
        <GlassCard className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6" style={{ color: '#8B5CF6' }} />
            <h2 className="font-heading font-bold text-2xl text-white">{copy.timelineHeading}</h2>
          </div>
          <p className="text-sm mb-6" style={{ color: '#CBD5E1' }}>{copy.timelineBody}</p>
          <div className="space-y-3">
            {copy.timelineBullets.map((b, i) => (
              <div key={i} className="flex gap-4 items-start">
                <span className="shrink-0 text-xs font-bold px-2 py-1 rounded w-24 text-center"
                  style={{ background: 'rgba(139,92,246,0.15)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.25)' }}>
                  {b.label}
                </span>
                <p className="text-sm pt-1" style={{ color: '#CBD5E1' }}>{b.value}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      {/* What makes it different */}
      <section className="py-12 px-4 max-w-3xl mx-auto text-center">
        <h2 className="font-heading font-bold text-2xl text-white mb-3">What makes JobAgent247 different?</h2>
        <p className="text-base mb-6 max-w-xl mx-auto" style={{ color: '#94A3B8' }}>
          Most tools do one piece — score your CV, or write a cover letter, or list jobs. JobAgent247 connects the entire workflow with shared context across agents.
        </p>
        <Link href={`${baseHref}/vs`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold"
          style={{ background: 'rgba(255,255,255,0.06)', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.12)' }}>
          Compare us to Jobscan, Rezi, Resume.io <ArrowRight className="w-3 h-3" />
        </Link>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 max-w-3xl mx-auto">
        <h2 className="font-heading font-bold text-2xl text-white text-center mb-8">Frequently asked questions</h2>
        <div className="space-y-3">
          {copy.faqs.map((faq, i) => (
            <GlassCard key={i} className="p-5">
              <p className="font-semibold text-white mb-2 text-sm">{faq.q}</p>
              <p className="text-sm" style={{ color: '#CBD5E1' }}>{faq.a}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <GlassCard className="max-w-xl mx-auto p-10 text-center">
          <Zap className="w-8 h-8 mx-auto mb-4" style={{ color: '#8B5CF6' }} />
          <h2 className="font-heading font-bold text-2xl text-white mb-3">Try the full workflow — free</h2>
          <p className="text-sm mb-6" style={{ color: '#94A3B8' }}>
            No credit card required. First 100 users get 30 days Pro free.
          </p>
          <GradientButton href={`${baseHref}/signup`} size="lg" className="w-full justify-center">
            Start free <ArrowRight className="w-4 h-4" />
          </GradientButton>
        </GlassCard>
      </section>

      <footer className="py-8 text-center text-xs" style={{ color: '#475569' }}>
        © {new Date().getFullYear()} JobAgent247 Ltd ·{' '}
        <Link href={`${baseHref}/privacy`} className="hover:text-white">Privacy</Link> ·{' '}
        <Link href={`${baseHref}/terms`} className="hover:text-white">Terms</Link>
      </footer>
    </div>
  )
}
