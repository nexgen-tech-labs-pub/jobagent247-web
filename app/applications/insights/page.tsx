'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { GlassCard } from '@/components/ui/GlassCard'
import { SecondaryButton } from '@/components/ui/SecondaryButton'
import { GradientButton } from '@/components/ui/GradientButton'
import { Loader2, ArrowLeft, TrendingUp, XCircle, CheckCircle, Lightbulb, AlertTriangle, RefreshCw } from 'lucide-react'
import type { ApplicationInsights, ApplicationStatus } from '@/lib/types/database'

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  saved: 'Saved',
  applied: 'Applied',
  interviewing: 'Interviewing',
  offered: 'Offered',
  rejected: 'Rejected',
}

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  saved: '#64748B',
  applied: '#3B82F6',
  interviewing: '#8B5CF6',
  offered: '#22C55E',
  rejected: '#EF4444',
}

export default function ApplicationInsightsPage() {
  const router = useRouter()
  const [insights, setInsights] = useState<ApplicationInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/applications/insights')
      const data = await res.json() as { insights?: ApplicationInsights; error?: string }
      if (!res.ok) { setError(data.error ?? 'Failed to load insights'); return }
      setInsights(data.insights!)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  return (
    <DashboardLayout title="Application Insights">
      <div className="max-w-3xl space-y-5">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/applications')}
            className="flex items-center gap-1.5 text-xs transition-colors"
            style={{ color: '#64748B' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Applications
          </button>
          {insights && (
            <SecondaryButton size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </SecondaryButton>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#8B5CF6' }} />
          </div>
        )}

        {error && !loading && (
          <GlassCard className="p-6 text-center">
            <p className="text-sm mb-4" style={{ color: '#94A3B8' }}>{error}</p>
            {error.includes('least 3') ? (
              <GradientButton size="sm" onClick={() => router.push('/applications')}>
                Go to Applications
              </GradientButton>
            ) : (
              <SecondaryButton size="sm" onClick={load}>Try Again</SecondaryButton>
            )}
          </GlassCard>
        )}

        {insights && !loading && (
          <>
            {/* Summary + stats */}
            <GlassCard className="p-5">
              <p className="text-sm leading-relaxed mb-4" style={{ color: '#CBD5E1' }}>{insights.summary}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <p className="font-heading font-bold text-xl text-white">{insights.totalApplications}</p>
                  <p className="text-xs" style={{ color: '#64748B' }}>Total applications</p>
                </div>
                <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <p className="font-heading font-bold text-xl" style={{ color: '#8B5CF6' }}>{insights.responseRate}%</p>
                  <p className="text-xs" style={{ color: '#64748B' }}>Response rate</p>
                </div>
                <div className="text-center p-3 rounded-xl col-span-2 sm:col-span-1" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <p className="font-heading font-bold text-xl" style={{ color: '#22C55E' }}>
                    {insights.outcomeBreakdown.offered ?? 0}
                  </p>
                  <p className="text-xs" style={{ color: '#64748B' }}>Offers received</p>
                </div>
              </div>
            </GlassCard>

            {/* Outcome breakdown */}
            <GlassCard className="p-5">
              <h3 className="font-heading font-semibold text-white mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" style={{ color: '#8B5CF6' }} /> Outcome Breakdown
              </h3>
              <div className="space-y-2">
                {(Object.entries(insights.outcomeBreakdown) as [ApplicationStatus, number][])
                  .sort((a, b) => b[1] - a[1])
                  .map(([status, count]) => {
                    const pct = Math.round((count / insights.totalApplications) * 100)
                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs" style={{ color: STATUS_COLORS[status] }}>{STATUS_LABELS[status]}</span>
                          <span className="text-xs" style={{ color: '#64748B' }}>{count} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: STATUS_COLORS[status] }} />
                        </div>
                      </div>
                    )
                  })}
              </div>
            </GlassCard>

            <div className="grid md:grid-cols-2 gap-4">
              {insights.topMissingSkills.length > 0 && (
                <GlassCard className="p-5">
                  <h3 className="font-heading font-semibold text-white mb-3 flex items-center gap-2">
                    <XCircle className="w-4 h-4" style={{ color: '#EF4444' }} /> Top Skill Gaps
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {insights.topMissingSkills.map((s, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </GlassCard>
              )}
              {insights.strongPerformingAreas.length > 0 && (
                <GlassCard className="p-5">
                  <h3 className="font-heading font-semibold text-white mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: '#22C55E' }} /> Strengths
                  </h3>
                  <ul className="space-y-1.5">
                    {insights.strongPerformingAreas.map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs" style={{ color: '#94A3B8' }}>
                        <CheckCircle className="w-3 h-3 mt-0.5 shrink-0" style={{ color: '#22C55E' }} /> {s}
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              )}
            </div>

            {insights.rejectionPatterns.length > 0 && (
              <GlassCard className="p-5">
                <h3 className="font-heading font-semibold text-white mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" style={{ color: '#F59E0B' }} /> Rejection Patterns
                </h3>
                <ul className="space-y-2">
                  {insights.rejectionPatterns.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#94A3B8' }}>
                      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: '#F59E0B' }} /> {p}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            )}

            {insights.recommendations.length > 0 && (
              <GlassCard className="p-5">
                <h3 className="font-heading font-semibold text-white mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" style={{ color: '#06B6D4' }} /> Recommendations
                </h3>
                <ul className="space-y-2">
                  {insights.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#94A3B8' }}>
                      <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#06B6D4' }} /> {r}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
