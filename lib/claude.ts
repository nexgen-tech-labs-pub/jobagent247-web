import Anthropic from '@anthropic-ai/sdk'
import type { CVAnalysisResult, MatchResult, InterviewQuestion } from './types/database'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const cvAnalysisTool: Anthropic.Tool = {
  name: 'cv_analysis_result',
  description: 'Return structured CV analysis results',
  input_schema: {
    type: 'object' as const,
    properties: {
      score: { type: 'number', description: 'ATS match score 0-100' },
      missingKeywords: { type: 'array', items: { type: 'string' } },
      improvedBullets: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            original: { type: 'string' },
            improved: { type: 'string' },
            reason: { type: 'string' },
          },
          required: ['original', 'improved', 'reason'],
        },
      },
      summary: { type: 'string' },
    },
    required: ['score', 'missingKeywords', 'improvedBullets', 'summary'],
  },
}

export async function analyseCVForRole(
  cvText: string,
  jobDescription: string,
  targetRole: string,
  roleContext?: string
): Promise<CVAnalysisResult> {
  const roleSection = roleContext ? `\n\n${roleContext}` : ''
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: [
      {
        type: 'text',
        text: `You are an expert CV/resume analyst and ATS specialist with deep knowledge of technical hiring.\n\nCandidate CV:\n${cvText}${roleSection}`,
        cache_control: { type: 'ephemeral' },
      },
    ] as Anthropic.TextBlockParam[],
    messages: [
      {
        role: 'user',
        content: `Analyse this CV against the following job description for the role: ${targetRole}\n\nJob Description:\n${jobDescription}\n\nUse the cv_analysis_result tool to return your analysis. For improvedBullets, pick the 3 weakest bullets from the CV and rewrite them. If the score is below 90, the summary must explain what is holding it back.`,
      },
    ],
    tools: [cvAnalysisTool],
    tool_choice: { type: 'tool', name: 'cv_analysis_result' },
  })

  const toolUse = response.content.find((b) => b.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('Claude did not return a tool_use block')
  }
  return toolUse.input as CVAnalysisResult
}

export async function* streamCVImprovement(
  cvText: string,
  jobDescription: string,
  targetRole: string,
  roleContext?: string
): AsyncGenerator<string> {
  const roleSection = roleContext ? `\n\n${roleContext}` : ''
  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: [
      {
        type: 'text',
        text: `You are an expert CV writer and ATS specialist.\n\nCandidate CV:\n${cvText}${roleSection}`,
        cache_control: { type: 'ephemeral' },
      },
    ] as Anthropic.TextBlockParam[],
    messages: [
      {
        role: 'user',
        content: `Rewrite this CV to be optimised for the role: ${targetRole}\n\nJob Description:\n${jobDescription}\n\nRewrite the full CV maintaining the candidate's authentic experience while maximising ATS score and keyword relevance. Output only the rewritten CV text — no commentary, no preamble.`,
      },
    ],
  })

  for await (const chunk of stream) {
    if (
      chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta'
    ) {
      yield chunk.delta.text
    }
  }
}

function verdictFromScore(score: number): string {
  if (score >= 90) return 'Excellent match — apply with confidence'
  if (score >= 75) return 'Strong match — minor gaps to address'
  if (score >= 60) return 'Reasonable match — tailor your CV'
  return 'Weak match — significant gaps'
}

const matchResultTool: Anthropic.Tool = {
  name: 'match_result',
  description: 'Return structured job match scoring results',
  input_schema: {
    type: 'object' as const,
    properties: {
      score: { type: 'number', description: 'Match score 0–100 representing how well the CV fits the job' },
      strengths: {
        type: 'array',
        items: { type: 'string' },
        description: '3–5 bullet points on what makes this candidate a strong fit',
      },
      gaps: {
        type: 'array',
        items: { type: 'string' },
        description: '2–4 skills or experience areas the candidate is missing',
      },
      suggestedChanges: {
        type: 'array',
        items: { type: 'string' },
        description: '2–3 specific CV edits that would improve the match score',
      },
    },
    required: ['score', 'strengths', 'gaps', 'suggestedChanges'],
  },
}

export async function scoreJobMatch(
  cvText: string,
  jobDescription: string,
  jobTitle: string,
  roleContext?: string
): Promise<MatchResult> {
  const roleSection = roleContext ? `\n\n${roleContext}` : ''
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: [
      {
        type: 'text',
        text: `You are an expert recruiter and hiring manager evaluating candidate fit.\n\nCandidate CV:\n${cvText}${roleSection}`,
        cache_control: { type: 'ephemeral' },
      },
    ] as Anthropic.TextBlockParam[],
    messages: [
      {
        role: 'user',
        content: `Score this candidate's CV against the following job.\n\nRole: ${jobTitle}\n\nJob Description:\n${jobDescription}\n\nUse the match_result tool to return your assessment. Be specific and actionable.`,
      },
    ],
    tools: [matchResultTool],
    tool_choice: { type: 'tool', name: 'match_result' },
  })

  const toolUse = response.content.find((b) => b.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('Claude did not return a tool_use block')
  }
  const raw = toolUse.input as Omit<MatchResult, 'verdict'>
  return { ...raw, verdict: verdictFromScore(raw.score) }
}

