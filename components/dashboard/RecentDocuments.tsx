'use client'

import { useEffect, useState } from 'react'
import { getBrowserClient } from '@/lib/supabase-browser'
import { GlassCard } from '@/components/ui/GlassCard'
import { FileText, MessageSquare } from 'lucide-react'
import type { Document } from '@/lib/types/database'

const typeLabel: Record<Document['type'], string> = {
  tailored_cv: 'Tailored CV',
  cover_letter: 'Cover Letter',
  recruiter_msg: 'Recruiter Message',
}

const typeIcon: Record<Document['type'], React.ElementType> = {
  tailored_cv: FileText,
  cover_letter: FileText,
  recruiter_msg: MessageSquare,
}

const typeColor: Record<Document['type'], string> = {
  tailored_cv: '#22C55E',
  cover_letter: '#8B5CF6',
  recruiter_msg: '#06B6D4',
}

export function RecentDocuments() {
  const [docs, setDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getBrowserClient()
    ;(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)
        setDocs((data as Document[]) ?? [])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading || docs.length === 0) return null

  return (
    <GlassCard className="p-6">
      <h3 className="font-heading font-semibold text-white mb-4">Recent Documents</h3>
      <div className="space-y-3">
        {docs.map((doc) => {
          const Icon = typeIcon[doc.type]
          const color = typeColor[doc.type]
          return (
            <div key={doc.id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${color}18` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{typeLabel[doc.type]}</p>
                <p className="text-xs truncate" style={{ color: '#64748B' }}>
                  {doc.content?.slice(0, 60) ?? '—'}…
                </p>
              </div>
              <span className="text-xs shrink-0" style={{ color: '#64748B' }}>
                {new Date(doc.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          )
        })}
      </div>
    </GlassCard>
  )
}
