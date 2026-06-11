'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { SecondaryButton } from '@/components/ui/SecondaryButton'
import {
  BrainCircuit, Loader2, ArrowLeft, CheckCircle, AlertTriangle,
  XCircle, Lightbulb, BarChart3, TrendingUp, Plus, Trash2,
} from 'lucide-react'
import type { ReadinessAnalysis, ReadinessScoreBreakdown, ReadinessLevel } from '@/lib/types/database'

type View = 'input' | 'result' | 'list'

const SENIORITY_OPTIONS = ['Entry', 'Junior', 'Mid', 'Senior', 'Lead', 'Manager', 'Director']
const GEOGRAPHY_OPTIONS = ['UK', 'US', 'India', 'EU', 'Remote', 'Australia', 'Canada']

const DIMENSION_LABELS: Record<keyof ReadinessScoreBreakdown, string> = {
  technicalSkills: 'Technical Skills',
  experienceMatch: 'Experience Match',
  evidenceStrength: 'Evidence Strength',
  industryMatch: 'Industry Match',
  interviewReadiness: 'Interview Readiness',
  profilePositioning: 'Profile Positioning',
}

const DIMENSION_WEIGHTS: Record<keyof ReadinessScoreBreakdown, number> = {
  technicalSkills: 30,
  experienceMatch: 25,
  evidenceStrength: 20,
  industryMatch: 10,
  interviewReadiness: 10,
  profilePositioning: 5,
}

function levelStyle(level: ReadinessLevel) {
  if (level === 'Ready') return { color: '#22C55E', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)' }
  if (level === 'Partially Ready') return { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' }
  return { color: '#EF4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' }
}

function scoreColor(score: number) {
  if (score >= 75) return '#22C55E'
  if (score >= 50) return '#F59E0B'
  return '#EF4444'
}

// ─── Radar Chart ──────────────────────────────────────────────────────────────

const RADAR_DIMS: (keyof ReadinessScoreBreakdown)[] = [
  'technicalSkills',
  'experienceMatch',
  'evidenceStrength',
  'industryMatch',
  'interviewReadiness',
  'profilePositioning',
]

const RADAR_LABELS: Record<keyof ReadinessScoreBreakdown, string> = {
  technicalSkills:    'Technical\nSkills',
  experienceMatch:    'Experience\nMatch',
  evidenceStrength:   'Evidence\nStrength',
  industryMatch:      'Industry\nMatch',
  interviewReadiness: 'Interview\nReadiness',
  profilePositioning: 'Profile\nPositioning',
}

function polygonPoints(values: number[], cx: number, cy: number, r: number): string {
  return RADAR_DIMS.map((_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 6
    const v = (values[i] ?? 0) / 100
    return `${cx + r * v * Math.cos(angle)},${cy + r * v * Math.sin(angle)}`
  }).join(' ')
}

function gridHex(cx: number, cy: number, r: number): string {
  return RADAR_DIMS.map((_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 6
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
  }).join(' ')
}

function RadarChart({ breakdown }: { breakdown: ReadinessScoreBreakdown }) {
  const cx = 160
  const cy = 155
  const r = 100
  const values = RADAR_DIMS.map(k => breakdown[k])

  // Label anchor offsets beyond the outer ring
  const labelOffset = 30

  return (
    <svg viewBox="0 0 320 310" className="w-full max-w-xs mx-auto" aria-hidden="true">
      {/* Grid rings at 20 / 40 / 60 / 80 / 100 */}
      {[20, 40, 60, 80, 100].map(pct => (
        <polygon
          key={pct}
          points={gridHex(cx, cy, r * pct / 100)}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
      ))}

      {/* Grid ring labels (20, 40, 60, 80) */}
      {[20, 40, 60, 80].map(pct => (
        <text
          key={pct}
          x={cx + 4}
          y={cy - r * pct / 100 + 4}
          fontSize="8"
          fill="rgba(255,255,255,0.25)"
          textAnchor="middle"
        >{pct}</text>
      ))}

      {/* Axis spokes */}
      {RADAR_DIMS.map((_, i) => {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 6
        return (
          <line
            key={i}
            x1={cx} y1={cy}
            x2={cx + r * Math.cos(angle)}
            y2={cy + r * Math.sin(angle)}
            stroke="rgba(255,255,255,0.10)"
            strokeWidth="1"
          />
        )
      })}

      {/* Score polygon — filled */}
      <polygon
        points={polygonPoints(values, cx, cy, r)}
        fill="rgba(139,92,246,0.22)"
        stroke="#8B5CF6"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Score dots */}
      {RADAR_DIMS.map((_, i) => {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 6
        const v = (values[i] ?? 0) / 100
        return (
          <circle
            key={i}
            cx={cx + r * v * Math.cos(angle)}
            cy={cy + r * v * Math.sin(angle)}
            r="3"
            fill="#8B5CF6"
            stroke="rgba(139,92,246,0.4)"
            strokeWidth="4"
          />
        )
      })}

      {/* Axis labels (multi-line via tspan) */}
      {RADAR_DIMS.map((dim, i) => {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 6
        const lx = cx + (r + labelOffset) * Math.cos(angle)
        const ly = cy + (r + labelOffset) * Math.sin(angle)
        const lines = RADAR_LABELS[dim].split('\n')

        // Nudge anchor for left-side labels
        let anchor: 'start' | 'middle' | 'end' = 'middle'
        if (lx < cx - 10) anchor = 'end'
        else if (lx > cx + 10) anchor = 'start'

        return (
          <text
            key={dim}
            x={lx}
            y={ly - (lines.length - 1) * 6}
            textAnchor={anchor}
            fontSize="9.5"
            fill="rgba(203,213,225,0.85)"
            fontFamily="Inter, sans-serif"
          >
            {lines.map((line, li) => (
              <tspan key={li} x={lx} dy={li === 0 ? 0 : 13}>{line}</tspan>
            ))}
          </text>
        )
      })}
    </svg>
  )
}

