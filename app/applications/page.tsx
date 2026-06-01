'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { GlassCard } from '@/components/ui/GlassCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { getBrowserClient } from '@/lib/supabase-browser'
import type { UserJobWithJob, ApplicationStatus } from '@/lib/types/database'
import { Building2, Calendar, MapPin, Trash2, ChevronDown, Check, X, Plus } from 'lucide-react'

type AppStatus = ApplicationStatus

const COLUMNS: { status: AppStatus; label: string; color: string }[] = [
  { status: 'saved',        label: 'Saved',        color: '#64748B' },
  { status: 'applied',      label: 'Applied',       color: '#3B82F6' },
  { status: 'interviewing', label: 'Interviewing',  color: '#8B5CF6' },
  { status: 'offered',      label: 'Offered',       color: '#22C55E' },
  { status: 'rejected',     label: 'Rejected',      color: '#EF4444' },
]

interface EditDraft {
  notes: string
  followUp: string
}

export default function ApplicationsPage() {
  const [items, setItems] = useState<UserJobWithJob[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<EditDraft>({ notes: '', followUp: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const supabase = getBrowserClient()
        const { data, error } = await supabase
          .from('user_jobs')
          .select('*, job:jobs(id, title, company, location, type, visa_sponsorship)')
          .order('created_at', { ascending: false })
        if (error) throw error
        setItems((data ?? []) as UserJobWithJob[])
      } catch (e) {
        setFetchError(e instanceof Error ? e.message : 'Failed to load applications')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleStatusChange(id: string, newStatus: AppStatus) {
    const prev = items
    const appliedAt = newStatus === 'applied'
      ? (items.find(i => i.id === id)?.applied_at ?? new Date().toISOString())
      : items.find(i => i.id === id)?.applied_at ?? null

    setItems(cur => cur.map(i =>
      i.id === id ? { ...i, status: newStatus, applied_at: appliedAt } : i
    ))
    try {
      const supabase = getBrowserClient()
      const update: Record<string, unknown> = { status: newStatus }
      if (newStatus === 'applied' && !items.find(i => i.id === id)?.applied_at) {
        update.applied_at = new Date().toISOString()
      }
      const { error } = await supabase.from('user_jobs').update(update).eq('id', id)
      if (error) throw error
    } catch {
      setItems(prev)
    }
  }

  async function handleDelete(id: string) {
    const prev = items
    setItems(cur => cur.filter(i => i.id !== id))
    if (expandedId === id) setExpandedId(null)
    try {
      const supabase = getBrowserClient()
      const { error } = await supabase.from('user_jobs').delete().eq('id', id)
      if (error) throw error
    } catch {
      setItems(prev)
    }
  }

  function openEdit(item: UserJobWithJob) {
    setExpandedId(item.id)
    setDraft({
      notes: item.notes ?? '',
      followUp: item.follow_up_date ?? '',
    })
  }

  async function handleSave(id: string) {
    setSaving(true)
    try {
      const supabase = getBrowserClient()
      const { error } = await supabase
        .from('user_jobs')
        .update({
          notes: draft.notes || null,
          follow_up_date: draft.followUp || null,
        })
        .eq('id', id)
      if (error) throw error
      setItems(cur => cur.map(i =>
        i.id === id
          ? { ...i, notes: draft.notes || null, follow_up_date: draft.followUp || null }
          : i
      ))
      setExpandedId(null)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Applications">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {COLUMNS.map(col => (
            <div key={col.status}>
              <div className="h-6 w-24 rounded mb-3" style={{ background: 'rgba(255,255,255,0.06)' }} />
              {[1, 2].map(n => (
                <div key={n} className="h-28 rounded-2xl mb-3" style={{ background: 'rgba(255,255,255,0.04)' }} />
              ))}
            </div>
          ))}
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Applications">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm" style={{ color: '#94A3B8' }}>
          {fetchError ? (
            <span style={{ color: '#EF4444' }}>{fetchError}</span>
          ) : (
            `${items.length} total application${items.length !== 1 ? 's' : ''}`
          )}
        </p>
        <a
          href="/job-matches"
          className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
            color: '#fff',
            boxShadow: '0 8px 24px rgba(139,92,246,0.3)',
          }}
        >
          <Plus className="w-3.5 h-3.5" /> Find Jobs
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
        {COLUMNS.map((col) => {
          const cards = items.filter(i => i.status === col.status)
          return (
            <div key={col.status}>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-heading font-semibold text-sm text-white">{col.label}</h3>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${col.color}22`, color: col.color }}
                >
                  {cards.length}
                </span>
              </div>

              <div className="space-y-3">
                {cards.map((item) => {
                  const isExpanded = expandedId === item.id
                  return (
                    <GlassCard key={item.id} className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-sm font-semibold text-white leading-tight flex-1">
                          {item.job?.title ?? 'Unknown role'}
                        </h4>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="shrink-0 p-1 rounded-lg opacity-40 hover:opacity-100 transition-opacity"
                          style={{ color: '#EF4444' }}
                          aria-label="Remove application"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.job?.company && (
                        <div className="flex items-center gap-1.5 mb-1 text-xs" style={{ color: '#64748B' }}>
                          <Building2 className="w-3 h-3 shrink-0" />
                          {item.job.company}
                        </div>
                      )}
                      {item.job?.location && (
                        <div className="flex items-center gap-1.5 mb-3 text-xs" style={{ color: '#64748B' }}>
                          <MapPin className="w-3 h-3 shrink-0" />
                          {item.job.location}
                        </div>
                      )}

                      {item.match_score != null && (
                        <div className="mb-2 text-xs font-semibold" style={{ color: '#8B5CF6' }}>
                          {item.match_score}% match
                        </div>
                      )}

                      {/* Status selector */}
                      <div className="relative mb-2">
                        <select
                          value={item.status}
                          onChange={e => handleStatusChange(item.id, e.target.value as AppStatus)}
                          className="w-full text-xs rounded-lg px-2 py-1.5 pr-6 appearance-none cursor-pointer"
                          style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#CBD5E1',
                          }}
                        >
                          {COLUMNS.map(c => (
                            <option key={c.status} value={c.status}
                              style={{ background: '#0B1020', color: '#F8FAFC' }}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#64748B' }} />
                      </div>

                      {item.applied_at && (
                        <div className="flex items-center gap-1 mt-1 text-xs" style={{ color: '#64748B' }}>
                          <Calendar className="w-3 h-3" />
                          Applied {new Date(item.applied_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </div>
                      )}

                      {item.follow_up_date && !isExpanded && (
                        <div className="mt-2 text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>
                          Follow up {new Date(item.follow_up_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </div>
                      )}

                      {item.notes && !isExpanded && (
                        <p className="text-xs mt-2 leading-relaxed line-clamp-2" style={{ color: '#64748B' }}>
                          {item.notes}
                        </p>
                      )}

                      {/* Expand/collapse edit */}
                      {isExpanded ? (
                        <div className="mt-3 space-y-2">
                          <textarea
                            rows={3}
                            value={draft.notes}
                            onChange={e => setDraft(d => ({ ...d, notes: e.target.value }))}
                            placeholder="Notes..."
                            className="w-full text-xs rounded-lg px-3 py-2 resize-none"
                            style={{
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              color: '#CBD5E1',
                            }}
                          />
                          <input
                            type="date"
                            value={draft.followUp}
                            onChange={e => setDraft(d => ({ ...d, followUp: e.target.value }))}
                            className="w-full text-xs rounded-lg px-3 py-2"
                            style={{
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              color: draft.followUp ? '#CBD5E1' : '#64748B',
                              colorScheme: 'dark',
                            }}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSave(item.id)}
                              disabled={saving}
                              className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg font-semibold"
                              style={{ background: 'rgba(139,92,246,0.2)', color: '#8B5CF6' }}
                            >
                              <Check className="w-3 h-3" />
                              {saving ? 'Saving…' : 'Save'}
                            </button>
                            <button
                              onClick={() => setExpandedId(null)}
                              className="flex items-center justify-center px-3 rounded-lg"
                              style={{ background: 'rgba(255,255,255,0.05)', color: '#64748B' }}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => openEdit(item)}
                          className="mt-2 w-full text-xs py-1 rounded-lg text-left pl-2"
                          style={{ color: '#3F4A5A', border: '1px dashed rgba(255,255,255,0.08)' }}
                        >
                          {item.notes ? 'Edit notes…' : 'Add notes…'}
                        </button>
                      )}
                    </GlassCard>
                  )
                })}

                {cards.length === 0 && (
                  <div
                    className="rounded-xl p-4 text-center text-xs"
                    style={{ border: '1px dashed rgba(255,255,255,0.1)', color: '#3F4A5A' }}
                  >
                    No applications
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </DashboardLayout>
  )
}
