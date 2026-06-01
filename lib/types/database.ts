export type JobType = 'contract' | 'permanent' | 'remote' | 'freelance'
export type ApplicationStatus = 'saved' | 'applied' | 'interviewing' | 'offered' | 'rejected'
export type DocumentType = 'tailored_cv' | 'cover_letter' | 'recruiter_msg'
export type ScrapeJobStatus = 'queued' | 'running' | 'done' | 'failed'

export interface User {
  id: string           // = auth.uid() from Supabase Auth
  name: string | null
  email: string | null
  location: string | null
  current_role: string | null
  target_roles: string[] | null
  visa_required: boolean
  job_type_pref: string | null
  location_pref: string | null
  priority: string | null
  keywords: string[] | null
  onboarding_complete: boolean
  plan: 'free' | 'pro' | 'accelerator'
  created_at: string
}

export interface CV {
  id: string
  user_id: string
  file_name: string | null
  file_url: string | null
  raw_text: string | null
  ats_score: number | null
  version_label: string | null
  is_primary: boolean
  created_at: string
}

export interface Job {
  id: string
  title: string
  company: string | null
  location: string | null
  type: JobType | null
  salary_min: number | null
  salary_max: number | null
  currency: string
  description: string | null
  responsibilities: string | null
  requirements: string | null
  url: string | null
  source_site: string | null
  posted_date: string | null
  visa_sponsorship: boolean
  category: string | null
  scraped_at: string
  expires_at: string | null
}

export interface UserJob {
  id: string
  user_id: string
  job_id: string
  match_score: number | null
  status: ApplicationStatus
  notes: string | null
  applied_at: string | null
  follow_up_date: string | null
  created_at: string
}

export interface UserJobWithJob extends UserJob {
  job: Job
}

export interface Document {
  id: string
  user_id: string
  job_id: string | null
  type: DocumentType
  content: string | null
  file_url: string | null
  ats_score: number | null
  created_at: string
}

export interface InterviewQuestion {
  id: string
  question: string
  category: 'Technical' | 'Behavioural' | 'SRE' | 'Leadership' | 'Cloud' | 'Situational'
  difficulty: 'easy' | 'medium' | 'hard'
  starFramework: {
    situation: string
    task: string
    action: string
    result: string
  }
  keywordsToUse: string[]
}

export interface InterviewSession {
  id: string
  user_id: string
  job_id: string | null
  questions: InterviewQuestion[]
  created_at: string
}

export interface ScrapeJob {
  id: string
  user_id: string
  search_criteria: {
    keywords: string[]
    location: string
    type: JobType | ''
    visa_required: boolean
    sites: string[]
  }
  status: ScrapeJobStatus
  sites: string[] | null
  results_count: number | null
  error: string | null
  created_at: string
  completed_at: string | null
}

export interface BulletImprovement {
  original: string
  improved: string
  reason: string
}

export interface CVAnalysisResult {
  score: number
  missingKeywords: string[]
  improvedBullets: BulletImprovement[]
  summary: string
}

export interface MatchResult {
  score: number
  strengths: string[]
  gaps: string[]
  suggestedChanges: string[]
  verdict: string
}

type TableDef<Row, Insert, Update> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: never[]
}

// Supabase database type map (for createClient<Database> generic)
export interface Database {
  public: {
    Tables: {
      users: TableDef<User, Omit<User, 'created_at'>, Partial<Omit<User, 'id'>>>
      cvs: TableDef<CV, Omit<CV, 'id' | 'created_at'>, Partial<Omit<CV, 'id'>>>
      jobs: TableDef<Job, Omit<Job, 'id' | 'scraped_at'>, Partial<Omit<Job, 'id'>>>
      user_jobs: TableDef<UserJob, Omit<UserJob, 'id' | 'created_at'>, Partial<Omit<UserJob, 'id'>>>
      documents: TableDef<Document, Omit<Document, 'id' | 'created_at'>, Partial<Omit<Document, 'id'>>>
      interview_sessions: TableDef<InterviewSession, Omit<InterviewSession, 'id' | 'created_at'>, Partial<Omit<InterviewSession, 'id'>>>
      scrape_jobs: TableDef<ScrapeJob, Omit<ScrapeJob, 'id' | 'created_at'>, Partial<Omit<ScrapeJob, 'id'>>>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
