'use client'

import { useState, useRef } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { SecondaryButton } from '@/components/ui/SecondaryButton'
import {
  Loader2, Zap, XCircle, BookOpen, Code, Target, CheckCircle,
  AlertTriangle, Lightbulb, Users, Star, Trash2, Library,
  ChevronDown, ChevronUp, Save,
} from 'lucide-react'
import type { EvidenceBundle, SavedEvidenceAsset, EvidenceAssetType } from '@/lib/types/database'

type Tab = 'build' | 'library'

const OUTPUT_TYPES: { value: EvidenceAssetType; label: string }[] = [
  { value: 'full_bundle', label: 'Full Evidence Pack (all types)' },
  { value: 'portfolio_project', label: 'Portfolio Project Only' },
  { value: 'star_story', label: 'STAR Stories Only' },
  { value: 'cv_bullets', label: 'CV Bullets Only' },
  { value: 'linkedin_bullets', label: 'LinkedIn Bullets Only' },
  { value: 'interview_pack', label: 'Interview Evidence Pack Only' },
]

const ASSET_TYPE_LABELS: Record<EvidenceAssetType, string> = {
  full_bundle: 'Full Pack',
  portfolio_project: 'Portfolio Project',
  star_story: 'STAR Story',
  cv_bullets: 'CV Bullets',
  linkedin_bullets: 'LinkedIn Bullets',
  interview_pack: 'Interview Pack',
}

const ASSET_TYPE_COLORS: Record<EvidenceAssetType, string> = {
  full_bundle: '#8B5CF6',
  portfolio_project: '#06B6D4',
  star_story: '#F59E0B',
  cv_bullets: '#22C55E',
  linkedin_bullets: '#3B82F6',
  interview_pack: '#EC4899',
}

function GapBadge({ gapType }: { gapType: 'critical' | 'important' | 'nice_to_have' }) {
  const cfg = {
    critical:      { label: 'Critical',      color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)' },
    important:     { label: 'Important',     color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)' },
    nice_to_have:  { label: 'Nice to Have',  color: '#64748B', bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.3)' },
  }[gapType]
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      {cfg.label}
    </span>
  )
}

function Section({ title, icon, color, children }: {
  title: string; icon: React.ReactNode; color: string; children: React.ReactNode
}) {
  const [open, setOpen] = useState(true)
  return (
    <GlassCard className="overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4"
        style={{ borderBottom: open ? '1px solid rgba(255,255,255,0.08)' : 'none' }}
      >
        <span className="font-heading font-semibold text-white flex items-center gap-2 text-sm">
          <span style={{ color }}>{icon}</span>
          {title}
        </span>
        {open ? <ChevronUp className="w-4 h-4" style={{ color: '#64748B' }} /> : <ChevronDown className="w-4 h-4" style={{ color: '#64748B' }} />}
      </button>
      {open && <div className="px-5 py-4">{children}</div>}
    </GlassCard>
  )
}