export async function* generateCoverLetter(
  cvText: string,
  jobDescription: string,
  jobTitle: string,
  company: string,
  tone: 'formal' | 'direct' | 'enthusiastic' = 'direct'
): AsyncGenerator<string> {
  const toneGuide = {
    formal: 'Professional and formal British English. Structured paragraphs, no contractions.',
    direct: 'Confident and direct. Active voice, concise sentences.',
    enthusiastic: 'Energetic and genuine. Show real excitement without hollow clichés.',
  }

  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: [
      {
        type: 'text',
        text: `You are an expert career coach writing tailored, honest cover letters.\nNever make claims the CV does not support. Do not use generic phrases like "I am passionate about" or "I am a team player".\nTone: ${toneGuide[tone]}\nTarget length: 300–350 words.\nStructure:\n1. Specific opening hook referencing the role and company — not generic.\n2. Two to three concrete examples with metrics drawn directly from the CV.\n3. How the candidate's skills address the job's key requirements.\n4. Brief closing with a clear call to action.\n\nCandidate CV:\n${cvText}`,
        cache_control: { type: 'ephemeral' },
      },
    ] as Anthropic.TextBlockParam[],
    messages: [
      {
        role: 'user',
        content: `Write a cover letter for the following role.\n\nRole: ${jobTitle}\nCompany: ${company || 'the company'}\n\nJob Description:\n${jobDescription}`,
      },
    ],
  })

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      yield chunk.delta.text
    }
  }
}

export async function generateRecruiterMessage(
  cvText: string,
  jobDescription: string,
  jobTitle: string,
  company: string
): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    system: [
      {
        type: 'text',
        text: `You are an expert career coach writing LinkedIn InMail / recruiter outreach messages.\nRules: 150 words maximum. Reference the specific role by name. Include one concrete achievement from the CV that is relevant to the role. End with a clear call to action. Do not open with "I hope this finds you well" or similar filler.\n\nCandidate CV:\n${cvText}`,
        cache_control: { type: 'ephemeral' },
      },
    ] as Anthropic.TextBlockParam[],
    messages: [
      {
        role: 'user',
        content: `Write a recruiter outreach message for:\n\nRole: ${jobTitle}\nCompany: ${company || 'the company'}\n\nJob Description:\n${jobDescription}`,
      },
    ],
  })

  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') throw new Error('Claude did not return text')
  return textBlock.text
}

const interviewQuestionsTool: Anthropic.Tool = {
  name: 'interview_questions_result',
  description: 'Return structured interview questions with STAR framework answers grounded in the CV',
  input_schema: {
    type: 'object' as const,
    properties: {
      questions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            question: { type: 'string' },
            category: {
              type: 'string',
              enum: ['Technical', 'Behavioural', 'SRE', 'Leadership', 'Cloud', 'Situational'],
            },
            difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
            starFramework: {
              type: 'object',
              properties: {
                situation: { type: 'string' },
                task: { type: 'string' },
                action: { type: 'string' },
                result: { type: 'string' },
              },
              required: ['situation', 'task', 'action', 'result'],
            },
            keywordsToUse: { type: 'array', items: { type: 'string' } },
          },
          required: ['id', 'question', 'category', 'difficulty', 'starFramework', 'keywordsToUse'],
        },
      },
    },
    required: ['questions'],
  },
}

export async function generateInterviewQuestions(
  cvText: string,
  jobDescription: string,
  jobTitle: string,
  company: string,
  count: number = 10,
  interviewTopics?: string[]
): Promise<InterviewQuestion[]> {
  const topicsLine = interviewTopics && interviewTopics.length > 0
    ? `\nKey topic areas to cover: ${interviewTopics.join(', ')}.`
    : ''
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: [
      {
        type: 'text',
        text: `You are an expert interview coach for technical roles.\nGenerate interview questions that are specific to this candidate's background and the target role.\nSTAR answers must be grounded in the CV — reference real projects, technologies, and measurable results where possible.\nFor each question, include 3–5 keywords from the job description that the candidate should weave into their answer.\n\nCandidate CV:\n${cvText}`,
        cache_control: { type: 'ephemeral' },
      },
    ] as Anthropic.TextBlockParam[],
    messages: [
      {
        role: 'user',
        content: `Generate ${count} interview questions for the following role.\n\nRole: ${jobTitle}\nCompany: ${company || 'the company'}\n\nJob Description:\n${jobDescription}\n\nDistribution: Technical (40%), Behavioural (30%), Leadership/Situational (30%).${topicsLine}\nAssign each question a unique id: q1 through q${count}.\nSTAR answers must reference specific content from the candidate's CV, not generic advice.\nUse the interview_questions_result tool.`,
      },
    ],
    tools: [interviewQuestionsTool],
    tool_choice: { type: 'tool', name: 'interview_questions_result' },
  })

  const toolUse = response.content.find((b) => b.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('Claude did not return a tool_use block')
  }
  const rawInput = toolUse.input as Record<string, unknown>
  if (!Array.isArray(rawInput.questions) || rawInput.questions.length === 0) {
    throw new Error('Claude tool response missing questions array')
  }
  const first = rawInput.questions[0] as Record<string, unknown>
  if (typeof first.id !== 'string' || typeof first.question !== 'string') {
    throw new Error('Claude returned malformed question objects')
  }
  return rawInput.questions as InterviewQuestion[]
}
