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
    <GlassCard className="p-5">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0"
          style={{ background: config.bg, border: `1px solid ${config.border}` }}
        >
          <span className="font-heading font-bold text-sm leading-none" style={{ color: config.color }}>{config.label}</span>
          <span className="text-xs leading-none mt-0.5" style={{ color: config.color, opacity: 0.7 }}>{config.subtitle}</span>
        </div>
        <div>
          <h3 className="font-heading font-semibold text-white text-sm">{milestone.title}</h3>
          <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{milestone.description}</p>
        </div>
      </div>

      <div className="space-y-3">
        {milestone.actions.length > 0 && (
          <div>
            <p className="text-xs font-semibold mb-1.5 flex items-center gap-1.5" style={{ color: config.color }}>
              <Target className="w-3 h-3" /> Actions
            </p>
            <ul className="space-y-1">
              {milestone.actions.map((a, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs" style={{ color: '#CBD5E1' }}>
                  <CheckCircle className="w-3 h-3 mt-0.5 shrink-0" style={{ color: config.color }} /> {a}
                </li>
              ))}
            </ul>
          </div>
        )}
        {milestone.skills.length > 0 && (
          <div>
            <p className="text-xs font-semibold mb-1.5 flex items-center gap-1.5" style={{ color: '#F59E0B' }}>
              <BookOpen className="w-3 h-3" /> Skills to build
            </p>
            <div className="flex flex-wrap gap-1.5">
              {milestone.skills.map((s, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
        {milestone.evidenceToCreate.length > 0 && (
          <div>
            <p className="text-xs font-semibold mb-1.5 flex items-center gap-1.5" style={{ color: '#8B5CF6' }}>
              <Code className="w-3 h-3" /> Evidence to create
            </p>
            <ul className="space-y-1">
              {milestone.evidenceToCreate.map((e, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs" style={{ color: '#CBD5E1' }}>
                  <span className="mt-0.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#8B5CF6' }} /> {e}
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
            <GlassCard className="p-5">
              <p className="text-sm leading-relaxed" style={{ color: '#CBD5E1' }}>{plan.summary}</p>
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                {plan.quickWins.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: '#22C55E' }}>
                      <Zap className="w-3 h-3" /> Quick wins this week
                    </p>
                    <ul className="space-y-1">
                      {plan.quickWins.map((w, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs" style={{ color: '#CBD5E1' }}>
                          <CheckCircle className="w-3 h-3 mt-0.5 shrink-0" style={{ color: '#22C55E' }} /> {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {plan.keyRisks.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: '#EF4444' }}>
                      <AlertTriangle className="w-3 h-3" /> Key risks
                    </p>
                    <ul className="space-y-1">
                      {plan.keyRisks.map((r, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs" style={{ color: '#CBD5E1' }}>
                          <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" style={{ color: '#EF4444' }} /> {r}
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
