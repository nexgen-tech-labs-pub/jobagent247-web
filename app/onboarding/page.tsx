'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, ChevronRight, ChevronLeft, Check, Plus, X } from 'lucide-react'
import { GradientButton } from '@/components/ui/GradientButton'
import { CVUpload } from '@/components/profile/CVUpload'
import { getBrowserClient } from '@/lib/supabase-browser'
import type { CV } from '@/lib/types/database'

const STEPS = ['Basic Info', 'Job Preferences', 'Keywords', 'Priority', 'Upload CV']
const TOTAL = STEPS.length

type Prefs = {
  name: string
  currentRole: string
  location: string
  targetRoles: string[]
  jobType: string
  locationPref: string
  visaRequired: boolean
  keywords: string
  priority: string
}

const DEFAULTS: Prefs = {
  name: '',
  currentRole: '',
  location: '',
  targetRoles: [],
  jobType: 'Both',
  locationPref: 'Any',
  visaRequired: false,
  keywords: '',
  priority: 'Role title',
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS)
  const [tagInput, setTagInput] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [uploadedCVs, setUploadedCVs] = useState<CV[]>([])
  const [saving, setSaving] = useState(false)

  // Pre-fill name from Supabase auth metadata
  useEffect(() => {
    const supabase = getBrowserClient()
    supabase.auth.getUser().then((res: Awaited<ReturnType<typeof supabase.auth.getUser>>) => {
      const authUser = res.data.user
      if (!authUser) { router.replace('/login'); return }
      setUserId(authUser.id)
      setPrefs(p => ({
        ...p,
        name: (authUser.user_metadata as { full_name?: string })?.full_name ?? '',
      }))
    })
  }, [router])

  const set = useCallback(<K extends keyof Prefs>(k: K, v: Prefs[K]) =>
    setPrefs(p => ({ ...p, [k]: v })), [])

  const saveStep = useCallback(async () => {
    const body: Record<string, unknown> = {}
    if (step === 0) Object.assign(body, { name: prefs.name, current_role: prefs.currentRole, location: prefs.location })
    if (step === 1) Object.assign(body, { target_roles: prefs.targetRoles, job_type_pref: prefs.jobType, location_pref: prefs.locationPref, visa_required: prefs.visaRequired })
    if (step === 2) Object.assign(body, { keywords: prefs.keywords.split(/\s+/).filter(Boolean) })
    if (step === 3) Object.assign(body, { priority: prefs.priority })
    if (Object.keys(body).length) {
      await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    }
  }, [step, prefs])

  const next = useCallback(async () => {
    setSaving(true)
    await saveStep()
    setSaving(false)
    if (step < TOTAL - 1) { setStep(s => s + 1); return }
    // Final step — complete onboarding
    await fetch('/api/profile/complete-onboarding', { method: 'POST' })
    router.replace('/dashboard')
  }, [step, saveStep, router])

  const back = () => setStep(s => Math.max(0, s - 1))

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !prefs.targetRoles.includes(tag)) set('targetRoles', [...prefs.targetRoles, tag])
    setTagInput('')
  }

  if (!userId) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#8B5CF6', borderTopColor: 'transparent' }} />
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      {/* Logo */}
      <div className="flex items-center gap-2 font-heading font-bold text-[color:var(--foreground)] mb-10">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' }}>
          <Zap className="w-4 h-4 text-white" />
        </div>
        JobAgent247
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-lg mb-8">
        <div className="flex justify-between text-xs mb-2" style={{ color: '#64748B' }}>
          <span>{STEPS[step]}</span>
          <span>Step {step + 1} of {TOTAL}</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / TOTAL) * 100}%`, background: 'linear-gradient(90deg, #8B5CF6, #06B6D4)' }} />
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-lg rounded-2xl p-8 space-y-6"
        style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.10)' }}>

        {/* Step 1 — Basic Info */}
        {step === 0 && (
          <>
            <Heading>Let&apos;s start with the basics</Heading>
            <Field label="Full name">
              <Input value={prefs.name} onChange={v => set('name', v)} placeholder="Your full name" />
            </Field>
            <Field label="Current role / job title">
              <Input value={prefs.currentRole} onChange={v => set('currentRole', v)} placeholder="e.g. Senior DevOps Engineer" />
            </Field>
            <Field label="Location (city, country)">
              <Input value={prefs.location} onChange={v => set('location', v)} placeholder="e.g. London, UK" />
            </Field>
          </>
        )}

        {/* Step 2 — Job Preferences */}
        {step === 1 && (
          <>
            <Heading>What kind of roles are you after?</Heading>
            <Field label="Target roles">
              <div className="flex flex-wrap gap-2 mb-2">
                {prefs.targetRoles.map(r => (
                  <span key={r} className="flex items-center gap-1 text-sm px-3 py-1 rounded-full"
                    style={{ background: 'rgba(139,92,246,0.15)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.3)' }}>
                    {r}
                    <button onClick={() => set('targetRoles', prefs.targetRoles.filter(x => x !== r))}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={tagInput} onChange={setTagInput} placeholder="e.g. DevOps Engineer" onKeyDown={e => e.key === 'Enter' && addTag()} />
                <button onClick={addTag} className="px-3 py-2 rounded-xl text-sm" style={{ background: 'rgba(139,92,246,0.15)', color: '#8B5CF6' }}>
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </Field>
            <Field label="Job type">
              <Chips options={['Permanent', 'Contract', 'Both']} value={prefs.jobType} onChange={v => set('jobType', v)} />
            </Field>
            <Field label="Work location">
              <Chips options={['On-site', 'Hybrid', 'Remote', 'Any']} value={prefs.locationPref} onChange={v => set('locationPref', v)} />
            </Field>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[color:var(--foreground)]">Visa sponsorship required?</p>
                <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>Only show jobs offering sponsorship</p>
              </div>
              <Toggle value={prefs.visaRequired} onChange={v => set('visaRequired', v)} />
            </div>
          </>
        )}

        {/* Step 3 — Keywords */}
        {step === 2 && (
          <>
            <Heading>What skills and tools are you looking for?</Heading>
            <p className="text-sm" style={{ color: '#64748B' }}>Space-separated — these become your initial job search criteria.</p>
            <Field label="Keywords">
              <textarea
                value={prefs.keywords}
                onChange={e => set('keywords', e.target.value)}
                placeholder="e.g. AWS Terraform Kubernetes Python DevOps CI/CD"
                rows={4}
                className="w-full px-4 py-3 rounded-xl text-sm text-[color:var(--foreground)] outline-none resize-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
              />
            </Field>
            {prefs.keywords.trim() && (
              <div className="flex flex-wrap gap-2">
                {prefs.keywords.split(/\s+/).filter(Boolean).map(k => (
                  <span key={k} className="text-xs px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(6,182,212,0.12)', color: '#06B6D4', border: '1px solid rgba(6,182,212,0.2)' }}>
                    {k}
                  </span>
                ))}
              </div>
            )}
          </>
        )}

        {/* Step 4 — Priority */}
        {step === 3 && (
          <>
            <Heading>What matters most to you?</Heading>
            <p className="text-sm" style={{ color: '#64748B' }}>This helps us rank and surface the best job matches for you.</p>
            <div className="space-y-3">
              {['Salary', 'Location', 'Role title', 'Company', 'Benefits'].map(opt => (
                <button
                  key={opt}
                  onClick={() => set('priority', opt)}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-all text-left"
                  style={prefs.priority === opt
                    ? { background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.4)', color: '#8B5CF6' }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--color-text-secondary)' }}
                >
                  {opt}
                  {prefs.priority === opt && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 5 — CV Upload */}
        {step === 4 && (
          <>
            <Heading>Upload your CV</Heading>
            <p className="text-sm" style={{ color: '#64748B' }}>Our agents use your CV to tailor applications and score job matches. You can skip this and upload later.</p>
            <CVUpload
              userId={userId}
              existingCVs={uploadedCVs}
              onUploadComplete={cv => setUploadedCVs(p => [...p, cv])}
            />
          </>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-2">
          <button
            onClick={back}
            disabled={step === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-30 transition-colors"
            style={{ color: '#64748B' }}
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <GradientButton onClick={next} disabled={saving} size="sm">
            {saving ? 'Saving…' : step === TOTAL - 1 ? 'Go to Dashboard' : 'Continue'}
            {!saving && <ChevronRight className="w-4 h-4" />}
          </GradientButton>
        </div>
      </div>

      <p className="mt-6 text-xs text-center" style={{ color: '#475569' }}>
        You can update all of this later in your profile settings.
      </p>
    </div>
  )
}

// ─── Small primitives ─────────────────────────────────────────────────────────

function Heading({ children }: { children: React.ReactNode }) {
  return <h1 className="font-heading font-bold text-2xl text-[color:var(--foreground)]">{children}</h1>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: '#94A3B8' }}>{label}</label>
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder, onKeyDown }: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  onKeyDown?: (e: React.KeyboardEvent) => void
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      onKeyDown={onKeyDown}
      className="w-full px-4 py-2.5 rounded-xl text-sm text-[color:var(--foreground)] outline-none"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
    />
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

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className="w-12 h-6 rounded-full transition-colors relative shrink-0"
      style={{ background: value ? '#8B5CF6' : 'rgba(255,255,255,0.1)' }}>
      <span className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform"
        style={{ left: value ? '26px' : '4px' }} />
    </button>
  )
}
