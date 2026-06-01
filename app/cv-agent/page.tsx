'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { SecondaryButton } from '@/components/ui/SecondaryButton'
import { Upload, Zap, Download, ArrowRight, CheckCircle, XCircle, Loader2, Lock, FileText, MessageSquare, Copy } from 'lucide-react'
import { getBrowserClient } from '@/lib/supabase-browser'
import type { CV, CVAnalysisResult } from '@/lib/types/database'

function CVAgentInner() {
  const searchParams = useSearchParams()
  const [cvList, setCvList] = useState<CV[]>([])
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null)
  const [jobDescription, setJobDescription] = useState(() => searchParams.get('jd') ?? '')
  const [targetRole, setTargetRole] = useState(() => searchParams.get('role') ?? '')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<(CVAnalysisResult & { remaining: number }) | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [improving, setImproving] = useState(false)
  const [improvedCV, setImprovedCV] = useState('')
  const [upgradeRequired, setUpgradeRequired] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [tone, setTone] = useState<'formal' | 'direct' | 'enthusiastic'>('direct')
  const [generatingCL, setGeneratingCL] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [generatingRM, setGeneratingRM] = useState(false)
  const [recruiterMessage, setRecruiterMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const supabase = getBrowserClient()
    ;(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data } = await supabase
          .from('cvs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        if (!data) return
        setCvList(data as CV[])
        const primary = (data as CV[]).find((c) => c.is_primary) ?? (data as CV[])[0]
        if (primary) setSelectedCvId(primary.id)
      } catch {
        // silently ignore — user stays on page with empty CV list
      }
    })()
  }, [searchParams])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)

    const supabase = getBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploading(false); return }

    const storagePath = `${user.id}/${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('cvs')
      .upload(storagePath, file, { upsert: false })

    if (uploadError) {
      setError('Upload failed: ' + uploadError.message)
      setUploading(false)
      return
    }

    const res = await fetch('/api/cv/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storagePath,
        fileName: file.name,
        fileSize: file.size,
      }),
    })

    if (!res.ok) {
      let msg = 'Failed to process CV'
      try { const d = await res.json(); msg = d.error ?? msg } catch { /* empty body */ }
      setError(msg)
      setUploading(false)
      return
    }

    const { cvId } = await res.json()

    // Refresh CV list and select the new one
    const { data } = await supabase
      .from('cvs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (data) setCvList(data as CV[])
    setSelectedCvId(cvId)
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleAnalyse = async () => {
    if (!selectedCvId || !jobDescription.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    setImprovedCV('')
    setUpgradeRequired(false)

    const res = await fetch('/api/cv/analyse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cvId: selectedCvId, jobDescription, targetRole }),
    })

    if (res.status === 429) {
      setError('Daily limit reached. Upgrade your plan for more applications.')
      setLoading(false)
      return
    }
    if (!res.ok) {
      const { error: msg } = await res.json()
      setError(msg ?? 'Something went wrong')
      setLoading(false)
      return
    }

    const data = await res.json()
    setResult(data)
    setLoading(false)
  }

  const handleImprove = async () => {
    if (!selectedCvId || !jobDescription.trim() || !result) return
    setImproving(true)
    setImprovedCV('')
    setUpgradeRequired(false)

    const res = await fetch('/api/cv/improve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cvId: selectedCvId, jobDescription, targetRole }),
    })

    if (res.status === 403) {
      setUpgradeRequired(true)
      setImproving(false)
      return
    }
    if (res.status === 429) {
      setError('Daily limit reached.')
      setImproving(false)
      return
    }
    if (!res.ok || !res.body) {
      setError('Failed to generate rewrite')
      setImproving(false)
      return
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      setImprovedCV((prev) => prev + decoder.decode(value))
    }
    setImproving(false)
  }

  const handleCoverLetter = async () => {
    if (!selectedCvId || !jobDescription.trim() || !targetRole.trim()) return
    setGeneratingCL(true)
    setCoverLetter('')
    setError(null)

    const res = await fetch('/api/apply/cover-letter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cvId: selectedCvId,
        jobDescription,
        jobTitle: targetRole,
        tone,
      }),
    })

    if (res.status === 429) {
      setError('Daily limit reached. Upgrade your plan for more.')
      setGeneratingCL(false)
      return
    }
    if (!res.ok || !res.body) {
      setError('Failed to generate cover letter')
      setGeneratingCL(false)
      return
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      setCoverLetter((prev) => prev + decoder.decode(value))
    }
    setGeneratingCL(false)
  }

  const handleRecruiterMessage = async () => {
    if (!selectedCvId || !jobDescription.trim() || !targetRole.trim()) return
    setGeneratingRM(true)
    setRecruiterMessage('')
    setError(null)

    const res = await fetch('/api/apply/recruiter-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cvId: selectedCvId,
        jobDescription,
        jobTitle: targetRole,
      }),
    })

    if (res.status === 429) {
      setError('Daily limit reached.')
      setGeneratingRM(false)
      return
    }
    if (!res.ok) {
      setError('Failed to generate recruiter message')
      setGeneratingRM(false)
      return
    }

    const data = await res.json()
    setRecruiterMessage(data.message)
    setGeneratingRM(false)
  }

  const scoreColor =
    result && result.score >= 90
      ? '#22C55E'
      : result && result.score >= 70
      ? '#F59E0B'
      : '#EF4444'

  return (
    <DashboardLayout title="CV Agent">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input panel */}
        <div className="space-y-4">
          <GlassCard className="p-6">
            <h3 className="font-heading font-semibold text-white mb-4">1. Select your CV</h3>
            {cvList.length === 0 ? (
              <p className="text-sm" style={{ color: '#64748B' }}>No CVs uploaded yet.</p>
            ) : (
              <div className="space-y-2 mb-3">
                {cvList.map((cv) => (
                  <button
                    key={cv.id}
                    onClick={() => setSelectedCvId(cv.id)}
                    className="w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all"
                    style={{
                      background: selectedCvId === cv.id ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${selectedCvId === cv.id ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.08)'}`,
                    }}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{cv.file_name ?? 'Untitled CV'}</p>
                      <p className="text-xs" style={{ color: '#64748B' }}>
                        {cv.is_primary ? 'Primary CV' : cv.version_label ?? 'CV'}
                        {cv.ats_score != null ? ` · ATS Score: ${cv.ats_score}%` : ''}
                      </p>
                    </div>
                    {selectedCvId === cv.id && <CheckCircle className="w-4 h-4 shrink-0" style={{ color: '#22C55E' }} />}
                  </button>
                ))}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={handleUpload}
            />
            <SecondaryButton
              size="sm"
              className="w-full justify-center"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading
                ? <><Loader2 className="w-3 h-3 animate-spin" /> Uploading…</>
                : <><Upload className="w-3 h-3" /> Upload different CV</>}
            </SecondaryButton>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-heading font-semibold text-white mb-2">2. Target role</h3>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Senior DevOps Engineer"
              className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
            />
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-heading font-semibold text-white mb-2">3. Paste job description</h3>
            <textarea
              className="w-full h-48 px-4 py-3 rounded-xl text-sm outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: '#CBD5E1' }}
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-heading font-semibold text-white mb-3">4. Cover letter tone</h3>
            <div className="flex gap-2">
              {(['formal', 'direct', 'enthusiastic'] as const).map((t) => (
                <button key={t} onClick={() => setTone(t)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-all"
                  style={tone === t
                    ? { background: 'rgba(139,92,246,0.15)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.3)' }
                    : { background: 'rgba(255,255,255,0.05)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {t}
                </button>
              ))}
            </div>
          </GlassCard>

          <div className="flex gap-3">
            <SecondaryButton
              size="sm"
              className="flex-1 justify-center"
              onClick={handleCoverLetter}
              disabled={generatingCL || !selectedCvId || !jobDescription.trim() || !targetRole.trim()}
            >
              {generatingCL
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Writing…</>
                : <><FileText className="w-3.5 h-3.5" /> Cover Letter</>}
            </SecondaryButton>
            <SecondaryButton
              size="sm"
              className="flex-1 justify-center"
              onClick={handleRecruiterMessage}
              disabled={generatingRM || !selectedCvId || !jobDescription.trim() || !targetRole.trim()}
            >
              {generatingRM
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Writing…</>
                : <><MessageSquare className="w-3.5 h-3.5" /> Recruiter Message</>}
            </SecondaryButton>
          </div>

          {error && (
            <p className="text-sm px-4 py-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </p>
          )}

          <GradientButton
            size="lg"
            className="w-full justify-center"
            onClick={handleAnalyse}
            disabled={loading || !selectedCvId || !jobDescription.trim()}
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analysing…</> : <><Zap className="w-4 h-4" /> Run CV Agent</>}
          </GradientButton>
        </div>

        {/* Output panel */}
        <div className="space-y-4">
          {/* Score */}
          <GlassCard className="p-6">
            <h3 className="font-heading font-semibold text-white mb-4">ATS Score</h3>
            <div className="flex items-center gap-6">
              <div className="relative w-28 h-28">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke={result ? scoreColor : 'rgba(139,92,246,0.3)'}
                    strokeWidth="2.5"
                    strokeDasharray={`${result ? result.score : 0} 100`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 1s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-heading font-bold text-2xl" style={{ color: result ? scoreColor : '#64748B' }}>
                    {result ? result.score : '--'}
                  </span>
                  <span className="text-xs" style={{ color: '#64748B' }}>/ 100</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-white mb-1">
                  {result
                    ? result.score >= 90 ? 'Strong match' : result.score >= 70 ? 'Good match' : 'Needs improvement'
                    : 'Run agent to score'}
                </p>
                <p className="text-xs" style={{ color: '#94A3B8' }}>
                  {result ? result.summary : 'Paste a job description and click Run CV Agent'}
                </p>
                {result && (
                  <p className="text-xs mt-1" style={{ color: '#64748B' }}>
                    {result.remaining} application{result.remaining !== 1 ? 's' : ''} remaining today
                  </p>
                )}
              </div>
            </div>
          </GlassCard>

          {/* Missing keywords */}
          {result && result.missingKeywords.length > 0 && (
            <GlassCard className="p-6">
              <h3 className="font-heading font-semibold text-white mb-3">Missing Keywords</h3>
              <p className="text-xs mb-3" style={{ color: '#94A3B8' }}>Add these to improve your ATS score for this role</p>
              <div className="flex flex-wrap gap-2">
                {result.missingKeywords.map((kw) => (
                  <span key={kw} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full"
                    style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }}>
                    <XCircle className="w-3 h-3" /> {kw}
                  </span>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Improved bullets */}
          {result && result.improvedBullets.length > 0 && (
            <GlassCard className="p-6">
              <h3 className="font-heading font-semibold text-white mb-4">Improved Bullets</h3>
              <div className="space-y-5">
                {result.improvedBullets.map((b, i) => (
                  <div key={i}>
                    <div className="flex items-start gap-2 mb-1">
                      <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: '#EF4444' }} />
                      <p className="text-xs line-through" style={{ color: '#64748B' }}>{b.original}</p>
                    </div>
                    <div className="flex items-start gap-2 mb-1">
                      <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: '#22C55E' }} />
                      <p className="text-xs" style={{ color: '#CBD5E1' }}>{b.improved}</p>
                    </div>
                    <p className="text-xs ml-5 italic" style={{ color: '#64748B' }}>{b.reason}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Improve / export actions */}
          {result && (
            <div className="flex gap-3">
              <SecondaryButton size="sm" className="flex-1 justify-center" disabled>
                <Download className="w-3.5 h-3.5" /> Export CV
              </SecondaryButton>
              <GradientButton
                size="sm"
                className="flex-1 justify-center"
                onClick={handleImprove}
                disabled={improving}
              >
                {improving
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Rewriting…</>
                  : <><ArrowRight className="w-3.5 h-3.5" /> Full CV Rewrite</>}
              </GradientButton>
            </div>
          )}

          {/* Upgrade prompt */}
          {upgradeRequired && (
            <GlassCard className="p-5">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 shrink-0" style={{ color: '#8B5CF6' }} />
                <div>
                  <p className="text-sm font-medium text-white">Pro feature</p>
                  <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>Full CV rewrite is available on the Pro plan. Upgrade to unlock unlimited rewrites.</p>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Streamed CV rewrite */}
          {improvedCV && (
            <GlassCard className="p-6">
              <h3 className="font-heading font-semibold text-white mb-3">Rewritten CV</h3>
              <pre className="text-xs whitespace-pre-wrap max-h-96 overflow-y-auto" style={{ color: '#CBD5E1', fontFamily: 'inherit' }}>
                {improvedCV}
              </pre>
            </GlassCard>
          )}

          {/* Cover letter output */}
          {(coverLetter || generatingCL) && (
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading font-semibold text-white">Cover Letter</h3>
                {coverLetter && (
                  <button
                    onClick={() => navigator.clipboard.writeText(coverLetter)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-colors"
                    style={{ background: 'rgba(255,255,255,0.06)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                )}
              </div>
              {generatingCL && !coverLetter && (
                <div className="flex items-center gap-2" style={{ color: '#64748B' }}>
                  <Loader2 className="w-4 h-4 animate-spin" /> Writing your cover letter…
                </div>
              )}
              {coverLetter && (
                <pre className="text-xs whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed" style={{ color: '#CBD5E1', fontFamily: 'inherit' }}>
                  {coverLetter}
                </pre>
              )}
            </GlassCard>
          )}

          {/* Recruiter message output */}
          {recruiterMessage && (
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading font-semibold text-white">Recruiter Message</h3>
                <button
                  onClick={() => navigator.clipboard.writeText(recruiterMessage)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#CBD5E1' }}>{recruiterMessage}</p>
              <p className="text-xs mt-2" style={{ color: '#64748B' }}>{recruiterMessage.split(/\s+/).length} words</p>
            </GlassCard>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function CVAgentPage() {
  return (
    <Suspense>
      <CVAgentInner />
    </Suspense>
  )
}
