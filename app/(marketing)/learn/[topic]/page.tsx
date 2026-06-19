import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { LEARN_TOPICS, getTopicBySlug } from '@/lib/data/learn-topics'
import { ArrowRight, Clock, ChevronRight, Zap } from 'lucide-react'

interface Props {
  params: Promise<{ topic: string }>
}

export async function generateStaticParams() {
  return LEARN_TOPICS.map(t => ({ topic: t.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topic: slug } = await params
  const topic = getTopicBySlug(slug)
  if (!topic) return {}
  return {
    metadataBase: new URL('https://jobagent247.co'),
    title: topic.metaTitle,
    description: topic.metaDescription,
    alternates: { canonical: `https://jobagent247.co/learn/${topic.slug}` },
    openGraph: {
      title: topic.metaTitle,
      description: topic.metaDescription,
      url: `https://jobagent247.co/learn/${topic.slug}`,
      siteName: 'JobAgent247',
      type: 'article',
    },
  }
}

export default async function LearnTopicPage({ params }: Props) {
  const { topic: slug } = await params
  const topic = getTopicBySlug(slug)
  if (!topic) notFound()

  const schemaJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Article', 'FAQPage'],
        headline: topic.title,
        description: topic.metaDescription,
        author: { '@type': 'Organization', name: 'JobAgent247' },
        publisher: { '@type': 'Organization', name: 'JobAgent247', url: 'https://jobagent247.co' },
        mainEntity: topic.faqs.map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://jobagent247.co' },
          { '@type': 'ListItem', position: 2, name: 'Learn', item: 'https://jobagent247.co/learn' },
          { '@type': 'ListItem', position: 3, name: topic.title, item: `https://jobagent247.co/learn/${topic.slug}` },
        ],
      },
    ],
  })

  const related = LEARN_TOPICS.filter(t => topic.relatedTopics.includes(t.slug))

  return (
    <div className="min-h-screen" style={{
      background: 'radial-gradient(circle at top left, rgba(139,92,246,0.18) 0%, transparent 40%), radial-gradient(circle at top right, rgba(6,182,212,0.12) 0%, transparent 40%), linear-gradient(180deg, #05070D 0%, #0B1020 100%)',
    }}>
      {/* JSON-LD — static data, no user input */}
      <script type="application/ld+json" suppressHydrationWarning>{schemaJson}</script>
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 pt-28 pb-16">

        {/* Breadcrumb */}
        <nav className="text-xs mb-6 flex items-center gap-1" style={{ color: '#64748B' }}>
          <Link href="/" className="hover:text-white">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/learn" className="hover:text-white">Learn</Link>
          <ChevronRight className="w-3 h-3" />
          <span style={{ color: '#94A3B8' }}>{topic.category}</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(139,92,246,0.15)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.3)' }}>
              {topic.category}
            </span>
            <div className="flex items-center gap-1 text-xs" style={{ color: '#64748B' }}>
              <Clock className="w-3 h-3" />
              {topic.readingTime} min read
            </div>
          </div>
          <h1 className="font-heading font-bold text-3xl lg:text-4xl text-white leading-tight mb-5">
            {topic.title}
          </h1>
          <p className="text-base leading-relaxed" style={{ color: '#CBD5E1' }}>
            {topic.intro}
          </p>
        </div>

        {/* Inline CTA */}
        <GlassCard className="p-4 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="font-semibold text-white text-sm">{topic.ctaHeading}</p>
            <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{topic.ctaBody}</p>
          </div>
          <GradientButton href="/signup" size="sm" className="shrink-0">
            Try free <ArrowRight className="w-3 h-3" />
          </GradientButton>
        </GlassCard>

        {/* Article sections */}
        <div className="space-y-10">
          {topic.sections.map((section, i) => (
            <div key={i}>
              <h2 className="font-heading font-semibold text-xl text-white mb-4">{section.heading}</h2>
              <p className="text-base leading-relaxed mb-4" style={{ color: '#CBD5E1' }}>{section.body}</p>
              {section.bullets && (
                <ul className="space-y-2 mt-3">
                  {section.bullets.map((b, j) => (
                    <li key={j} className="flex gap-3 text-sm" style={{ color: '#CBD5E1' }}>
                      <span className="shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ background: '#8B5CF6' }} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* FAQs */}
        {topic.faqs.length > 0 && (
          <div className="mt-12">
            <h2 className="font-heading font-bold text-2xl text-white mb-6">Frequently asked questions</h2>
            <div className="space-y-4">
              {topic.faqs.map((faq, i) => (
                <GlassCard key={i} className="p-5">
                  <p className="font-semibold text-white mb-2 text-sm">{faq.question}</p>
                  <p className="text-sm" style={{ color: '#CBD5E1' }}>{faq.answer}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* Related articles */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="font-heading font-semibold text-lg text-white mb-4">Related guides</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {related.map(t => (
                <Link key={t.slug} href={`/learn/${t.slug}`}>
                  <GlassCard hover className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white leading-snug">{t.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{t.readingTime} min read</p>
                    </div>
                    <ArrowRight className="w-4 h-4 shrink-0 ml-3" style={{ color: '#64748B' }} />
                  </GlassCard>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <GlassCard className="mt-12 p-8 text-center">
          <Zap className="w-8 h-8 mx-auto mb-4" style={{ color: '#8B5CF6' }} />
          <h2 className="font-heading font-bold text-xl text-white mb-3">{topic.ctaHeading}</h2>
          <p className="text-sm mb-6" style={{ color: '#94A3B8' }}>{topic.ctaBody}</p>
          <GradientButton href="/signup" size="lg" className="w-full justify-center">
            Start free <ArrowRight className="w-4 h-4" />
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
