import { NextRequest, NextResponse } from 'next/server'
import { answerHelpQuery } from '@/lib/claude'
import knowledgeRaw from './help-knowledge.json'

interface KnowledgeEntry {
  id: string
  category: string
  question: string
  content: string
  keywords: string[]
}

const knowledge = knowledgeRaw as KnowledgeEntry[]

const MAX_MESSAGE_LENGTH = 500

function searchKnowledge(query: string): string[] {
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2)
  const scored = knowledge.map(entry => {
    const text = `${entry.question} ${entry.content} ${entry.keywords.join(' ')}`.toLowerCase()
    const score = words.filter(w => text.includes(w)).length
    return { entry, score }
  })
  return scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ entry }) => `Q: ${entry.question}\nA: ${entry.content}`)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { message?: string }
    const message = (body.message ?? '').trim()

    if (!message) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 })
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json({ error: 'Message too long (max 500 characters)' }, { status: 400 })
    }

    const contextChunks = searchKnowledge(message)
    const { answer, grounded } = await answerHelpQuery(message, contextChunks)

    return NextResponse.json({ answer, grounded })
  } catch {
    return NextResponse.json(
      { answer: 'The JobAgent247 help assistant is temporarily unavailable. Please try again or contact media@jobsagent007.com.', grounded: false },
      { status: 200 }
    )
  }
}
