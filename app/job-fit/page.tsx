'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { SecondaryButton } from '@/components/ui/SecondaryButton'
import {
  Target, Loader2, ChevronDown, ChevronUp, ExternalLink,
  CheckCircle, AlertTriangle, XCircle, Lightbulb, TrendingUp,
  MessageSquare, BarChart3, ArrowLeft,
} from 'lucide-react'
import type { JobFitAnalysisWithJob, UserFeedback, ApplicationOutcome, ScoreBreakdown } from '@/lib/types/database'

type View = 'input' | 'result' | 'list'

const DIMENSION_LABELS: Record<keyof ScoreBreakdown, string> = {
  technicalSkillsMatch: 'Technical Skills',
  experienceSeniorityMatch: 'Experience & Seniority',
  evidenceStrength: 'Evidence Strength',
  domainIndustryMatch: 'Domain & Industry',
  locationRemoteCompatibility: 'Location / Remote',
  salaryCompatibility: 'Salary Compatibility',
  visaWorkAuthorizationCompatibility: 'Visa / Work Auth',
  roleTrajectoryFit: 'Role Trajectory',
}

const DIMENSION_WEIGHTS: Record<keyof ScoreBreakdown, number> = {
  technicalSkillsMatch: 25,
  experienceSeniorityMatch: 20,
  evidenceStrength: 15,
  domainIndustryMatch: 10,
  locationRemoteCompatibility: 10,
  salaryCompatibility: 5,
  visaWorkAuthorizationCompatibility: 10,
  roleTrajectoryFit: 5,
}

function categoryColor(cat: string) {
  if (cat === 'Strong Match') return { color: '#22C55E', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)' }
  if (cat === 'Stretch Match') return { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' }
  return { color: '#EF4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' }
}

function scoreColor(score: number) {
  if (score >= 75) return '#22C55E'
  if (score >= 55) return '#F59E0B'
  return '#EF4444'
}

function ScoreBar({ label, value, weight }: { label: string; value: number; weight: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: '#94A3B8' }}>{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: '#64748B' }}>{weight}% weight</span>
          <span className="text-xs font-semibold" style={{ color: scoreColor(value) }}>{value}</span>
        </div>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, background: scoreColor(value) }}
        />
      </div>
    </div>
  )
}

