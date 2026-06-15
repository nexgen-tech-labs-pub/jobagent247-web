'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { SecondaryButton } from '@/components/ui/SecondaryButton'
import { Loader2, Mail, RefreshCw, Pause, Play, Trash2, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import type { ConnectedEmailAccount, EmailProvider } from '@/lib/types/database'

const PROVIDER_LABELS: Record<EmailProvider, string> = { gmail: 'Gmail', microsoft: 'Outlook / Microsoft 365' }

const PROVIDER_SETUP: Record<EmailProvider, { label: string; steps: string[] }> = {
  gmail: {
    label: 'Create Gmail label "jobagent247"',
    steps: [
      'Open Gmail in your browser.',
      'In the left sidebar, scroll down and click "Create new label".',
      'Name it exactly: jobagent247',
      'Apply this label to any recruiter, employer, or job-related conversations you want synced.',
      'Optionally create a Gmail filter to auto-apply the label to future messages.',
    ],
  },
  microsoft: {
    label: 'Create Outlook folder "job247"',
    steps: [
      'Open Outlook (web or desktop).',
      'Right-click on your inbox and choose "Create new subfolder".',
      'Name it exactly: job247',
      'Move relevant job-related emails into this folder.',
      'Optionally set up an inbox rule to automatically move matching emails.',
    ],
  },
}

function StatusBadge({ status }: { status: ConnectedEmailAccount['connection_status'] }) {
  const cfg = {
    active:             { label: 'Active',             color: '#22C55E', bg: 'rgba(34,197,94,0.12)',   icon: <CheckCircle className="w-3 h-3" /> },
    paused:             { label: 'Paused',             color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  icon: <Pause className="w-3 h-3" /> },
    pending:            { label: 'Setup required',     color: '#06B6D4', bg: 'rgba(6,182,212,0.12)',   icon: <Clock className="w-3 h-3" /> },
    reconnect_required: { label: 'Reconnect required', color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   icon: <AlertTriangle className="w-3 h-3" /> },
    failed:             { label: 'Error',              color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   icon: <AlertTriangle className="w-3 h-3" /> },
    disconnected:       { label: 'Disconnected',       color: '#64748B', bg: 'rgba(100,116,139,0.12)', icon: <Mail className="w-3 h-3" /> },
  }[status]

  return (
    <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-semibold"
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}44` }}>
      {cfg.icon} {cfg.label}
    </span>
  )
}

function AccountsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [accounts, setAccounts] = useState<ConnectedEmailAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [setupProvider, setSetupProvider] = useState<EmailProvider | null>(
    searchParams.get('setup_required') as EmailProvider | null
  )
  const banner = searchParams.get('success') ?? searchParams.get('error')

  useEffect(() => {
    fetch('/api/email/accounts')
      .then(r => r.json())
      .then((d: { accounts?: ConnectedEmailAccount[] }) => setAccounts(d.accounts ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handlePauseResume = async (id: string, current: string) => {
    setActionId(id)
    await fetch(`/api/email/accounts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: current === 'paused' ? 'resume' : 'pause' }),
    })
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, connection_status: current === 'paused' ? 'active' : 'paused' } : a))
    setActionId(null)
  }

  const handleDisconnect = async (id: string) => {
    if (!confirm('Disconnect this account? Synced messages will be retained but no new syncs will run.')) return
    setActionId(id)
    await fetch(`/api/email/accounts/${id}`, { method: 'DELETE' })
    setAccounts(prev => prev.filter(a => a.id !== id))
    setActionId(null)
  }

  const setupInfo = setupProvider ? PROVIDER_SETUP[setupProvider] : null

  return (
    <DashboardLayout title="Connected Inboxes">
      <div className="max-w-2xl space-y-5">
        {banner && (
          <div className="px-4 py-3 rounded-xl text-sm" style={{
            background: banner.includes('error') ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
            color: banner.includes('error') ? '#EF4444' : '#22C55E',
            border: `1px solid ${banner.includes('error') ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
          }}>
            {banner === 'connected' ? 'Account connected successfully.' :
             banner === 'reconnected' ? 'Account reconnected successfully.' :
             banner === 'limit_reached' ? 'You have reached the 5-account limit.' :
             banner}
          </div>
        )}

        {setupInfo && setupProvider && (
          <GlassCard className="p-5">
            <h3 className="font-heading font-semibold text-white mb-1">{setupInfo.label}</h3>
            <p className="text-sm mb-3" style={{ color: '#94A3B8' }}>
              JobAgent247 can only read emails in this label/folder. Follow these steps to start syncing:
            </p>
            <ol className="space-y-2">
              {setupInfo.steps.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm" style={{ color: '#F1F5F9' }}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5" style={{ background: 'rgba(139,92,246,0.2)', color: '#8B5CF6' }}>{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
            <SecondaryButton size="sm" className="mt-4" onClick={() => setSetupProvider(null)}>Done — dismiss</SecondaryButton>
          </GlassCard>
        )}

        <GlassCard className="p-5">
          <h2 className="font-heading font-semibold text-white mb-1 flex items-center gap-2">
            <Mail className="w-4 h-4" style={{ color: '#8B5CF6' }} /> Connect Email Account
          </h2>
          <p className="text-sm mb-4" style={{ color: '#94A3B8' }}>
            Connect up to 5 accounts. Only emails in the <strong style={{ color: '#F1F5F9' }}>jobagent247</strong> Gmail label or <strong style={{ color: '#F1F5F9' }}>job247</strong> Outlook folder will be read. JobAgent247 never sends emails automatically.
          </p>
          <div className="flex flex-wrap gap-3">
            <GradientButton
              onClick={() => router.push('/api/email/auth/gmail')}
              disabled={accounts.length >= 5}
            >
              Connect Gmail
            </GradientButton>
            <SecondaryButton
              onClick={() => router.push('/api/email/auth/microsoft')}
              disabled={accounts.length >= 5}
            >
              Connect Outlook / Microsoft 365
            </SecondaryButton>
          </div>
          {accounts.length >= 5 && (
            <p className="text-xs mt-2" style={{ color: '#F59E0B' }}>5-account limit reached.</p>
          )}
        </GlassCard>

        {loading && (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#8B5CF6' }} />
          </div>
        )}

        {!loading && accounts.length === 0 && (
          <GlassCard className="p-6 text-center">
            <p className="text-sm" style={{ color: '#64748B' }}>No connected accounts yet. Connect Gmail or Outlook above.</p>
          </GlassCard>
        )}

        {accounts.map(account => (
          <GlassCard key={account.id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold text-white text-sm truncate">{account.email_address}</p>
                <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{PROVIDER_LABELS[account.provider as EmailProvider]}</p>
                {account.last_successful_sync_at && (
                  <p className="text-xs mt-1" style={{ color: '#475569' }}>
                    Last synced {new Date(account.last_successful_sync_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={account.connection_status as ConnectedEmailAccount['connection_status']} />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              {account.connection_status !== 'disconnected' && account.connection_status !== 'reconnect_required' && (
                <SecondaryButton
                  size="sm"
                  onClick={() => void handlePauseResume(account.id, account.connection_status)}
                  disabled={actionId === account.id}
                >
                  {actionId === account.id
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : account.connection_status === 'paused' ? <><Play className="w-3.5 h-3.5" /> Resume</> : <><Pause className="w-3.5 h-3.5" /> Pause</>}
                </SecondaryButton>
              )}
              {account.connection_status === 'reconnect_required' && (
                <GradientButton size="sm" onClick={() => router.push(`/api/email/auth/${account.provider}`)}>
                  <RefreshCw className="w-3.5 h-3.5" /> Reconnect
                </GradientButton>
              )}
              <button
                onClick={() => void handleDisconnect(account.id)}
                disabled={actionId === account.id}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: '#EF4444' }}
                aria-label="Disconnect account"
              >
                {actionId === account.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          </GlassCard>
        ))}
      </div>
    </DashboardLayout>
  )
}

export default function AccountsPage() {
  return (
    <Suspense>
      <AccountsContent />
    </Suspense>
  )
}
