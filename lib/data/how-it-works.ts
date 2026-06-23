export interface Stage {
  num: number
  title: string
  body: string
  agents: string[]
  iconName: string
}

export interface Agent {
  slug: string
  name: string
  iconName: string
  oneLiner: string
  whatYouGet: string[]
  href: string
  stage: number
}

export interface HowItWorksFaq {
  q: string
  a: string
}

export interface HowItWorksCopy {
  locale: 'uk' | 'in'
  cvTerm: 'CV' | 'resume'
  cvTermLower: 'cv' | 'resume'
  metaTitle: string
  metaDescription: string
  canonical: string
  heroTitle: string
  heroTitleAccent: string
  heroSubtitle: string
  stages: Stage[]
  agents: Agent[]
  timelineHeading: string
  timelineBody: string
  timelineBullets: { label: string; value: string }[]
  faqs: HowItWorksFaq[]
}

// Shared data — the actual flow is identical for UK and India; only copy differs.

const UK_STAGES: Stage[] = [
  {
    num: 1,
    iconName: 'UserCircle',
    title: 'Set up your profile',
    body: 'A 5-minute onboarding captures your target roles, experience level, location, salary range, and visa requirements. This profile gets passed as cached context to every AI agent so you never have to repeat yourself.',
    agents: ['profile'],
  },
  {
    num: 2,
    iconName: 'FileText',
    title: 'Score and rewrite your CV',
    body: 'Upload your CV and we score it against any job description in seconds. The CV Agent rewrites bullets, optimises keywords, and produces an ATS-ready version targeting 90+. Job Fit then shows your fit score across 8 dimensions — technical skills, seniority, evidence strength, domain, location, salary, visa, trajectory.',
    agents: ['cv-agent', 'job-fit'],
  },
  {
    num: 3,
    iconName: 'Briefcase',
    title: 'Find matching jobs',
    body: 'Live jobs from Reed, CV-Library, Adzuna, LinkedIn, Indeed, and 50+ UK job sites — matched to your profile with a match score. Bulk-select up to 5 jobs and run a tailored CV pass on all of them in one go.',
    agents: ['job-matches'],
  },
  {
    num: 4,
    iconName: 'BrainCircuit',
    title: 'Build evidence and close gaps',
    body: 'Career Intel shows your readiness for your target role on a 6-dimension radar chart, flagging critical, important, and nice-to-have gaps. Growth Coach turns that into a 90-day action plan. Evidence Builder generates portfolio projects, STAR stories, and CV bullets you can deploy.',
    agents: ['career-intelligence', 'career-growth', 'evidence-builder'],
  },
  {
    num: 5,
    iconName: 'Send',
    title: 'Apply with tailored materials',
    body: 'For each role, generate a tailored CV, cover letter, and recruiter outreach message — all aware of the specific job description, your profile, and your evidence library. Mark roles as applied and add them to your pipeline. Export to DOCX or PDF.',
    agents: ['applications', 'cv-agent'],
  },
  {
    num: 6,
    iconName: 'CheckCircle2',
    title: 'Follow up and prep for interviews',
    body: 'Follow-Ups surfaces reminders so nothing falls through the gaps after you apply. Interview Prep generates role-specific questions, STAR answers, and a 7-day prep plan the moment you land an interview.',
    agents: ['follow-ups', 'interview-prep'],
  },
]

