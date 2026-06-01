import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getUserPlan } from '@/lib/db/users'
import { checkRateLimit } from '@/lib/rate-limit'
import { streamCVImprovement } from '@/lib/claude'
import { classifyRole, getRoleProfile } from '@/lib/db/role-profiles'

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const plan = await getUserPlan(supabase, user.id)
  if (plan === 'free') {
    return new Response(
      JSON.stringify({ error: 'Upgrade to Pro to unlock full CV rewrite' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const { allowed, remaining } = await checkRateLimit(user.id, plan)
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: 'Daily application limit reached.', remaining: 0 }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const body = await request.json() as {
    cvId: string
    jobDescription: string
    targetRole: string
  }

  const { data: cv } = await supabase
    .from('cvs')
    .select('raw_text')
    .eq('id', body.cvId)
    .eq('user_id', user.id)
    .single()

  if (!cv?.raw_text) {
    return new Response(JSON.stringify({ error: 'CV not found' }), { status: 404 })
  }

  let roleContext: string | undefined
  try {
    const { domain, seniority } = await classifyRole(body.targetRole, body.jobDescription)
    const profile = await getRoleProfile(supabase, domain, seniority)
    if (profile) {
      roleContext = `Role knowledge base for ${profile.role_title}:\nKey tech stack: ${profile.tech_stack.join(', ')}\nCritical ATS keywords to include: ${profile.tech_stack.join(', ')}\nSkills gap focus areas: ${profile.learning_focus.join(', ')}`
    }
  } catch { /* degrade gracefully */ }

  const generator = streamCVImprovement(cv.raw_text, body.jobDescription, body.targetRole, roleContext)
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of generator) {
          controller.enqueue(encoder.encode(chunk))
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Remaining': String(remaining),
    },
  })
}
