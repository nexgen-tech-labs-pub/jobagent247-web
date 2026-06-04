import Anthropic from '@anthropic-ai/sdk'
import type { CVAnalysisResult, MatchResult, InterviewQuestion, ReadinessResult } from './types/database'

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

const readinessTool: Anthropic.Tool = {
  name: 'readiness_result',
  description: 'Return a structured job readiness analysis with score breakdown, gap analysis, and recommendations',
  input_schema: {
    type: 'object' as const,
    properties: {
      overallScore: { type: 'number', description: 'Overall readiness score 0-100' },
      readinessLevel: {
        type: 'string',
        enum: ['Ready', 'Partially Ready', 'Not Yet Ready'],
        description: 'Ready: score >= 75, Partially Ready: score 50-74, Not Yet Ready: score < 50',
      },
      scoreBreakdown: {
        type: 'object',
        properties: {
          technicalSkills: { type: 'number', description: '0-100: does the candidate have the required technical skills?' },
          experienceMatch: { type: 'number', description: '0-100: does the candidate have the right years and seniority?' },
          evidenceStrength: { type: 'number', description: '0-100: are skills backed by concrete achievements and metrics?' },
          industryMatch: { type: 'number', description: '0-100: does the candidate have relevant domain or industry experience?' },
          interviewReadiness: { type: 'number', description: '0-100: does the CV demonstrate the kind of impact stories needed for interviews?' },
          profilePositioning: { type: 'number', description: '0-100: is the CV headline, summary, and structure optimised for this role?' },
        },
        required: ['technicalSkills', 'experienceMatch', 'evidenceStrength', 'industryMatch', 'interviewReadiness', 'profilePositioning'],
      },
      criticalGaps: {
        type: 'array',
        items: { type: 'string' },
        description: 'Gaps that will very likely block interviews — missing required skills or experience years',
      },
      importantGaps: {
        type: 'array',
        items: { type: 'string' },
        description: 'Gaps that will reduce interview probability but are not blockers',
      },
      niceToHaveGaps: {
        type: 'array',
        items: { type: 'string' },
        description: 'Gaps that are useful to fill but will not significantly affect interview rate',
      },
      strengths: {
        type: 'array',
        items: { type: 'string' },
        description: '3-5 specific strengths backed by evidence in the CV',
      },
      recommendations: {
        type: 'array',
        items: { type: 'string' },
        description: '4-6 specific, actionable improvement steps (e.g. "Add a Terraform project to your GitHub to evidence IaC skills")',
      },
      evidenceSummary: {
        type: 'string',
        description: '2-3 sentence summary of evidence quality in the CV',
      },
      summary: {
        type: 'string',
        description: '2-3 sentence plain English summary of overall readiness',
      },
    },
    required: [
      'overallScore', 'readinessLevel', 'scoreBreakdown',
      'criticalGaps', 'importantGaps', 'niceToHaveGaps',
      'strengths', 'recommendations', 'evidenceSummary', 'summary',
    ],
  },
}

export async function analyseReadiness(
  cvText: string,
  targetJobTitle: string,
  targetSeniority: string | null,
  targetGeography: string | null,
  linkedinText: string | null,
  portfolioLinks: string[]
): Promise<ReadinessResult> {
  const supplemental: string[] = []
  if (linkedinText?.trim()) supplemental.push(`LinkedIn profile text:\n${linkedinText.trim()}`)
  if (portfolioLinks.length > 0) supplemental.push(`Portfolio / GitHub links: ${portfolioLinks.join(', ')}`)

  const seniorityLine = targetSeniority ? `Target seniority: ${targetSeniority}` : ''
  const geoLine = targetGeography ? `Target geography / market: ${targetGeography}` : ''

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: [
      {
        type: 'text',
        text: `You are a senior technical recruiter and career coach performing a deep readiness assessment.\n\nYour job:\n1. Extract the candidate's skills, evidence, achievements, and experience from their materials\n2. Model what this specific target role (title + seniority + geography) actually requires from the market\n3. Compare honestly and identify gaps\n4. Score across 6 dimensions 0-100\n5. Compute overallScore as the weighted average: technicalSkills 30%, experienceMatch 25%, evidenceStrength 20%, industryMatch 10%, interviewReadiness 10%, profilePositioning 5%\n\nReadiness level:\n- Ready: overallScore >= 75\n- Partially Ready: overallScore 50-74\n- Not Yet Ready: overallScore < 50\n\nEvidence strength scoring rules:\n- "worked with X" = score -10 (weak claim)\n- "built X" = score 0 (neutral)\n- "built X that achieved Y% improvement / £Z saving / N users" = score +10 (strong evidence)\n\nDo NOT guarantee interviews or hiring outcomes. Assess honestly.\n\nCandidate CV:\n${cvText}${supplemental.length > 0 ? '\n\n' + supplemental.join('\n\n') : ''}`,
        cache_control: { type: 'ephemeral' },
      },
    ] as Anthropic.TextBlockParam[],
    messages: [
      {
        role: 'user',
        content: `Analyse this candidate's readiness for the following target role and use the readiness_result tool.\n\nTarget role: ${targetJobTitle}\n${seniorityLine}\n${geoLine}`.trim(),
      },
    ],
    tools: [readinessTool],
    tool_choice: { type: 'tool', name: 'readiness_result' },
  })

  const toolUse = response.content.find((b) => b.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('Claude did not return a tool_use block')
  }
  return toolUse.input as ReadinessResult
}

