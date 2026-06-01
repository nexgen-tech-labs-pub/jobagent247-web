import { cn } from '@/lib/utils'

type Status =
  | 'applied'
  | 'interviewing'
  | 'offered'
  | 'rejected'
  | 'saved'
  | 'strong-match'
  | 'ready'
  | 'needs-tailoring'
  | 'contract'
  | 'permanent'
  | 'remote'

const statusConfig: Record<Status, { label: string; className: string }> = {
  applied: { label: 'Applied', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  interviewing: { label: 'Interviewing', className: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
  offered: { label: 'Offered', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  rejected: { label: 'Rejected', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
  saved: { label: 'Saved', className: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  'strong-match': { label: 'Strong Match', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  ready: { label: 'Ready to Apply', className: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  'needs-tailoring': { label: 'Needs Tailoring', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  contract: { label: 'Contract', className: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  permanent: { label: 'Permanent', className: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
  remote: { label: 'Remote', className: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
}

interface StatusBadgeProps {
  status: Status
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', config.className, className)}>
      {config.label}
    </span>
  )
}
