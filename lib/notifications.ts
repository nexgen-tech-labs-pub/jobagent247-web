// Single source of truth for the candidate "suggested actions" surfaced both on
// the dashboard page and in the header notification bell. Pure (no server/client
// imports) so it can run in either context.

export type ActionIcon = 'FileText' | 'MessageSquare' | 'Bell'

export interface SuggestedAction {
  id: string
  icon: ActionIcon
  title: string
  subtitle: string
  priority: 'high' | 'medium'
  href: string
}

const ACTION_HREFS: Record<string, string> = {
  '1': '/profile',
  '2': '/profile',
  '3': '/job-matches',
  '4': '/follow-ups',
}

export interface SuggestedActionInputs {
  cvCount: number
  currentRole: string | null | undefined
  userJobsCount: number
  followUpsDue: number
}

export function buildSuggestedActions({
  cvCount,
  currentRole,
  userJobsCount,
  followUpsDue,
}: SuggestedActionInputs): SuggestedAction[] {
  const raw = [
    cvCount === 0 && { id: '1', icon: 'FileText' as const, title: 'Upload your CV', subtitle: 'Required to use all AI agents', priority: 'high' as const },
    !currentRole && { id: '2', icon: 'Bell' as const, title: 'Complete your profile', subtitle: 'Add your current role and target preferences', priority: 'high' as const },
    userJobsCount === 0 && { id: '3', icon: 'MessageSquare' as const, title: 'Find matching jobs', subtitle: 'Run a job search to see live matches', priority: 'medium' as const },
    followUpsDue > 0 && { id: '4', icon: 'Bell' as const, title: `${followUpsDue} follow-up${followUpsDue > 1 ? 's' : ''} due`, subtitle: 'Check your applications tracker', priority: 'high' as const },
  ].filter(Boolean) as Omit<SuggestedAction, 'href'>[]

  return raw.map((action) => ({ ...action, href: ACTION_HREFS[action.id] ?? '/dashboard' }))
}

export function countFollowUpsDue(
  userJobs: { follow_up_date: string | null }[],
  today: string = new Date().toISOString().split('T')[0],
): number {
  return userJobs.filter((j) => j.follow_up_date && j.follow_up_date <= today).length
}
