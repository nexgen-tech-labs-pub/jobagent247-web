'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  User,
  FileText,
  Briefcase,
  CheckSquare,
  MessageSquare,
  Settings,
  Zap,
  Target,
  BrainCircuit,
  TrendingUp,
  BookOpen,
  Inbox,
  LogOut,
} from 'lucide-react'
import { getBrowserClient } from '@/lib/supabase-browser'

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Profile', href: '/profile', icon: User },
  { label: 'CV Agent', href: '/cv-agent', icon: FileText },
  { label: 'Job Matches', href: '/job-matches', icon: Briefcase },
  { label: 'Job Fit', href: '/job-fit', icon: Target },
  { label: 'Career Intel', href: '/career-intelligence', icon: BrainCircuit },
  { label: 'Growth Coach', href: '/career-growth', icon: TrendingUp },
  { label: 'Evidence Builder', href: '/evidence-builder', icon: BookOpen },
  { label: 'Applications', href: '/applications', icon: CheckSquare },
  { label: 'Follow-Ups', href: '/follow-ups', icon: Inbox },
  { label: 'Interview Prep', href: '/interview-prep', icon: MessageSquare },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [initials, setInitials] = useState('U')
  const [name, setName] = useState('')

  useEffect(() => {
    const supabase = getBrowserClient()
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('users').select('name').eq('id', user.id).maybeSingle()
      if (data?.name) {
        setName(data.name)
        setInitials(
          (data.name as string).split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase() || 'U'
        )
      }
    })()
  }, [])

  async function handleSignOut() {
    const supabase = getBrowserClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 h-screen sticky top-0 sidebar-surface">
      {/* Logo */}
      <div className="p-5 border-b sidebar-footer-border">
        <Link href="/dashboard" className="flex items-center gap-2 font-heading font-bold text-white">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          JobAgent247
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={
                active
                  ? {
                      background: 'rgba(139, 92, 246, 0.15)',
                      color: 'var(--color-accent-violet)',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                    }
                  : { color: 'var(--color-text-secondary)', border: '1px solid transparent' }
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t sidebar-footer-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)', color: 'white' }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[color:var(--foreground)] truncate">{name || 'My Account'}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
            style={{ color: '#64748B' }}
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
