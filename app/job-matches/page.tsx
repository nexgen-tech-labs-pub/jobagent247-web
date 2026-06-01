'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { SecondaryButton } from '@/components/ui/SecondaryButton'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { MapPin, Building2, Banknote, FileText, ExternalLink, Search, CheckCircle, XCircle, Zap, Loader2, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import type { MatchResult } from '@/lib/types/database'

interface SearchJob {
  id: string
  title: string
  company: string | null
  location: string | null
  type: string | null
  salary_min: number | null
  salary_max: number | null
  currency: string
  description: string | null
  url: string | null
  source_site: string | null
  visa_sponsorship: boolean
  match_score: number | null
  saved_status: string | null
  user_job_id: string | null
}

type ScrapeStatus = 'idle' | 'queued' | 'running' | 'done' | 'failed'

function MatchScorePill({ score }: { score: number | null }) {
  if (score === null) return (
    <span className="font-heading font-bold text-sm px-3 py-1 rounded-full" style={{ color: '#64748B', background: 'rgba(255,255,255,0.06)' }}>
      — %
    </span>
  )
  const color = score >= 80 ? '#22C55E' : score >= 60 ? '#F59E0B' : '#EF4444'
  const bg = score >= 80 ? 'rgba(34,197,94,0.12)' : score >= 60 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)'
  return (
    <span className="font-heading font-bold text-sm px-3 py-1 rounded-full" style={{ color, background: bg }}>
      {score}% match
    </span>
  )
}

