'use client'

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { FileText, Sparkles, Download, RefreshCw, Lock, Loader2, Eye, Pencil, X, Check } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { SecondaryButton } from '@/components/ui/SecondaryButton'

interface MasterCvMeta {
  eligible: boolean
  exists: boolean
  status: 'generating' | 'ready' | 'failed' | null
  stage: string | null
  displayName: string
  atsScore: number | null
  targetRole: string | null
  targetMarket: string | null
  jobFamily: string | null
  seniority: string | null
  marketGaps: string[]
  generatedAt: string | null
  error: string | null
  ready: boolean
}

interface Props {
  plan: 'free' | 'pro' | 'accelerator'
}

const STAGES = ['queued', 'parsing', 'market', 'optimising', 'scoring', 'formatting', 'ready']
const STAGE_LABELS: Record<string, string> = {
  queued: 'Queued',
  parsing: 'Parsing your CV',
  market: 'Matching market job specs',
  optimising: 'Optimising content',
  scoring: 'Checking ATS readiness',
  formatting: 'Formatting document',
  ready: 'Ready',
}

export function MasterCvCard({ plan }: Props) {
  const [meta, setMeta] = useState<MasterCvMeta | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [renaming, setRenaming] = useState(false)
  const [nameDraft, setNameDraft] = useState('')

  const eligible = plan === 'pro' || plan === 'accelerator'

  useEffect(() => {
    let active = true
    async function poll() {
      try {
        const res = await fetch('/api/cv/master')
        if (active && res.ok) {
          const data: MasterCvMeta = await res.json()
          setMeta(data)
          return data.status
        }
      } catch { /* card degrades to its default state */ }
      return null
    }
    void poll()
    // While generating, keep polling so the stepper advances.
    const id = setInterval(async () => {
      const status = await poll()
      if (status !== 'generating') clearInterval(id)
    }, 3000)
    return () => { active = false; clearInterval(id) }
  }, [])

  async function refresh() {
    const res = await fetch('/api/cv/master')
    if (res.ok) setMeta(await res.json())
  }

  async function generate() {
    setBusy(true); setError(null)
    try {
      const res = await fetch('/api/cv/master', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Generation failed'); return }
      setMeta(data)
    } catch { setError('Generation failed. Please try again.') }
    finally { setBusy(false) }
  }

  async function download(format: 'docx' | 'pdf') {
    setBusy(true); setError(null)
    try {
      const res = await fetch('/api/cv/master/download', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ format }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Download failed'); return }
      if (data.url) window.open(data.url, '_blank', 'noopener')
    } catch { setError('Download failed. Please try again.') }
    finally { setBusy(false) }
  }

  async function openPreview() {
    setBusy(true); setError(null)
    try {
      const res = await fetch('/api/cv/master/preview')
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Preview failed'); return }
      setPreview(data.markdown)
    } catch { setError('Preview failed. Please try again.') }
    finally { setBusy(false) }
  }

  async function saveName() {
    const name = nameDraft.trim()
    if (!name) { setRenaming(false); return }
    setBusy(true); setError(null)
    try {
      const res = await fetch('/api/cv/master/rename', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Rename failed'); return }
      setRenaming(false)
      await refresh()
    } catch { setError('Rename failed. Please try again.') }
    finally { setBusy(false) }
  }

  const header = (
    <div className="flex items-center gap-3 mb-1">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.2)' }}>
        <FileText className="w-4 h-4" style={{ color: '#8B5CF6' }} />
      </div>
      <div className="min-w-0">
        <h3 className="font-heading font-semibold text-white truncate">{meta?.displayName ?? 'Default Master CV'}</h3>
        <p className="text-xs" style={{ color: '#64748B' }}>Your professionally optimised go-to CV for job applications.</p>
      </div>
    </div>
  )

  if (!eligible) {
    return (
      <GlassCard className="p-6">
        {header}
        <div className="mt-4 flex items-center gap-3 rounded-xl px-4 py-3"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Lock className="w-4 h-4 shrink-0" style={{ color: '#F59E0B' }} />
          <p className="text-sm" style={{ color: '#CBD5E1' }}>
            Upgrade to Pro or Accelerator to generate your Default Master CV automatically.
          </p>
        </div>
        <div className="mt-4"><GradientButton href="/pricing" size="sm">Upgrade</GradientButton></div>
      </GlassCard>
    )
  }

  const generating = busy || meta?.status === 'generating'
  const activeStageIdx = meta?.stage ? STAGES.indexOf(meta.stage) : -1

  return (
    <GlassCard className="p-6">
      {header}

      {meta?.status === 'generating' && (
        <div className="mt-4 space-y-2">
          <p className="text-sm flex items-center gap-2" style={{ color: '#CBD5E1' }}>
            <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: '#8B5CF6' }} />
            Creating your Default Master CV…
          </p>
          <div className="flex flex-wrap gap-1.5">
            {STAGES.slice(0, -1).map((s, i) => (
              <span key={s} className="text-xs px-2 py-0.5 rounded-full"
                style={i < activeStageIdx
                  ? { background: 'rgba(34,197,94,0.12)', color: '#22C55E' }
                  : i === activeStageIdx
                  ? { background: 'rgba(139,92,246,0.18)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.35)' }
                  : { background: 'rgba(255,255,255,0.04)', color: '#64748B' }}>
                {STAGE_LABELS[s]}
              </span>
            ))}
          </div>
        </div>
      )}

      {meta?.ready && (
        <>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { label: 'ATS readiness', value: meta.atsScore != null ? `${meta.atsScore}` : '—', color: '#22C55E' },
              { label: 'Target role', value: meta.targetRole ?? '—', color: '#8B5CF6' },
              { label: 'Market', value: meta.targetMarket ?? '—', color: '#06B6D4' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="font-heading font-bold text-lg truncate" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs mt-0.5" style={{ color: '#64748B' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {meta.generatedAt && (
            <p className="text-xs mt-3" style={{ color: '#64748B' }}>
              Last generated {new Date(meta.generatedAt).toLocaleDateString()} · Optimised to target a 90+ JobAgent247 ATS readiness score.
            </p>
          )}

          {meta.marketGaps.length > 0 && (
            <div className="mt-3 rounded-xl px-4 py-3" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <p className="text-xs font-medium mb-1" style={{ color: '#F59E0B' }}>Recommended to strengthen (not added to your CV):</p>
              <p className="text-xs" style={{ color: '#CBD5E1' }}>{meta.marketGaps.join(' · ')}</p>
            </div>
          )}
        </>
      )}

      {error && (
        <p className="text-sm mt-3 px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</p>
      )}
      {renaming && (
        <div className="mt-3 flex gap-2">
          <input autoFocus value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} maxLength={80}
            className="flex-1 px-3 py-2 rounded-lg text-sm text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }} placeholder="CV name" />
          <SecondaryButton size="sm" onClick={saveName} disabled={busy}><Check className="w-3.5 h-3.5" /></SecondaryButton>
          <SecondaryButton size="sm" onClick={() => setRenaming(false)}><X className="w-3.5 h-3.5" /></SecondaryButton>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {generating ? (
          <GradientButton size="sm" disabled>
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating…
          </GradientButton>
        ) : meta?.ready ? (
          <>
            <GradientButton size="sm" onClick={() => download('docx')} disabled={busy}><Download className="w-3.5 h-3.5" /> DOCX</GradientButton>
            <SecondaryButton size="sm" onClick={() => download('pdf')} disabled={busy}><Download className="w-3.5 h-3.5" /> PDF</SecondaryButton>
            <SecondaryButton size="sm" onClick={openPreview} disabled={busy}><Eye className="w-3.5 h-3.5" /> Preview</SecondaryButton>
            <SecondaryButton size="sm" onClick={() => { setNameDraft(meta.displayName); setRenaming((v) => !v) }}><Pencil className="w-3.5 h-3.5" /> Rename</SecondaryButton>
            <SecondaryButton size="sm" onClick={generate} disabled={busy}><RefreshCw className="w-3.5 h-3.5" /> Regenerate</SecondaryButton>
          </>
        ) : (
          <GradientButton size="sm" onClick={generate} disabled={busy}><Sparkles className="w-3.5 h-3.5" /> Generate Default Master CV</GradientButton>
        )}
      </div>

      {preview !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setPreview(null)}>
          <div className="w-full max-w-2xl max-h-[80vh] overflow-auto rounded-2xl p-6" onClick={(e) => e.stopPropagation()}
            style={{ background: 'rgba(11,16,32,0.98)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-heading font-semibold text-white">{meta?.displayName ?? 'Default Master CV'}</h4>
              <button onClick={() => setPreview(null)} style={{ color: '#94A3B8' }}><X className="w-5 h-5" /></button>
            </div>
            <div className="cv-preview text-sm space-y-2" style={{ color: '#CBD5E1' }}>
              <ReactMarkdown>{preview}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  )
}
