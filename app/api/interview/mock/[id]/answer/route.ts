import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getMockSession, appendMockResponse, completeMockSession, getInterviewKit } from '@/lib/db/interview'
import { evaluateMockAnswer } from '@/lib/claude'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json() as {
    questionId: string
    question: string
    category: string
    answer: string
  }

  if (!body.questionId || !body.question || !body.answer?.trim()) {
    return NextResponse.json({ error: 'questionId, question, and answer are required' }, { status: 400 })
  }

  const session = await getMockSession(supabase, user.id, id)
  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  if (session.status === 'completed') return NextResponse.json({ error: 'Session already completed' }, { status: 400 })

  const kit = await getInterviewKit(supabase, user.id, session.interview_kit_id)
  if (!kit) return NextResponse.json({ error: 'Interview kit not found' }, { status: 404 })

  try {
    const evalResult = await evaluateMockAnswer(
      body.question,
      body.category,
      body.answer,
      kit.job_description
    )

    const response = {
      question_id: body.questionId,
      question: body.question,
      category: body.category,
      answer: body.answer,
      score: evalResult.score,
      strengths: evalResult.strengths,
      weaknesses: evalResult.weaknesses,
      feedback: evalResult.feedback,
      improved_answer_structure: evalResult.improvedAnswerStructure,
      created_at: new Date().toISOString(),
    }

    const newIndex = session.current_question_index + 1
    const isLast = newIndex >= kit.questions.length
    let updatedSession = await appendMockResponse(supabase, user.id, id, response, newIndex)

    if (isLast) {
      const allResponses = [...session.responses, response]
      const overallScore = Math.round(allResponses.reduce((sum, r) => sum + r.score, 0) / allResponses.length)
      const feedbackSummary = `Completed ${allResponses.length} question${allResponses.length !== 1 ? 's' : ''}. Average score: ${overallScore}/100.`
      updatedSession = await completeMockSession(supabase, user.id, id, overallScore, feedbackSummary)
    }

    return NextResponse.json({ session: updatedSession, evaluation: evalResult, isComplete: isLast })
  } catch {
    return NextResponse.json({ error: 'Evaluation failed. Please try again.' }, { status: 500 })
  }
}
