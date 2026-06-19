'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { GradientButton } from '@/components/ui/GradientButton'
import { SecondaryButton } from '@/components/ui/SecondaryButton'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const navLinks = [
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'CV Builder', href: '/cv-builder' },
  { label: 'Learn', href: '/learn' },
  { label: 'Comparisons', href: '/vs' },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 nav-surface"
      style={{ backdropFilter: 'blur(20px)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="inline-flex items-center" aria-label="JobAgent247 home">
            <Image
              src="/jobagent-logo.png"
              alt="JobAgent247"
              width={154}
              height={60}
              priority
              className="h-10 w-auto"
            />
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm transition-colors text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <SecondaryButton href="/login" size="sm">Sign in</SecondaryButton>
            <GradientButton href="/signup" size="sm">Start free</GradientButton>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="p-2 rounded-lg text-[color:var(--muted-foreground)]"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2 mobile-menu-surface">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2 text-sm text-[color:var(--muted-foreground)]"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-2">
            <SecondaryButton href="/login" className="w-full justify-center">Sign in</SecondaryButton>
            <GradientButton href="/signup" className="w-full justify-center">Start free</GradientButton>
          </div>
        </div>
      )}
    </nav>
  )
}
