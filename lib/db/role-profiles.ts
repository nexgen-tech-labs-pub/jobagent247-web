import Anthropic from '@anthropic-ai/sdk'
import type { SupabaseClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Client = SupabaseClient<any>

export interface RoleProfile {
  id: string
  domain: string
  seniority: string
  role_title: string
  tech_stack: string[]
  interview_topics: string[]
  learning_focus: string[]
}

const VALID_DOMAINS = [
  'frontend', 'backend', 'fullstack', 'mobile',
  'devops', 'data', 'ml', 'security',
  'embedded', 'erp', 'leadership',
] as const

const VALID_SENIORITIES = ['junior', 'mid', 'senior', 'staff', 'principal'] as const

const classifyTool: Anthropic.Tool = {
  name: 'classify_role',
  description: 'Classify a job into a domain and seniority level',
  input_schema: {
    type: 'object' as const,
    properties: {
      domain: {
        type: 'string',
        enum: [...VALID_DOMAINS],
        description: 'Engineering domain the role belongs to',
      },
      seniority: {
        type: 'string',
        enum: [...VALID_SENIORITIES],
        description: 'Seniority level of the role',
      },
    },
    required: ['domain', 'seniority'],
  },
}

export async function classifyRole(
  jobTitle: string,
  jobDescription: string
): Promise<{ domain: string; seniority: string }> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const snippet = jobDescription.slice(0, 800)

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 64,
    messages: [
      {
        role: 'user',
        content: `Classify this job into one domain and one seniority level.\n\nJob title: ${jobTitle}\n\nJob description excerpt:\n${snippet}\n\nUse the classify_role tool.`,
      },
    ],
    tools: [classifyTool],
    tool_choice: { type: 'tool', name: 'classify_role' },
  })

  const toolUse = response.content.find((b) => b.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('classify_role tool not returned')
  }

  const raw = toolUse.input as { domain: string; seniority: string }
  return { domain: raw.domain, seniority: raw.seniority }
}

export async function getRoleProfile(
  db: Client,
  domain: string,
  seniority: string
): Promise<RoleProfile | null> {
  const { data, error } = await db
    .from('role_profiles')
    .select('id, domain, seniority, role_title, tech_stack, interview_topics, learning_focus')
    .eq('domain', domain)
    .eq('seniority', seniority)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as RoleProfile
}
