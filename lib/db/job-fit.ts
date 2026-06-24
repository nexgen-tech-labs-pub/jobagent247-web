import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  SavedJob,
  JobFitAnalysis,
  JobFitAnalysisWithJob,
  JobFitFeedback,
  JobFitResult,
  ApplicationOutcome,
  UserFeedback,
} from '../types/database'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Client = SupabaseClient<any>

export async function saveJobWithAnalysis(
  db: Client,
  userId: string,
  job: Omit<SavedJob, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
  result: JobFitResult
): Promise<{ savedJob: SavedJob; analysis: JobFitAnalysis }> {
  const { data: savedJob, error: jobError } = await db
    .from('saved_jobs')
    .insert({ ...job, user_id: userId })
    .select()
    .single()
  if (jobError) throw jobError

  const { data: analysis, error: analysisError } = await db
    .from('job_fit_analyses')
    .insert({
      user_id: userId,
      saved_job_id: savedJob.id,
      fit_score: result.fitScore,
      match_category: result.matchCategory,
      score_breakdown: result.scoreBreakdown,
      strengths: result.strengths,
      risks: result.risks,
      missing_skills: result.missingSkills,
      evidence_gaps: result.evidenceGaps,
      location_notes: result.locationNotes || null,
      salary_notes: result.salaryNotes || null,
      visa_notes: result.visaNotes || null,
      recommended_next_action: result.recommendedNextAction || null,
      application_strategy: result.applicationStrategy || null,
      summary: result.summary || null,
      raw_ai_output: result,
    })
    .select()
    .single()
  if (analysisError) throw analysisError

  return { savedJob: savedJob as SavedJob, analysis: analysis as JobFitAnalysis }
}

export async function getAnalysisById(
  db: Client,
  userId: string,
  analysisId: string
): Promise<JobFitAnalysisWithJob | null> {
  const { data } = await db
    .from('job_fit_analyses')
    .select('*, saved_job:saved_jobs(*)')
    .eq('id', analysisId)
    .eq('user_id', userId)
    .single()
  return data as JobFitAnalysisWithJob | null
}

export async function listAnalysesForUser(
  db: Client,
  userId: string,
  limit = 20
): Promise<JobFitAnalysisWithJob[]> {
  const { data } = await db
    .from('job_fit_analyses')
    .select('*, saved_job:saved_jobs(*)')
    .eq('user_id', userId)
    .order('fit_score', { ascending: false })
    .limit(limit)
  // The Supabase join returns saved_job as nullable when the referenced
  // saved_jobs row was deleted (cascade should prevent this, but historical
  // orphans exist). Strip those — an analysis with no job context isn't
  // renderable, so don't ship it to the UI.
  const rows = (data ?? []) as (Omit<JobFitAnalysisWithJob, 'saved_job'> & { saved_job: JobFitAnalysisWithJob['saved_job'] | null })[]
  return rows.filter((a): a is JobFitAnalysisWithJob => a.saved_job != null)
}

export async function upsertFeedback(
  db: Client,
  userId: string,
  analysisId: string,
  userFeedback: UserFeedback | null,
  applicationOutcome: ApplicationOutcome | null,
  notes: string | null
): Promise<JobFitFeedback> {
  const { data, error } = await db
    .from('job_fit_feedback')
    .upsert(
      {
        user_id: userId,
        job_fit_analysis_id: analysisId,
        user_feedback: userFeedback,
        application_outcome: applicationOutcome,
        notes,
      },
      { onConflict: 'user_id,job_fit_analysis_id' }
    )
    .select()
    .single()
  if (error) throw error
  return data as JobFitFeedback
}
