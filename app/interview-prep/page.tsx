'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { SecondaryButton } from '@/components/ui/SecondaryButton'
import { ChevronDown, ChevronUp, Zap, Brain, Tag } from 'lucide-react'
import { getBrowserClient } from '@/lib/supabase-browser'
import type { CV, UserJobWithJob, InterviewQuestion } from '@/lib/types/database'

const difficultyColor: Record<string, string> = {
  easy: '#22C55E',
  medium: '#F59E0B',
  hard: '#EF4444',
}

export default function InterviewPrepPage() {
  const [userJobs, setUserJobs] = useState<UserJobWithJob[]>([])
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [cvList, setCvList] = useState<CV[]>([])
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [generating, setGenerating] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [practiceMode, setPracticeMode] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>('All')
  const [error, setError] = useState<string | null>(null)
  const [revealedCards, setRevealedCards] = useState<Set<string>>(new Set())

  useEffect(() => {
    const supabase = getBrowserClient()
    ;(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const [{ data: jobs }, { data: cvs }] = await Promise.all([
          supabase
            .from('user_jobs')
            .select('*, job:jobs(*)')
            .eq('user_id', user.id)
            .neq('status', 'rejected')
            .order('created_at', { ascending: false }),
          supabase
            .from('cvs')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
        ])

        const jobList = (jobs as UserJobWithJob[]) ?? []
        const cvs2 = (cvs as CV[]) ?? []
        setUserJobs(jobList)
        setCvList(cvs2)

        if (jobList.length > 0) setSelectedJobId(jobList[0].job_id)
        const primary = cvs2.find((c) => c.is_primary) ?? cvs2[0]
        if (primary) setSelectedCvId(primary.id)
      } catch {
        // leave lists empty — user sees empty state
      }
    })()
  }, [])

  const handleGenerate = async () => {
    if (!selectedCvId || !selectedJobId) return
    setGenerating(true)
    setError(null)
    setQuestions([])
    setCategoryFilter('All')
    setExpanded(null)
    setRevealedCards(new Set())
    try {
      const res = await fetch('/api/interview/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvId: selectedCvId, jobId: selectedJobId }),
      })
      if (res.status === 429) {
        setError('Daily limit reached. Upgrade your plan for more.')
        return
      }
      if (!res.ok) {
        setError('Failed to generate questions. Please try again.')
        return
      }
      const data = await res.json()
      setQuestions(data.questions)
    } catch {
      setError('Failed to generate questions. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const selectedJob = userJobs.find((uj) => uj.job_id === selectedJobId)

  const visibleQuestions = categoryFilter === 'All'
    ? questions
    : questions.filter((q) => q.category === categoryFilter)

  const activeCategories = ['All', ...Array.from(new Set(questions.map((q) => q.category)))]

  return (
    <DashboardLayout title="Interview Prep">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: controls */}
        <div className="space-y-4">
          <GlassCard className="p-5">
            <h3 className="font-heading font-semibold text-white mb-4">Prepare for</h3>
            {userJobs.length === 0 ? (
              <p className="text-sm" style={{ color: '#64748B' }}>No active applications yet.</p>
            ) : (
              <select
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none mb-4"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                value={selectedJobId ?? ''}
                onChange={(e) => {
                  setSelectedJobId(e.target.value)
                  setQuestions([])
                  setCategoryFilter('All')
                }}
              >
                {userJobs.map((uj) => (
                  <option key={uj.id} value={uj.job_id}>
                    {uj.job.title} — {uj.job.company ?? 'Unknown'}
                  </option>
                ))}
              </select>
            )}

            {selectedJob && (
              <div className="rounded-xl p-3" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
                <p className="text-sm font-medium text-white">{selectedJob.job.title}</p>
                <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{selectedJob.job.company ?? '—'}</p>
                {selectedJob.follow_up_date && (
                  <p className="text-xs mt-2" style={{ color: '#F59E0B' }}>
                    Follow-up: {new Date(selectedJob.follow_up_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                )}
              </div>
            )}
          </GlassCard>

          {cvList.length > 1 && (
            <GlassCard className="p-5">
              <h3 className="font-heading font-semibold text-white mb-3">CV to use</h3>
              <select
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                value={selectedCvId ?? ''}
                onChange={(e) => setSelectedCvId(e.target.value)}
              >
                {cvList.map((cv) => (
                  <option key={cv.id} value={cv.id}>
                    {cv.file_name ?? 'Untitled CV'}{cv.is_primary ? ' (Primary)' : ''}
                  </option>
                ))}
              </select>
            </GlassCard>
          )}

          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-white">Practice Mode</h3>
              <button
                onClick={() => setPracticeMode(!practiceMode)}
                className="w-12 h-6 rounded-full transition-colors relative"
                style={{ background: practiceMode ? '#8B5CF6' : 'rgba(255,255,255,0.1)' }}>
                <span className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform"
                  style={{ left: practiceMode ? '26px' : '4px' }} />
              </button>
            </div>
            <p className="text-xs" style={{ color: '#94A3B8' }}>Hide STAR answers until you&apos;ve thought through your own response first</p>
          </GlassCard>

          {error && (
            <p className="text-sm px-4 py-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </p>
          )}

          <GradientButton
            className="w-full justify-center"
            size="sm"
            onClick={handleGenerate}
            disabled={generating || !selectedCvId || !selectedJobId}
          >
            {generating
              ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating…</>
              : <><Zap className="w-3.5 h-3.5" /> Generate Questions</>}
          </GradientButton>
        </div>

        {/* Right: questions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="font-heading font-semibold text-white">
              {generating ? 'Generating…' : questions.length > 0 ? `${visibleQuestions.length} Question${visibleQuestions.length !== 1 ? 's' : ''}` : 'Interview Questions'}
            </h3>
            {questions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {activeCategories.map((cat) => (
                  <button key={cat} onClick={() => setCategoryFilter(cat)}
                    className="text-xs px-3 py-1 rounded-full transition-colors"
                    style={categoryFilter === cat
                      ? { background: 'rgba(139,92,246,0.2)', color: '#8B5CF6' }
                      : { background: 'rgba(255,255,255,0.05)', color: '#64748B' }}>
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Loading skeleton */}
          {generating && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <GlassCard key={i} className="p-5 animate-pulse">
                  <div className="flex gap-2 mb-3">
                    <div className="h-5 w-20 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
                    <div className="h-5 w-12 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
                  </div>
                  <div className="h-4 rounded mb-2" style={{ background: 'rgba(255,255,255,0.08)' }} />
                  <div className="h-4 rounded w-3/4" style={{ background: 'rgba(255,255,255,0.08)' }} />
                </GlassCard>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!generating && questions.length === 0 && (
            <GlassCard className="p-8 text-center">
              <Brain className="w-8 h-8 mx-auto mb-3" style={{ color: '#64748B' }} />
              <p className="text-sm font-medium text-white mb-1">No questions yet</p>
              <p className="text-xs" style={{ color: '#64748B' }}>
                {userJobs.length === 0
                  ? 'Save a job to get started.'
                  : 'Select a job and click Generate Questions.'}
              </p>
            </GlassCard>
          )}

          {/* Question cards */}
          {!generating && visibleQuestions.map((q) => (
            <GlassCard key={q.id} className="overflow-hidden">
              <button
                className="w-full p-5 text-left flex items-start justify-between gap-4"
                onClick={() => setExpanded(expanded === q.id ? null : q.id)}
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(139,92,246,0.12)', color: '#8B5CF6' }}>{q.category}</span>
                    <span className="text-xs font-medium" style={{ color: difficultyColor[q.difficulty] }}>{q.difficulty}</span>
                  </div>
                  <p className="text-sm text-white leading-relaxed">{q.question}</p>
                  {q.keywordsToUse.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Tag className="w-3 h-3 mt-0.5 shrink-0" style={{ color: '#64748B' }} />
                      {q.keywordsToUse.slice(0, 4).map((kw) => (
                        <span key={kw} className="text-xs" style={{ color: '#64748B' }}>{kw}</span>
                      ))}
                    </div>
                  )}
                </div>
                {expanded === q.id
                  ? <ChevronUp className="w-4 h-4 mt-1 shrink-0" style={{ color: '#64748B' }} />
                  : <ChevronDown className="w-4 h-4 mt-1 shrink-0" style={{ color: '#64748B' }} />}
              </button>

              {expanded === q.id && (!practiceMode || revealedCards.has(q.id)) && (
                <div className="px-5 pb-5 border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-4 h-4" style={{ color: '#06B6D4' }} />
                    <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#06B6D4' }}>STAR Framework</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'S — Situation', value: q.starFramework.situation },
                      { label: 'T — Task', value: q.starFramework.task },
                      { label: 'A — Action', value: q.starFramework.action },
                      { label: 'R — Result', value: q.starFramework.result },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <p className="text-xs font-semibold mb-1" style={{ color: '#8B5CF6' }}>{label}</p>
                        <p className="text-sm" style={{ color: '#CBD5E1' }}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {expanded === q.id && practiceMode && !revealedCards.has(q.id) && (
                <div className="px-5 pb-5 border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                  <p className="text-sm mb-3" style={{ color: '#94A3B8' }}>Write your answer before revealing the framework:</p>
                  <textarea
                    className="w-full h-28 px-4 py-3 rounded-xl text-sm text-white outline-none resize-none mb-3"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                    placeholder="Your STAR answer..."
                  />
                  <SecondaryButton size="sm" onClick={() => setRevealedCards((prev) => new Set(prev).add(q.id))}>Reveal framework</SecondaryButton>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