const UK_AGENTS: Agent[] = [
  {
    slug: 'profile',
    name: 'Your Profile',
    iconName: 'User',
    oneLiner: 'Tells every agent who you are and what you want',
    whatYouGet: [
      'Target roles, locations, salary band, visa needs',
      'Skills and keywords feed all matching logic',
      'Reused as cached context across every AI call',
    ],
    href: '/profile',
    stage: 1,
  },
  {
    slug: 'cv-agent',
    name: 'CV Agent',
    iconName: 'FileText',
    oneLiner: 'Scores and rewrites your CV for any role',
    whatYouGet: [
      'ATS score with keyword gap analysis in <10 seconds',
      'Full CV rewrite targeting 90+ ATS score',
      'Tailored cover letters and recruiter messages',
    ],
    href: '/cv-agent',
    stage: 2,
  },
  {
    slug: 'job-fit',
    name: 'Job Fit',
    iconName: 'Target',
    oneLiner: 'Deep 8-dimension match analysis for any job',
    whatYouGet: [
      'Fit score 0–100 with confidence band',
      '8 dimensions: skills, seniority, evidence, domain, location, salary, visa, trajectory',
      'Strengths, risks, and missing skills — ranked',
    ],
    href: '/job-fit',
    stage: 2,
  },
  {
    slug: 'job-matches',
    name: 'Job Matches',
    iconName: 'Briefcase',
    oneLiner: 'Live job feed from 50+ UK job sites',
    whatYouGet: [
      'Reed, CV-Library, Adzuna, LinkedIn, Indeed — all in one feed',
      'Match score for every role based on your profile',
      'Bulk-tailor your CV for up to 5 roles at once',
    ],
    href: '/job-matches',
    stage: 3,
  },
  {
    slug: 'career-intelligence',
    name: 'Career Intel',
    iconName: 'BrainCircuit',
    oneLiner: 'Readiness analysis for your target role and seniority',
    whatYouGet: [
      '6-dimension readiness radar (skills, evidence, trajectory, network, presence, market)',
      'Critical / important / nice-to-have gap tiers',
      'Honest assessment of where you are vs where you want to go',
    ],
    href: '/career-intelligence',
    stage: 4,
  },
  {
    slug: 'career-growth',
    name: 'Growth Coach',
    iconName: 'TrendingUp',
    oneLiner: 'Turns gaps into a 90-day action plan',
    whatYouGet: [
      'Prioritised plan: what to learn, build, and ship',
      'Weekly milestones to close your biggest gaps',
      'Concrete projects and courses, not generic advice',
    ],
    href: '/career-growth',
    stage: 4,
  },
  {
    slug: 'evidence-builder',
    name: 'Evidence Builder',
    iconName: 'BookOpen',
    oneLiner: 'Generates portfolio evidence you can actually use',
    whatYouGet: [
      'Portfolio project briefs tailored to your target role',
      'STAR stories for behavioural interviews',
      'CV bullets and LinkedIn bullets — copy-ready',
    ],
    href: '/evidence-builder',
    stage: 4,
  },
  {
    slug: 'applications',
    name: 'Applications',
    iconName: 'CheckSquare',
    oneLiner: 'Pipeline tracker for every role you apply to',
    whatYouGet: [
      'Saved → Applied → Interviewing → Offer pipeline',
      'Notes, dates, and follow-up reminders per role',
      'Status timeline so nothing falls through',
    ],
    href: '/applications',
    stage: 5,
  },
  {
    slug: 'follow-ups',
    name: 'Follow-Ups',
    iconName: 'Inbox',
    oneLiner: 'Inbox of follow-ups and reminders due',
    whatYouGet: [
      'Auto-surfaced follow-ups based on application date',
      'Templated messages you can edit and send',
      'Zero applications left forgotten',
    ],
    href: '/follow-ups',
    stage: 6,
  },
  {
    slug: 'interview-prep',
    name: 'Interview Prep',
    iconName: 'MessageSquare',
    oneLiner: 'Role-specific prep packs the moment you land an interview',
    whatYouGet: [
      'Likely questions for the company, role, and interview type',
      'STAR-format answer drafts using your real experience',
      '7-day prep plan, technical refresh, and mock prompts',
    ],
    href: '/interview-prep',
    stage: 6,
  },
]

const UK_FAQS: HowItWorksFaq[] = [
  {
    q: 'Do I need to use all 10 agents?',
    a: 'No. Most people start with the CV Agent and Job Matches, then add Interview Prep when they land their first interview. You can use the agents in any order — they share context through your profile.',
  },
  {
    q: 'How long does it take to get my first tailored CV?',
    a: 'Around 10 minutes for onboarding and CV upload, plus 30–60 seconds for the AI to score and rewrite your CV against your first job description. Most users have a tailored CV ready to send within 15 minutes of signup.',
  },
  {
    q: 'Does this work for any role or industry?',
    a: 'Yes. The agents work for any role — software engineering, finance, healthcare, teaching, marketing, anything. The AI tailors itself to the job description you paste, so it adapts to your industry automatically. We have role-specific guides for 20+ common roles in our CV Builder.',
  },
  {
    q: 'How is this different from using ChatGPT?',
    a: 'ChatGPT is a general AI — you need to know what to ask. JobAgent247 wraps Claude (also a frontier AI) in a structured workflow built for job searching: it scores against ATS, remembers your profile across sessions, finds live jobs, tracks applications, and prepares you for specific interviews. ChatGPT does none of that.',
  },
  {
    q: 'How much does it cost?',
    a: 'Free to start — including CV scoring, basic tailoring, and limited job searches. Pro is £9.99/month for unlimited use of every agent. Career Accelerator is £29.99/month and includes multiple CV versions, mock interviews, and export. The first 100 founding members get 30 days of Pro free.',
  },
]

