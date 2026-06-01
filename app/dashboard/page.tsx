import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { RecentDocuments } from '@/components/dashboard/RecentDocuments'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Progress } from '@/components/ui/progress'
import { createServerClient } from '@/lib/supabase'
import { FileText, MessageSquare, Bell, ArrowRight } from 'lucide-react'
import type { Job } from '@/lib/types/database'

const actionIcons: Record<string, React.ElementType> = { FileText, MessageSquare, Bell }

async function getDashboardData() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [profileRes, cvsRes, userJobsRes, topJobsRes] = await Promise.all([
    supabase.from('users').select('name, onboarding_complete, current_role, keywords, location').eq('id', user.id).single(),
    supabase.from('cvs').select('id').eq('user_id', user.id),
    supabase.from('user_jobs').select('status, match_score, follow_up_date, applied_at').eq('user_id', user.id),
    supabase.from('jobs').select('id, title, company, location, type, visa_sponsorship').order('scraped_at', { ascending: false }).limit(3),
  ])

  const profile = profileRes.data
  const cvCount = cvsRes.data?.length ?? 0
  const userJobs = userJobsRes.data ?? []
  const topJobs = (topJobsRes.data ?? []) as Pick<Job, 'id' | 'title' | 'company' | 'location' | 'type' | 'visa_sponsorship'>[]

  const today = new Date().toISOString().split('T')[0]
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()

  const profileFields = [profile?.name, profile?.current_role, profile?.location, profile?.keywords?.length]
  const profileStrength = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100)
  const cvReadiness = cvCount > 0 ? 100 : 0
  const scores = userJobs.map(j => j.match_score).filter((s): s is number => s !== null)
  const jobMatchAverage = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  const applicationsThisWeek = userJobs.filter(j => j.status === 'applied' && j.applied_at && j.applied_at >= weekAgo).length
  const interviewsScheduled = userJobs.filter(j => j.status === 'interviewing').length
  const followUpsDue = userJobs.filter(j => j.follow_up_date && j.follow_up_date <= today).length

  const suggestedActions = [
    cvCount === 0 && { id: '1', icon: 'FileText', title: 'Upload your CV', subtitle: 'Required to use all AI agents', priority: 'high' },
    !profile?.current_role && { id: '2', icon: 'Bell', title: 'Complete your profile', subtitle: 'Add your current role and target preferences', priority: 'high' },
    userJobs.length === 0 && { id: '3', icon: 'MessageSquare', title: 'Find matching jobs', subtitle: 'Run a job search to see live matches', priority: 'medium' },
    followUpsDue > 0 && { id: '4', icon: 'Bell', title: `${followUpsDue} follow-up${followUpsDue > 1 ? 's' : ''} due`, subtitle: 'Check your applications tracker', priority: 'high' },
  ].filter(Boolean) as Array<{ id: string; icon: string; title: string; subtitle: string; priority: string }>

  return {
    name: profile?.name ?? user.email?.split('@')[0] ?? 'there',
    metrics: { profileStrength, cvReadiness, jobMatchAverage, applicationsThisWeek, interviewsScheduled, followUpsDue },
    topJobs,
    suggestedActions,
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()
  const { name, metrics, topJobs, suggestedActions } = data ?? {
    name: 'there',
    metrics: { profileStrength: 0, cvReadiness: 0, jobMatchAverage: 0, applicationsThisWeek: 0, interviewsScheduled: 0, followUpsDue: 0 },
    topJobs: [],
    suggestedActions: [],
  }

  return (
    <DashboardLayout title="Overview">
      <div className="mb-8">
        <h2 className="font-heading font-bold text-2xl text-white mb-1">
          Welcome back, {name.split(' ')[0]}.
        </h2>
        <p style={{ color: '#94A3B8' }}>
          {suggestedActions.length > 0
            ? <>Your job-search agents have <span style={{ color: '#8B5CF6' }}>{suggestedActions.length} suggested action{suggestedActions.length > 1 ? 's' : ''}</span> today.</>
            : <>Everything looks good — keep applying!</>}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Profile Strength',   value: metrics.profileStrength + '%',        color: '#8B5CF6', progress: metrics.profileStrength },
          { label: 'CV Readiness',       value: metrics.cvReadiness + '%',            color: '#22C55E', progress: metrics.cvReadiness },
          { label: 'Job Match Avg',      value: metrics.jobMatchAverage > 0 ? metrics.jobMatchAverage + '%' : '—', color: '#06B6D4', progress: metrics.jobMatchAverage },
          { label: 'Applied This Week',  value: String(metrics.applicationsThisWeek), color: '#F59E0B', progress: null },
          { label: 'Interviews',         value: String(metrics.interviewsScheduled),  color: '#22C55E', progress: null },
          { label: 'Follow-ups Due',     value: String(metrics.followUpsDue),         color: '#EF4444', progress: null },
        ].map(w => (
          <GlassCard key={w.label} className="p-4 text-center">
            <div className="font-heading font-bold text-2xl mb-1" style={{ color: w.color }}>{w.value}</div>
            <div className="text-xs mb-2" style={{ color: '#64748B' }}>{w.label}</div>
            {w.progress !== null && <Progress value={w.progress} className="h-1" />}
          </GlassCard>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h3 className="font-heading font-semibold text-white mb-4">Suggested Actions</h3>
          {suggestedActions.length === 0 ? (
            <GlassCard className="p-6 text-center">
              <p className="text-sm" style={{ color: '#64748B' }}>No actions right now — you&apos;re all caught up.</p>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {suggestedActions.map(action => {
                const Icon = actionIcons[action.icon] ?? FileText
                return (
                  <GlassCard key={action.id} hover className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: action.priority === 'high' ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(139,92,246,0.2)' }}>
                      <Icon className="w-4 h-4" style={{ color: '#8B5CF6' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{action.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{action.subtitle}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 shrink-0" style={{ color: '#64748B' }} />
                  </GlassCard>
                )
              })}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-heading font-semibold text-white mb-4">Latest Jobs</h3>
          {topJobs.length === 0 ? (
            <GlassCard className="p-4 text-center">
              <p className="text-sm mb-3" style={{ color: '#64748B' }}>No jobs scraped yet.</p>
              <GradientButton href="/job-matches" size="sm" className="w-full justify-center">Find Jobs</GradientButton>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {topJobs.map(job => (
                <GlassCard key={job.id} hover className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="text-sm font-medium text-white leading-tight">{job.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{job.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {job.type && <StatusBadge status={job.type as 'contract' | 'permanent'} />}
                    <span className="text-xs" style={{ color: '#64748B' }}>{job.location}</span>
                  </div>
                </GlassCard>
              ))}
              <GradientButton href="/job-matches" className="w-full justify-center" size="sm">
                View all matches <ArrowRight className="w-3 h-3" />
              </GradientButton>
            </div>
          )}
        </div>
      </div>

      <RecentDocuments />
    </DashboardLayout>
  )
}
