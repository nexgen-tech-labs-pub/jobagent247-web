import type { SupabaseClient } from '@supabase/supabase-js'
import type { ReadinessAnalysis, ReadinessResult } from '../types/database'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Client = SupabaseClient<any>

export async function saveReadinessAnalysis(
  db: Client,
  userId: string,
  input: {
    target_job_title: string
    target_seniority: string | null
    target_geography: string | null
    linkedin_text: string | null
    portfolio_links: string[]
  },
  result: ReadinessResult
): Promise<ReadinessAnalysis> {
  const { data, error } = await db
    .from('readiness_analyses')
    .insert({
      user_id: userId,
      target_job_title: input.target_job_title,
      target_seniority: input.target_seniority,
      target_geography: input.target_geography,
      linkedin_text: input.linkedin_text,
      portfolio_links: input.portfolio_links,
      overall_score: result.overallScore,
      readiness_level: result.readinessLevel,
      score_breakdown: result.scoreBreakdown,
      critical_gaps: result.criticalGaps,
      important_gaps: result.importantGaps,
      nice_to_have_gaps: result.niceToHaveGaps,
      strengths: result.strengths,
      recommendations: result.recommendations,
      evidence_summary: result.evidenceSummary || null,
      summary: result.summary || null,
      raw_ai_output: result,
    })
    .select()
    .single()
  if (error) throw error
  return data as ReadinessAnalysis
}

export async function listReadinessAnalyses(
  db: Client,
  userId: string,
  limit = 20
): Promise<ReadinessAnalysis[]> {
  const { data } = await db
    .from('readiness_analyses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data ?? []) as ReadinessAnalysis[]
}

export async function getReadinessAnalysis(
  db: Client,
  userId: string,
  analysisId: string
): Promise<ReadinessAnalysis | null> {
  const { data } = await db
    .from('readiness_analyses')
    .select('*')
    .eq('id', analysisId)
    .eq('user_id', userId)
    .single()
  return data as ReadinessAnalysis | null
}
