'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { SecondaryButton } from '@/components/ui/SecondaryButton'
import {
  ChevronDown, ChevronUp, Brain, Zap, Tag, Play,
  ArrowLeft, CheckSquare, Square, AlertTriangle, BookOpen, HelpCircle,
} from 'lucide-react'
import type { InterviewKit, InterviewQuestion, MockInterviewSession, MockEvalResult } from '@/lib/types/database'

type View = 'input' | 'kit' | 'mock' | 'list'
type KitTab = 'summary' | 'questions' | 'risks' | 'checklist'

const INTERVIEW_TYPES = ['General', 'Technical', 'Behavioural', 'HR Screen', 'Leadership', 'System Design', 'Case/Scenario']
const GEOGRAPHIES = ['UK', 'US', 'India', 'EU', 'Remote']

const difficultyColor: Record<string, string> = {
  easy: '#22C55E',
  medium: '#F59E0B',
  hard: '#EF4444',
}

const categoryColor: Record<string, string> = {
  Technical: '#8B5CF6',
  Behavioural: '#06B6D4',
  Leadership: '#F59E0B',
  Scenario: '#22C55E',
  Culture: '#EC4899',
  SRE: '#8B5CF6',
  Cloud: '#06B6D4',
  Situational: '#F59E0B',
}

