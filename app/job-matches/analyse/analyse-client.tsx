'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { GradientButton } from '@/components/ui/GradientButton'
import { SecondaryButton } from '@/components/ui/SecondaryButton'
import { Loader2, ArrowLeft, ExternalLink, CheckCircle, Check } from 'lucide-react'
import type { JobFitResult, ScoreBreakdown } from '@/lib/types/database'

interface SearchJob {
  id: string
  title: string
  company: string | null
  location: string | null
  salary_min: number | null
  salary_max: number | null
  currency: string
  description: string | null
  url: string | null
}

interface AnalysisState {
  status: 'pending' | 'resolved' | 'error'
  result?: JobFitResult
  error?: string
}

const SCORE_LABELS: Record<keyof ScoreBreakdown, string> = {
  technicalSkillsMatch: 'Technical Skills',
  experienceSeniorityMatch: 'Experience Match',
  evidenceStrength: 'Evidence Strength',
  domainIndustryMatch: 'Domain Match',
  locationRemoteCompatibility: 'Location / Remote',
  salaryCompatibility: 'Salary Fit',
  visaWorkAuthorizationCompatibility: 'Visa / Work Auth',
  roleTrajectoryFit: 'Career Trajectory',
}

function scoreColor(n: number): string {
  return n >= 75 ? '#22C55E' : n >= 55 ? '#F59E0B' : '#EF4444'
}

function formatSalary(min: number | null, max: number | null, currency: string): string {
  const sym = currency === 'USD' ? '$' : currency === 'INR' ? '₹' : '£'
  if (min != null && max != null && min !== max) return `${sym}${min.toLocaleString()} – ${sym}${max.toLocaleString()}`
  if (min != null) return `From ${sym}${min.toLocaleString()}`
  if (max != null) return `Up to ${sym}${max.toLocaleString()}`
  return ''
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = scoreColor(value)
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs" style={{ color: '#94A3B8' }}>{label}</span>
        <span className="text-xs font-semibold" style={{ color }}>{value}</span>
      </div>
      <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  )
}

function ToggleRow({
  label, icon, subtitle, value, onChange,
}: { label: string; icon: string; subtitle: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label
      className="flex items-center justify-between rounded-xl px-3 py-2.5 cursor-pointer"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center gap-2.5">
        <span className="text-base">{icon}</span>
        <div>
          <p className="text-xs font-semibold text-white">{label}</p>
          <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{subtitle}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={e => { e.preventDefault(); onChange(!value) }}
        className="relative flex-shrink-0 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-violet-500"
        style={{
          width: 36, height: 20,
          background: value ? 'linear-gradient(135deg,#8B5CF6,#06B6D4)' : 'rgba(255,255,255,0.10)',
        }}
        aria-checked={value}
        role="switch">
        <span
          className="absolute top-0.5 rounded-full bg-white transition-all"
          style={{ width: 16, height: 16, left: value ? 18 : 2, opacity: value ? 1 : 0.5 }}
        />
      </button>
    </label>
  )
}

interface PipelineWizardProps {
  jobId: string
  matchScore: number
  onClose: () => void
  onSuccess: () => void
}

function PipelineWizard({ jobId, matchScore, onClose, onSuccess }: PipelineWizardProps) {
  const [wantCv, setWantCv] = useState(true)
  const [wantCoverLetter, setWantCoverLetter] = useState(true)
  const [wantRecruiterMsg, setWantRecruiterMsg] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/jobs/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          matchScore,
          wantCv,
          wantCoverLetter,
          wantRecruiterMessage: wantRecruiterMsg,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string }
        setError(body.error ?? 'Failed to add to pipeline')
        return
      }
      onSuccess()
    } catch {
      setError('Failed to add to pipeline. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="mt-4 rounded-2xl p-4"
      style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)' }}>
      <p className="text-xs font-bold text-white mb-0.5">What should the agent generate?</p>
      <p className="text-xs mb-3" style={{ color: '#64748B' }}>
        All documents use your primary CV and the job description above.
      </p>
      <div className="flex flex-col gap-2 mb-4">
        <ToggleRow label="Tailor CV to this role" icon="📄" subtitle="Rewrite your CV targeting this JD · ATS-optimised" value={wantCv} onChange={setWantCv} />
        <ToggleRow label="Cover letter" icon="✉️" subtitle="Role-specific, professional tone" value={wantCoverLetter} onChange={setWantCoverLetter} />
        <ToggleRow label="Recruiter message" icon="💬" subtitle="LinkedIn outreach · concise, direct" value={wantRecruiterMsg} onChange={setWantRecruiterMsg} />
      </div>
      {error && <p className="text-xs mb-3" style={{ color: '#EF4444' }}>{error}</p>}
      <div className="flex items-center gap-2">
        <GradientButton size="sm" onClick={handleSubmit} disabled={submitting} className="flex-1 justify-center">
          {submitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Adding…</> : '⚡ Generate & Add to Applications'}
        </GradientButton>
        <SecondaryButton size="sm" onClick={onClose}>Cancel</SecondaryButton>
      </div>
      <p className="text-xs mt-3 text-center" style={{ color: '#64748B' }}>
        Job saved to Applications board · Documents ready in ~30 seconds
      </p>
    </div>
  )
}

