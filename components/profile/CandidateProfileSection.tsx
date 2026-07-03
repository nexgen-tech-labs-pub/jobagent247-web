'use client'

import { useEffect, useState } from 'react'
import { Sparkles, Loader2, X, Plus, Check, RefreshCw, ShieldCheck } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { SecondaryButton } from '@/components/ui/SecondaryButton'
import type { CandidateProfile, CandidateProfileData, EducationEntry } from '@/lib/types/database'

const EMPTY: CandidateProfileData = {
  skills: [], tools: [], job_titles: [], industries: [], years_experience: null,
  seniority: null, education: [], certifications: [], achievements: [], visa_signal: null,
}

function toForm(p: CandidateProfile): CandidateProfileData {
  return {
    skills: p.skills, tools: p.tools, job_titles: p.job_titles, industries: p.industries,
    years_experience: p.years_experience, seniority: p.seniority, education: p.education,
    certifications: p.certifications, achievements: p.achievements, visa_signal: p.visa_signal,
  }
}

function ChipList({ label, values, onChange }: { label: string; values: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState('')
  function add() {
    const v = draft.trim()
    if (v && !values.includes(v)) onChange([...values, v])
    setDraft('')
  }
  return (
    <div>
      <label className="block text-xs font-medium mb-2" style={{ color: '#94A3B8' }}>{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(139,92,246,0.15)', color: '#C4B5FD', border: '1px solid rgba(139,92,246,0.3)' }}>
            {v}
            <button onClick={() => onChange(values.filter((x) => x !== v))} aria-label={`Remove ${v}`}><X className="w-3 h-3" /></button>
          </span>
        ))}
        {values.length === 0 && <span className="text-xs" style={{ color: '#64748B' }}>None extracted</span>}
      </div>
      <div className="flex gap-2">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          className="flex-1 px-3 py-1.5 rounded-lg text-sm text-white outline-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }} placeholder={`Add ${label.toLowerCase()}…`} />
        <SecondaryButton size="sm" onClick={add}><Plus className="w-3.5 h-3.5" /></SecondaryButton>
      </div>
    </div>
  )
}

