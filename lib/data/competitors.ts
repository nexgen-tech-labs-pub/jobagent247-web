export interface Competitor {
  slug: string
  name: string
  tagline: string
  description: string
  founded: string
  pricing: {
    free: string | null
    paid: string
    notes?: string
  }
  strengths: string[]
  weaknesses: string[]
  features: {
    label: string
    them: boolean | 'partial'
    us: boolean | 'partial'
  }[]
  bestFor: string
  verdict: string
  rating: { overall: number; atsAccuracy: number; valueForMoney: number; ukFocus: number }
}

export const COMPETITORS: Competitor[] = [
  {
    slug: 'jobscan',
    name: 'Jobscan',
    tagline: 'ATS optimisation only — no writing help, no job matching',
    description: 'Jobscan is a dedicated ATS scanning tool that compares your CV against job descriptions and returns a match score. It does one thing reasonably well, but it stops there. It does not write, rewrite, or generate content.',
    founded: '2014',
    pricing: {
      free: '5 scans/month',
      paid: '$49.95/month (no annual discount)',
      notes: 'No UK pricing — charged in USD. No free trial for premium.',
    },
    strengths: [
      'ATS matching algorithm is well-established',
      'Good keyword gap report',
      'LinkedIn profile optimisation included',
    ],
    weaknesses: [
      'Does not rewrite your CV — just tells you what to fix',
      'No cover letter generator',
      'No job search or job matching features',
      'No interview preparation',
      'USD pricing with no UK localisation',
      'Premium tier is expensive at $49.95/month',
    ],
    features: [
      { label: 'ATS score checker', them: true, us: true },
      { label: 'CV rewriting (AI-generated)', them: false, us: true },
      { label: 'Cover letter generator', them: false, us: true },
      { label: 'Job search & matching', them: false, us: true },
      { label: 'Interview preparation', them: false, us: true },
      { label: 'Application tracker', them: 'partial', us: true },
      { label: 'UK job sites (Reed, CV-Library)', them: false, us: true },
      { label: 'Free tier available', them: true, us: true },
    ],
    bestFor: 'Users who already have a strong CV and just want to run a quick ATS scan before applying to a specific role.',
    verdict: 'Jobscan is a useful but limited tool. If you want to know your ATS score, it works — but it will not help you fix it, find jobs, write applications, or prepare for interviews. JobAgent247 does all of that in one place, at a lower monthly price, with UK job sites built in.',
    rating: { overall: 7, atsAccuracy: 8, valueForMoney: 5, ukFocus: 4 },
  },
  {
    slug: 'rezi',
    name: 'Rezi',
    tagline: 'AI resume builder — good formatting, limited UK relevance',
    description: 'Rezi is an AI resume builder focused on ATS-friendly formatting and content generation. It launched in 2015 and has built a large US user base. It offers strong resume templates and AI writing suggestions but has limited UK market focus.',
    founded: '2015',
    pricing: {
      free: 'Limited free tier (watermark on exports)',
      paid: '$29/month or $129/year',
      notes: 'Pricing in USD. UK users pay ~£23/month at current rates. Annual plan good value.',
    },
    strengths: [
      'Strong resume formatting and templates',
      'AI content suggestions for bullet points',
      'Good ATS-friendliness out of the box',
      'Reasonable annual plan pricing',
    ],
    weaknesses: [
      'US-centric — UK CV conventions (no photo, address format, 2-page norm) not well-supported',
      'No live job search or matching',
      'No cover letter generation',
      'No interview preparation tools',
      'No application tracking',
      'Free export has watermark',
    ],
    features: [
      { label: 'ATS score checker', them: true, us: true },
      { label: 'CV rewriting (AI-generated)', them: 'partial', us: true },
      { label: 'Cover letter generator', them: false, us: true },
      { label: 'Job search & matching', them: false, us: true },
      { label: 'Interview preparation', them: false, us: true },
      { label: 'Application tracker', them: false, us: true },
      { label: 'UK job sites (Reed, CV-Library)', them: false, us: true },
      { label: 'UK CV format support', them: false, us: true },
    ],
    bestFor: 'US-based job seekers who need a well-formatted resume with ATS-friendly layout and basic AI writing assistance.',
    verdict: 'Rezi is a solid US resume builder but is not built for UK job seekers. The conventions differ (CV vs resume, A4 format, UK job board integrations) and Rezi does not address them. If you are applying for UK jobs, JobAgent247 was designed specifically for you — with UK job sites, UK CV formatting, and a full application workflow.',
    rating: { overall: 7, atsAccuracy: 7, valueForMoney: 6, ukFocus: 3 },
  },
  {
    slug: 'resume-io',
    name: 'Resume.io',
    tagline: 'Template-heavy builder — beautiful designs, weak on AI',
    description: 'Resume.io is a popular online resume builder known for its polished templates and clean UI. It has tens of millions of users globally and is one of the most recognisable names in the space — but it is fundamentally a formatting tool, not an AI assistant.',
    founded: '2017',
    pricing: {
      free: 'Preview only — cannot download without paying',
      paid: '£2.95/week or £19.95/month',
      notes: 'The free tier is effectively a trial — any download requires payment. Weekly plan is misleadingly priced.',
    },
    strengths: [
      'Beautiful, professional templates',
      'Very easy to use UI',
      'Multiple export formats',
      'Large template library',
    ],
    weaknesses: [
      'No AI content generation — you write everything yourself',
      'Cannot download for free (paywall after preview)',
      'No ATS score or job matching',
      'No cover letter AI generation',
      'No interview prep or application tracking',
      'Weekly billing model is confusing',
    ],
    features: [
      { label: 'ATS score checker', them: false, us: true },
      { label: 'CV rewriting (AI-generated)', them: false, us: true },
      { label: 'Cover letter generator', them: 'partial', us: true },
      { label: 'Job search & matching', them: false, us: true },
      { label: 'Interview preparation', them: false, us: true },
      { label: 'Application tracker', them: false, us: true },
      { label: 'Beautiful templates', them: true, us: 'partial' },
      { label: 'Free to export', them: false, us: true },
    ],
    bestFor: 'Job seekers who just need a professionally formatted CV/resume template and are happy to write all content themselves.',
    verdict: 'Resume.io looks great but it is a formatting tool, not an AI job search assistant. You write all the content, there is no ATS feedback, and you cannot even download for free. If you want AI to help you tailor your CV to each job, score it against ATS systems, generate cover letters, and find matching roles, JobAgent247 is built for exactly that workflow.',
    rating: { overall: 6, atsAccuracy: 3, valueForMoney: 5, ukFocus: 6 },
  },
  {
    slug: 'kickresume',
    name: 'Kickresume',
    tagline: 'Templates + basic AI — good starting point, limited depth',
    description: 'Kickresume offers resume and cover letter templates with an AI writing assistant powered by GPT. It is a polished tool with a good free tier, but the AI is general-purpose and the job-matching features are shallow.',
    founded: '2015',
    pricing: {
      free: 'Good free tier — 1 resume, 1 cover letter',
      paid: '$19/month or $96/year',
      notes: 'USD pricing. Reasonable annual plan. Premium unlocks more templates and AI features.',
    },
    strengths: [
      'Solid free tier with real functionality',
      'Good template variety',
      'AI writing assistant available on paid plan',
      'Cover letter builder included',
    ],
    weaknesses: [
      'ATS score checking limited to premium',
      'No live job search integration',
      'AI writing is generic — not tailored to specific job descriptions',
      'No interview preparation',
      'No application tracking',
      'US-centric design and job board integrations',
    ],
    features: [
      { label: 'ATS score checker', them: 'partial', us: true },
      { label: 'CV rewriting (AI-generated)', them: 'partial', us: true },
      { label: 'Cover letter generator', them: true, us: true },
      { label: 'Job search & matching', them: false, us: true },
      { label: 'Interview preparation', them: false, us: true },
      { label: 'Application tracker', them: false, us: true },
      { label: 'UK job sites (Reed, CV-Library)', them: false, us: true },
      { label: 'Job-specific CV tailoring', them: false, us: true },
    ],
    bestFor: 'Job seekers who want a good-looking resume with basic AI writing suggestions and a solid free tier.',
    verdict: 'Kickresume is one of the better template-based builders, with a decent free tier and AI writing assistance. But the AI is not connected to the job you are applying for — it cannot tailor your CV to a specific role, score it against that job\'s ATS requirements, or help you prepare for the interview. JobAgent247 does the entire workflow: score, rewrite, match, apply, and prep — all connected to the actual job description.',
    rating: { overall: 7, atsAccuracy: 6, valueForMoney: 7, ukFocus: 4 },
  },
  {
    slug: 'enhancv',
    name: 'Enhancv',
    tagline: 'Design-focused builder — stands out visually, ATS risk',
    description: 'Enhancv is a resume builder that prioritises visual design with personalised sections like "My life philosophy" and "What drives me". It produces eye-catching resumes but the unconventional layouts can cause ATS parsing failures.',
    founded: '2014',
    pricing: {
      free: '1 page resume with watermark',
      paid: '$24.99/month',
    },
    strengths: [
      'Distinctive, visually impressive designs',
      'Personalisation sections for modern companies',
      'Good for creative industries',
      'User-friendly drag-and-drop editor',
    ],
    weaknesses: [
      'Creative layouts can fail ATS parsing — a serious risk in traditional industries',
      'No AI tailoring to specific job descriptions',
      'No ATS score feature',
      'No job search integration',
      'No interview prep',
      'Designs optimised for human reading, not machine parsing',
    ],
    features: [
      { label: 'ATS score checker', them: false, us: true },
      { label: 'CV rewriting (AI-generated)', them: 'partial', us: true },
      { label: 'Cover letter generator', them: true, us: true },
      { label: 'Job search & matching', them: false, us: true },
      { label: 'Interview preparation', them: false, us: true },
      { label: 'ATS-safe formatting', them: false, us: true },
      { label: 'Beautiful visual designs', them: true, us: 'partial' },
    ],
    bestFor: 'Creative professionals at design agencies, startups, or companies where the hiring manager (not an ATS) reviews every application.',
    verdict: 'Enhancv produces beautiful resumes that can make a great impression — if a human sees them. The risk is that ATS systems reject multi-column layouts and graphics before any human reviews your application. For most UK corporate, finance, NHS, tech, or government roles, a clean ATS-compliant CV is essential. JobAgent247 scores your CV against the specific ATS requirements of each role before you apply.',
    rating: { overall: 6, atsAccuracy: 4, valueForMoney: 6, ukFocus: 4 },
  },
  {
    slug: 'teal',
    name: 'Teal',
    tagline: 'Job tracker + resume — US-only job search, no AI depth',
    description: 'Teal is a job search platform with a built-in resume builder and application tracker. It has a strong US community and good free features, but the AI resume assistance is shallow and it has no UK job site integrations.',
    founded: '2020',
    pricing: {
      free: 'Good free tier with tracker and basic resume',
      paid: '$29/month or $9/month annual',
      notes: 'One of the more affordable paid plans. US market focused.',
    },
    strengths: [
      'Good application tracker (free)',
      'Solid resume builder with AI suggestions',
      'Job saving and organisation features',
      'Strong US community',
      'Affordable annual plan',
    ],
    weaknesses: [
      'No UK job site integrations — Reed, CV-Library, Adzuna not supported',
      'AI resume tailoring is shallow compared to Claude-powered tools',
      'No interview preparation features',
      'US-centric job search — limited value for UK job seekers',
    ],
    features: [
      { label: 'ATS score checker', them: true, us: true },
      { label: 'CV rewriting (AI-generated)', them: 'partial', us: true },
      { label: 'Cover letter generator', them: true, us: true },
      { label: 'Job search & matching', them: 'partial', us: true },
      { label: 'Interview preparation', them: false, us: true },
      { label: 'Application tracker', them: true, us: true },
      { label: 'UK job sites (Reed, CV-Library)', them: false, us: true },
    ],
    bestFor: 'US job seekers who want a free, well-organised job search hub with a basic resume builder and application tracker.',
    verdict: 'Teal is a good free tool for US job seekers but has limited relevance for the UK market. If you are applying to UK roles, the lack of Reed, Adzuna, and CV-Library integrations is a significant gap. JobAgent247 is built UK-first — with UK job boards, UK CV conventions, and AI that understands the UK hiring landscape.',
    rating: { overall: 7, atsAccuracy: 6, valueForMoney: 8, ukFocus: 2 },
  },
  {
    slug: 'novoresume',
    name: 'Novoresume',
    tagline: 'Clean templates, no AI tailoring',
    description: 'Novoresume is a template-first resume builder that produces clean, professional CVs with guidance on content. It lacks AI generation and has no job search, tracking, or interview features.',
    founded: '2014',
    pricing: {
      free: 'One page template, limited features',
      paid: '$16/month or $9.99/month annual',
    },
    strengths: [
      'Clean, professional templates',
      'Guided content sections with examples',
      'Affordable pricing',
      'Good for first-time CV writers',
    ],
    weaknesses: [
      'No AI content generation',
      'No ATS score checking',
      'No job search or matching',
      'No cover letter AI',
      'No application tracking or interview prep',
    ],
    features: [
      { label: 'ATS score checker', them: false, us: true },
      { label: 'CV rewriting (AI-generated)', them: false, us: true },
      { label: 'Cover letter generator', them: false, us: true },
      { label: 'Job search & matching', them: false, us: true },
      { label: 'Interview preparation', them: false, us: true },
      { label: 'Application tracker', them: false, us: true },
      { label: 'Clean templates', them: true, us: 'partial' },
    ],
    bestFor: 'Students and early-career job seekers who need a clean template with structured guidance to write their first CV.',
    verdict: 'Novoresume is a beginner-friendly template tool. It is straightforward and affordable, but it is entirely passive — you do all the work. There is no AI to help you optimise for each role, no ATS scoring, and no job search. For anyone who wants active AI assistance throughout their job search, JobAgent247 offers a complete platform.',
    rating: { overall: 6, atsAccuracy: 3, valueForMoney: 7, ukFocus: 5 },
  },
  {
    slug: 'chatgpt',
    name: 'ChatGPT',
    tagline: 'General AI — powerful but requires expert prompting',
    description: 'Many job seekers use ChatGPT to improve their CVs and write cover letters. It is powerful but requires you to know what to ask, provides no ATS scoring, has no job search functionality, and produces output that hiring managers increasingly recognise.',
    founded: '2022',
    pricing: {
      free: 'GPT-4o available free (limited)',
      paid: '$20/month for ChatGPT Plus',
    },
    strengths: [
      'Extremely versatile — can help with any writing task',
      'Free tier is generous',
      'Large context window for long CVs',
      'Good for brainstorming and first drafts',
    ],
    weaknesses: [
      'No ATS score or job-specific keyword analysis',
      'Requires expert prompting to get good results',
      'Output is often recognisable as AI-written — detectable by recruiters',
      'No job search, matching, or tracking',
      'No interview prep structured for specific roles',
      'No UK job board integration',
      'You must start from scratch every session — no profile or CV memory',
    ],
    features: [
      { label: 'ATS score checker', them: false, us: true },
      { label: 'CV rewriting (role-specific)', them: false, us: true },
      { label: 'Cover letter generator', them: 'partial', us: true },
      { label: 'Job search & matching', them: false, us: true },
      { label: 'Interview preparation', them: 'partial', us: true },
      { label: 'Application tracker', them: false, us: true },
      { label: 'Remembers your profile', them: false, us: true },
      { label: 'UK job sites integration', them: false, us: true },
    ],
    bestFor: 'Experienced writers who know how to prompt AI effectively and want a general writing assistant for ad hoc tasks.',
    verdict: 'ChatGPT is a remarkable general AI but it is not a job search tool. It does not know what ATS systems are screening for, cannot search live jobs, does not remember your profile across sessions, and produces output that increasingly gets flagged. JobAgent247 uses Claude (built by Anthropic) as its AI engine, but wraps it in a structured workflow designed specifically for job searching — with ATS scoring, profile memory, job matching, and application tracking built in.',
    rating: { overall: 5, atsAccuracy: 2, valueForMoney: 9, ukFocus: 3 },
  },
]

export function getCompetitorBySlug(slug: string): Competitor | undefined {
  return COMPETITORS.find(c => c.slug === slug)
}
