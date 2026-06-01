'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  User,
  FileText,
  Briefcase,
  CheckSquare,
  MessageSquare,
  Settings,
  Zap,
  Bell,
} from 'lucide-react'

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Profile', href: '/profile', icon: User },
  { label: 'CV Agent', href: '/cv-agent', icon: FileText },
  { label: 'Job Matches', href: '/job-matches', icon: Briefcase },
  { label: 'Applications', href: '/applications', icon: CheckSquare },
  { label: 'Interview Prep', href: '/interview-prep', icon: MessageSquare },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 h-screen sticky top-0 sidebar-surface">
      {/* Logo */}
      <div className="p-5 border-b sidebar-footer-border">
        <Link href="/" className="flex items-center gap-2 font-heading font-bold text-white">
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
            HK
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[color:var(--foreground)] truncate">Hitendra K.</p>
            <p className="text-xs truncate" style={{ color: '#64748B' }}>Free plan</p>
          </div>
          <Bell className="w-4 h-4 shrink-0" style={{ color: '#64748B' }} />
        </div>
      </div>
    </aside>
  )
}