function BulletList({ items, accentColor }: { items: string[]; accentColor?: string }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm leading-relaxed" style={{ color: '#F1F5F9' }}>
          <span className="mt-2 w-2 h-2 rounded-full shrink-0" style={{ background: accentColor ?? '#8B5CF6' }} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function EvidenceBuilderPage() {
  const [tab, setTab] = useState<Tab>('build')
  const [targetRole, setTargetRole] = useState('')
  const [skillOrGap, setSkillOrGap] = useState('')
  const [assetType, setAssetType] = useState<EvidenceAssetType>('full_bundle')
  const [loading, setLoading] = useState(false)
  const [bundle, setBundle] = useState<EvidenceBundle | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState<string | null>(null)
  const [library, setLibrary] = useState<SavedEvidenceAsset[] | null>(null)
  const [libLoading, setLibLoading] = useState(false)
  const [libError, setLibError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const handleGenerate = async () => {
    if (loading) { abortRef.current?.abort(); setLoading(false); return }
    if (!targetRole.trim()) return
    setLoading(true); setError(null); setBundle(null); setSavedMsg(null)
    const ctrl = new AbortController(); abortRef.current = ctrl
    try {
      const res = await fetch('/api/evidence/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRole: targetRole.trim(), skillOrGap: skillOrGap.trim(), assetType }),
        signal: ctrl.signal,
      })
      const data = await res.json() as { bundle?: EvidenceBundle; error?: string }
      if (!res.ok) { setError(data.error ?? 'Generation failed'); return }
      setBundle(data.bundle!)
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return
      setError('Network error. Please try again.')
    } finally { setLoading(false) }
  }

  const handleSave = async () => {
    if (!bundle || !targetRole.trim()) return
    setSaving(true); setSavedMsg(null)
    try {
      const res = await fetch('/api/evidence/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetType,
          title: `${targetRole.trim()}${skillOrGap.trim() ? ` — ${skillOrGap.trim()}` : ''}`,
          targetRole: targetRole.trim(),
          skillOrGap: skillOrGap.trim() || null,
          content: bundle,
        }),
      })
      if (res.ok) { setSavedMsg('Saved to your Evidence Library.') }
      else { const d = await res.json() as { error?: string }; setSavedMsg(`Save failed: ${d.error ?? 'Unknown error'}`) }
    } catch { setSavedMsg('Save failed. Try again.') }
    finally { setSaving(false) }
  }

  const loadLibrary = async () => {
    setLibLoading(true); setLibError(null)
    try {
      const res = await fetch('/api/evidence/assets')
      const data = await res.json() as { assets?: SavedEvidenceAsset[]; error?: string }
      if (!res.ok) setLibError(data.error ?? 'Failed to load library')
      else setLibrary((data.assets ?? []) as SavedEvidenceAsset[])
    } catch { setLibError('Network error.') }
    finally { setLibLoading(false) }
  }

  const handleDeleteAsset = async (id: string) => {
    setDeleting(id)
    try {
      const res = await fetch(`/api/evidence/assets/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setLibrary(prev => prev?.filter(a => a.id !== id) ?? null)
      } else {
        setLibError('Failed to delete asset. Please try again.')
      }
    } catch {
      setLibError('Network error. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  const handleTabChange = (t: Tab) => {
    setTab(t)
    if (t === 'library' && library === null) loadLibrary()
  }

  return (
    <DashboardLayout title="Evidence Builder">
      <div className="max-w-3xl space-y-5">

        {/* Tab bar */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', width: 'fit-content' }}>
          {(['build', 'library'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize"
              style={tab === t
                ? { background: 'linear-gradient(135deg,#8B5CF6,#06B6D4)', color: 'white' }
                : { color: '#64748B' }
              }
            >
              {t === 'build' ? 'Build Evidence' : 'My Library'}
            </button>
          ))}
        </div>

        {/* ── BUILD TAB ── */}
        {tab === 'build' && (
          <>
            <GlassCard className="p-5 space-y-4">
              <div>
                <h2 className="font-heading font-semibold text-white mb-1 flex items-center gap-2">
                  <Zap className="w-4 h-4" style={{ color: '#8B5CF6' }} /> Generate Career Evidence
                </h2>
                <p className="text-sm" style={{ color: '#94A3B8' }}>
                  Enter a target role and an optional skill gap. The agent will analyse your CV and produce portfolio projects, STAR stories, CV bullets, LinkedIn bullets, and an interview pack.
                </p>
              </div>

              <div className="space-y-3">
                <input
                  value={targetRole}
                  onChange={e => setTargetRole(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') void handleGenerate() }}
                  placeholder="Target role (e.g. Senior Platform Engineer, Staff SRE, Data Engineer)"
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                />
                <input
                  value={skillOrGap}
                  onChange={e => setSkillOrGap(e.target.value)}
                  placeholder="Skill / gap focus (optional — e.g. Kubernetes, leadership, system design)"
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                />
                <select
                  value={assetType}
                  onChange={e => setAssetType(e.target.value as EvidenceAssetType)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                >
                  {OUTPUT_TYPES.map(o => (
                    <option key={o.value} value={o.value} style={{ background: '#0B1020' }}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <GradientButton onClick={handleGenerate} disabled={!loading && !targetRole.trim()}>
                  {loading
                    ? <><XCircle className="w-4 h-4" /> Cancel</>
                    : <><Zap className="w-4 h-4" /> Generate Evidence</>}
                </GradientButton>
                {bundle && (
                  <SecondaryButton size="sm" onClick={handleSave} disabled={saving}>
                    <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save to Library'}
                  </SecondaryButton>
                )}
              </div>

              {error && <p className="text-sm" style={{ color: '#EF4444' }}>{error}</p>}
              {savedMsg && <p className="text-sm" style={{ color: savedMsg.startsWith('Save failed') ? '#EF4444' : '#22C55E' }}>{savedMsg}</p>}
              <p className="text-xs" style={{ color: '#64748B' }}>
                Requires a primary CV. AI output is draft guidance — verify all claims before use. Takes ~25 seconds.
              </p>
            </GlassCard>

            {loading && (
              <div className="flex items-center gap-3" style={{ color: '#8B5CF6' }}>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Analysing your CV and building evidence assets…</span>
              </div>
            )}

            {bundle && (
              <div className="space-y-4">
                {/* Summary */}
                <GlassCard className="p-5">
                  <p className="text-sm leading-relaxed font-medium" style={{ color: '#F1F5F9' }}>{bundle.evidenceGapSummary}</p>
                </GlassCard>

                {/* Evidence Gaps */}
                {bundle.detectedEvidenceGaps.length > 0 && (
                  <Section title="Evidence Gaps" icon={<AlertTriangle className="w-4 h-4" />} color="#F87171">
                    <div className="space-y-4">
                      {bundle.detectedEvidenceGaps.map((gap, i) => (
                        <div key={i} className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">{gap.skillOrTheme}</span>
                            <GapBadge gapType={gap.gapType} />
                          </div>
                          <p className="text-sm" style={{ color: '#CBD5E1' }}>{gap.description}</p>
                          <p className="text-xs" style={{ color: '#94A3B8' }}>
                            <span style={{ color: '#F59E0B' }}>Current: </span>{gap.currentEvidenceSummary}
                          </p>
                          <p className="text-xs" style={{ color: '#94A3B8' }}>
                            <span style={{ color: '#22C55E' }}>Strategy: </span>{gap.recommendedEvidenceStrategy}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Portfolio Projects */}
                {bundle.portfolioProjects.length > 0 && (
                  <Section title="Portfolio Projects" icon={<Code className="w-4 h-4" />} color="#06B6D4">
                    <div className="space-y-6">
                      {bundle.portfolioProjects.map((proj, i) => (
                        <div key={i} className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="font-heading font-semibold text-white text-sm">{proj.projectTitle}</h4>
                            <span className="text-xs px-2 py-0.5 rounded-full shrink-0" style={{ background: 'rgba(6,182,212,0.12)', color: '#06B6D4', border: '1px solid rgba(6,182,212,0.25)' }}>
                              {proj.difficultyLevel} · {proj.estimatedEffort}
                            </span>
                          </div>
                          <p className="text-sm" style={{ color: '#CBD5E1' }}>{proj.problemStatement}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {proj.tools.map((t, j) => (
                              <span key={j} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(6,182,212,0.08)', color: '#67E8F9', border: '1px solid rgba(6,182,212,0.2)' }}>{t}</span>
                            ))}
                          </div>
                          {proj.implementationSteps.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold mb-1.5" style={{ color: '#94A3B8' }}>Steps</p>
                              <ol className="space-y-1">
                                {proj.implementationSteps.map((s, j) => (
                                  <li key={j} className="text-xs flex gap-2 leading-relaxed" style={{ color: '#F1F5F9' }}>
                                    <span className="shrink-0 font-semibold" style={{ color: '#06B6D4' }}>{j + 1}.</span>
                                    {s}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}
                          {proj.cvBullets.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold mb-1.5" style={{ color: '#94A3B8' }}>CV Bullets</p>
                              <BulletList items={proj.cvBullets} accentColor="#06B6D4" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* STAR Stories */}
                {bundle.starStories.length > 0 && (
                  <Section title="STAR Stories" icon={<Star className="w-4 h-4" />} color="#F59E0B">
                    <div className="space-y-6">
                      {bundle.starStories.map((story, i) => (
                        <div key={i} className="space-y-3">
                          <div className="flex items-center gap-2">
                            <h4 className="font-heading font-semibold text-white text-sm">{story.title}</h4>
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{
                              background: story.confidenceLevel === 'high' ? 'rgba(34,197,94,0.12)' : story.confidenceLevel === 'medium' ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
                              color: story.confidenceLevel === 'high' ? '#22C55E' : story.confidenceLevel === 'medium' ? '#F59E0B' : '#EF4444',
                              border: `1px solid ${story.confidenceLevel === 'high' ? 'rgba(34,197,94,0.3)' : story.confidenceLevel === 'medium' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`,
                            }}>
                              {story.confidenceLevel} confidence
                            </span>
                          </div>
                          {[
                            { label: 'S', text: story.situation },
                            { label: 'T', text: story.task },
                            { label: 'A', text: story.action },
                            { label: 'R', text: story.result },
                          ].map(({ label, text }) => (
                            <div key={label} className="flex gap-3">
                              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                                style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>{label}</span>
                              <p className="text-sm leading-relaxed" style={{ color: '#F1F5F9' }}>{text}</p>
                            </div>
                          ))}
                          {story.missingDetails.length > 0 && (
                            <div className="rounded-xl p-3" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                              <p className="text-xs font-semibold mb-1" style={{ color: '#EF4444' }}>You need to provide:</p>
                              <ul className="space-y-0.5">
                                {story.missingDetails.map((d, j) => (
                                  <li key={j} className="text-xs" style={{ color: '#FCA5A5' }}>• {d}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* CV Bullets */}
                {bundle.cvBullets.length > 0 && (
                  <Section title="CV Achievement Bullets" icon={<Target className="w-4 h-4" />} color="#22C55E">
                    <BulletList items={bundle.cvBullets} accentColor="#22C55E" />
                  </Section>
                )}

                {/* LinkedIn Bullets */}
                {bundle.linkedinBullets.length > 0 && (
                  <Section title="LinkedIn Bullets" icon={<Users className="w-4 h-4" />} color="#3B82F6">
                    <BulletList items={bundle.linkedinBullets} accentColor="#3B82F6" />
                  </Section>
                )}

                {/* Interview Pack */}
                <Section title="Interview Evidence Pack" icon={<Lightbulb className="w-4 h-4" />} color="#EC4899">
                  <div className="space-y-5">
                    <div>
                      <p className="text-xs font-semibold mb-2" style={{ color: '#EC4899' }}>60-Second Pitch</p>
                      <p className="text-sm leading-relaxed p-3 rounded-xl" style={{ background: 'rgba(236,72,153,0.08)', color: '#F1F5F9', border: '1px solid rgba(236,72,153,0.2)' }}>
                        {bundle.interviewEvidencePack.sixtySecondPitch}
                      </p>
                    </div>
                    {bundle.interviewEvidencePack.technicalDeepDivePoints.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold mb-2" style={{ color: '#94A3B8' }}>Technical Deep-Dive Points</p>
                        <BulletList items={bundle.interviewEvidencePack.technicalDeepDivePoints} accentColor="#EC4899" />
                      </div>
                    )}
                    {bundle.interviewEvidencePack.commonFollowUpQuestions.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold mb-2" style={{ color: '#94A3B8' }}>Common Follow-Up Questions</p>
                        <BulletList items={bundle.interviewEvidencePack.commonFollowUpQuestions} accentColor="#94A3B8" />
                      </div>
                    )}
                  </div>
                </Section>

                {/* Completion Checklist */}
                {bundle.completionChecklist.length > 0 && (
                  <Section title="Completion Checklist" icon={<CheckCircle className="w-4 h-4" />} color="#A78BFA">
                    <ul className="space-y-2">
                      {bundle.completionChecklist.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#F1F5F9' }}>
                          <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#A78BFA' }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}

                {/* Disclaimer */}
                <p className="text-xs px-1" style={{ color: '#475569' }}>
                  AI-generated draft guidance. Verify all claims, metrics, and experience before using in applications or interviews. Never misrepresent your experience.
                </p>

                <SecondaryButton size="sm" onClick={() => { setBundle(null); setTargetRole(''); setSkillOrGap(''); setSavedMsg(null) }}>
                  Generate New Pack
                </SecondaryButton>
              </div>
            )}
          </>
        )}

        {/* ── LIBRARY TAB ── */}
        {tab === 'library' && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-semibold text-white flex items-center gap-2">
                <Library className="w-4 h-4" style={{ color: '#8B5CF6' }} /> Evidence Library
              </h2>
              <SecondaryButton size="sm" onClick={loadLibrary} disabled={libLoading}>
                {libLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Refresh'}
              </SecondaryButton>
            </div>

            {libLoading && (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#8B5CF6' }} />
              </div>
            )}

            {libError && !libLoading && (
              <GlassCard className="p-5 text-center">
                <p className="text-sm" style={{ color: '#94A3B8' }}>{libError}</p>
              </GlassCard>
            )}

            {library !== null && !libLoading && library.length === 0 && (
              <GlassCard className="p-8 text-center">
                <BookOpen className="w-8 h-8 mx-auto mb-3" style={{ color: '#475569' }} />
                <p className="text-sm font-semibold text-white mb-1">No evidence assets saved yet</p>
                <p className="text-sm" style={{ color: '#64748B' }}>Generate evidence in the Build tab and click Save to Library.</p>
              </GlassCard>
            )}

            {library !== null && !libLoading && library.length > 0 && (
              <div className="space-y-3">
                {library.map(asset => (
                  <GlassCard key={asset.id} className="p-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-semibold shrink-0"
                          style={{
                            background: `${ASSET_TYPE_COLORS[asset.asset_type as EvidenceAssetType]}18`,
                            color: ASSET_TYPE_COLORS[asset.asset_type as EvidenceAssetType],
                            border: `1px solid ${ASSET_TYPE_COLORS[asset.asset_type as EvidenceAssetType]}44`,
                          }}
                        >
                          {ASSET_TYPE_LABELS[asset.asset_type as EvidenceAssetType]}
                        </span>
                        <span className="text-xs truncate" style={{ color: '#64748B' }}>
                          {new Date(asset.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-white truncate">{asset.title}</p>
                      {asset.skill_or_gap && (
                        <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>Gap: {asset.skill_or_gap}</p>
                      )}
                    </div>
                    <button
                      onClick={() => void handleDeleteAsset(asset.id)}
                      disabled={deleting === asset.id}
                      className="shrink-0 p-2 rounded-lg transition-colors"
                      style={{ color: deleting === asset.id ? '#475569' : '#EF4444' }}
                      aria-label="Delete evidence asset"
                    >
                      {deleting === asset.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />}
                    </button>
                  </GlassCard>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