export function CandidateProfileSection() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null)
  const [form, setForm] = useState<CandidateProfileData>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [extracting, setExtracting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const res = await fetch('/api/profile/structured')
        if (active && res.ok) {
          const { profile: p } = await res.json()
          if (p) { setProfile(p); setForm(toForm(p)) }
        }
      } catch { /* section degrades to the extract prompt */ }
      finally { if (active) setLoading(false) }
    })()
    return () => { active = false }
  }, [])

  async function extract() {
    setExtracting(true); setError(null); setSaved(false)
    try {
      const res = await fetch('/api/profile/extract', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Extraction failed'); return }
      setProfile(data.profile); setForm(toForm(data.profile))
    } catch { setError('Extraction failed. Please try again.') }
    finally { setExtracting(false) }
  }

  async function save() {
    setSaving(true); setError(null); setSaved(false)
    try {
      const res = await fetch('/api/profile/structured', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Save failed'); return }
      setProfile(data.profile); setSaved(true)
    } catch { setError('Save failed. Please try again.') }
    finally { setSaving(false) }
  }

  const set = <K extends keyof CandidateProfileData>(k: K, v: CandidateProfileData[K]) => setForm((f) => ({ ...f, [k]: v }))

  const header = (
    <div className="flex items-start justify-between gap-3 mb-1">
      <div>
        <h3 className="font-heading font-semibold text-white">Candidate Profile</h3>
        <p className="text-xs" style={{ color: '#64748B' }}>Structured data extracted from your CV — review and edit before it powers matching and applications.</p>
      </div>
      {profile && (
        <span className="text-xs px-2 py-0.5 rounded-full shrink-0 inline-flex items-center gap-1"
          style={profile.status === 'approved'
            ? { background: 'rgba(34,197,94,0.12)', color: '#22C55E' }
            : { background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}>
          {profile.status === 'approved' ? <><ShieldCheck className="w-3 h-3" /> Approved</> : 'Needs review'}
        </span>
      )}
    </div>
  )

  if (loading) {
    return <GlassCard className="p-6">{header}<div className="mt-4 flex items-center gap-2 text-sm" style={{ color: '#64748B' }}><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div></GlassCard>
  }

  if (!profile) {
    return (
      <GlassCard className="p-6">
        {header}
        <p className="text-sm mt-4 mb-4" style={{ color: '#CBD5E1' }}>Turn your uploaded CV into an editable, structured profile.</p>
        {error && <p className="text-sm mb-3 px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>{error}</p>}
        <GradientButton size="sm" onClick={extract} disabled={extracting}>
          {extracting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Extracting…</> : <><Sparkles className="w-3.5 h-3.5" /> Extract from CV</>}
        </GradientButton>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="p-6">
      {header}
      {profile.confidence != null && (
        <p className="text-xs mt-1 mb-4" style={{ color: '#64748B' }}>Extraction confidence: {profile.confidence}%</p>
      )}

      <div className="space-y-5">
        <ChipList label="Skills" values={form.skills} onChange={(v) => set('skills', v)} />
        <ChipList label="Tools & technologies" values={form.tools} onChange={(v) => set('tools', v)} />
        <ChipList label="Job titles" values={form.job_titles} onChange={(v) => set('job_titles', v)} />
        <ChipList label="Industries" values={form.industries} onChange={(v) => set('industries', v)} />
        <ChipList label="Certifications" values={form.certifications} onChange={(v) => set('certifications', v)} />
        <ChipList label="Achievements" values={form.achievements} onChange={(v) => set('achievements', v)} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#94A3B8' }}>Years of experience</label>
            <input type="number" min={0} value={form.years_experience ?? ''} onChange={(e) => set('years_experience', e.target.value === '' ? null : Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#94A3B8' }}>Seniority</label>
            <input value={form.seniority ?? ''} onChange={(e) => set('seniority', e.target.value || null)}
              className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }} placeholder="e.g. senior" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#94A3B8' }}>Work authorisation signal (only if on your CV)</label>
          <input value={form.visa_signal ?? ''} onChange={(e) => set('visa_signal', e.target.value || null)}
            className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }} placeholder="e.g. Eligible to work in the UK" />
        </div>

        <EducationEditor value={form.education} onChange={(v) => set('education', v)} />
      </div>

      {error && <p className="text-sm mt-4 px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>{error}</p>}
      {saved && <p className="text-sm mt-4 px-3 py-2 rounded-lg" style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}>Profile saved and approved.</p>}

      <div className="mt-5 flex flex-wrap gap-3">
        <GradientButton size="sm" onClick={save} disabled={saving}>
          {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : <><Check className="w-3.5 h-3.5" /> Save &amp; approve</>}
        </GradientButton>
        <SecondaryButton size="sm" onClick={extract} disabled={extracting}>
          {extracting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Re-extracting…</> : <><RefreshCw className="w-3.5 h-3.5" /> Re-extract from CV</>}
        </SecondaryButton>
      </div>
    </GlassCard>
  )
}

function EducationEditor({ value, onChange }: { value: EducationEntry[]; onChange: (v: EducationEntry[]) => void }) {
  function update(i: number, patch: Partial<EducationEntry>) {
    onChange(value.map((e, idx) => (idx === i ? { ...e, ...patch } : e)))
  }
  return (
    <div>
      <label className="block text-xs font-medium mb-2" style={{ color: '#94A3B8' }}>Education</label>
      <div className="space-y-2">
        {value.map((e, i) => (
          <div key={i} className="flex gap-2">
            <input value={e.degree} onChange={(ev) => update(i, { degree: ev.target.value })} placeholder="Degree"
              className="flex-1 px-3 py-1.5 rounded-lg text-sm text-white outline-none" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }} />
            <input value={e.institution} onChange={(ev) => update(i, { institution: ev.target.value })} placeholder="Institution"
              className="flex-1 px-3 py-1.5 rounded-lg text-sm text-white outline-none" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }} />
            <input value={e.year ?? ''} onChange={(ev) => update(i, { year: ev.target.value || null })} placeholder="Year"
              className="w-20 px-3 py-1.5 rounded-lg text-sm text-white outline-none" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }} />
            <SecondaryButton size="sm" onClick={() => onChange(value.filter((_, idx) => idx !== i))}><X className="w-3.5 h-3.5" /></SecondaryButton>
          </div>
        ))}
        {value.length === 0 && <span className="text-xs" style={{ color: '#64748B' }}>None extracted</span>}
      </div>
      <div className="mt-2">
        <SecondaryButton size="sm" onClick={() => onChange([...value, { degree: '', institution: '', year: null }])}><Plus className="w-3.5 h-3.5" /> Add education</SecondaryButton>
      </div>
    </div>
  )
}
