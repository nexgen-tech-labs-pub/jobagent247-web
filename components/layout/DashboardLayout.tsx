import { Sidebar } from './Sidebar'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { UserMenu } from '@/components/ui/UserMenu'
import { NotificationBell } from './NotificationBell'

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="h-16 flex items-center justify-between px-6 shrink-0 sticky top-0 z-10 dashboard-header-surface"
          style={{ backdropFilter: 'blur(20px)' }}
        >
          <h1 className="font-heading font-semibold text-lg text-[color:var(--foreground)]">{title}</h1>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NotificationBell />
            <UserMenu />
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
