'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, FileText, Check, X, Loader2 } from 'lucide-react'
import { getBrowserClient } from '@/lib/supabase-browser'
import type { CV } from '@/lib/types/database'

interface CVUploadProps {
  userId: string
  existingCVs: CV[]
  onUploadComplete: (cv: CV & { preview: string }) => void
}

type UploadState = 'idle' | 'uploading' | 'extracting' | 'done' | 'error'

const ACCEPTED = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/pdf',
]
const MAX_SIZE = 10 * 1024 * 1024

export function CVUpload({ userId, existingCVs, onUploadComplete }: CVUploadProps) {
  const [state, setState] = useState<UploadState>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [versionLabel, setVersionLabel] = useState('')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    setError(null)

    if (!ACCEPTED.includes(file.type)) {
      setError('Only .docx and .pdf files are supported')
      return
    }
    if (file.size > MAX_SIZE) {
      setError('File exceeds 10MB limit')
      return
    }

    setState('uploading')
    setProgress(0)

    const supabase = getBrowserClient()
    const timestamp = Date.now()
    const storagePath = `${userId}/${timestamp}-${file.name}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('cvs')
      .upload(storagePath, file, { upsert: false })

    if (uploadError) {
      setError('Upload failed — please try again')
      setState('error')
      return
    }

    setProgress(60)
    setState('extracting')

    // Extract text + insert DB row via API route
    const res = await fetch('/api/cv/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storagePath,
        fileName: file.name,
        versionLabel: versionLabel.trim() || null,
        fileSize: file.size,
      }),
    })

    if (!res.ok) {
      const { error: apiError } = await res.json()
      setError(apiError ?? 'Processing failed')
      setState('error')
      return
    }

    const { cvId, preview } = await res.json()
    setProgress(100)
    setState('done')

    onUploadComplete({
      id: cvId,
      user_id: userId,
      file_name: file.name,
      file_url: '',
      raw_text: null,
      ats_score: null,
      version_label: versionLabel.trim() || null,
      is_primary: existingCVs.length === 0,
      created_at: new Date().toISOString(),
      preview,
    })
  }, [userId, versionLabel, existingCVs.length, onUploadComplete])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const isProcessing = state === 'uploading' || state === 'extracting'

  return (
    <div className="space-y-3">
      {/* Version label input */}
      <input
        type="text"
        placeholder="Version label (e.g. DevOps 2026) — optional"
        value={versionLabel}
        onChange={(e) => setVersionLabel(e.target.value)}
        disabled={isProcessing}
        className="w-full px-4 py-2.5 rounded-xl text-sm text-[color:var(--foreground)] outline-none transition-colors"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
      />

      {/* Drop zone */}
      <button
        type="button"
        disabled={isProcessing}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className="w-full rounded-xl p-8 text-center transition-all cursor-pointer"
        style={{
          border: `2px dashed ${dragging ? 'rgba(139,92,246,0.6)' : 'rgba(139,92,246,0.3)'}`,
          background: dragging ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.04)',
        }}
      >
        {isProcessing ? (
          <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin" style={{ color: '#8B5CF6' }} />
        ) : (
          <Upload className="w-8 h-8 mx-auto mb-3" style={{ color: '#8B5CF6' }} />
        )}
        <p className="text-sm font-medium text-[color:var(--foreground)] mb-1">
          {state === 'uploading' && 'Uploading…'}
          {state === 'extracting' && 'Extracting text…'}
          {(state === 'idle' || state === 'done' || state === 'error') && 'Drop your CV here or click to upload'}
        </p>
        <p className="text-xs" style={{ color: '#64748B' }}>Supports DOCX and PDF · Max 10MB</p>

        {/* Progress bar */}
        {isProcessing && (
          <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #8B5CF6, #06B6D4)' }}
            />
          </div>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".docx,.pdf"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />

      {error && (
        <p className="text-sm flex items-center gap-2" style={{ color: '#EF4444' }}>
          <X className="w-4 h-4 shrink-0" /> {error}
        </p>
      )}

      {state === 'done' && (
        <p className="text-sm flex items-center gap-2" style={{ color: '#22C55E' }}>
          <Check className="w-4 h-4 shrink-0" /> CV uploaded and text extracted successfully
        </p>
      )}

      {/* Existing CVs list */}
      {existingCVs.length > 0 && (
        <div className="space-y-2 pt-2">
          {existingCVs.map((cv) => (
            <div key={cv.id} className="flex items-center gap-3 p-4 rounded-xl"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.12)' }}>
                <FileText className="w-5 h-5" style={{ color: '#22C55E' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[color:var(--foreground)] truncate">{cv.file_name}</p>
                <p className="text-xs" style={{ color: '#64748B' }}>
                  {cv.version_label ?? 'Primary CV'}
                  {cv.ats_score != null && ` · ATS Score: ${cv.ats_score}%`}
                  {cv.is_primary && ' · ✓ Primary'}
                </p>
              </div>
              <Check className="w-5 h-5 shrink-0" style={{ color: '#22C55E' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