export const HOW_IT_WORKS_UK: HowItWorksCopy = {
  locale: 'uk',
  cvTerm: 'CV',
  cvTermLower: 'cv',
  metaTitle: 'How JobAgent247 Works: From CV to Job Offer (UK Guide 2026)',
  metaDescription: 'See exactly how JobAgent247 helps you score 90+ on ATS, find UK jobs from 50+ sites, generate tailored cover letters, and land interviews — across 10 AI agents.',
  canonical: 'https://jobagent247.co/how-it-works',
  heroTitle: 'From CV to job offer —',
  heroTitleAccent: 'how JobAgent247 works',
  heroSubtitle: 'Ten AI agents, one workspace, one connected workflow. Here\'s exactly what happens from the moment you sign up to the moment you land an offer.',
  stages: UK_STAGES,
  agents: UK_AGENTS,
  timelineHeading: 'Realistic timeline',
  timelineBody: 'JobAgent247 compresses what normally takes weeks into hours. Here\'s what a typical user\'s timeline looks like:',
  timelineBullets: [
    { label: '0–10 min', value: 'Sign up, complete onboarding, upload your CV' },
    { label: '10–25 min', value: 'Score your CV against your first job, generate a tailored version and cover letter' },
    { label: 'Day 1–7', value: 'Apply to 10–20 tailored roles, track everything in the pipeline' },
    { label: 'Week 2–4', value: 'First interviews booked — use Interview Prep for each' },
  ],
  faqs: UK_FAQS,
}

// India variant: same structure, "resume" instead of "CV", India-specific job sites
const IN_STAGES: Stage[] = UK_STAGES.map(s => {
  if (s.num === 3) {
    return {
      ...s,
      body: 'Live jobs from Naukri, Indeed, LinkedIn, Foundit, and 50+ India job sites — matched to your profile with a match score. Bulk-select up to 5 jobs and tailor your resume to all of them in one go.',
    }
  }
  return {
    ...s,
    body: s.body.replace(/CV/g, 'resume').replace(/cv/g, 'resume'),
  }
})

const IN_AGENTS: Agent[] = UK_AGENTS.map(a => {
  if (a.slug === 'cv-agent') {
    return {
      ...a,
      name: 'Resume Agent',
      oneLiner: 'Scores and rewrites your resume for any role',
      whatYouGet: [
        'ATS score with keyword gap analysis in <10 seconds',
        'Full resume rewrite targeting 90+ ATS score',
        'Tailored cover letters and recruiter messages',
      ],
    }
  }
  if (a.slug === 'job-matches') {
    return {
      ...a,
      oneLiner: 'Live job feed from 50+ India job sites',
      whatYouGet: [
        'Naukri, Indeed, LinkedIn, Foundit — all in one feed',
        'Match score for every role based on your profile',
        'Bulk-tailor your resume for up to 5 roles at once',
      ],
    }
  }
  return a
})

const IN_FAQS: HowItWorksFaq[] = UK_FAQS.map(f => ({
  q: f.q.replace(/CV/g, 'resume'),
  a: f.a.replace(/CV/g, 'resume').replace(/£9\.99/g, '₹500').replace(/£29\.99/g, '₹1,000').replace(/UK/g, 'India'),
}))

export const HOW_IT_WORKS_IN: HowItWorksCopy = {
  locale: 'in',
  cvTerm: 'resume',
  cvTermLower: 'resume',
  metaTitle: 'How JobAgent247 Works: From Resume to Job Offer (India Guide 2026)',
  metaDescription: 'See exactly how JobAgent247 helps you score 90+ on ATS, find India jobs from 50+ sites including Naukri, generate tailored cover letters, and land interviews.',
  canonical: 'https://jobagent247.co/in/how-it-works',
  heroTitle: 'From resume to job offer —',
  heroTitleAccent: 'how JobAgent247 works',
  heroSubtitle: 'Ten AI agents, one workspace, one connected workflow. Here\'s exactly what happens from the moment you sign up to the moment you land an offer.',
  stages: IN_STAGES,
  agents: IN_AGENTS,
  timelineHeading: 'Realistic timeline',
  timelineBody: 'JobAgent247 compresses what normally takes weeks into hours. Here\'s what a typical user\'s timeline looks like:',
  timelineBullets: [
    { label: '0–10 min', value: 'Sign up, complete onboarding, upload your resume' },
    { label: '10–25 min', value: 'Score your resume against your first job, generate a tailored version and cover letter' },
    { label: 'Day 1–7', value: 'Apply to 10–20 tailored roles, track everything in the pipeline' },
    { label: 'Week 2–4', value: 'First interviews booked — use Interview Prep for each' },
  ],
  faqs: IN_FAQS,
}
