'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, User, Settings } from 'lucide-react'
import { getBrowserClient } from '@/lib/supabase-browser'

export function UserMenu() {
  const [open, setOpen] = useState(false)
  const [initials, setInitials] = useState('U')
  const [name, setName] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

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

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleSignOut() {
    const supabase = getBrowserClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold focus:outline-none focus:ring-2 focus:ring-violet-500"
        style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)', color: 'white' }}
        aria-label="User menu"
      >
        {initials}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-xl py-1 z-50"
          style={{
            background: 'rgba(11, 16, 32, 0.96)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(16px)',
          }}
        >
          {name && (
            <div className="px-4 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-sm font-medium text-[color:var(--foreground)] truncate">{name}</p>
            </div>
          )}
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-white/5"
            style={{ color: '#CBD5E1' }}
          >
            <User className="w-4 h-4" />
            Profile
          </Link>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-white/5"
            style={{ color: '#CBD5E1' }}
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
          <div className="border-t my-1" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-white/5 text-left"
            style={{ color: '#EF4444' }}
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
