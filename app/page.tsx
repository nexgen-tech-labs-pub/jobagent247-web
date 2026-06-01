'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  FileText, Briefcase, MessageSquare, CheckSquare, User, Target,
  ArrowRight, Check, X, Star, Zap, BarChart2, Clock,
  Brain, Bell, MapPin,
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { SecondaryButton } from '@/components/ui/SecondaryButton'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-16">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: '#8B5CF6' }} />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-15" style={{ background: '#06B6D4' }} />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-widest rounded-full mb-6"
              style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
              AI-powered job search automation
            </span>
            <h1 className="font-heading font-bold text-5xl lg:text-6xl xl:text-7xl text-white leading-[1.1] mb-6">
              Get more interviews with your{' '}
              <span className="gradient-text">personal AI agents.</span>
            </h1>
            <p className="text-lg leading-relaxed mb-8" style={{ color: '#CBD5E1' }}>
              Create stronger CVs, match with better roles, generate tailored applications, prepare for interviews,
              and track your entire job search from one intelligent workspace.
            </p>
            <ul className="space-y-3 mb-10">
              {['Tailored CV and cover letter generation', 'Job match scoring and gap analysis', 'Interview prep based on each role', 'Application tracker and follow-up reminders'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm" style={{ color: '#CBD5E1' }}>
                  <Check className="w-4 h-4 shrink-0" style={{ color: '#22C55E' }} />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <GradientButton href="/dashboard" size="lg">Start free <ArrowRight className="w-4 h-4" /></GradientButton>
              <SecondaryButton href="#workflow" size="lg">See how it works</SecondaryButton>
            </div>
            <p className="text-xs" style={{ color: '#64748B' }}>No credit card required · Build your first job profile in minutes</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <div className="rounded-3xl p-6"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 40px 120px rgba(0,0,0,0.5), 0 0 80px rgba(139, 92, 246, 0.25)',
              }}>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full" style={{ background: '#EF4444' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#F59E0B' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#22C55E' }} />
                <span className="ml-2 text-xs" style={{ color: '#64748B' }}>jobagent247 · dashboard</span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[{ label: 'Profile Strength', value: '82%', color: '#8B5CF6' }, { label: 'CV Readiness', value: '91%', color: '#22C55E' }, { label: 'Job Match', value: '76%', color: '#06B6D4' }].map((m) => (
                  <div key={m.label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="text-xl font-bold font-heading" style={{ color: m.color }}>{m.value}</div>
                    <div className="text-xs mt-1" style={{ color: '#64748B' }}>{m.label}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2 mb-4">
                {[{ label: 'Senior DevOps Engineer · Barclays', score: 92, color: '#22C55E' }, { label: 'Azure Cloud Architect · KPMG', score: 87, color: '#22C55E' }, { label: 'SRE Lead · Monzo Bank', score: 84, color: '#06B6D4' }].map((job) => (
                  <div key={job.label} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="text-xs text-white truncate mr-2">{job.label}</span>
                    <span className="text-xs font-bold shrink-0" style={{ color: job.color }}>{job.score}%</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {['Ready to apply', 'Needs tailoring', 'Interview prep due'].map((pill) => (
                  <span key={pill} className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6', border: '1px solid rgba(139, 92, 246, 0.3)' }}>{pill}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── Metric Strip ─────────────────────────────────────────────────────────────

function MetricStrip() {
  return (
    <section className="border-y py-10" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-widest text-center mb-4" style={{ color: '#64748B' }}>Platform capability</p>
        <div className="h-px mb-8" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { value: '3×', label: 'faster application preparation', Icon: Clock },
            { value: '10+', label: 'job-search agents', Icon: Brain },
            { value: 'Role-specific', label: 'interview practice', Icon: MessageSquare },
            { value: 'One workspace', label: 'for every application', Icon: Briefcase },
          ].map((m) => (
            <div key={m.label} className="text-center">
              <div className="flex items-center justify-center gap-2">
                <m.Icon className="w-4 h-4" style={{ color: '#8B5CF6' }} />
                <span className="font-heading font-bold text-xl text-white">{m.value}</span>
              </div>
              <p className="text-sm mt-1" style={{ color: '#CBD5E1' }}>{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Offer Strip ──────────────────────────────────────────────────────────────

function PricingOfferStrip() {
  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(6,182,212,0.1))', border: '1px solid rgba(139,92,246,0.3)' }}>
          <div>
            <h3 className="font-heading font-bold text-xl text-white mb-1">Start your job search system today</h3>
            <p className="text-sm" style={{ color: '#CBD5E1' }}>Free plan available · Premium from £9.99/month</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['CV Agent included', 'Job Match Agent included', 'Interview Prep Agent included'].map((pill) => (
              <span key={pill} className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }}>
                <Check className="w-3 h-3 inline mr-1" />{pill}
              </span>
            ))}
          </div>
          <GradientButton href="/dashboard" size="sm">Start free</GradientButton>
        </div>
      </div>
    </section>
  )
}

// ─── How It Helps ─────────────────────────────────────────────────────────────

function HowItHelps() {
  const cards = [
    { Icon: FileText, title: 'Build a better CV', desc: 'Upload your CV and let the CV Agent improve structure, keywords, impact statements, and ATS readability.' },
    { Icon: Target, title: 'Find stronger role matches', desc: 'Paste job descriptions and get match scores, missing skills, keyword gaps, and suggested improvements.' },
    { Icon: ArrowRight, title: 'Apply with confidence', desc: 'Generate tailored cover letters, recruiter messages, and application answers for each role.' },
    { Icon: MessageSquare, title: 'Prepare for interviews', desc: 'Get role-specific questions, answer frameworks, mock interview prompts, and feedback loops.' },
    { Icon: CheckSquare, title: 'Track every opportunity', desc: 'Manage saved jobs, application status, deadlines, follow-ups, and interview stages.' },
    { Icon: User, title: 'Improve your profile', desc: 'Optimise LinkedIn headlines, summaries, project descriptions, and recruiter-facing positioning.' },
  ]
  return (
    <section id="features" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader badge="Everything you need" heading="Everything you need to run a smarter job search" subheading="Each tool is purpose-built for a specific part of your job search." centered />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map(({ Icon, title, desc }) => (
            <GlassCard key={title} hover animate className="p-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.2)' }}>
                <Icon className="w-5 h-5" style={{ color: '#8B5CF6' }} />
              </div>
              <h3 className="font-heading font-semibold text-white text-lg mb-2">{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#94A3B8' }}>{desc}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Agent Workflow ───────────────────────────────────────────────────────────

function AgentWorkflow() {
  const agents = [
    { title: 'Profile Agent', desc: 'Understands your experience, skills, projects, goals, and target roles.' },
    { title: 'CV Agent', desc: 'Improves your CV for clarity, ATS keywords, measurable impact, and role alignment.' },
    { title: 'Job Match Agent', desc: 'Scores job descriptions against your profile and highlights gaps.' },
    { title: 'Application Agent', desc: 'Creates tailored cover letters, recruiter messages, and application answers.' },
    { title: 'Interview Agent', desc: 'Generates interview prep based on the job, your CV, and likely employer expectations.' },
    { title: 'Tracker Agent', desc: 'Keeps your job pipeline organised and suggests follow-up actions.' },
  ]
  return (
    <section id="workflow" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader badge="AI Agents" heading="A job search powered by specialised AI agents" subheading="Each agent handles a specific part of your job search, passing context to the next step so your applications stay consistent." centered />
        <div className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-stretch">
          {agents.map((agent, i) => (
            <motion.div key={agent.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center text-center h-full">
              <div className="glass-card p-5 w-full h-full flex flex-col items-center">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold mb-3 mx-auto shrink-0" style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)', color: 'white' }}>{i + 1}</div>
                <h3 className="font-heading font-semibold text-sm text-white mb-2">{agent.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: '#94A3B8' }}>{agent.desc}</p>
              </div>
            </motion.div>
          ))}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 -z-10"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.4), rgba(6,182,212,0.4), transparent)' }} />
        </div>
      </div>
    </section>
  )
}

// ─── Feature Grid ─────────────────────────────────────────────────────────────

function FeatureGrid() {
  const features = [
    { Icon: FileText, title: 'AI CV Builder', desc: 'Turn your CV into a sharper, role-ready version.', status: 'Live' },
    { Icon: Target, title: 'ATS Keyword Optimiser', desc: 'Match CV keywords to job descriptions automatically.', status: 'Live' },
    { Icon: Briefcase, title: 'Job Description Analyser', desc: 'Break down any job description into skills and priorities.', status: 'Live' },
    { Icon: BarChart2, title: 'Job Match Score', desc: 'Get a 0–100 score for how well you fit each role.', status: 'Live' },
    { Icon: FileText, title: 'Cover Letter Generator', desc: 'Create compelling, tailored cover letters in seconds.', status: 'Live' },
    { Icon: MessageSquare, title: 'Recruiter Message Generator', desc: 'Write effective cold outreach and InMail messages.', status: 'Live' },
    { Icon: User, title: 'LinkedIn Profile Optimiser', desc: 'Improve headlines, summaries, and project descriptions.', status: 'Beta' },
    { Icon: Brain, title: 'Mock Interview Generator', desc: 'Role-specific interview questions with STAR frameworks.', status: 'Live' },
    { Icon: CheckSquare, title: 'Application Tracker', desc: 'Manage every application stage from saved to offered.', status: 'Live' },
    { Icon: Bell, title: 'Follow-up Reminder System', desc: 'Never miss a follow-up or let a lead go cold.', status: 'Live' },
    { Icon: Target, title: 'Skill Gap Analysis', desc: 'See exactly what skills you need to close for each role.', status: 'Live' },
    { Icon: MapPin, title: 'Career Roadmap Suggestions', desc: 'Get personalised next steps based on your target role.', status: 'Beta' },
  ]
  return (
    <section id="feature-grid" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader badge="Platform" heading="All the tools your job search needs in one platform" centered />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {features.map(({ Icon, title, desc, status }) => (
            <GlassCard key={title} hover animate className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.12)' }}>
                  <Icon className="w-4 h-4" style={{ color: '#8B5CF6' }} />
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full" style={status === 'Live' ? { background: 'rgba(34,197,94,0.12)', color: '#22C55E' } : { background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}>{status}</span>
              </div>
              <h3 className="font-heading font-semibold text-sm text-white mb-1">{title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: '#94A3B8' }}>{desc}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Dashboard Preview ────────────────────────────────────────────────────────

function DashboardPreview() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader badge="Product" heading="Your job-search command centre" subheading="Everything in one place — from CV score to application pipeline to interview prep." centered />
        <div className="rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 40px 120px rgba(0,0,0,0.5), 0 0 80px rgba(139,92,246,0.2)' }}>
          <div className="flex items-center gap-2 px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="w-3 h-3 rounded-full" style={{ background: '#EF4444' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#F59E0B' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#22C55E' }} />
            <span className="ml-3 text-xs" style={{ color: '#64748B' }}>jobagent247.app/dashboard</span>
          </div>
          <div className="flex">
            <div className="hidden md:block w-48 shrink-0 p-4 border-r space-y-1" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              {['Overview', 'My Profile', 'CV Agent', 'Job Matches', 'Applications', 'Interview Prep', 'Settings'].map((item, i) => (
                <div key={item} className="px-3 py-2 rounded-lg text-xs" style={i === 0 ? { background: 'rgba(139,92,246,0.15)', color: '#8B5CF6' } : { color: '#64748B' }}>{item}</div>
              ))}
            </div>
            <div className="flex-1 p-6">
              <p className="text-sm mb-6" style={{ color: '#CBD5E1' }}>Welcome back, Hitendra. Your job-search agents have <span style={{ color: '#8B5CF6' }}>4 suggested actions</span> today.</p>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
                {[{ label: 'Profile Strength', value: '82%', color: '#8B5CF6' }, { label: 'CV Readiness', value: '91%', color: '#22C55E' }, { label: 'Job Match Avg', value: '76%', color: '#06B6D4' }, { label: 'Applied This Week', value: '8', color: '#F59E0B' }, { label: 'Interviews', value: '2', color: '#22C55E' }, { label: 'Follow-ups Due', value: '3', color: '#EF4444' }].map((w) => (
                  <div key={w.label} className="rounded-xl p-3 text-center flex flex-col justify-center min-h-[72px]" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="text-lg font-bold font-heading" style={{ color: w.color }}>{w.value}</div>
                    <div className="text-xs mt-1" style={{ color: '#64748B' }}>{w.label}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[{ text: 'Tailor CV for Senior DevOps Engineer — Barclays Technology', tag: 'High priority' }, { text: 'Prepare for Azure Platform Engineer interview (28 May)', tag: 'Upcoming' }, { text: 'Follow up with recruiter — Lloyds Banking Group', tag: 'Overdue' }].map((action) => (
                  <div key={action.text} className="flex items-center justify-between rounded-lg px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="text-xs text-white">{action.text}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full ml-2 shrink-0" style={{ background: 'rgba(139,92,246,0.15)', color: '#8B5CF6' }}>{action.tag}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Use Cases ────────────────────────────────────────────────────────────────

function UseCases() {
  const cases = [
    { Icon: User, title: 'Experienced professionals', desc: 'Turn years of experience into a focused, recruiter-friendly profile.' },
    { Icon: ArrowRight, title: 'Career switchers', desc: 'Map transferable skills and build a stronger story for your new target role.' },
    { Icon: Target, title: 'Students & graduates', desc: 'Create your first professional CV, prepare for interviews, and apply with structure.' },
    { Icon: Briefcase, title: 'Contractors & consultants', desc: 'Tailor your profile quickly for multiple roles, clients, and statements of work.' },
    { Icon: Zap, title: 'Tech professionals', desc: 'Optimise CVs for cloud, DevOps, software, data, AI, platform, and SRE roles.' },
    { Icon: MapPin, title: 'International job seekers', desc: 'Adapt your CV and applications for different markets and employer expectations.' },
  ]
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader badge="Who it's for" heading="Built for every stage of your career move" centered />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map(({ Icon, title, desc }) => (
            <GlassCard key={title} hover animate className="p-6">
              <Icon className="w-6 h-6 mb-4" style={{ color: '#06B6D4' }} />
              <h3 className="font-heading font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm" style={{ color: '#94A3B8' }}>{desc}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Comparison ───────────────────────────────────────────────────────────────

function ComparisonTable() {
  const rows = ['Improves CV structure', 'Analyses job descriptions', 'Scores job fit', 'Tailors each application', 'Prepares interview questions', 'Tracks applications', 'Maintains job-search context', 'Suggests next actions', 'Optimises LinkedIn profile', 'Supports follow-ups']
  const columns = [
    { label: 'Basic CV Builder', values: [true, false, false, false, false, false, false, false, false, false] },
    { label: 'Generic Chatbot', values: [true, true, false, true, true, false, false, false, false, false] },
    { label: 'JobAgent247', values: [true, true, true, true, true, true, true, true, true, true], highlight: true },
  ]
  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader badge="Why us" heading="More than a CV builder. A full job-search operating system." centered />
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th className="text-left py-4 px-6 text-sm font-semibold" style={{ color: '#64748B' }}>Feature</th>
                {columns.map((col) => (
                  <th key={col.label} className="py-4 px-4 text-center text-sm font-semibold" style={col.highlight ? { color: '#8B5CF6' } : { color: '#64748B' }}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row} style={{ borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.05)' : undefined }}>
                  <td className="py-3 px-6 text-sm text-white">{row}</td>
                  {columns.map((col) => (
                    <td key={col.label} className="py-3 px-4 text-center">
                      {col.values[i] ? <Check className="w-4 h-4 mx-auto" style={{ color: col.highlight ? '#22C55E' : '#64748B' }} /> : <X className="w-4 h-4 mx-auto" style={{ color: '#3F4A5A' }} />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

function Testimonials() {
  const testimonials = [
    { initials: 'SR', name: 'Sarah R.', role: 'Cloud Engineer → Senior Platform Engineer', quote: 'After using the CV Agent and tailoring my applications, I got 4 interview invites in a week. The match scoring is genuinely useful.', stars: 5 },
    { initials: 'MK', name: 'Marcus K.', role: 'DevOps Lead at a FTSE 250', quote: 'The interview prep feature is exceptional. It generated questions specific to the exact role, not just generic DevOps questions. I walked in well-prepared.', stars: 5 },
    { initials: 'PT', name: 'Priya T.', role: 'Career switcher into cloud engineering', quote: 'The gap analysis showed me exactly what keywords I was missing and helped me reframe my bullet points for a cloud engineering role.', stars: 5 },
  ]
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader badge="Social proof" heading="What job seekers are saying" centered />
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <GlassCard key={t.name} animate className="p-6">
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" style={{ color: '#F59E0B' }} />)}
              </div>
              <p className="text-sm leading-relaxed mb-6" style={{ color: '#CBD5E1' }}>{`"${t.quote}"`}</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)', color: 'white' }}>{t.initials}</div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs" style={{ color: '#64748B' }}>{t.role}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

function PricingSection() {
  const plans = [
    { name: 'Free', price: '£0', period: '/month', desc: 'For exploring and building your first profile', features: ['1 CV upload', 'Basic CV feedback', '3 job description analyses', 'Basic job tracker', 'Limited AI generations'], cta: 'Start free', highlight: false },
    { name: 'Pro', price: '£9.99', period: '/month', desc: 'For active job seekers who want better applications', features: ['Unlimited CV improvements', 'Unlimited job match analysis', 'Tailored cover letters', 'Recruiter messages', 'Interview prep', 'Application tracker', 'LinkedIn optimisation', 'Follow-up suggestions'], cta: 'Get Pro', highlight: true, badge: 'Best value' },
    { name: 'Career Accelerator', price: '£29.99', period: '/month', desc: 'For serious job seekers and career switchers', features: ['Everything in Pro', 'Advanced role strategy', 'Multiple CV versions', 'Mock interview workflows', 'Weekly job-search plan', 'Priority AI processing', 'Exportable documents'], cta: 'Accelerate my search', highlight: false },
  ]
  return (
    <section id="pricing" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader badge="Pricing" heading="Choose the plan that fits your job search" centered />
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.name} className="glass-card p-8 flex flex-col relative" style={plan.highlight ? { border: '1px solid rgba(139,92,246,0.5)', boxShadow: '0 0 40px rgba(139,92,246,0.15)' } : {}}>
              {plan.badge && <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold rounded-full" style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)', color: 'white' }}>{plan.badge}</span>}
              <div className="mb-6">
                <h3 className="font-heading font-bold text-xl text-white mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="font-heading font-bold text-4xl text-white">{plan.price}</span>
                  <span className="text-sm" style={{ color: '#64748B' }}>{plan.period}</span>
                </div>
                <p className="text-sm" style={{ color: '#94A3B8' }}>{plan.desc}</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm" style={{ color: '#CBD5E1' }}>
                    <Check className="w-4 h-4 shrink-0" style={{ color: '#22C55E' }} />{f}
                  </li>
                ))}
              </ul>
              {plan.highlight
                ? <GradientButton href="/dashboard" className="w-full justify-center">{plan.cta}</GradientButton>
                : <SecondaryButton href="/dashboard" className="w-full justify-center">{plan.cta}</SecondaryButton>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

function FAQSection() {
  const faqs = [
    { q: 'Is this just a CV builder?', a: 'No. It includes CV improvement, job matching, application generation, interview prep, LinkedIn optimisation, and application tracking — all powered by specialised AI agents.' },
    { q: 'Can it guarantee me a job?', a: 'No platform can guarantee a job. The goal is to improve the quality, consistency, and speed of your job search — increasing your chances of getting interviews.' },
    { q: 'Can I tailor my CV for each job?', a: 'Yes. The CV Agent analyses a job description and suggests role-specific CV improvements, targeting a 90+ ATS score for every application.' },
    { q: 'Does it work for tech roles?', a: 'Yes — especially useful for cloud, DevOps, SRE, software, data, AI, and product roles. The platform understands technical terminology and ATS patterns for these fields.' },
    { q: 'Can I track my applications?', a: 'Yes. Manage application stages, follow-up dates, interviews, recruiter contacts, and next actions — all in one pipeline view.' },
    { q: 'Is my data private?', a: 'Your CVs, job documents, and profile data are handled securely. We do not share your personal data with employers or third parties without your consent.' },
  ]
  return (
    <section id="faq" className="py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader badge="FAQ" heading="Common questions" centered />
        <Accordion className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="glass-card px-6 border-0">
              <AccordionTrigger className="text-left text-sm font-medium text-white hover:no-underline py-4">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-sm pb-4" style={{ color: '#94A3B8' }}>{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

// ─── Final CTA ────────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="glass-card p-16 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 blur-3xl opacity-30 rounded-full" style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' }} />
          </div>
          <div className="relative">
            <h2 className="font-heading font-bold text-4xl md:text-5xl text-white mb-6">Ready to run a smarter job search?</h2>
            <p className="text-lg mb-10" style={{ color: '#CBD5E1' }}>Join professionals using AI agents to find better roles, apply with confidence, and prepare more effectively.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GradientButton href="/dashboard" size="lg">Start free <ArrowRight className="w-4 h-4" /></GradientButton>
              <SecondaryButton href="#pricing" size="lg">View pricing</SecondaryButton>
            </div>
            <p className="text-xs mt-6" style={{ color: '#64748B' }}>No credit card required · Cancel anytime</p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t py-12" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-heading font-bold text-white">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' }}>
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            JobAgent247
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {['Product', 'How it Works', 'Features', 'Pricing', 'FAQ'].map((link) => (
              <a key={link} href={`#${link.toLowerCase().replace(/\s/g, '-')}`} className="text-sm" style={{ color: '#64748B' }}>{link}</a>
            ))}
          </div>
          <p className="text-xs" style={{ color: '#64748B' }}>© {new Date().getFullYear()} Nexgen Tech Labs. All rights reserved.</p>
        </div>
        {/* Legal links */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <Link href="/terms" className="text-xs hover:underline" style={{ color: '#64748B' }}>Terms &amp; Conditions</Link>
          <Link href="/privacy" className="text-xs hover:underline" style={{ color: '#64748B' }}>Privacy Policy</Link>
          <Link href="/data-compliance" className="text-xs hover:underline" style={{ color: '#64748B' }}>Data Compliance</Link>
          <a href="mailto:media@jobsagent247.com" className="text-xs hover:underline" style={{ color: '#64748B' }}>Contact</a>
          <span className="text-xs" style={{ color: '#334155' }}>Registered in the United Kingdom</span>
        </div>
      </div>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <MetricStrip />
      <PricingOfferStrip />
      <HowItHelps />
      <AgentWorkflow />
      <FeatureGrid />
      <DashboardPreview />
      <UseCases />
      <ComparisonTable />
      <Testimonials />
      <PricingSection />
      <FAQSection />
      <FinalCTA />
      <Footer />
    </main>
  )
}
