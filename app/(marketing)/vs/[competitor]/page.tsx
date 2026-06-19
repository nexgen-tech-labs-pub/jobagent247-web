import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { COMPETITORS, getCompetitorBySlug } from '@/lib/data/competitors'
import { ArrowRight, CheckCircle, XCircle, MinusCircle, Zap } from 'lucide-react'

interface Props {
  params: Promise<{ competitor: string }>
}

export async function generateStaticParams() {
  return COMPETITORS.map(c => ({ competitor: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { competitor: slug } = await params
  const c = getCompetitorBySlug(slug)
  if (!c) return {}
  return {
    metadataBase: new URL('https://jobagent247.co'),
    title: `JobAgent247 vs ${c.name}: Which Is Better for UK Job Seekers? (2026)`,
    description: `Honest comparison of JobAgent247 vs ${c.name}. Features, pricing, UK job market fit, and which tool gets you more interviews.`,
    alternates: { canonical: `https://jobagent247.co/vs/${c.slug}` },
    openGraph: {
      title: `JobAgent247 vs ${c.name} — Honest Comparison (UK 2026)`,
      description: `Features, pricing, and UK job market verdict for JobAgent247 vs ${c.name}.`,
      url: `https://jobagent247.co/vs/${c.slug}`,
      siteName: 'JobAgent247',
      type: 'article',
    },
  }
}

function FeatureIcon({ val }: { val: boolean | 'partial' }) {
  if (val === true) return <CheckCircle className="w-4 h-4 mx-auto" style={{ color: '#22C55E' }} />
  if (val === 'partial') return <MinusCircle className="w-4 h-4 mx-auto" style={{ color: '#F59E0B' }} />
  return <XCircle className="w-4 h-4 mx-auto" style={{ color: '#EF4444' }} />
}

function RatingBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-full rounded-full" style={{ width: `${value * 10}%`, background: 'linear-gradient(90deg, #8B5CF6, #06B6D4)' }} />
      </div>
      <span className="text-xs font-semibold w-6" style={{ color: '#94A3B8' }}>{value}</span>
    </div>
  )
}

export default async function CompetitorPage({ params }: Props) {
  const { competitor: slug } = await params
  const c = getCompetitorBySlug(slug)
  if (!c) notFound()

  const schemaJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `Is JobAgent247 better than ${c.name}?`,
            acceptedAnswer: { '@type': 'Answer', text: c.verdict },
          },
          {
            '@type': 'Question',
            name: `Who should use ${c.name}?`,
            acceptedAnswer: { '@type': 'Answer', text: c.bestFor },
          },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://jobagent247.co' },
          { '@type': 'ListItem', position: 2, name: 'Comparisons', item: 'https://jobagent247.co/vs' },
          { '@type': 'ListItem', position: 3, name: `JobAgent247 vs ${c.name}`, item: `https://jobagent247.co/vs/${c.slug}` },
        ],
      },
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
          <Link href="/vs" className="hover:text-white">Comparisons</Link>
          {' / '}
          <span style={{ color: '#94A3B8' }}>vs {c.name}</span>
        </nav>
        <h1 className="font-heading font-bold text-3xl lg:text-5xl text-white leading-tight mb-4">
          <span className="gradient-text">JobAgent247</span>
          {' vs '}
          {c.name}
          <span className="block text-xl lg:text-2xl mt-2 font-normal" style={{ color: '#94A3B8' }}>
            Which is better for UK job seekers?
          </span>
        </h1>
        <p className="text-base mb-6" style={{ color: '#CBD5E1' }}>{c.description}</p>
        <GradientButton href="/signup">
          Try JobAgent247 free <ArrowRight className="w-4 h-4" />
        </GradientButton>
      </section>

      <div className="max-w-3xl mx-auto px-4 pb-16 space-y-8">

        {/* Quick verdict */}
        <div style={{ borderLeft: '4px solid #8B5CF6', borderRadius: '0 16px 16px 0' }}>
          <GlassCard className="p-6 rounded-l-none">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#8B5CF6' }}>Our verdict</p>
            <p className="text-sm" style={{ color: '#CBD5E1' }}>{c.verdict}</p>
          </GlassCard>
        </div>

        {/* Rating comparison */}
        <GlassCard className="p-6">
          <h2 className="font-heading font-semibold text-white text-lg mb-5">Ratings</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold mb-3" style={{ color: '#8B5CF6' }}>JobAgent247</p>
              {[
                { label: 'Overall', val: 9 },
                { label: 'ATS accuracy', val: 9 },
                { label: 'Value for money', val: 8 },
                { label: 'UK focus', val: 10 },
              ].map(r => (
                <div key={r.label} className="mb-3">
                  <p className="text-xs mb-1" style={{ color: '#64748B' }}>{r.label}</p>
                  <RatingBar value={r.val} />
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold mb-3" style={{ color: '#64748B' }}>{c.name}</p>
              {[
                { label: 'Overall', val: c.rating.overall },
                { label: 'ATS accuracy', val: c.rating.atsAccuracy },
                { label: 'Value for money', val: c.rating.valueForMoney },
                { label: 'UK focus', val: c.rating.ukFocus },
              ].map(r => (
                <div key={r.label} className="mb-3">
                  <p className="text-xs mb-1" style={{ color: '#64748B' }}>{r.label}</p>
                  <RatingBar value={r.val} />
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Feature comparison */}
        <GlassCard className="p-6">
          <h2 className="font-heading font-semibold text-white text-lg mb-5">Feature comparison</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-3 text-xs font-semibold pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#64748B' }}>
              <span>Feature</span>
              <span className="text-center" style={{ color: '#8B5CF6' }}>JobAgent247</span>
              <span className="text-center">{c.name}</span>
            </div>
            {c.features.map(f => (
              <div key={f.label} className="grid grid-cols-3 items-center text-sm py-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: '#CBD5E1' }}>{f.label}</span>
                <FeatureIcon val={f.us} />
                <FeatureIcon val={f.them} />
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Pricing */}
        <GlassCard className="p-6">
          <h2 className="font-heading font-semibold text-white text-lg mb-4">Pricing</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold mb-3" style={{ color: '#8B5CF6' }}>JobAgent247</p>
              <p className="text-sm mb-1" style={{ color: '#CBD5E1' }}><strong className="text-white">Free:</strong> ATS score + basic tailoring</p>
              <p className="text-sm mb-1" style={{ color: '#CBD5E1' }}><strong className="text-white">Pro:</strong> £9.99/month — unlimited CV rewrites, cover letters, job matching</p>
              <p className="text-sm" style={{ color: '#CBD5E1' }}><strong className="text-white">Accelerator:</strong> £29.99/month — everything + mock interviews, export</p>
            </div>
            <div>
              <p className="text-xs font-semibold mb-3" style={{ color: '#64748B' }}>{c.name}</p>
              {c.pricing.free && <p className="text-sm mb-1" style={{ color: '#CBD5E1' }}><strong className="text-white">Free:</strong> {c.pricing.free}</p>}
              <p className="text-sm mb-1" style={{ color: '#CBD5E1' }}><strong className="text-white">Paid:</strong> {c.pricing.paid}</p>
              {c.pricing.notes && <p className="text-xs mt-2" style={{ color: '#64748B' }}>{c.pricing.notes}</p>}
            </div>
          </div>
        </GlassCard>

        {/* Pros and cons */}
        <div className="grid sm:grid-cols-2 gap-4">
          <GlassCard className="p-5">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#22C55E' }}>{c.name} strengths</p>
            <div className="space-y-2">
              {c.strengths.map((s, i) => (
                <div key={i} className="flex gap-2 text-sm" style={{ color: '#CBD5E1' }}>
                  <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: '#22C55E' }} />
                  {s}
                </div>
              ))}
            </div>
          </GlassCard>
          <GlassCard className="p-5">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#EF4444' }}>{c.name} weaknesses</p>
            <div className="space-y-2">
              {c.weaknesses.map((w, i) => (
                <div key={i} className="flex gap-2 text-sm" style={{ color: '#CBD5E1' }}>
                  <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: '#EF4444' }} />
                  {w}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Best for */}
        <GlassCard className="p-5">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#06B6D4' }}>
            Who should use {c.name}?
          </p>
          <p className="text-sm" style={{ color: '#CBD5E1' }}>{c.bestFor}</p>
        </GlassCard>

        {/* Other comparisons */}
        <div>
          <h2 className="font-heading font-semibold text-white mb-4 text-sm">Other comparisons</h2>
          <div className="flex flex-wrap gap-2">
            {COMPETITORS.filter(x => x.slug !== c.slug).map(x => (
              <Link key={x.slug} href={`/vs/${x.slug}`}
                className="text-xs px-3 py-1.5 rounded-full transition-colors hover:text-white"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#64748B', border: '1px solid rgba(255,255,255,0.08)' }}>
                vs {x.name}
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <GlassCard className="p-8 text-center">
          <Zap className="w-8 h-8 mx-auto mb-4" style={{ color: '#8B5CF6' }} />
          <h2 className="font-heading font-bold text-xl text-white mb-3">
            See the difference for yourself
          </h2>
          <p className="text-sm mb-6" style={{ color: '#94A3B8' }}>
            Start free. No credit card required. Your first ATS score is on us.
          </p>
          <GradientButton href="/signup" size="lg" className="w-full justify-center">
            Try JobAgent247 free <ArrowRight className="w-4 h-4" />
          </GradientButton>
          <p className="text-xs mt-3" style={{ color: '#475569' }}>First 100 users get 30 days Pro free</p>
        </GlassCard>

      </div>

      <footer className="py-8 text-center text-xs" style={{ color: '#475569' }}>
        © {new Date().getFullYear()} JobAgent247 Ltd · <Link href="/privacy" className="hover:text-white">Privacy</Link> · <Link href="/terms" className="hover:text-white">Terms</Link>
      </footer>
    </div>
  )
}
