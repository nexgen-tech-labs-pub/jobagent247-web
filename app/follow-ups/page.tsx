'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { SecondaryButton } from '@/components/ui/SecondaryButton'
import { Loader2, Mail, RefreshCw, AlertTriangle, Clock, CheckCircle, X, Lightbulb, Copy } from 'lucide-react'
import type { FollowUpRecommendation, FollowUpDraft } from '@/lib/types/database'

const URGENCY_CONFIG = {
  urgent: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   label: 'Urgent' },
  high:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  label: 'High'   },
  normal: { color: '#06B6D4', bg: 'rgba(6,182,212,0.1)',   label: 'Normal' },
  low:    { color: '#64748B', bg: 'rgba(100,116,139,0.1)', label: 'Low'    },
}

type FollowUpWithSource = FollowUpRecommendation & {
  source_message: { sender: string; subject: string; received_at: string; classification: string | null; snippet: string } | null
}

function FollowUpCard({
  followUp,
  onDismiss,
  onGenerateDraft,
}: {
  followUp: FollowUpWithSource
  onDismiss: (id: string) => void
  onGenerateDraft: (id: string) => void
}) {
  const [draft, setDraft] = useState<FollowUpDraft | null>(null)
  const [draftLoading, setDraftLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const urgency = URGENCY_CONFIG[followUp.urgency as keyof typeof URGENCY_CONFIG] ?? URGENCY_CONFIG.normal

  const handleGetDraft = async () => {
    if (draft) return
    setDraftLoading(true)
    onGenerateDraft(followUp.id)
    try {
      const existing = await fetch(`/api/email/follow-ups/${followUp.id}/draft`)
      const exData = await existing.json() as { draft?: FollowUpDraft }
      if (exData.draft) { setDraft(exData.draft); return }
      const res = await fetch(`/api/email/follow-ups/${followUp.id}/draft`, { method: 'POST' })
      const data = await res.json() as { draft?: FollowUpDraft }
      if (data.draft) setDraft(data.draft)
    } finally { setDraftLoading(false) }
  }

  const handleCopy = () => {
    if (!draft) return
    navigator.clipboard.writeText(`Subject: ${draft.subject}\n\n${draft.body}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <GlassCard className="p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ color: urgency.color, background: urgency.bg, border: `1px solid ${urgency.color}44` }}>
              {urgency.label}
            </span>
            <span className="text-xs capitalize" style={{ color: '#64748B' }}>
              {followUp.recommendation_type.replace(/_/g, ' ')}
            </span>
          </div>
          {followUp.source_message && (
            <>
              <p className="text-sm font-semibold text-white truncate">{followUp.source_message.subject}</p>
              <p className="text-xs" style={{ color: '#64748B' }}>
                From: {followUp.source_message.sender} ·{' '}
                {new Date(followUp.source_message.received_at).toLocaleDateString('en-GB')}
              </p>
            </>
          )}
          <p className="text-sm leading-relaxed" style={{ color: '#CBD5E1' }}>{followUp.reason}</p>
        </div>
        <button
          onClick={() => onDismiss(followUp.id)}
          className="shrink-0 p-1.5 rounded-lg"
          style={{ color: '#475569' }}
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {followUp.source_message?.snippet && (
        <p className="text-xs px-3 py-2 rounded-xl italic" style={{ background: 'rgba(255,255,255,0.04)', color: '#94A3B8' }}>
          &ldquo;{followUp.source_message.snippet}&rdquo;
        </p>
      )}

      {!draft && (
        <GradientButton size="sm" onClick={handleGetDraft} disabled={draftLoading}>
          {draftLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating…</> : <><Lightbulb className="w-3.5 h-3.5" /> Generate Draft Reply</>}
        </GradientButton>
      )}

      {draft && (
        <div className="space-y-3">
          <div className="rounded-xl p-4 space-y-2" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.18)' }}>
            <p className="text-xs font-semibold" style={{ color: '#8B5CF6' }}>Subject: {draft.subject}</p>
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#F1F5F9' }}>{draft.body}</p>
            {draft.placeholders.length > 0 && (
              <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-xs font-semibold mb-1" style={{ color: '#F59E0B' }}>Fill in before sending:</p>
                {draft.placeholders.map((p, i) => (
                  <p key={i} className="text-xs" style={{ color: '#FCD34D' }}>• {p}</p>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <SecondaryButton size="sm" onClick={handleCopy}>
              {copied ? <><CheckCircle className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Draft</>}
            </SecondaryButton>
            <button
              onClick={handleGetDraft}
              className="text-xs px-3 py-1.5 rounded-full"
              style={{ color: '#64748B' }}
            >
              Regenerate
            </button>
          </div>
          <p className="text-xs" style={{ color: '#475569' }}>
            AI-generated draft. Review carefully and fill in any [PLACEHOLDER] sections before sending. Never auto-sent.
          </p>
        </div>
      )}
    </GlassCard>
  )
}

export default function FollowUpsPage() {
  const router = useRouter()
  const [followUps, setFollowUps] = useState<FollowUpWithSource[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [, setGeneratingId] = useState<string | null>(null)

  const loadFollowUps = () => {
    fetch('/api/email/follow-ups')
      .then(r => r.json())
      .then((d: { followUps?: FollowUpWithSource[]; error?: string }) => {
        if (d.error) setError(d.error)
        else setFollowUps(d.followUps ?? [])
      })
      .catch(() => setError('Network error.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadFollowUps() }, [])

  const handleSync = async () => {
    setSyncing(true)
    await fetch('/api/email/sync', { method: 'POST' })
    setSyncing(false)
    setLoading(true)
    loadFollowUps()
  }

  const handleDismiss = async (id: string) => {
    await fetch(`/api/email/follow-ups/${id}/dismiss`, { method: 'POST' })
    setFollowUps(prev => prev.filter(f => f.id !== id))
  }

  return (
    <DashboardLayout title="Follow-Ups">
      <div className="max-w-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-semibold text-white flex items-center gap-2">
              <Mail className="w-4 h-4" style={{ color: '#8B5CF6' }} /> Job Email Follow-Ups
            </h2>
            <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>
              Follow-up opportunities detected from your synced job-related emails.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SecondaryButton size="sm" onClick={handleSync} disabled={syncing}>
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing…' : 'Sync now'}
            </SecondaryButton>
            <SecondaryButton size="sm" onClick={() => router.push('/follow-ups/accounts')}>
              Manage Inboxes
            </SecondaryButton>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#8B5CF6' }} />
          </div>
        )}

        {error && !loading && (
          <GlassCard className="p-5 text-center">
            <AlertTriangle className="w-6 h-6 mx-auto mb-2" style={{ color: '#F59E0B' }} />
            <p className="text-sm mb-3" style={{ color: '#94A3B8' }}>{error}</p>
            <SecondaryButton size="sm" onClick={loadFollowUps}>Try Again</SecondaryButton>
          </GlassCard>
        )}

        {!loading && !error && followUps.length === 0 && (
          <GlassCard className="p-8 text-center">
            <Clock className="w-8 h-8 mx-auto mb-3" style={{ color: '#475569' }} />
            <p className="text-sm font-semibold text-white mb-1">No follow-ups needed right now</p>
            <p className="text-sm mb-4" style={{ color: '#64748B' }}>
              Connect your email accounts and move job-related emails into the required label/folder. New follow-up recommendations will appear here.
            </p>
            <GradientButton size="sm" onClick={() => router.push('/follow-ups/accounts')}>
              Connect Email Accounts
            </GradientButton>
          </GlassCard>
        )}

        {followUps.map(fu => (
          <FollowUpCard
            key={fu.id}
            followUp={fu}
            onDismiss={id => void handleDismiss(id)}
            onGenerateDraft={id => setGeneratingId(id)}
          />
        ))}
      </div>
    </DashboardLayout>
  )
}
