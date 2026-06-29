'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Bell, FileText, MessageSquare, ArrowRight } from 'lucide-react'
import { getBrowserClient } from '@/lib/supabase-browser'
import { buildSuggestedActions, countFollowUpsDue, type SuggestedAction, type ActionIcon } from '@/lib/notifications'

const ICONS: Record<ActionIcon, React.ElementType> = { FileText, MessageSquare, Bell }

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [actions, setActions] = useState<SuggestedAction[]>([])
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = getBrowserClient()
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [profileRes, cvsRes, userJobsRes] = await Promise.all([
        supabase.from('users').select('current_role').eq('id', user.id).maybeSingle(),
        supabase.from('cvs').select('id').eq('user_id', user.id),
        supabase.from('user_jobs').select('follow_up_date').eq('user_id', user.id),
      ])
      const userJobs = userJobsRes.data ?? []
      setActions(
        buildSuggestedActions({
          cvCount: cvsRes.data?.length ?? 0,
          currentRole: profileRes.data?.current_role,
          userJobsCount: userJobs.length,
          followUpsDue: countFollowUpsDue(userJobs),
        }),
      )
    })()
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const count = actions.length

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg transition-colors hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-violet-500"
        style={{ color: '#94A3B8' }}
        aria-label={count > 0 ? `Notifications, ${count} suggested action${count > 1 ? 's' : ''}` : 'Notifications'}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Bell className="w-5 h-5" />
        {count > 0 && (
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: '#8B5CF6' }}
          />
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-80 rounded-xl py-1 z-50"
          role="menu"
          style={{
            background: 'rgba(11, 16, 32, 0.96)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div className="px-4 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <p className="text-sm font-medium text-[color:var(--foreground)]">Suggested actions</p>
          </div>

          {count === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm" style={{ color: '#64748B' }}>You&apos;re all caught up.</p>
            </div>
          ) : (
            actions.map((action) => {
              const Icon = ICONS[action.icon] ?? FileText
              return (
                <Link
                  key={action.id}
                  href={action.href}
                  onClick={() => setOpen(false)}
                  role="menuitem"
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/5"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: action.priority === 'high' ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(139,92,246,0.2)',
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: '#8B5CF6' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[color:var(--foreground)] truncate">{action.title}</p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: '#64748B' }}>{action.subtitle}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 shrink-0" style={{ color: '#64748B' }} />
                </Link>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