export default function JobMatchesPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<SearchJob[]>([])
  const [scores, setScores] = useState<Record<string, MatchResult>>({})
  const [loading, setLoading] = useState(true)
  const [scoring, setScoring] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [keyword, setKeyword] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [scrapeStatus, setScrapeStatus] = useState<ScrapeStatus>('idle')
  const [scrapeError, setScrapeError] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const keywordRef = useRef(keyword)

  useEffect(() => { keywordRef.current = keyword }, [keyword])

  const fetchJobs = useCallback(async (kw: string, tf: string) => {
    const params = new URLSearchParams()
    if (kw) params.set('keywords', kw)
    if (tf !== 'All') params.set('type', tf.toLowerCase())
    const res = await fetch(`/api/jobs/search?${params}`)
    if (!res.ok) return []
    const data = await res.json()
    return data.jobs as SearchJob[]
  }, [])

  const loadAndScore = useCallback(async (kw = '', tf = 'All') => {
    const jobList = await fetchJobs(kw, tf)
    setJobs(jobList)
    setLoading(false)

    const unscoredIds = jobList.filter(j => j.match_score === null).slice(0, 10).map(j => j.id)
    if (unscoredIds.length === 0) return

    setScoring(true)
    try {
      const res = await fetch('/api/match/score-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobIds: unscoredIds }),
      })
      if (res.ok) {
        const bulk = await res.json() as Array<{ jobId: string; score: number; verdict: string }>
        setScores(prev => {
          const next = { ...prev }
          bulk.forEach(({ jobId, score, verdict }) => {
            next[jobId] = { score, verdict, strengths: [], gaps: [], suggestedChanges: [] }
          })
          return next
        })
      }
    } finally {
      setScoring(false)
    }
  }, [fetchJobs])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void loadAndScore() }, [loadAndScore])

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
  }

  const startScrape = async () => {
    setScrapeStatus('queued')
    setScrapeError(null)

    const res = await fetch('/api/jobs/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords: keyword ? keyword.split(' ') : ['developer'], location: 'London', sites: [] }),
    })

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({})) as { error?: string }
      setScrapeStatus('failed')
      setScrapeError(errBody.error ?? 'Failed to start job search')
      return
    }

    const { scrape_job_id } = await res.json() as { scrape_job_id: string }

    pollRef.current = setInterval(async () => {
      const poll = await fetch(`/api/jobs/scrape/${scrape_job_id}`)
      if (!poll.ok) return
      const { status, results_count, error } = await poll.json() as { status: ScrapeStatus; results_count: number; error: string | null }

      setScrapeStatus(status)
      if (status === 'done') {
        stopPolling()
        await loadAndScore(keywordRef.current, typeFilter)
      } else if (status === 'failed') {
        stopPolling()
        setScrapeError(error ?? 'Scrape failed')
      }
    }, 3000)
  }

  useEffect(() => () => stopPolling(), [])

  const handleFilter = async () => {
    setLoading(true)
    const jobList = await fetchJobs(keyword, typeFilter)
    setJobs(jobList)
    setLoading(false)
  }

  const isScraping = scrapeStatus === 'queued' || scrapeStatus === 'running'

  return (
    <DashboardLayout title="Job Matches">
      {/* Filters + Find Jobs */}
      <GlassCard className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748B' }} />
            <input
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
              placeholder="Search by title or keyword..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleFilter() }}
            />
          </div>
          {(['All', 'Permanent', 'Contract'] as const).map(t => (
            <button key={t} onClick={async () => {
              setTypeFilter(t)
              setLoading(true)
              const jobList = await fetchJobs(keywordRef.current, t)
              setJobs(jobList)
              setLoading(false)
            }}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style={typeFilter === t
                ? { background: 'rgba(139,92,246,0.2)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.4)' }
                : { background: 'rgba(255,255,255,0.05)', color: '#64748B', border: '1px solid rgba(255,255,255,0.08)' }}>
              {t}
            </button>
          ))}
          <GradientButton size="sm" onClick={startScrape} disabled={isScraping} className="shrink-0">
            {isScraping
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {scrapeStatus === 'queued' ? 'Queuing…' : 'Scraping…'}</>
              : <><RefreshCw className="w-3.5 h-3.5" /> Find Jobs</>}
          </GradientButton>
          {scoring && <Loader2 className="w-4 h-4 animate-spin self-center shrink-0" style={{ color: '#8B5CF6' }} />}
        </div>

        {scrapeStatus === 'done' && (
          <p className="text-xs mt-2" style={{ color: '#22C55E' }}>Job search complete — results updated.</p>
        )}
        {scrapeError && (
          <p className="text-xs mt-2" style={{ color: '#EF4444' }}>{scrapeError}</p>
        )}
      </GlassCard>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#8B5CF6' }} />
        </div>
      )}

      {!loading && jobs.length === 0 && (
        <div className="text-center py-16" style={{ color: '#64748B' }}>
          <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm mb-4">No jobs found yet.</p>
          <GradientButton size="sm" onClick={startScrape} disabled={isScraping}>
            {isScraping ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Searching…</> : 'Find Jobs Now'}
          </GradientButton>
        </div>
      )}

      {!loading && jobs.length > 0 && (
        <div className="space-y-4">
          {jobs.map(job => {
            const score = scores[job.id]?.score ?? job.match_score ?? null
            const analysis = scores[job.id]
            const isExpanded = expanded === job.id

            return (
              <GlassCard key={job.id} hover className="p-6">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="font-heading font-semibold text-white text-lg">{job.title}</h3>
                      <MatchScorePill score={score} />
                    </div>
                    <div className="flex flex-wrap gap-4 mb-3" style={{ color: '#94A3B8' }}>
                      {job.company && (
                        <span className="flex items-center gap-1.5 text-sm">
                          <Building2 className="w-3.5 h-3.5" /> {job.company}
                        </span>
                      )}
                      {job.location && (
                        <span className="flex items-center gap-1.5 text-sm">
                          <MapPin className="w-3.5 h-3.5" /> {job.location}
                        </span>
                      )}
                      {(job.salary_min || job.salary_max) && (
                        <span className="flex items-center gap-1.5 text-sm">
                          <Banknote className="w-3.5 h-3.5" />
                          {`£${job.salary_min?.toLocaleString()}–£${job.salary_max?.toLocaleString()}/yr`}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {job.type && <StatusBadge status={job.type as 'contract' | 'permanent'} />}
                      {job.visa_sponsorship && <StatusBadge status="ready" />}
                      {job.source_site && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: '#94A3B8' }}>
                          {job.source_site}
                        </span>
                      )}
                    </div>
                    {job.description && (
                      <p className="text-sm leading-relaxed line-clamp-2 mb-3" style={{ color: '#94A3B8' }}>{job.description}</p>
                    )}
                    {analysis && (
                      <button
                        onClick={() => setExpanded(isExpanded ? null : job.id)}
                        className="flex items-center gap-1.5 text-xs font-medium mb-3 transition-colors"
                        style={{ color: '#8B5CF6' }}>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        {isExpanded ? 'Hide Analysis' : 'View Analysis'}
                      </button>
                    )}
                    {isExpanded && analysis && (
                      <div className="mt-3 pt-3 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        {analysis.strengths.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold mb-1.5" style={{ color: '#22C55E' }}>Strengths</p>
                            <ul className="space-y-1">
                              {analysis.strengths.map((s, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-xs" style={{ color: '#94A3B8' }}>
                                  <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: '#22C55E' }} /> {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {analysis.gaps.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold mb-1.5" style={{ color: '#EF4444' }}>Gaps</p>
                            <ul className="space-y-1">
                              {analysis.gaps.map((g, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-xs" style={{ color: '#94A3B8' }}>
                                  <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: '#EF4444' }} /> {g}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {analysis.suggestedChanges.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold mb-1.5" style={{ color: '#F59E0B' }}>Suggested Changes</p>
                            <ul className="space-y-1">
                              {analysis.suggestedChanges.map((s, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-xs" style={{ color: '#94A3B8' }}>
                                  <Zap className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: '#F59E0B' }} /> {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <p className="text-xs italic" style={{ color: '#64748B' }}>{analysis.verdict}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex md:flex-col gap-2 shrink-0">
                    <GradientButton
                      size="sm"
                      className="justify-center"
                      onClick={() => router.push(`/cv-agent?jd=${encodeURIComponent(job.description ?? '')}&role=${encodeURIComponent(job.title)}`)}>
                      <FileText className="w-3.5 h-3.5" /> Tailor CV
                    </GradientButton>
                    {job.url && (
                      <SecondaryButton size="sm" className="justify-center" onClick={() => window.open(job.url!, '_blank')}>
                        <ExternalLink className="w-3.5 h-3.5" /> View Job
                      </SecondaryButton>
                    )}
                  </div>
                </div>
              </GlassCard>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}