function FitResultView({
  analysis,
  onBack,
  onFeedback,
}: {
  analysis: JobFitAnalysisWithJob
  onBack: () => void
  onFeedback: (f: UserFeedback, o: ApplicationOutcome) => void
}) {
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackSent, setFeedbackSent] = useState(false)
  const cat = categoryColor(analysis.match_category)
  const job = analysis.saved_job

  const handleFeedback = async (uf: UserFeedback, ao: ApplicationOutcome) => {
    await fetch(`/api/jobs/fit/${analysis.id}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userFeedback: uf, applicationOutcome: ao }),
    })
    setFeedbackSent(true)
    onFeedback(uf, ao)
  }

  return (
    <div className="space-y-5">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm transition-colors"
        style={{ color: '#64748B' }}>
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative w-20 h-20 shrink-0">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <circle
                cx="40" cy="40" r="34" fill="none"
                stroke={scoreColor(analysis.fit_score)} strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(analysis.fit_score / 100) * 213.6} 213.6`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-heading font-bold text-lg" style={{ color: scoreColor(analysis.fit_score) }}>
                {analysis.fit_score}
              </span>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="font-heading font-semibold text-white text-xl mb-1">{job.job_title}</h2>
            {job.company_name && <p className="text-sm mb-2" style={{ color: '#94A3B8' }}>{job.company_name}</p>}
            <span
              className="inline-block text-sm font-semibold px-3 py-1 rounded-full"
              style={{ color: cat.color, background: cat.bg, border: `1px solid ${cat.border}` }}>
              {analysis.match_category}
            </span>
          </div>
        </div>
        {analysis.summary && (
          <p className="mt-4 text-sm leading-relaxed" style={{ color: '#94A3B8' }}>{analysis.summary}</p>
        )}
        {job.job_url && (
          <a href={job.job_url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs mt-3 transition-colors"
            style={{ color: '#8B5CF6' }}>
            <ExternalLink className="w-3.5 h-3.5" /> View Job Posting
          </a>
        )}
      </GlassCard>

      <GlassCard className="p-5">
        <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" style={{ color: '#8B5CF6' }} /> Score Breakdown
        </h3>
        <div className="space-y-3">
          {(Object.entries(analysis.score_breakdown) as [keyof ScoreBreakdown, number][]).map(([key, val]) => (
            <ScoreBar key={key} label={DIMENSION_LABELS[key]} value={val} weight={DIMENSION_WEIGHTS[key]} />
          ))}
        </div>
      </GlassCard>

      <div className="grid md:grid-cols-2 gap-4">
        {analysis.strengths.length > 0 && (
          <GlassCard className="p-5">
            <h3 className="font-heading font-semibold text-white mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" style={{ color: '#22C55E' }} /> Strengths
            </h3>
            <ul className="space-y-2">
              {analysis.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#94A3B8' }}>
                  <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: '#22C55E' }} /> {s}
                </li>
              ))}
            </ul>
          </GlassCard>
        )}
        {analysis.risks.length > 0 && (
          <GlassCard className="p-5">
            <h3 className="font-heading font-semibold text-white mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" style={{ color: '#F59E0B' }} /> Risks
            </h3>
            <ul className="space-y-2">
              {analysis.risks.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#94A3B8' }}>
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: '#F59E0B' }} /> {r}
                </li>
              ))}
            </ul>
          </GlassCard>
        )}
      </div>

      {(analysis.missing_skills.length > 0 || analysis.evidence_gaps.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {analysis.missing_skills.length > 0 && (
            <GlassCard className="p-5">
              <h3 className="font-heading font-semibold text-white mb-3 flex items-center gap-2">
                <XCircle className="w-4 h-4" style={{ color: '#EF4444' }} /> Missing Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.missing_skills.map((s, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                    {s}
                  </span>
                ))}
              </div>
            </GlassCard>
          )}
          {analysis.evidence_gaps.length > 0 && (
            <GlassCard className="p-5">
              <h3 className="font-heading font-semibold text-white mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" style={{ color: '#F59E0B' }} /> Evidence Gaps
              </h3>
              <ul className="space-y-2">
                {analysis.evidence_gaps.map((g, i) => (
                  <li key={i} className="text-sm" style={{ color: '#94A3B8' }}>• {g}</li>
                ))}
              </ul>
            </GlassCard>
          )}
        </div>
      )}

      {(analysis.recommended_next_action || analysis.application_strategy) && (
        <GlassCard className="p-5">
          <h3 className="font-heading font-semibold text-white mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" style={{ color: '#06B6D4' }} /> Recommendations
          </h3>
          {analysis.recommended_next_action && (
            <div className="mb-3">
              <p className="text-xs font-semibold mb-1" style={{ color: '#06B6D4' }}>Next Action</p>
              <p className="text-sm" style={{ color: '#94A3B8' }}>{analysis.recommended_next_action}</p>
            </div>
          )}
          {analysis.application_strategy && (
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: '#8B5CF6' }}>Application Strategy</p>
              <p className="text-sm" style={{ color: '#94A3B8' }}>{analysis.application_strategy}</p>
            </div>
          )}
        </GlassCard>
      )}

      {(analysis.location_notes || analysis.salary_notes || analysis.visa_notes) && (
        <GlassCard className="p-5">
          <h3 className="font-heading font-semibold text-white mb-3">Additional Notes</h3>
          <div className="space-y-2 text-sm" style={{ color: '#94A3B8' }}>
            {analysis.location_notes && <p><span className="font-medium text-white">Location:</span> {analysis.location_notes}</p>}
            {analysis.salary_notes && <p><span className="font-medium text-white">Salary:</span> {analysis.salary_notes}</p>}
            {analysis.visa_notes && <p><span className="font-medium text-white">Visa:</span> {analysis.visa_notes}</p>}
          </div>
        </GlassCard>
      )}

      <GlassCard className="p-5">
        <button
          onClick={() => setShowFeedback(!showFeedback)}
          className="flex items-center gap-2 text-sm font-medium w-full"
          style={{ color: '#64748B' }}>
          <MessageSquare className="w-4 h-4" />
          {feedbackSent ? 'Feedback recorded — thank you' : 'Rate this analysis'}
          {!feedbackSent && (showFeedback ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />)}
        </button>
        {showFeedback && !feedbackSent && (
          <div className="mt-4">
            <p className="text-xs font-medium mb-2" style={{ color: '#94A3B8' }}>Was this score accurate?</p>
            <div className="flex flex-wrap gap-2">
              {(['accurate', 'too_high', 'too_low', 'not_relevant'] as UserFeedback[]).map(f => (
                <button key={f} onClick={() => handleFeedback(f, 'not_applied')}
                  className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        )}
      </GlassCard>

      <div className="flex gap-3">
        <GradientButton
          size="sm"
          onClick={() => {
            window.location.href = `/cv-agent?jd=${encodeURIComponent(job.job_description)}&role=${encodeURIComponent(job.job_title)}`
          }}>
          Tailor CV for This Role
        </GradientButton>
        <SecondaryButton size="sm" onClick={onBack}>
          Analyse Another Job
        </SecondaryButton>
      </div>
    </div>
  )
}

function AnalysisList({
  analyses,
  onSelect,
  onNew,
}: {
  analyses: JobFitAnalysisWithJob[]
  onSelect: (a: JobFitAnalysisWithJob) => void
  onNew: () => void
}) {
  if (analyses.length === 0) {
    return (
      <div className="text-center py-16" style={{ color: '#64748B' }}>
        <Target className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm mb-4">No job fit analyses yet.</p>
        <GradientButton size="sm" onClick={onNew}>Analyse Your First Job</GradientButton>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading font-semibold text-white">Saved Analyses ({analyses.length})</h2>
        <GradientButton size="sm" onClick={onNew}>+ New Analysis</GradientButton>
      </div>
      {analyses.map(a => {
        const cat = categoryColor(a.match_category)
        return (
          <button key={a.id} onClick={() => onSelect(a)} className="w-full text-left">
            <GlassCard hover className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full shrink-0"
                  style={{ background: cat.bg, border: `1px solid ${cat.border}` }}>
                  <span className="font-heading font-bold text-sm" style={{ color: cat.color }}>
                    {a.fit_score}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">{a.saved_job.job_title}</p>
                  {a.saved_job.company_name && (
                    <p className="text-xs truncate" style={{ color: '#94A3B8' }}>{a.saved_job.company_name}</p>
                  )}
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full shrink-0"
                  style={{ color: cat.color, background: cat.bg, border: `1px solid ${cat.border}` }}>
                  {a.match_category}
                </span>
              </div>
            </GlassCard>
          </button>
        )
      })}
    </div>
  )
}

export default function JobFitPage() {
  const [view, setView] = useState<View>('input')
  const [jobTitle, setJobTitle] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [jobUrl, setJobUrl] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeAnalysis, setActiveAnalysis] = useState<JobFitAnalysisWithJob | null>(null)
  const [savedAnalyses, setSavedAnalyses] = useState<JobFitAnalysisWithJob[]>([])
  const [loadingList, setLoadingList] = useState(false)

  const loadSaved = useCallback(async () => {
    setLoadingList(true)
    try {
      const res = await fetch('/api/jobs/fit/list')
      if (res.ok) {
        const data = await res.json() as JobFitAnalysisWithJob[]
        setSavedAnalyses(data)
      }
    } finally {
      setLoadingList(false)
    }
  }, [])

  useEffect(() => { void loadSaved() }, [loadSaved])

  const handleAnalyse = async () => {
    if (!jobTitle.trim() || !jobDescription.trim()) {
      setError('Job title and description are required.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/jobs/fit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: jobTitle.trim(),
          jobDescription: jobDescription.trim(),
          companyName: companyName.trim() || undefined,
          jobUrl: jobUrl.trim() || undefined,
        }),
      })
      const data = await res.json() as { analysis: JobFitAnalysisWithJob; error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Analysis failed. Please try again.')
        return
      }
      setActiveAnalysis(data.analysis)
      setSavedAnalyses(prev => [data.analysis, ...prev])
      setView('result')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout title="Job Fit">
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.04)' }}>
        {(['input', 'list'] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={view === v
              ? { background: 'rgba(139,92,246,0.2)', color: '#8B5CF6' }
              : { color: '#64748B' }}>
            {v === 'input' ? 'Analyse Job' : `Saved (${savedAnalyses.length})`}
          </button>
        ))}
      </div>

      {view === 'input' && (
        <div className="max-w-2xl space-y-4">
          <GlassCard className="p-5 space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#94A3B8' }}>
                  Job Title <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#94A3B8' }}>
                  Company Name
                </label>
                <input
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Ltd"
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#94A3B8' }}>
                Job URL (optional)
              </label>
              <input
                value={jobUrl}
                onChange={e => setJobUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#94A3B8' }}>
                Job Description <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <textarea
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                rows={12}
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none resize-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
              />
            </div>
            {error && <p className="text-sm" style={{ color: '#EF4444' }}>{error}</p>}
            <GradientButton onClick={handleAnalyse} disabled={loading} className="w-full justify-center">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Analysing fit…</>
                : <><Target className="w-4 h-4" /> Analyse Job Fit</>}
            </GradientButton>
            <p className="text-xs text-center" style={{ color: '#64748B' }}>
              Requires a primary CV uploaded in your profile. Analysis takes ~15 seconds.
            </p>
          </GlassCard>
        </div>
      )}

      {view === 'result' && activeAnalysis && (
        <FitResultView
          analysis={activeAnalysis}
          onBack={() => setView(savedAnalyses.length > 0 ? 'list' : 'input')}
          onFeedback={() => {}}
        />
      )}

      {view === 'list' && (
        loadingList
          ? <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin" style={{ color: '#8B5CF6' }} /></div>
          : <AnalysisList
              analyses={savedAnalyses}
              onSelect={a => { setActiveAnalysis(a); setView('result') }}
              onNew={() => setView('input')}
            />
      )}
    </DashboardLayout>
  )
}
