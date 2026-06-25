import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { GlassCard } from '@/components/ui/GlassCard'
import { Mail } from 'lucide-react'

export default function FollowUpsPage() {
  return (
    <DashboardLayout title="Follow-Ups">
      <div className="max-w-2xl mx-auto">
        <GlassCard className="p-10 text-center space-y-5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
            style={{ background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.25)' }}
          >
            <Mail className="w-6 h-6" style={{ color: '#A78BFA' }} />
          </div>
          <div className="space-y-2">
            <span
              className="inline-block text-[11px] font-semibold uppercase tracking-wide px-2 py-1 rounded-md"
              style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#A78BFA', border: '1px solid rgba(139, 92, 246, 0.25)' }}
            >
              Coming soon
            </span>
            <h2 className="font-heading font-bold text-2xl text-white">Follow-Ups is on the way</h2>
            <p className="text-sm max-w-md mx-auto" style={{ color: '#94A3B8' }}>
              We&apos;ll connect your Gmail or Outlook inbox, read replies from recruiters, and surface
              exactly which threads need a follow-up — with a draft ready to send.
            </p>
          </div>
          <p className="text-xs" style={{ color: '#64748B' }}>
            No action needed. We&apos;ll let you know when it&apos;s ready.
          </p>
        </GlassCard>
      </div>
    </DashboardLayout>
  )
}
