import type { SupabaseClient } from '@supabase/supabase-js'
import type { InterviewKit, InterviewKitResult, MockInterviewSession, MockInterviewResponse } from '../types/database'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Client = SupabaseClient<any>

export async function saveInterviewKit(
  db: Client,
  userId: string,
  input: {
    company_name?: string | null
    job_description: string
    target_role: string
    interview_type: string
    geography: string
  },
  result: InterviewKitResult
): Promise<InterviewKit> {
  const { data, error } = await db
    .from('interview_kits')
    .insert({
      user_id: userId,
      company_name: input.company_name ?? null,
      job_description: input.job_description,
      target_role: input.target_role,
      interview_type: input.interview_type,
      geography: input.geography,
      summary: result.summary,
      likely_interview_stages: result.likelyInterviewStages,
      questions: result.questions,
      candidate_risk_areas: result.candidateRiskAreas,
      revision_topics: result.revisionTopics,
      questions_to_ask_employer: result.questionsToAskEmployer,
      final_checklist: result.finalChecklist,
      raw_ai_output: result,
    })
    .select()
    .single()
  if (error) throw error
  return data as InterviewKit
}

export async function listInterviewKits(
  db: Client,
  userId: string,
  limit = 20
): Promise<InterviewKit[]> {
  const { data } = await db
    .from('interview_kits')
    .select('id, user_id, company_name, target_role, interview_type, geography, summary, questions, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data ?? []) as InterviewKit[]
}

export async function getInterviewKit(
  db: Client,
  userId: string,
  kitId: string
): Promise<InterviewKit | null> {
  const { data } = await db
    .from('interview_kits')
    .select('*')
    .eq('id', kitId)
    .eq('user_id', userId)
    .single()
  return (data ?? null) as InterviewKit | null
}

export async function createMockSession(
  db: Client,
  userId: string,
  kitId: string
): Promise<MockInterviewSession> {
  const { data, error } = await db
    .from('mock_interview_sessions')
    .insert({
      user_id: userId,
      interview_kit_id: kitId,
      status: 'active',
      current_question_index: 0,
      responses: [],
    })
    .select()
    .single()
  if (error) throw error
  return data as MockInterviewSession
}

export async function getMockSession(
  db: Client,
  userId: string,
  sessionId: string
): Promise<MockInterviewSession | null> {
  const { data } = await db
    .from('mock_interview_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single()
  return (data ?? null) as MockInterviewSession | null
}

export async function appendMockResponse(
  db: Client,
  userId: string,
  sessionId: string,
  response: MockInterviewResponse,
  newIndex: number
): Promise<MockInterviewSession> {
  const session = await getMockSession(db, userId, sessionId)
  if (!session) throw new Error('Session not found')
  const { data, error } = await db
    .from('mock_interview_sessions')
    .update({
      responses: [...session.responses, response],
      current_question_index: newIndex,
    })
    .eq('id', sessionId)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error
  return data as MockInterviewSession
}

export async function completeMockSession(
  db: Client,
  userId: string,
  sessionId: string,
  overallScore: number,
  feedbackSummary: string
): Promise<MockInterviewSession> {
  const { data, error } = await db
    .from('mock_interview_sessions')
    .update({
      status: 'completed',
      overall_score: overallScore,
      feedback_summary: feedbackSummary,
      completed_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error
  return data as MockInterviewSession
}