interface AnalysisCardProps {
  job: SearchJob
  state: AnalysisState
  onRetry: () => void
  wizardOpen: boolean
  onOpenWizard: () => void
  onCloseWizard: () => void
}

function AnalysisCard({ job, state, onRetry, wizardOpen, onOpenWizard, onCloseWizard }: AnalysisCardProps) {
  const [added, setAdded] = useState(false)
  const salary = formatSalary(job.salary_min, job.salary_max, job.currency)
  const result = state.result
  const borderColor = result
    ? result.fitScore >= 75 ? 'rgba(34,197,94,0.25)'
    : result.fitScore >= 55 ? 'rgba(245,158,11,0.2)'
    : 'rgba(239,68,68,0.2)'
    : 'rgba(255,255,255,0.08)'

  const bgColor = result
    ? result.fitScore >= 75 ? 'rgba(34,197,94,0.04)'
    : result.fitScore >= 55 ? 'rgba(245,158,11,0.03)'
    : 'rgba(239,68,68,0.03)'
    : 'transparent'

  return (
    <div
      className="rounded-3xl p-5"
      style={{
        background: `${bgColor}, rgba(255,255,255,0.045)`,
        border: `1px solid ${borderColor}`,
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
      }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-heading font-semibold text-white text-base">{job.title}</h3>
          <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>
            {[job.company, job.location, salary].filter(Boolean).join(' · ')}
          </p>
          {result && (
            <div
              className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg"
              style={{
                background: result.fitScore >= 75 ? 'rgba(34,197,94,0.12)' : result.fitScore >= 55 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
                border: `1px solid ${borderColor}`,
              }}>
              <span className="font-heading font-bold text-xl" style={{ color: scoreColor(result.fitScore) }}>
                {result.fitScore}
              </span>
              <div>
                <p className="text-xs font-semibold leading-none" style={{ color: scoreColor(result.fitScore) }}>/100</p>
                <p className="text-xs leading-none mt-0.5" style={{ color: scoreColor(result.fitScore) }}>{result.matchCategory}</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {job.url && (
            <SecondaryButton size="sm" onClick={() => window.open(job.url!, '_blank')}>
              <ExternalLink className="w-3 h-3" /> View Job
            </SecondaryButton>
          )}
          {state.status === 'resolved' && !added && (
            <GradientButton size="sm" onClick={onOpenWizard}>
              Add to Pipeline →
            </GradientButton>
          )}
          {added && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}>
              <CheckCircle className="w-3.5 h-3.5" /> Added!
            </div>
          )}
        </div>
      </div>

      {/* Pending state */}
      {state.status === 'pending' && (
        <div className="space-y-2">
          {[80, 60, 70, 90].map((w, i) => (
            <div key={i} className="h-2 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.06)', width: `${w}%` }} />
          ))}
          <div className="flex items-center gap-2 mt-3" style={{ color: '#8B5CF6' }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#8B5CF6' }} />
            <span className="text-xs">Analysing…</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {state.status === 'error' && (
        <div className="flex items-center gap-3">
          <p className="text-xs flex-1" style={{ color: '#EF4444' }}>{state.error ?? 'Analysis failed.'}</p>
          <SecondaryButton size="sm" onClick={onRetry}>Retry</SecondaryButton>
        </div>
      )}

      {/* Resolved state */}
      {state.status === 'resolved' && result && (
        <>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
            {(Object.keys(SCORE_LABELS) as (keyof ScoreBreakdown)[]).map(key => (
              <ScoreBar key={key} label={SCORE_LABELS[key]} value={result.scoreBreakdown[key]} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 mb-3">
            {result.strengths.length > 0 && (
              <div>
                <p className="text-xs font-semibold mb-1.5" style={{ color: '#22C55E' }}>Strengths</p>
                <ul className="space-y-1">
                  {result.strengths.slice(0, 3).map(s => (
                    <li key={s} className="flex items-start gap-1.5 text-xs" style={{ color: '#94A3B8' }}>
                      <Check className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: '#22C55E' }} /> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.missingSkills.length > 0 && (
              <div>
                <p className="text-xs font-semibold mb-1.5" style={{ color: '#EF4444' }}>Gaps</p>
                <ul className="space-y-1">
                  {result.missingSkills.slice(0, 3).map(g => (
                    <li key={g} className="flex items-start gap-1.5 text-xs" style={{ color: '#94A3B8' }}>
                      <span className="flex-shrink-0 mt-0.5" style={{ color: '#EF4444' }}>✗</span> {g}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {result.summary && (
            <p className="text-xs italic mb-3" style={{ color: '#64748B' }}>{result.summary}</p>
          )}
        </>
      )}

      {/* Pipeline wizard inline */}
      {wizardOpen && state.status === 'resolved' && result && (
        <PipelineWizard
          jobId={job.id}
          matchScore={result.fitScore}
          onClose={onCloseWizard}
          onSuccess={() => { onCloseWizard(); setAdded(true) }}
        />
      )}
    </div>
  )
}

export default function AnalyseClient({ jobIds }: { jobIds: string[] }) {
  const router = useRouter()
  const [jobs, setJobs] = useState<SearchJob[]>([])
  const [analyses, setAnalyses] = useState<Record<string, AnalysisState>>({})
  const [openWizard, setOpenWizard] = useState<string | null>(null)
  const [loadingJobs, setLoadingJobs] = useState(true)

  const runAnalysis = async (job: SearchJob, signal?: AbortSignal) => {
    try {
      const fitRes = await fetch('/api/jobs/fit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: job.title,
          jobDescription: job.description ?? job.title,
          companyName: job.company ?? undefined,
          jobUrl: job.url ?? undefined,
          location: job.location ?? undefined,
        }),
        signal,
      })
      if (!fitRes.ok) {
        const errBody = await fitRes.json().catch(() => ({})) as { error?: string }
        setAnalyses(prev => ({ ...prev, [job.id]: { status: 'error', error: errBody.error ?? 'Analysis failed' } }))
        return
      }
      const fitData = await fitRes.json() as { analysis: JobFitResult }
      setAnalyses(prev => ({ ...prev, [job.id]: { status: 'resolved', result: fitData.analysis } }))
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return
      const msg = e instanceof Error ? e.message : 'Analysis failed'
      setAnalyses(prev => ({ ...prev, [job.id]: { status: 'error', error: msg } }))
    }
  }

  useEffect(() => {
    if (jobIds.length === 0) return
    const controller = new AbortController()
    const { signal } = controller

    void (async () => {
      const init: Record<string, AnalysisState> = {}
      jobIds.forEach(id => { init[id] = { status: 'pending' } })
      setAnalyses(init)
      setLoadingJobs(true)
      const res = await fetch(`/api/jobs/search?ids=${jobIds.join(',')}`, { signal })
      if (!res.ok) { setLoadingJobs(false); return }
      const data = await res.json() as { jobs: SearchJob[] }
      setJobs(data.jobs)
      setLoadingJobs(false)
      void Promise.allSettled(data.jobs.map(j => runAnalysis(j, signal)))
    })()

    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobIds.join(',')])

  const completedCount = Object.values(analyses).filter(a => a.status !== 'pending').length
  const allDone = completedCount === jobIds.length && jobIds.length > 0

  const sortedJobs = [...jobs].sort((a, b) => {
    const sa = analyses[a.id]
    const sb = analyses[b.id]
    if (sa?.status === 'resolved' && sb?.status === 'resolved') {
      return (sb.result?.fitScore ?? 0) - (sa.result?.fitScore ?? 0)
    }
    if (sa?.status === 'resolved') return -1
    if (sb?.status === 'resolved') return 1
    return 0
  })

  if (jobIds.length === 0) {
    return (
      <DashboardLayout title="Job Fit Analysis">
        <div className="text-center py-16" style={{ color: '#64748B' }}>
          <p className="text-sm mb-4">No jobs selected. Go back and select up to 5 jobs to analyse.</p>
          <SecondaryButton size="sm" onClick={() => router.push('/job-matches')}>
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Job Matches
          </SecondaryButton>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Job Fit Analysis">
      <div className="flex items-start justify-between mb-6">
        <div>
          <button
            onClick={() => router.push('/job-matches')}
            className="flex items-center gap-1.5 text-xs mb-2 transition-colors hover:text-white"
            style={{ color: '#64748B' }}>
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Job Matches
          </button>
          <h1 className="font-heading font-bold text-white text-xl">Job Fit Analysis</h1>
          <p className="text-xs mt-1" style={{ color: '#64748B' }}>
            {allDone
              ? `${jobIds.length} of ${jobIds.length} complete · sorted by score`
              : `${completedCount} of ${jobIds.length} complete`}
          </p>
        </div>
        {!allDone && (
          <div className="flex items-center gap-2" style={{ color: '#8B5CF6' }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#8B5CF6' }} />
            <span className="text-xs">Analysing…</span>
          </div>
        )}
      </div>

      {loadingJobs ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#8B5CF6' }} />
        </div>
      ) : (
        <div className="space-y-4">
          {sortedJobs.map(job => (
            <AnalysisCard
              key={job.id}
              job={job}
              state={analyses[job.id] ?? { status: 'pending' }}
              onRetry={() => void runAnalysis(job)}
              wizardOpen={openWizard === job.id}
              onOpenWizard={() => setOpenWizard(job.id)}
              onCloseWizard={() => setOpenWizard(null)}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
