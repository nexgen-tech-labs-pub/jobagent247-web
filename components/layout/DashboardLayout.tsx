import { Sidebar } from './Sidebar'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Bell } from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header
          className="h-16 flex items-center justify-between px-6 shrink-0 sticky top-0 z-10 dashboard-header-surface"
          style={{ backdropFilter: 'blur(20px)' }}
        >
          <h1 className="font-heading font-semibold text-lg text-[color:var(--foreground)]">{title}</h1>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button className="relative p-2 rounded-lg transition-colors"
              style={{ color: '#94A3B8' }}>
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ background: '#8B5CF6' }} />
            </button>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)', color: 'white' }}>
              HK
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
