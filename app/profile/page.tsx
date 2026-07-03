'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { Progress } from '@/components/ui/progress'
import { CVUpload } from '@/components/profile/CVUpload'
import { CandidateProfileSection } from '@/components/profile/CandidateProfileSection'
import { getBrowserClient } from '@/lib/supabase-browser'
import { Check, X, Plus, Zap, Loader2 } from 'lucide-react'
import type { User, CV } from '@/lib/types/database'

function calcStrength(u: User, cvCount: number): number {
  const checks = [
    !!u.name,
    !!u.email,
    !!u.location,
    !!u.current_role,
    (u.target_roles?.length ?? 0) > 0,
    (u.keywords?.length ?? 0) > 0,
    !!u.job_type_pref,
    !!u.location_pref,
    cvCount > 0,
    u.onboarding_complete,
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<User | null>(null)
  const [cvs, setCVs] = useState<CV[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const [agentRunning, setAgentRunning] = useState(false)
  const [agentError, setAgentError] = useState<string | null>(null)
  const [agentResult, setAgentResult] = useState<{
    topSkills: string[]
    experienceLevel: string
    preferredDomains: string[]
    yearsExperience: number | null
  } | null>(null)

  const runProfileAgent = async () => {
    setAgentRunning(true)
    setAgentError(null)
    setAgentResult(null)
    try {
      const res = await fetch('/api/profile/extract-skills', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Profile Agent failed')
      setAgentResult(data)
    } catch (err) {
      setAgentError(err instanceof Error ? err.message : 'Profile Agent failed')
    } finally {
      setAgentRunning(false)
    }
  }

  const acceptSuggestedSkills = () => {
    if (!agentResult || !profile) return
    const existing = profile.keywords ?? []
    const next = Array.from(new Set([...existing, ...agentResult.topSkills.map(s => s.toLowerCase())]))
    setProfile(p => p ? { ...p, keywords: next } : p)
    save({ keywords: next })
    setAgentResult(null)
  }

  useEffect(() => {
    const supabase = getBrowserClient()
    ;(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUserId(user.id)
          // Load existing CVs from the DB — previously this state was only
          // populated by an in-session upload, so refreshing the page made
          // any previously-uploaded CV "vanish" and profile strength drop.
          const { data: cvRows } = await supabase
            .from('cvs')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
          if (cvRows) setCVs(cvRows as CV[])
        }

        const res = await fetch('/api/profile')
        if (!res.ok) {
          const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
          throw new Error(body.error ?? `HTTP ${res.status}`)
        }
        const data: User = await res.json()
        setProfile(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const save = async (updates: Partial<User>) => {
    setSaving(true)
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    const updated: User = await res.json()
    setProfile(updated)
    setSaving(false)
  }

  const addTag = (field: 'target_roles' | 'keywords', input: string, setInput: (v: string) => void) => {
    const tag = input.trim()
    if (!tag) return
    const current = profile?.[field] ?? []
    if (!current.includes(tag)) {
      setProfile(p => p ? { ...p, [field]: [...current, tag] } : p)
      save({ [field]: [...current, tag] })
    }
    setInput('')
  }

  const removeTag = (field: 'target_roles' | 'keywords', tag: string) => {
    const current = profile?.[field] ?? []
    const next = current.filter(t => t !== tag)
    setProfile(p => p ? { ...p, [field]: next } : p)
    save({ [field]: next })
  }

  if (loading) {
    return (
      <DashboardLayout title="My Profile">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#8B5CF6' }} />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !profile) {
    return (
      <DashboardLayout title="My Profile">
        <div className="flex items-center justify-center h-64">
          <p className="text-sm px-4 py-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error ?? 'Failed to load profile'}
          </p>
        </div>
      </DashboardLayout>
    )
  }

  const strength = calcStrength(profile, cvs.length)
  const completionItems = [
    { label: 'Basic info', done: !!(profile.name && profile.location) },
    { label: 'CV uploaded', done: cvs.length > 0 },
    { label: 'Target roles', done: (profile.target_roles?.length ?? 0) > 0 },
    { label: 'Keywords added', done: (profile.keywords?.length ?? 0) > 0 },
    { label: 'Job preferences', done: !!(profile.job_type_pref && profile.location_pref) },
    { label: 'Onboarding done', done: profile.onboarding_complete },
  ]

  return (
    <DashboardLayout title="My Profile">
      <div className="max-w-3xl space-y-6">

        {/* Profile strength */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-semibold text-white">Profile Strength</h3>
              <p className="text-sm mt-0.5" style={{ color: '#94A3B8' }}>Complete your profile so agents can give better recommendations</p>
            </div>
            <span className="font-heading font-bold text-2xl" style={{ color: '#8B5CF6' }}>{strength}%</span>
          </div>
          <Progress value={strength} className="h-2" />
          <div className="flex flex-wrap gap-2 mt-4">
            {completionItems.map(item => (
              <span key={item.label} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                style={item.done
                  ? { background: 'rgba(34,197,94,0.12)', color: '#22C55E' }
                  : { background: 'rgba(255,255,255,0.05)', color: '#64748B' }}>
                {item.done ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} {item.label}
              </span>
            ))}
          </div>
        </GlassCard>

        {/* Basic info */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading font-semibold text-white">Basic Information</h3>
            {saving && <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#8B5CF6' }} />}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {([
              { label: 'Full name', key: 'name' as const, placeholder: 'Your full name' },
              { label: 'Current role', key: 'current_role' as const, placeholder: 'e.g. Senior DevOps Engineer' },
              { label: 'Location', key: 'location' as const, placeholder: 'e.g. London, UK' },
              { label: 'Email', key: 'email' as const, placeholder: 'your@email.com' },
            ] as const).map(field => (
              <div key={field.key}>
                <label className="block text-xs font-medium mb-2" style={{ color: '#94A3B8' }}>{field.label}</label>
                <input
                  type="text"
                  defaultValue={profile[field.key] ?? ''}
                  placeholder={field.placeholder}
                  onBlur={e => { if (e.target.value !== (profile[field.key] ?? '')) save({ [field.key]: e.target.value }) }}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                />
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Target roles */}
        <GlassCard className="p-6">
          <h3 className="font-heading font-semibold text-white mb-4">Target Roles</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {(profile.target_roles ?? []).map(role => (
              <span key={role} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(139,92,246,0.12)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.25)' }}>
                {role}
                <button onClick={() => removeTag('target_roles', role)}><X className="w-3 h-3" /></button>
              </span>
            ))}
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag('target_roles', tagInput, setTagInput) } }}
                placeholder="Add role…"
                className="px-3 py-1.5 rounded-full text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#CBD5E1', border: '1px dashed rgba(255,255,255,0.15)', minWidth: 120 }}
              />
              <button onClick={() => addTag('target_roles', tagInput, setTagInput)}
                className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#64748B', border: '1px dashed rgba(255,255,255,0.15)' }}>
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Job preferences */}
        <GlassCard className="p-6">
          <h3 className="font-heading font-semibold text-white mb-4">Job Preferences</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: '#94A3B8' }}>Job type</label>
              <Chips options={['Permanent', 'Contract', 'Both']} value={profile.job_type_pref ?? 'Both'}
                onChange={v => save({ job_type_pref: v })} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: '#94A3B8' }}>Work location</label>
              <Chips options={['On-site', 'Hybrid', 'Remote', 'Any']} value={profile.location_pref ?? 'Any'}
                onChange={v => save({ location_pref: v })} />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <p className="text-sm font-medium text-white">Visa Sponsorship Required</p>
              <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>Only show jobs that offer visa sponsorship</p>
            </div>
            <button
              onClick={() => save({ visa_required: !profile.visa_required })}
              className="w-12 h-6 rounded-full transition-colors relative"
              style={{ background: profile.visa_required ? '#8B5CF6' : 'rgba(255,255,255,0.1)' }}>
              <span className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform"
                style={{ left: profile.visa_required ? '26px' : '4px' }} />
            </button>
          </div>
        </GlassCard>

        {/* Keywords */}
        <GlassCard className="p-6">
          <h3 className="font-heading font-semibold text-white mb-4">Search Keywords</h3>
          <p className="text-sm mb-3" style={{ color: '#94A3B8' }}>Press Enter or Space to add a skill. Used for job matching.</p>
          <input
            type="text"
            value={tagInput}
            onChange={e => {
              const v = e.target.value
              if (v.endsWith(' ') || v.endsWith(',')) {
                addTag('keywords', v.slice(0, -1), setTagInput)
              } else {
                setTagInput(v)
              }
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault()
                addTag('keywords', tagInput, setTagInput)
              } else if (e.key === 'Backspace' && tagInput === '' && (profile.keywords?.length ?? 0) > 0) {
                e.preventDefault()
                const last = (profile.keywords ?? [])[profile.keywords!.length - 1]
                removeTag('keywords', last)
              }
            }}
            placeholder="e.g. AWS, Terraform, Kubernetes"
            className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
          />
          {(profile.keywords?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {(profile.keywords ?? []).map(k => (
                <span key={k} className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(6,182,212,0.12)', color: '#06B6D4', border: '1px solid rgba(6,182,212,0.2)' }}>
                  {k}
                  <button
                    type="button"
                    onClick={() => removeTag('keywords', k)}
                    className="hover:opacity-70"
                    aria-label={`Remove ${k}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </GlassCard>

        {/* CV Upload */}
        <GlassCard className="p-6">
          <h3 className="font-heading font-semibold text-white mb-4">CV Upload</h3>
          {userId && (
            <CVUpload
              userId={userId}
              existingCVs={cvs}
              onUploadComplete={cv => setCVs(p => [...p, cv])}
            />
          )}
        </GlassCard>

        <CandidateProfileSection />

        <GradientButton
          size="lg"
          className="w-full justify-center"
          onClick={runProfileAgent}
          disabled={agentRunning || cvs.length === 0}
        >
          {agentRunning
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Reading your CV…</>
            : <><Zap className="w-4 h-4" /> Run Profile Agent</>}
        </GradientButton>

        {cvs.length === 0 && (
          <p className="text-xs text-center" style={{ color: '#64748B' }}>
            Upload a CV above to enable the Profile Agent.
          </p>
        )}

        {agentError && (
          <p className="text-sm px-4 py-3 rounded-xl"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            {agentError}
          </p>
        )}

        {agentResult && (
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-semibold text-white">Profile Agent suggestions</h3>
              <button
                onClick={() => setAgentResult(null)}
                className="text-xs px-2 py-1 rounded-full hover:opacity-80"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                Dismiss
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div className="p-3 rounded-xl" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
                <p className="text-xs mb-1" style={{ color: '#94A3B8' }}>Seniority</p>
                <p className="text-white font-medium capitalize">{agentResult.experienceLevel}</p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}>
                <p className="text-xs mb-1" style={{ color: '#94A3B8' }}>Years of experience</p>
                <p className="text-white font-medium">{agentResult.yearsExperience ?? '—'}</p>
              </div>
            </div>

            {agentResult.preferredDomains.length > 0 && (
              <div className="mb-4">
                <p className="text-xs mb-2" style={{ color: '#94A3B8' }}>Domains detected</p>
                <div className="flex flex-wrap gap-1.5">
                  {agentResult.preferredDomains.map(d => (
                    <span key={d} className="text-xs px-2.5 py-1 rounded-full capitalize"
                      style={{ background: 'rgba(139,92,246,0.12)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.25)' }}>
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs mb-2" style={{ color: '#94A3B8' }}>
              Suggested keywords ({agentResult.topSkills.length})
            </p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {agentResult.topSkills.map(s => (
                <span key={s} className="text-xs px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(34,197,94,0.10)', color: '#86EFAC', border: '1px solid rgba(34,197,94,0.25)' }}>
                  {s}
                </span>
              ))}
            </div>

            <GradientButton size="sm" className="w-full justify-center" onClick={acceptSuggestedSkills} disabled={saving}>
              {saving ? 'Saving…' : 'Add these to my keywords'}
            </GradientButton>
          </GlassCard>
        )}

      </div>
    </DashboardLayout>
  )
}

function Chips({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button key={opt} onClick={() => onChange(opt)}
          className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
          style={value === opt
            ? { background: 'rgba(139,92,246,0.15)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.3)' }
            : { background: 'rgba(255,255,255,0.05)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)' }}>
          {opt}
        </button>
      ))}
    </div>
  )
}