const jobFitTool: Anthropic.Tool = {
  name: 'job_fit_result',
  description: 'Return a structured job fit analysis with score breakdown and actionable recommendations',
  input_schema: {
    type: 'object' as const,
    properties: {
      fitScore: { type: 'number', description: 'Overall fit score 0-100' },
      matchCategory: {
        type: 'string',
        enum: ['Strong Match', 'Stretch Match', 'Low Probability Match'],
      },
      scoreBreakdown: {
        type: 'object',
        properties: {
          technicalSkillsMatch: { type: 'number' },
          experienceSeniorityMatch: { type: 'number' },
          evidenceStrength: { type: 'number' },
          domainIndustryMatch: { type: 'number' },
          locationRemoteCompatibility: { type: 'number' },
          salaryCompatibility: { type: 'number' },
          visaWorkAuthorizationCompatibility: { type: 'number' },
          roleTrajectoryFit: { type: 'number' },
        },
        required: [
          'technicalSkillsMatch', 'experienceSeniorityMatch', 'evidenceStrength',
          'domainIndustryMatch', 'locationRemoteCompatibility', 'salaryCompatibility',
          'visaWorkAuthorizationCompatibility', 'roleTrajectoryFit',
        ],
      },
      strengths: { type: 'array', items: { type: 'string' }, description: '3-5 specific strengths' },
      risks: { type: 'array', items: { type: 'string' }, description: '2-4 risks or concerns' },
      missingSkills: { type: 'array', items: { type: 'string' } },
      evidenceGaps: { type: 'array', items: { type: 'string' }, description: 'Areas where candidate claims skills but lacks concrete evidence' },
      locationNotes: { type: 'string' },
      salaryNotes: { type: 'string' },
      visaNotes: { type: 'string' },
      recommendedNextAction: { type: 'string' },
      applicationStrategy: { type: 'string' },
      summary: { type: 'string', description: '2-3 sentence plain English summary' },
    },
    required: [
      'fitScore', 'matchCategory', 'scoreBreakdown', 'strengths', 'risks',
      'missingSkills', 'evidenceGaps', 'locationNotes', 'salaryNotes', 'visaNotes',
      'recommendedNextAction', 'applicationStrategy', 'summary',
    ],
  },
}

export async function analyseJobFit(
  cvText: string,
  jobDescription: string,
  jobTitle: string,
  userProfile?: { location?: string | null; visa_required?: boolean; job_type_pref?: string | null }
): Promise<import('./types/database').JobFitResult> {
  const profileContext = userProfile
    ? `\nCandidate location preference: ${userProfile.location ?? 'not specified'}\nVisa sponsorship required: ${userProfile.visa_required ? 'yes' : 'no'}\nJob type preference: ${userProfile.job_type_pref ?? 'not specified'}`
    : ''

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: [
      {
        type: 'text',
        text: `You are a senior technical recruiter and career coach evaluating candidate fit for a specific role.\n\nEvaluate evidence strength carefully — "worked with X" is weak evidence; "built X achieving Y% improvement" is strong evidence.\n\nScore each dimension 0-100. Set fitScore to the weighted average:\n- technicalSkillsMatch: 25%\n- experienceSeniorityMatch: 20%\n- evidenceStrength: 15%\n- domainIndustryMatch: 10%\n- locationRemoteCompatibility: 10%\n- salaryCompatibility: 5%\n- visaWorkAuthorizationCompatibility: 10%\n- roleTrajectoryFit: 5%\n\nMatchCategory rules:\n- Strong Match: fitScore >= 75\n- Stretch Match: fitScore 55-74\n- Low Probability Match: fitScore < 55\n\nCandidate CV:\n${cvText}${profileContext}`,
        cache_control: { type: 'ephemeral' },
      },
    ] as Anthropic.TextBlockParam[],
    messages: [
      {
        role: 'user',
        content: `Analyse this candidate's fit for the following role and use the job_fit_result tool.\n\nRole: ${jobTitle}\n\nJob Description:\n${jobDescription}`,
      },
    ],
    tools: [jobFitTool],
    tool_choice: { type: 'tool', name: 'job_fit_result' },
  })

  const toolUse = response.content.find((b) => b.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('Claude did not return a tool_use block')
  }
  return toolUse.input as import('./types/database').JobFitResult
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
