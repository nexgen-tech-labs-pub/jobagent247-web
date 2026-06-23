'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { SecondaryButton } from '@/components/ui/SecondaryButton'
import { StatusBadge } from '@/components/ui/StatusBadge'
import {
  MapPin, Building2, Banknote, FileText, ExternalLink,
  Search, Loader2, RefreshCw, ChevronLeft, ChevronRight,
  BarChart2, X,
} from 'lucide-react'

const PAGE_SIZE = 10

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

type FetchStatus = 'idle' | 'fetching' | 'done' | 'failed'

function formatSalary(min: number | null, max: number | null, currency: string): string {
  const sym = currency === 'USD' ? '$' : currency === 'INR' ? '₹' : '£'
  if (min && max && min !== max) return `${sym}${min.toLocaleString()} – ${sym}${max.toLocaleString()}`
  if (min) return `From ${sym}${min.toLocaleString()}`
  if (max) return `Up to ${sym}${max.toLocaleString()}`
  return ''
}

function MatchScorePill({ score }: { score: number | null }) {
  if (score === null) return null
  const color = score >= 80 ? '#22C55E' : score >= 60 ? '#F59E0B' : '#EF4444'
  const bg = score >= 80 ? 'rgba(34,197,94,0.12)' : score >= 60 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)'
  return (
    <span className="font-heading font-bold text-xs px-2.5 py-0.5 rounded-full" style={{ color, background: bg }}>
      {score}%
    </span>
  )
}

function Pagination({ page, total, onPage }: { page: number; total: number; onPage: (p: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between mt-6" style={{ color: '#64748B' }}>
      <p className="text-sm">Page {page} of {totalPages} <span className="opacity-60">({total} jobs)</span></p>
      <div className="flex items-center gap-2">
        <button disabled={page <= 1} onClick={() => onPage(page - 1)}
          className="p-2 rounded-lg transition-colors disabled:opacity-30"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const start = Math.max(1, Math.min(page - 2, totalPages - 4))
          const p = start + i
          return (
            <button key={p} onClick={() => onPage(p)}
              className="w-8 h-8 rounded-lg text-sm font-medium transition-colors"
              style={p === page
                ? { background: 'rgba(139,92,246,0.25)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.4)' }
                : { background: 'rgba(255,255,255,0.04)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.06)' }}>
              {p}
            </button>
          )
        })}
        <button disabled={page >= totalPages} onClick={() => onPage(page + 1)}
          className="p-2 rounded-lg transition-colors disabled:opacity-30"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  )
}

