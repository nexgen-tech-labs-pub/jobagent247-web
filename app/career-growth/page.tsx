'use client'

import { useState, useRef } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { SecondaryButton } from '@/components/ui/SecondaryButton'
import { Loader2, TrendingUp, Zap, AlertTriangle, CheckCircle, BookOpen, Code, Target, XCircle } from 'lucide-react'
import type { GrowthPlan, GrowthMilestone } from '@/lib/types/database'

const MILESTONE_CONFIG = [
  { key: 'day30' as const, label: 'Day 30', subtitle: 'Foundation', color: '#06B6D4', bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.2)' },
  { key: 'day60' as const, label: 'Day 60', subtitle: 'Momentum',   color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)' },
  { key: 'day90' as const, label: 'Day 90', subtitle: 'Ready',      color: '#22C55E', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.2)'  },
]

function MilestoneCard({ config, milestone }: { config: typeof MILESTONE_CONFIG[0]; milestone: GrowthMilestone }) {
  return (
    <GlassCard className="overflow-hidden">
      {/* Coloured header band */}
      <div className="px-6 py-4" style={{ background: config.bg, borderBottom: `1px solid ${config.border}` }}>
        <div className="flex items-center gap-3">
          <span
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-heading font-bold shrink-0"
            style={{ background: config.border, color: config.color }}
          >
            {config.label} · {config.subtitle}
          </span>
          <h3 className="font-heading font-bold text-base text-white leading-snug">{milestone.title}</h3>
        </div>
        <p className="text-sm mt-2 leading-relaxed" style={{ color: '#E2E8F0' }}>{milestone.description}</p>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-5">
        {milestone.actions.length > 0 && (
          <div>
            <p className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: config.color }}>
              <Target className="w-4 h-4" /> Actions
            </p>
            <ul className="space-y-2">
              {milestone.actions.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-sm leading-relaxed" style={{ color: '#F1F5F9' }}>
                  <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: config.color }} />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {milestone.skills.length > 0 && (
          <div>
            <p className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#F59E0B' }}>
              <BookOpen className="w-4 h-4" /> Skills to build
            </p>
            <div className="flex flex-wrap gap-2">
              {milestone.skills.map((s, i) => (
                <span
                  key={i}
                  className="text-sm px-3 py-1 rounded-full font-medium"
                  style={{ background: 'rgba(245,158,11,0.12)', color: '#FCD34D', border: '1px solid rgba(245,158,11,0.3)' }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {milestone.evidenceToCreate.length > 0 && (
          <div>
            <p className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#A78BFA' }}>
              <Code className="w-4 h-4" /> Evidence to create
            </p>
            <ul className="space-y-2">
              {milestone.evidenceToCreate.map((e, i) => (
                <li key={i} className="flex items-start gap-2 text-sm leading-relaxed" style={{ color: '#F1F5F9' }}>
                  <span className="mt-2 w-2 h-2 rounded-full shrink-0" style={{ background: '#A78BFA' }} />
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </GlassCard>
  )
}

export default function CareerGrowthPage() {
  const [targetRole, setTargetRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<GrowthPlan | null>(null)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const handleGenerate = async () => {
    if (loading) {
      abortRef.current?.abort()
      setLoading(false)
      return
    }
    if (!targetRole.trim()) return
    setLoading(true)
    setError(null)
    setPlan(null)
    const controller = new AbortController()
    abortRef.current = controller
    try {
      const res = await fetch('/api/career/growth-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRole: targetRole.trim() }),
        signal: controller.signal,
      })
      const data = await res.json() as { plan?: GrowthPlan; error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Failed to generate plan')
        return
      }
      setPlan(data.plan!)
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout title="Career Growth Coach">
      <div className="max-w-3xl space-y-6">
        <GlassCard className="p-5">
          <h2 className="font-heading font-semibold text-white mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: '#8B5CF6' }} /> 30/60/90-Day Roadmap
          </h2>
          <p className="text-sm mb-4" style={{ color: '#94A3B8' }}>
            Enter the role you want to reach. The coach will analyse your CV and build a personalised month-by-month improvement plan.
          </p>
          <div className="flex gap-3">
            <input
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') void handleGenerate() }}
              placeholder="e.g. Senior Backend Engineer, Staff Engineer, DevOps Lead"
              className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
            />
            <GradientButton
              onClick={handleGenerate}
              disabled={!loading && !targetRole.trim()}
            >
              {loading
                ? <><XCircle className="w-4 h-4" /> Cancel</>
                : <><Zap className="w-4 h-4" /> Generate Plan</>}
            </GradientButton>
          </div>
          {error && (
            <p className="text-sm mt-3" style={{ color: '#EF4444' }}>{error}</p>
          )}
          <p className="text-xs mt-2" style={{ color: '#64748B' }}>
            Requires a primary CV in your profile. Uses your latest Career Intelligence score if available. Takes ~20 seconds.
          </p>
        </GlassCard>

        {loading && (
          <div className="flex items-center gap-3" style={{ color: '#8B5CF6' }}>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Building your personalised roadmap…</span>
          </div>
        )}

        {plan && (
          <>
            <GlassCard className="p-6">
              <p className="text-base leading-relaxed font-medium" style={{ color: '#F1F5F9' }}>{plan.summary}</p>
              <div className="grid sm:grid-cols-2 gap-6 mt-5">
                {plan.quickWins.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#4ADE80' }}>
                      <Zap className="w-4 h-4" /> Quick wins this week
                    </p>
                    <ul className="space-y-2">
                      {plan.quickWins.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm leading-relaxed" style={{ color: '#F1F5F9' }}>
                          <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#4ADE80' }} />
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {plan.keyRisks.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#F87171' }}>
                      <AlertTriangle className="w-4 h-4" /> Key risks
                    </p>
                    <ul className="space-y-2">
                      {plan.keyRisks.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm leading-relaxed" style={{ color: '#F1F5F9' }}>
                          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F87171' }} />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </GlassCard>

            <div className="space-y-4">
              {MILESTONE_CONFIG.map(config => (
                <MilestoneCard key={config.key} config={config} milestone={plan[config.key]} />
              ))}
            </div>

            <SecondaryButton
              size="sm"
              onClick={() => { setPlan(null); setTargetRole('') }}
            >
              Generate New Plan
            </SecondaryButton>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
