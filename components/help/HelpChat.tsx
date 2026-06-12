'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2, RotateCcw } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  text: string
}

const WELCOME: Message = {
  role: 'assistant',
  text: "Hi! I can help you understand JobAgent247 — how features work, account setup, job search, CV support, application tracking, and pricing. What would you like to know?",
}

const SUGGESTED = [
  'How does JobAgent247 work?',
  'How do I upload my CV?',
  'Does JobAgent247 guarantee a job?',
  'How do I contact support?',
]

export function HelpChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: trimmed }])
    setLoading(true)
    try {
      const res = await fetch('/api/help-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      })
      const data = await res.json() as { answer: string }
      setMessages(prev => [...prev, { role: 'assistant', text: data.answer }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'The help assistant is temporarily unavailable. Please try again or contact media@jobsagent007.com.' }])
    } finally {
      setLoading(false)
    }
  }

  const reset = () => setMessages([WELCOME])

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Open JobAgent247 help chat"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all"
        style={{
          background: 'linear-gradient(135deg,#8B5CF6,#06B6D4)',
          boxShadow: '0 8px 32px rgba(139,92,246,0.4)',
        }}
      >
        {open
          ? <X className="w-5 h-5 text-white" />
          : <MessageCircle className="w-5 h-5 text-white" />}
        {!open && <span className="text-white text-sm font-semibold">Need help?</span>}
      </button>

      {/* Panel */}
      {open && (
        <div
          className="fixed bottom-20 right-6 z-50 w-80 sm:w-96 rounded-2xl flex flex-col overflow-hidden"
          style={{
            background: '#0B1020',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
            maxHeight: 'calc(100vh - 120px)',
          }}
          role="dialog"
          aria-label="JobAgent247 Help"
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div>
              <p className="font-heading font-semibold text-white text-sm">JobAgent247 Help</p>
              <p className="text-xs" style={{ color: '#64748B' }}>Ask about features, pricing &amp; more</p>
            </div>
            <button
              onClick={reset}
              aria-label="Reset conversation"
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: '#64748B' }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <p
                  className="text-xs leading-relaxed px-3 py-2 rounded-xl max-w-[85%]"
                  style={m.role === 'user'
                    ? { background: 'rgba(139,92,246,0.2)', color: '#F8FAFC', border: '1px solid rgba(139,92,246,0.3)' }
                    : { background: 'rgba(255,255,255,0.05)', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.08)' }
                  }
                >
                  {m.text}
                </p>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: '#8B5CF6' }} />
                </div>
              </div>
            )}

            {/* Suggested questions (only on fresh start) */}
            {messages.length === 1 && !loading && (
              <div className="space-y-1.5">
                {SUGGESTED.map(q => (
                  <button
                    key={q}
                    onClick={() => void send(q)}
                    className="w-full text-left text-xs px-3 py-2 rounded-xl transition-colors"
                    style={{ background: 'rgba(255,255,255,0.04)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            className="px-3 py-2.5 shrink-0 flex items-center gap-2"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
          >
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(input) } }}
              placeholder="Ask about JobAgent247…"
              maxLength={500}
              className="flex-1 text-xs px-3 py-2 rounded-xl outline-none text-white"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
              aria-label="Help chat message"
            />
            <button
              onClick={() => void send(input)}
              disabled={!input.trim() || loading}
              aria-label="Send message"
              className="p-2 rounded-xl transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#8B5CF6,#06B6D4)' }}
            >
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