// ─── Score Bar ─────────────────────────────────────────────────────────────────

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

function GapSection({ title, items, color, icon: Icon }: {
  title: string
  items: string[]
  color: string
  icon: React.FC<{ className?: string; style?: React.CSSProperties }>
}) {
  if (items.length === 0) return null
  return (
    <GlassCard className="p-5">
      <h3 className="font-heading font-semibold text-white mb-3 flex items-center gap-2">
        <Icon className="w-4 h-4" style={{ color }} /> {title}
        <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: `${color}1a`, color, border: `1px solid ${color}33` }}>
          {items.length}
        </span>
      </h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#94A3B8' }}>
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
            {item}
          </li>
        ))}
      </ul>
    </GlassCard>
  )
}

function ReportView({ analysis, onBack }: { analysis: ReadinessAnalysis; onBack: () => void }) {
  const lvl = levelStyle(analysis.readiness_level)

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-2 text-sm transition-colors" style={{ color: '#64748B' }}>
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative w-24 h-24 shrink-0">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <circle
                cx="48" cy="48" r="40" fill="none"
                stroke={scoreColor(analysis.overall_score)} strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(analysis.overall_score / 100) * 251.3} 251.3`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-heading font-bold text-2xl" style={{ color: scoreColor(analysis.overall_score) }}>
                {analysis.overall_score}
              </span>
              <span className="text-xs" style={{ color: '#64748B' }}>/ 100</span>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="font-heading font-semibold text-white text-xl mb-1">{analysis.target_job_title}</h2>
            <div className="flex flex-wrap gap-2 mb-2">
              {analysis.target_seniority && (
                <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(139,92,246,0.12)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.25)' }}>
                  {analysis.target_seniority}
                </span>
              )}
              {analysis.target_geography && (
                <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(6,182,212,0.12)', color: '#06B6D4', border: '1px solid rgba(6,182,212,0.25)' }}>
                  {analysis.target_geography}
                </span>
              )}
            </div>
            <span className="inline-block text-sm font-semibold px-3 py-1 rounded-full"
              style={{ color: lvl.color, background: lvl.bg, border: `1px solid ${lvl.border}` }}>
              {analysis.readiness_level}
            </span>
          </div>
        </div>
        {analysis.evidence_summary && (
          <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: '#64748B' }}>Evidence Quality</p>
            <p className="text-sm leading-relaxed" style={{ color: '#94A3B8' }}>{analysis.evidence_summary}</p>
          </div>
        )}
      </GlassCard>

      <GlassCard className="p-5">
        <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" style={{ color: '#8B5CF6' }} /> Score Breakdown
        </h3>
        <RadarChart breakdown={analysis.score_breakdown} />
        <div className="mt-5 space-y-3">
          {(Object.entries(analysis.score_breakdown) as [keyof ReadinessScoreBreakdown, number][]).map(([key, val]) => (
            <ScoreBar key={key} label={DIMENSION_LABELS[key]} value={val} weight={DIMENSION_WEIGHTS[key]} />
          ))}
        </div>
      </GlassCard>

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

      <GapSection title="Critical Gaps" items={analysis.critical_gaps} color="#EF4444" icon={XCircle} />
      <GapSection title="Important Gaps" items={analysis.important_gaps} color="#F59E0B" icon={AlertTriangle} />
      <GapSection title="Nice-to-Have Gaps" items={analysis.nice_to_have_gaps} color="#64748B" icon={TrendingUp} />

      {analysis.recommendations.length > 0 && (
        <GlassCard className="p-5">
          <h3 className="font-heading font-semibold text-white mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" style={{ color: '#06B6D4' }} /> Recommended Actions
          </h3>
          <ol className="space-y-3">
            {analysis.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                  style={{ background: 'rgba(6,182,212,0.15)', color: '#06B6D4', border: '1px solid rgba(6,182,212,0.25)' }}>
                  {i + 1}
                </span>
                <p className="text-sm" style={{ color: '#94A3B8' }}>{rec}</p>
              </li>
            ))}
          </ol>
        </GlassCard>
      )}

      <p className="text-xs text-center" style={{ color: '#475569' }}>
        Scores are guidance only and do not guarantee interviews or hiring outcomes.
      </p>

      <div className="flex gap-3">
        <GradientButton size="sm" onClick={() => {
          window.location.href = `/job-fit?role=${encodeURIComponent(analysis.target_job_title)}`
        }}>
          Analyse a Job Fit
        </GradientButton>
        <SecondaryButton size="sm" onClick={onBack}>
          Run Another Analysis
        </SecondaryButton>
      </div>
    </div>
  )
}

function HistoryList({
  analyses,
  onSelect,
  onNew,
}: {
  analyses: ReadinessAnalysis[]
  onSelect: (a: ReadinessAnalysis) => void
  onNew: () => void
}) {
  if (analyses.length === 0) {
    return (
      <div className="text-center py-16" style={{ color: '#64748B' }}>
        <BrainCircuit className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm mb-4">No readiness analyses yet.</p>
        <GradientButton size="sm" onClick={onNew}>Run Your First Analysis</GradientButton>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading font-semibold text-white">Past Analyses ({analyses.length})</h2>
        <GradientButton size="sm" onClick={onNew}>+ New Analysis</GradientButton>
      </div>
      {analyses.map(a => {
        const lvl = levelStyle(a.readiness_level)
        return (
          <button key={a.id} onClick={() => onSelect(a)} className="w-full text-left">
            <GlassCard hover className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full shrink-0"
                  style={{ background: lvl.bg, border: `1px solid ${lvl.border}` }}>
                  <span className="font-heading font-bold text-sm" style={{ color: lvl.color }}>
                    {a.overall_score}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">{a.target_job_title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {a.target_seniority && <span className="text-xs" style={{ color: '#64748B' }}>{a.target_seniority}</span>}
                    {a.target_geography && <span className="text-xs" style={{ color: '#64748B' }}>· {a.target_geography}</span>}
                  </div>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full shrink-0"
                  style={{ color: lvl.color, background: lvl.bg, border: `1px solid ${lvl.border}` }}>
                  {a.readiness_level}
                </span>
              </div>
            </GlassCard>
          </button>
        )
      })}
    </div>
  )
}

export default function CareerIntelligencePage() {
  const [view, setView] = useState<View>('input')
  const [targetJobTitle, setTargetJobTitle] = useState('')
  const [targetSeniority, setTargetSeniority] = useState('')
  const [targetGeography, setTargetGeography] = useState('')
  const [linkedinText, setLinkedinText] = useState('')
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>([''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeAnalysis, setActiveAnalysis] = useState<ReadinessAnalysis | null>(null)
  const [savedAnalyses, setSavedAnalyses] = useState<ReadinessAnalysis[]>([])
  const [loadingList, setLoadingList] = useState(false)

  useEffect(() => {
    async function load() {
      setLoadingList(true)
      try {
        const res = await fetch('/api/career/readiness/list')
        if (res.ok) {
          const data = await res.json() as ReadinessAnalysis[]
          setSavedAnalyses(data)
        }
      } finally {
        setLoadingList(false)
      }
    }
    void load()
  }, [])

  const addPortfolioLink = () => setPortfolioLinks(prev => [...prev, ''])
  const updatePortfolioLink = (i: number, val: string) =>
    setPortfolioLinks(prev => prev.map((l, idx) => idx === i ? val : l))
  const removePortfolioLink = (i: number) =>
    setPortfolioLinks(prev => prev.filter((_, idx) => idx !== i))

  const handleAnalyse = async () => {
    if (!targetJobTitle.trim()) {
      setError('Target job title is required.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/career/readiness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetJobTitle: targetJobTitle.trim(),
          targetSeniority: targetSeniority || undefined,
          targetGeography: targetGeography || undefined,
          linkedinText: linkedinText.trim() || undefined,
          portfolioLinks: portfolioLinks.filter(l => l.trim()),
        }),
      })
      const data = await res.json() as { analysis: ReadinessAnalysis; error?: string }
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
    <DashboardLayout title="Career Intelligence">
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.04)' }}>
        {(['input', 'list'] as const).map(v => (
          <button key={v} onClick={() => setView(v)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={view === v
              ? { background: 'rgba(139,92,246,0.2)', color: '#8B5CF6' }
              : { color: '#64748B' }}>
            {v === 'input' ? 'New Analysis' : `History (${savedAnalyses.length})`}
          </button>
        ))}
      </div>

      {view === 'input' && (
        <div className="max-w-2xl space-y-4">
          <GlassCard className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#94A3B8' }}>
                Target Job Title <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                value={targetJobTitle}
                onChange={e => setTargetJobTitle(e.target.value)}
                placeholder="e.g. Senior Cloud Engineer"
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#94A3B8' }}>
                  Target Seniority
                </label>
                <select
                  value={targetSeniority}
                  onChange={e => setTargetSeniority(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
                  <option value="">Any</option>
                  {SENIORITY_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#94A3B8' }}>
                  Target Geography
                </label>
                <select
                  value={targetGeography}
                  onChange={e => setTargetGeography(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
                  <option value="">Any</option>
                  {GEOGRAPHY_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#94A3B8' }}>
                LinkedIn Profile Text (optional — paste your About / Experience sections)
              </label>
              <textarea
                value={linkedinText}
                onChange={e => setLinkedinText(e.target.value)}
                placeholder="Paste your LinkedIn About section and experience summaries here…"
                rows={5}
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none resize-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium" style={{ color: '#94A3B8' }}>
                  Portfolio / GitHub / Website Links (optional)
                </label>
                <button onClick={addPortfolioLink} className="flex items-center gap-1 text-xs transition-colors"
                  style={{ color: '#8B5CF6' }}>
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              <div className="space-y-2">
                {portfolioLinks.map((link, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={link}
                      onChange={e => updatePortfolioLink(i, e.target.value)}
                      placeholder="https://github.com/..."
                      className="flex-1 px-3 py-2 rounded-xl text-sm text-white outline-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                    />
                    {portfolioLinks.length > 1 && (
                      <button onClick={() => removePortfolioLink(i)} style={{ color: '#64748B' }}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {error && <p className="text-sm" style={{ color: '#EF4444' }}>{error}</p>}

            <GradientButton onClick={handleAnalyse} disabled={loading} className="w-full justify-center">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Analysing readiness…</>
                : <><BrainCircuit className="w-4 h-4" /> Analyse My Readiness</>}
            </GradientButton>
            <p className="text-xs text-center" style={{ color: '#64748B' }}>
              Uses your primary CV. Analysis takes ~20 seconds. Scores are guidance only.
            </p>
          </GlassCard>
        </div>
      )}

      {view === 'result' && activeAnalysis && (
        <ReportView
          analysis={activeAnalysis}
          onBack={() => setView(savedAnalyses.length > 1 ? 'list' : 'input')}
        />
      )}

      {view === 'list' && (
        loadingList
          ? <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin" style={{ color: '#8B5CF6' }} /></div>
          : <HistoryList
              analyses={savedAnalyses}
              onSelect={a => { setActiveAnalysis(a); setView('result') }}
              onNew={() => setView('input')}
            />
      )}
    </DashboardLayout>
  )
}
