import Link from 'next/link'
import { Navbar } from './Navbar'
import { Zap } from 'lucide-react'

interface LegalLayoutProps {
  title: string
  lastUpdated: string
  children: React.ReactNode
}

export function LegalLayout({ title, lastUpdated, children }: LegalLayoutProps) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#8B5CF6' }}>
              Legal
            </p>
            <h1 className="font-heading font-bold text-3xl md:text-4xl text-[color:var(--foreground)] mb-3">
              {title}
            </h1>
            <p className="text-sm" style={{ color: '#64748B' }}>Last updated: {lastUpdated}</p>
            <div className="mt-4 p-4 rounded-xl text-sm" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#D97706' }}>
              <strong>Note:</strong> This document is provided for informational purposes only and does not constitute legal advice. Nexgen Tech Labs recommends that these policies be reviewed by a qualified legal professional before production launch.
            </div>
          </div>

          {/* Content */}
          <div className="legal-content space-y-8 text-[color:var(--foreground)]">
            {children}
          </div>

          {/* Footer nav */}
          <div className="mt-16 pt-8 border-t flex flex-wrap gap-6" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <Link href="/terms" className="text-sm hover:underline" style={{ color: '#8B5CF6' }}>Terms &amp; Conditions</Link>
            <Link href="/privacy" className="text-sm hover:underline" style={{ color: '#8B5CF6' }}>Privacy Policy</Link>
            <Link href="/data-compliance" className="text-sm hover:underline" style={{ color: '#8B5CF6' }}>Data Compliance</Link>
            <a href="mailto:media@jobsagent247.com" className="text-sm hover:underline" style={{ color: '#8B5CF6' }}>Contact</a>
            <Link href="/" className="text-sm ml-auto" style={{ color: '#64748B' }}>← Back to home</Link>
          </div>
        </div>
      </main>

      {/* Minimal footer */}
      <footer className="border-t py-8" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-heading font-bold text-[color:var(--foreground)] text-sm">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' }}>
              <Zap className="w-3 h-3 text-white" />
            </div>
            JobAgent247
          </div>
          <p className="text-xs" style={{ color: '#64748B' }}>
            © {new Date().getFullYear()} Nexgen Tech Labs. Registered in the United Kingdom. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  )
}
