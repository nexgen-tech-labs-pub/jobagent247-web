'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Zap } from 'lucide-react'
import { GradientButton } from '@/components/ui/GradientButton'
import { SecondaryButton } from '@/components/ui/SecondaryButton'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const navLinks = [
  { label: 'Product', href: '#features' },
  { label: 'How it Works', href: '#workflow' },
  { label: 'Features', href: '#feature-grid' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
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
          <Link href="/" className="flex items-center gap-2 font-heading font-bold text-[color:var(--foreground)] text-lg">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' }}
            >
              <Zap className="w-4 h-4 text-white" />
            </div>
            JobAgent247
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
            <SecondaryButton href="/dashboard" size="sm">Sign in</SecondaryButton>
            <GradientButton href="/dashboard" size="sm">Start free</GradientButton>
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
            <SecondaryButton href="/dashboard" className="w-full justify-center">Sign in</SecondaryButton>
            <GradientButton href="/dashboard" className="w-full justify-center">Start free</GradientButton>
          </div>
        </div>
      )}
    </nav>
  )
}