export default function JobMatchesPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<SearchJob[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>('idle')
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pendingRunsRef = useRef<{ runId: string; source: string }[]>([])
  const keywordRef = useRef(keyword)
  const typeFilterRef = useRef(typeFilter)

  useEffect(() => { keywordRef.current = keyword }, [keyword])
  useEffect(() => { typeFilterRef.current = typeFilter }, [typeFilter])

  const loadJobs = async (kw = '', tf = 'All', pg = 1) => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(pg), limit: String(PAGE_SIZE) })
    if (kw) params.set('keywords', kw)
    if (tf !== 'All') params.set('type', tf.toLowerCase())
    const res = await fetch(`/api/jobs/search?${params}`)
    if (res.ok) {
      const data = await res.json() as { jobs: SearchJob[]; total: number }
      setJobs(data.jobs)
      setTotal(data.total)
      setPage(pg)
    } else {
      setJobs([])
      setTotal(0)
    }
    setLoading(false)
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void loadJobs() }, [])

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
  }

  const startFetch = async () => {
    setFetchStatus('fetching')
    setFetchError(null)

    const res = await fetch('/api/jobs/fetch', { method: 'POST' })
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { error?: string }
      setFetchStatus('failed')
      setFetchError(body.error ?? 'Failed to start job search')
      return
    }

    const { runs } = await res.json() as { runs: { runId: string; source: string }[] }
    pendingRunsRef.current = [...runs]

    pollRef.current = setInterval(async () => {
      const remaining: { runId: string; source: string }[] = []
      let anyFailed = false

      for (const run of pendingRunsRef.current) {
        const poll = await fetch(`/api/jobs/fetch/${run.runId}?source=${encodeURIComponent(run.source)}`).catch(() => null)
        if (!poll?.ok) { remaining.push(run); continue }
        const { status } = await poll.json() as { status: 'running' | 'done' | 'failed' }
        if (status === 'running') remaining.push(run)
        if (status === 'failed') anyFailed = true
      }

      pendingRunsRef.current = remaining

      if (anyFailed && remaining.length === 0) {
        stopPolling()
        setFetchStatus('failed')
        setFetchError('Job search failed. Please try again.')
        return
      }

      if (remaining.length === 0) {
        stopPolling()
        setFetchStatus('done')
        await loadJobs(keywordRef.current, typeFilterRef.current, 1)
      }
    }, 5000)
  }

  useEffect(() => () => stopPolling(), [])

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else if (next.size < 5) {
        next.add(id)
      }
      return next
    })
  }

  const clearSelection = () => setSelectedIds(new Set())

  const handleAnalyse = () => {
    const ids = [...selectedIds].join(',')
    router.push(`/job-matches/analyse?ids=${ids}`)
  }

  const handleFilter = () => void loadJobs(keyword, typeFilter, 1)
  const handlePage = (p: number) => void loadJobs(keyword, typeFilter, p)
  const isFetching = fetchStatus === 'fetching'

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
            <button key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style={typeFilter === t
                ? { background: 'rgba(139,92,246,0.2)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.4)' }
                : { background: 'rgba(255,255,255,0.05)', color: '#64748B', border: '1px solid rgba(255,255,255,0.08)' }}>
              {t}
            </button>
          ))}
          <SecondaryButton size="sm" onClick={handleFilter} className="shrink-0">
            Apply filters
          </SecondaryButton>
          <GradientButton size="sm" onClick={startFetch} disabled={isFetching} className="shrink-0">
            {isFetching
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Finding…</>
              : <><RefreshCw className="w-3.5 h-3.5" /> Find Jobs</>}
          </GradientButton>
        </div>

        {fetchStatus === 'done' && (
          <p className="text-xs mt-2" style={{ color: '#22C55E' }}>Job search complete — results updated.</p>
        )}
        {fetchError && (
          <p className="text-xs mt-2" style={{ color: '#EF4444' }}>
            {fetchError}
            {fetchError.toLowerCase().includes('profile') && (
              <>
                {' '}<Link href="/profile" className="underline" style={{ color: '#EF4444' }}>Open profile →</Link>
              </>
            )}
          </p>
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
          <GradientButton size="sm" onClick={startFetch} disabled={isFetching}>
            {isFetching ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Finding…</> : 'Find Jobs Now'}
          </GradientButton>
        </div>
      )}

      {!loading && jobs.length > 0 && (
        <>
          {selectedIds.size > 0 && (
            <p className="text-xs mb-3" style={{ color: '#64748B' }}>
              Select up to 5 jobs to analyse together. {selectedIds.size}/5 selected.
            </p>
          )}

          <div className="space-y-4">
            {jobs.map(job => {
              const isSelected = selectedIds.has(job.id)
              const isDisabled = !isSelected && selectedIds.size >= 5
              const salary = formatSalary(job.salary_min, job.salary_max, job.currency)
              const brief = job.description ? job.description.slice(0, 240).trim() : null

              return (
                <GlassCard key={job.id} hover className="p-5">
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleSelect(job.id)}
                      disabled={isDisabled}
                      className="mt-0.5 w-4 h-4 rounded flex-shrink-0 transition-all border focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-1"
                      style={{
                        background: isSelected ? 'linear-gradient(135deg,#8B5CF6,#06B6D4)' : 'transparent',
                        borderColor: isSelected ? '#8B5CF6' : isDisabled ? 'rgba(255,255,255,0.1)' : 'rgba(139,92,246,0.5)',
                        opacity: isDisabled ? 0.35 : 1,
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                      }}
                      aria-label={isSelected ? 'Deselect job' : 'Select job for analysis'}
                    >
                      {isSelected && (
                        <svg viewBox="0 0 12 12" fill="none" className="w-full h-full p-0.5">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-heading font-semibold text-white text-base">{job.title}</h3>
                        <MatchScorePill score={job.match_score} />
                      </div>
                      <div className="flex flex-wrap gap-3 mb-2" style={{ color: '#94A3B8' }}>
                        {job.company && (
                          <span className="flex items-center gap-1 text-xs">
                            <Building2 className="w-3 h-3" /> {job.company}
                          </span>
                        )}
                        {job.location && (
                          <span className="flex items-center gap-1 text-xs">
                            <MapPin className="w-3 h-3" /> {job.location}
                          </span>
                        )}
                        {salary && (
                          <span className="flex items-center gap-1 text-xs">
                            <Banknote className="w-3 h-3" /> {salary}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {job.type && <StatusBadge status={job.type as 'contract' | 'permanent'} />}
                        {job.source_site && (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: '#94A3B8' }}>
                            {job.source_site}
                          </span>
                        )}
                      </div>
                      {brief && (
                        <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: '#64748B' }}>{brief}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <GradientButton
                          size="sm"
                          onClick={() => router.push(`/cv-agent?jd=${encodeURIComponent(job.description ?? '')}&role=${encodeURIComponent(job.title)}`)}>
                          <FileText className="w-3 h-3" /> Tailor CV
                        </GradientButton>
                        {job.url && (
                          <SecondaryButton size="sm" onClick={() => window.open(job.url!, '_blank')}>
                            <ExternalLink className="w-3 h-3" /> View Job
                          </SecondaryButton>
                        )}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              )
            })}
          </div>

          <Pagination page={page} total={total} onPage={handlePage} />
        </>
      )}

      {/* Sticky selection bar */}
      {selectedIds.size > 0 && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl z-50"
          style={{
            background: 'rgba(11,16,32,0.95)',
            border: '1px solid rgba(139,92,246,0.3)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 40px rgba(139,92,246,0.25)',
          }}>
          {/* 5-slot dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  background: i < selectedIds.size ? 'linear-gradient(135deg,#8B5CF6,#06B6D4)' : 'rgba(255,255,255,0.12)',
                  transform: i < selectedIds.size ? 'scale(1.2)' : 'scale(1)',
                }}
              />
            ))}
          </div>
          <span className="text-xs text-white font-medium">
            {selectedIds.size} {selectedIds.size === 1 ? 'job' : 'jobs'} selected
          </span>
          <button
            onClick={clearSelection}
            className="p-1 rounded-lg transition-colors"
            style={{ color: '#64748B' }}
            aria-label="Clear selection">
            <X className="w-3.5 h-3.5" />
          </button>
          <GradientButton size="sm" onClick={handleAnalyse}>
            <BarChart2 className="w-3.5 h-3.5" />
            Analyse {selectedIds.size} {selectedIds.size === 1 ? 'Job' : 'Jobs'} →
          </GradientButton>
        </div>
      )}
    </DashboardLayout>
  )
}