function QuestionCard({ q, expanded, onToggle, practiceMode }: {
  q: InterviewQuestion
  expanded: boolean
  onToggle: () => void
  practiceMode: boolean
}) {
  const [revealed, setRevealed] = useState(false)

  return (
    <GlassCard className="overflow-hidden">
      <button className="w-full p-5 text-left flex items-start justify-between gap-4" onClick={onToggle}>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: `${categoryColor[q.category] ?? '#8B5CF6'}22`, color: categoryColor[q.category] ?? '#8B5CF6' }}>
              {q.category}
            </span>
            <span className="text-xs font-medium" style={{ color: difficultyColor[q.difficulty] }}>{q.difficulty}</span>
          </div>
          <p className="text-sm text-white leading-relaxed">{q.question}</p>
          {q.keywordsToUse.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2 items-center">
              <Tag className="w-3 h-3 shrink-0" style={{ color: '#64748B' }} />
              {q.keywordsToUse.slice(0, 5).map((kw) => (
                <span key={kw} className="text-xs" style={{ color: '#64748B' }}>{kw}</span>
              ))}
            </div>
          )}
        </div>
        {expanded
          ? <ChevronUp className="w-4 h-4 mt-1 shrink-0" style={{ color: '#64748B' }} />
          : <ChevronDown className="w-4 h-4 mt-1 shrink-0" style={{ color: '#64748B' }} />}
      </button>

      {expanded && (!practiceMode || revealed) && (
        <div className="px-5 pb-5 border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4" style={{ color: '#06B6D4' }} />
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#06B6D4' }}>STAR Framework</span>
          </div>
          <div className="space-y-3">
            {([
              { label: 'S — Situation', value: q.starFramework.situation },
              { label: 'T — Task', value: q.starFramework.task },
              { label: 'A — Action', value: q.starFramework.action },
              { label: 'R — Result', value: q.starFramework.result },
            ] as { label: string; value: string }[]).map(({ label, value }) => (
              <div key={label} className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <p className="text-xs font-semibold mb-1" style={{ color: '#8B5CF6' }}>{label}</p>
                <p className="text-sm" style={{ color: '#CBD5E1' }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {expanded && practiceMode && !revealed && (
        <div className="px-5 pb-5 border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <p className="text-sm mb-3" style={{ color: '#94A3B8' }}>Think through your answer before revealing the framework:</p>
          <textarea
            className="w-full h-28 px-4 py-3 rounded-xl text-sm text-white outline-none resize-none mb-3"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
            placeholder="Your STAR answer…"
          />
          <SecondaryButton size="sm" onClick={() => setRevealed(true)}>Reveal framework</SecondaryButton>
        </div>
      )}
    </GlassCard>
  )
}

function KitView({ kit, onStartMock, onBack, mockStarting }: {
  kit: InterviewKit
  onStartMock: () => void
  onBack: () => void
  mockStarting: boolean
}) {
  const [tab, setTab] = useState<KitTab>('summary')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [practiceMode, setPracticeMode] = useState(false)
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set())

  const categories = ['All', ...Array.from(new Set(kit.questions.map((q) => q.category)))]
  const visibleQuestions = categoryFilter === 'All'
    ? kit.questions
    : kit.questions.filter((q) => q.category === categoryFilter)

  const TABS: { id: KitTab; label: string }[] = [
    { id: 'summary', label: 'Summary' },
    { id: 'questions', label: `Questions (${kit.questions.length})` },
    { id: 'risks', label: 'Risk & Revision' },
    { id: 'checklist', label: 'Checklist' },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <button onClick={onBack} className="flex items-center gap-1 text-xs mb-2" style={{ color: '#64748B' }}>
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <h2 className="font-heading font-bold text-white text-xl">{kit.target_role}</h2>
          {kit.company_name && <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>{kit.company_name}</p>}
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(139,92,246,0.12)', color: '#8B5CF6' }}>{kit.interview_type}</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(6,182,212,0.12)', color: '#06B6D4' }}>{kit.geography}</span>
          </div>
        </div>
        <GradientButton size="sm" onClick={onStartMock} disabled={mockStarting}>
          {mockStarting
            ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Starting…</>
            : <><Play className="w-3.5 h-3.5" /> Mock Interview</>}
        </GradientButton>
      </div>

      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-1 text-xs py-2 rounded-lg transition-all"
            style={tab === t.id
              ? { background: 'rgba(139,92,246,0.2)', color: '#8B5CF6' }
              : { color: '#64748B' }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'summary' && (
        <div className="space-y-4">
          {kit.summary && (
            <GlassCard className="p-5">
              <p className="text-sm leading-relaxed" style={{ color: '#CBD5E1' }}>{kit.summary}</p>
            </GlassCard>
          )}
          {kit.likely_interview_stages.length > 0 && (
            <GlassCard className="p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Likely Interview Stages</h3>
              <div className="flex flex-wrap gap-2">
                {kit.likely_interview_stages.map((stage, i) => (
                  <span key={i} className="text-xs px-3 py-1 rounded-full flex items-center gap-1.5"
                    style={{ background: 'rgba(139,92,246,0.12)', color: '#8B5CF6' }}>
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{ background: 'rgba(139,92,246,0.3)' }}>{i + 1}</span>
                    {stage}
                  </span>
                ))}
              </div>
            </GlassCard>
          )}
          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Question Breakdown</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(
                kit.questions.reduce((acc, q) => {
                  acc[q.category] = (acc[q.category] ?? 0) + 1
                  return acc
                }, {} as Record<string, number>)
              ).map(([cat, count]) => (
                <div key={cat} className="rounded-xl p-3 text-center"
                  style={{ background: `${categoryColor[cat] ?? '#8B5CF6'}14`, border: `1px solid ${categoryColor[cat] ?? '#8B5CF6'}33` }}>
                  <p className="text-lg font-bold" style={{ color: categoryColor[cat] ?? '#8B5CF6' }}>{count}</p>
                  <p className="text-xs" style={{ color: '#94A3B8' }}>{cat}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {tab === 'questions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setCategoryFilter(cat)}
                  className="text-xs px-3 py-1 rounded-full transition-colors"
                  style={categoryFilter === cat
                    ? { background: 'rgba(139,92,246,0.2)', color: '#8B5CF6' }
                    : { background: 'rgba(255,255,255,0.05)', color: '#64748B' }}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: '#64748B' }}>Practice mode</span>
              <button
                onClick={() => setPracticeMode(!practiceMode)}
                className="w-10 h-5 rounded-full transition-colors relative"
                style={{ background: practiceMode ? '#8B5CF6' : 'rgba(255,255,255,0.1)' }}>
                <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                  style={{ left: practiceMode ? '22px' : '2px' }} />
              </button>
            </div>
          </div>
          {visibleQuestions.map((q) => (
            <QuestionCard
              key={q.id}
              q={q}
              expanded={expanded === q.id}
              onToggle={() => setExpanded(expanded === q.id ? null : q.id)}
              practiceMode={practiceMode}
            />
          ))}
        </div>
      )}

      {tab === 'risks' && (
        <div className="space-y-4">
          {kit.candidate_risk_areas.length > 0 && (
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4" style={{ color: '#EF4444' }} />
                <h3 className="text-sm font-semibold text-white">Candidate Risk Areas</h3>
              </div>
              <ul className="space-y-2">
                {kit.candidate_risk_areas.map((risk, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#CBD5E1' }}>
                    <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: '#EF4444' }} />
                    {risk}
                  </li>
                ))}
              </ul>
            </GlassCard>
          )}
          {kit.revision_topics.length > 0 && (
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4" style={{ color: '#F59E0B' }} />
                <h3 className="text-sm font-semibold text-white">Topics to Revise</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {kit.revision_topics.map((topic, i) => (
                  <span key={i} className="text-xs px-3 py-1 rounded-full"
                    style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}>{topic}</span>
                ))}
              </div>
            </GlassCard>
          )}
          {kit.questions_to_ask_employer.length > 0 && (
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle className="w-4 h-4" style={{ color: '#06B6D4' }} />
                <h3 className="text-sm font-semibold text-white">Questions to Ask the Employer</h3>
              </div>
              <ul className="space-y-2">
                {kit.questions_to_ask_employer.map((q, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#CBD5E1' }}>
                    <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: '#06B6D4' }} />
                    {q}
                  </li>
                ))}
              </ul>
            </GlassCard>
          )}
        </div>
      )}

      {tab === 'checklist' && (
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Pre-Interview Checklist</h3>
          <ul className="space-y-3">
            {kit.final_checklist.map((item, i) => (
              <li key={i}>
                <button
                  className="w-full flex items-start gap-3 text-left"
                  onClick={() => setCheckedItems((prev) => {
                    const next = new Set(prev)
                    if (next.has(i)) next.delete(i); else next.add(i)
                    return next
                  })}>
                  {checkedItems.has(i)
                    ? <CheckSquare className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#22C55E' }} />
                    : <Square className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#64748B' }} />}
                  <span className="text-sm" style={{
                    color: checkedItems.has(i) ? '#64748B' : '#CBD5E1',
                    textDecoration: checkedItems.has(i) ? 'line-through' : 'none',
                  }}>
                    {item}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="text-xs mt-4" style={{ color: '#64748B' }}>
            {checkedItems.size}/{kit.final_checklist.length} completed
          </p>
        </GlassCard>
      )}
    </div>
  )
}

function ScoreCircle({ score }: { score: number }) {
  const radius = 30
  const circumference = 2 * Math.PI * radius
  const strokeColor = score >= 75 ? '#22C55E' : score >= 50 ? '#F59E0B' : '#EF4444'
  const offset = circumference - (score / 100) * circumference
  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg width="80" height="80" className="-rotate-90">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <circle cx="40" cy="40" r={radius} fill="none" stroke={strokeColor} strokeWidth="6"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-white">{score}</span>
        <span className="text-[10px]" style={{ color: '#64748B' }}>/100</span>
      </div>
    </div>
  )
}

function MockView({ session, questions, onBack }: {
  session: MockInterviewSession
  questions: InterviewQuestion[]
  onBack: () => void
}) {
  const [currentSession, setCurrentSession] = useState(session)
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [lastEval, setLastEval] = useState<MockEvalResult | null>(null)
  const [evalVisible, setEvalVisible] = useState(false)
  const [mockError, setMockError] = useState<string | null>(null)

  const idx = currentSession.current_question_index
  const currentQuestion = idx < questions.length ? questions[idx] : null
  const isComplete = currentSession.status === 'completed'
  const progress = Math.round((currentSession.responses.length / questions.length) * 100)

  const handleSubmit = async () => {
    if (!currentQuestion || !answer.trim()) return
    setSubmitting(true)
    setMockError(null)
    try {
      const res = await fetch(`/api/interview/mock/${currentSession.id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          question: currentQuestion.question,
          category: currentQuestion.category,
          answer: answer.trim(),
        }),
      })
      if (!res.ok) { setMockError('Evaluation failed. Please try again.'); return }
      const data = await res.json() as { session: MockInterviewSession; evaluation: MockEvalResult }
      setCurrentSession(data.session)
      setLastEval(data.evaluation)
      setEvalVisible(true)
    } catch {
      setMockError('Evaluation failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleNext = () => {
    setAnswer('')
    setLastEval(null)
    setEvalVisible(false)
    setMockError(null)
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1 text-xs" style={{ color: '#64748B' }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Kit
        </button>
        <span className="text-xs" style={{ color: '#64748B' }}>{currentSession.responses.length}/{questions.length} answered</span>
      </div>

      <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-1.5 rounded-full transition-all"
          style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #8B5CF6, #06B6D4)' }} />
      </div>

      {isComplete && (
        <GlassCard className="p-8 space-y-4">
          <p className="text-lg font-bold text-white text-center">Mock Interview Complete!</p>
          {currentSession.overall_score != null && (
            <div className="flex justify-center">
              <ScoreCircle score={currentSession.overall_score} />
            </div>
          )}
          {currentSession.feedback_summary && (
            <p className="text-sm text-center" style={{ color: '#CBD5E1' }}>{currentSession.feedback_summary}</p>
          )}
          <div className="space-y-3">
            {currentSession.responses.map((r, i) => (
              <div key={i} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-xs font-medium" style={{ color: '#94A3B8' }}>
                    Q{i + 1}: {r.question.slice(0, 80)}{r.question.length > 80 ? '…' : ''}
                  </p>
                  <span className="text-xs font-bold shrink-0"
                    style={{ color: r.score >= 75 ? '#22C55E' : r.score >= 50 ? '#F59E0B' : '#EF4444' }}>
                    {r.score}/100
                  </span>
                </div>
                <p className="text-xs" style={{ color: '#64748B' }}>
                  {r.feedback.slice(0, 120)}{r.feedback.length > 120 ? '…' : ''}
                </p>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <SecondaryButton onClick={onBack}>← Back to Kit</SecondaryButton>
          </div>
        </GlassCard>
      )}

      {!isComplete && currentQuestion && !evalVisible && (
        <GlassCard className="p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: `${categoryColor[currentQuestion.category] ?? '#8B5CF6'}22`, color: categoryColor[currentQuestion.category] ?? '#8B5CF6' }}>
              {currentQuestion.category}
            </span>
            <span className="text-xs" style={{ color: difficultyColor[currentQuestion.difficulty] }}>{currentQuestion.difficulty}</span>
          </div>
          <p className="text-base font-medium text-white leading-relaxed">{currentQuestion.question}</p>
          <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={6}
            placeholder="Type your answer here…"
            className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none resize-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }} />
          {mockError && (
            <p className="text-sm px-4 py-3 rounded-xl"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              {mockError}
            </p>
          )}
          <GradientButton className="w-full justify-center" onClick={handleSubmit} disabled={submitting || !answer.trim()}>
            {submitting
              ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Evaluating…</>
              : 'Submit Answer'}
          </GradientButton>
        </GlassCard>
      )}

      {evalVisible && lastEval && !isComplete && (
        <div className="space-y-4">
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <ScoreCircle score={lastEval.score} />
              <div>
                <p className="text-sm font-semibold text-white">Answer Score</p>
                <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>
                  {lastEval.score >= 75 ? 'Strong answer' : lastEval.score >= 50 ? 'Good start — room to improve' : 'Needs more structure and evidence'}
                </p>
              </div>
            </div>

            {lastEval.strengths.length > 0 && (
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: '#22C55E' }}>Strengths</p>
                <ul className="space-y-1">
                  {lastEval.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs" style={{ color: '#CBD5E1' }}>
                      <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: '#22C55E' }} />{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {lastEval.weaknesses.length > 0 && (
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: '#EF4444' }}>To Improve</p>
                <ul className="space-y-1">
                  {lastEval.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs" style={{ color: '#CBD5E1' }}>
                      <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: '#EF4444' }} />{w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: '#94A3B8' }}>Coaching Feedback</p>
              <p className="text-sm" style={{ color: '#CBD5E1' }}>{lastEval.feedback}</p>
            </div>

            <div className="rounded-xl p-3" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: '#8B5CF6' }}>Stronger Answer Structure</p>
              <p className="text-sm" style={{ color: '#CBD5E1' }}>{lastEval.improvedAnswerStructure}</p>
            </div>
          </GlassCard>

          <GradientButton className="w-full justify-center" onClick={handleNext}>
            Next Question →
          </GradientButton>
        </div>
      )}
    </div>
  )
}

export default function InterviewPrepPage() {
  const [view, setView] = useState<View>('input')
  const [activeKit, setActiveKit] = useState<InterviewKit | null>(null)
  const [savedKits, setSavedKits] = useState<InterviewKit[]>([])
  const [loadingList, setLoadingList] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [mockStarting, setMockStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [jobDescription, setJobDescription] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [interviewType, setInterviewType] = useState('General')
  const [geography, setGeography] = useState('UK')

  const [mockSession, setMockSession] = useState<MockInterviewSession | null>(null)
  const [mockQuestions, setMockQuestions] = useState<InterviewQuestion[]>([])

  useEffect(() => {
    async function load() {
      setLoadingList(true)
      try {
        const res = await fetch('/api/interview/kit/list')
        if (res.ok) {
          const data = await res.json() as InterviewKit[]
          setSavedKits(data)
        }
      } finally {
        setLoadingList(false)
      }
    }
    void load()
  }, [])

  const handleGenerate = async () => {
    if (!jobDescription.trim() || !targetRole.trim()) {
      setError('Job description and target role are required.')
      return
    }
    setError(null)
    setGenerating(true)
    try {
      const res = await fetch('/api/interview/kit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription: jobDescription.trim(),
          targetRole: targetRole.trim(),
          companyName: companyName.trim() || undefined,
          interviewType,
          geography,
        }),
      })
      if (res.status === 429) { setError('Daily limit reached. Upgrade your plan for more.'); return }
      if (!res.ok) { setError('Kit generation failed. Please try again.'); return }
      const data = await res.json() as { kit: InterviewKit }
      setActiveKit(data.kit)
      setSavedKits((prev) => [data.kit, ...prev])
      setView('kit')
    } catch {
      setError('Kit generation failed. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const handleStartMock = async () => {
    if (!activeKit) return
    setMockStarting(true)
    setError(null)
    try {
      const res = await fetch('/api/interview/mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kitId: activeKit.id }),
      })
      if (!res.ok) { setError('Failed to start mock interview. Please try again.'); return }
      const data = await res.json() as { session: MockInterviewSession; questions: InterviewQuestion[] }
      setMockSession(data.session)
      setMockQuestions(data.questions)
      setView('mock')
    } catch {
      setError('Failed to start mock interview. Please try again.')
    } finally {
      setMockStarting(false)
    }
  }

  return (
    <DashboardLayout title="Interview Prep">
      <div className="max-w-4xl mx-auto space-y-6">

        {(view === 'input' || view === 'list') && (
          <div className="flex gap-2">
            <button onClick={() => setView('input')}
              className="text-sm px-4 py-2 rounded-xl transition-all"
              style={view === 'input'
                ? { background: 'rgba(139,92,246,0.15)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.2)' }
                : { color: '#64748B', border: '1px solid transparent' }}>
              New Kit
            </button>
            <button onClick={() => setView('list')}
              className="text-sm px-4 py-2 rounded-xl transition-all"
              style={view === 'list'
                ? { background: 'rgba(139,92,246,0.15)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.2)' }
                : { color: '#64748B', border: '1px solid transparent' }}>
              My Kits{savedKits.length > 0 ? ` (${savedKits.length})` : ''}
            </button>
          </div>
        )}

        {view === 'input' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <GlassCard className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: '#94A3B8' }}>Target Role *</label>
                  <input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: '#94A3B8' }}>Company Name</label>
                  <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Google (optional)"
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: '#94A3B8' }}>Job Description *</label>
                  <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here…"
                    rows={10}
                    className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none resize-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }} />
                </div>
              </GlassCard>
            </div>

            <div className="space-y-4">
              <GlassCard className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: '#94A3B8' }}>Interview Type</label>
                  <select value={interviewType} onChange={(e) => setInterviewType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
                    {INTERVIEW_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: '#94A3B8' }}>Geography</label>
                  <select value={geography} onChange={(e) => setGeography(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
                    {GEOGRAPHIES.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </GlassCard>

              {error && (
                <p className="text-sm px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {error}
                </p>
              )}

              <GradientButton className="w-full justify-center" onClick={handleGenerate}
                disabled={generating || !targetRole.trim() || !jobDescription.trim()}>
                {generating
                  ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating…</>
                  : <><Zap className="w-3.5 h-3.5" /> Generate Kit</>}
              </GradientButton>
              <p className="text-xs text-center" style={{ color: '#64748B' }}>
                Generates 25+ questions with STAR guidance tailored to your CV and this role.
              </p>
            </div>
          </div>
        )}

        {view === 'kit' && activeKit && (
          <KitView
            kit={activeKit}
            onStartMock={handleStartMock}
            onBack={() => setView('input')}
            mockStarting={mockStarting}
          />
        )}

        {view === 'mock' && activeKit && mockSession && (
          <MockView
            session={mockSession}
            questions={mockQuestions}
            onBack={() => setView('kit')}
          />
        )}

        {view === 'list' && (
          <div className="space-y-3">
            {loadingList && [1, 2, 3].map((i) => (
              <GlassCard key={i} className="p-5 animate-pulse">
                <div className="h-4 rounded w-1/3 mb-2" style={{ background: 'rgba(255,255,255,0.08)' }} />
                <div className="h-3 rounded w-1/4" style={{ background: 'rgba(255,255,255,0.08)' }} />
              </GlassCard>
            ))}
            {!loadingList && savedKits.length === 0 && (
              <GlassCard className="p-8 text-center">
                <Brain className="w-8 h-8 mx-auto mb-3" style={{ color: '#64748B' }} />
                <p className="text-sm font-medium text-white mb-1">No interview kits yet</p>
                <p className="text-xs" style={{ color: '#64748B' }}>Generate your first kit from the New Kit tab.</p>
              </GlassCard>
            )}
            {!loadingList && savedKits.map((kit) => (
              <button key={kit.id} className="w-full text-left" onClick={() => { setActiveKit(kit); setView('kit') }}>
                <GlassCard hover className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{kit.target_role}</p>
                      {kit.company_name && <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{kit.company_name}</p>}
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(139,92,246,0.12)', color: '#8B5CF6' }}>{kit.interview_type}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(6,182,212,0.12)', color: '#06B6D4' }}>{kit.geography}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs" style={{ color: '#64748B' }}>
                        {new Date(kit.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </p>
                      <p className="text-xs mt-1" style={{ color: '#8B5CF6' }}>{kit.questions.length} questions</p>
                    </div>
                  </div>
                </GlassCard>
              </button>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
