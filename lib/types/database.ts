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
  stripe_customer_id: string | null
  paddle_customer_id: string | null
  locale: 'uk' | 'in'
  usage_counts: Record<string, number>
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
  apify_run_id: string | null
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
  category: 'Technical' | 'Behavioural' | 'SRE' | 'Leadership' | 'Cloud' | 'Situational' | 'Scenario' | 'Culture'
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

export interface InterviewKitResult {
  summary: string
  likelyInterviewStages: string[]
  questions: InterviewQuestion[]
  candidateRiskAreas: string[]
  revisionTopics: string[]
  questionsToAskEmployer: string[]
  finalChecklist: string[]
}

export interface InterviewKit {
  id: string
  user_id: string
  company_name: string | null
  job_description: string
  target_role: string
  interview_type: string
  geography: string
  summary: string | null
  likely_interview_stages: string[]
  questions: InterviewQuestion[]
  candidate_risk_areas: string[]
  revision_topics: string[]
  questions_to_ask_employer: string[]
  final_checklist: string[]
  raw_ai_output: InterviewKitResult | null
  created_at: string
}

export interface MockInterviewResponse {
  question_id: string
  question: string
  category: string
  answer: string
  score: number
  strengths: string[]
  weaknesses: string[]
  feedback: string
  improved_answer_structure: string
  created_at: string
}

export interface MockInterviewSession {
  id: string
  user_id: string
  interview_kit_id: string
  status: 'active' | 'completed'
  current_question_index: number
  responses: MockInterviewResponse[]
  overall_score: number | null
  feedback_summary: string | null
  created_at: string
  completed_at: string | null
}

export interface MockEvalResult {
  score: number
  strengths: string[]
  weaknesses: string[]
  feedback: string
  improvedAnswerStructure: string
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

export interface ScoreBreakdown {
  technicalSkillsMatch: number
  experienceSeniorityMatch: number
  evidenceStrength: number
  domainIndustryMatch: number
  locationRemoteCompatibility: number
  salaryCompatibility: number
  visaWorkAuthorizationCompatibility: number
  roleTrajectoryFit: number
}

export type MatchCategory = 'Strong Match' | 'Stretch Match' | 'Low Probability Match'
export type UserFeedback = 'accurate' | 'too_high' | 'too_low' | 'not_relevant'
export type ApplicationOutcome = 'not_applied' | 'applied' | 'interview' | 'rejected' | 'offer' | 'no_response'

export interface JobFitResult {
  fitScore: number
  matchCategory: MatchCategory
  scoreBreakdown: ScoreBreakdown
  strengths: string[]
  risks: string[]
  missingSkills: string[]
  evidenceGaps: string[]
  locationNotes: string
  salaryNotes: string
  visaNotes: string
  recommendedNextAction: string
  applicationStrategy: string
  summary: string
}

export interface SavedJob {
  id: string
  user_id: string
  job_title: string
  company_name: string | null
  job_url: string | null
  job_description: string
  location: string | null
  salary_range: string | null
  work_mode: string | null
  employment_type: string | null
  source: string | null
  created_at: string
  updated_at: string
}

export interface JobFitAnalysis {
  id: string
  user_id: string
  saved_job_id: string
  fit_score: number
  match_category: MatchCategory
  score_breakdown: ScoreBreakdown
  strengths: string[]
  risks: string[]
  missing_skills: string[]
  evidence_gaps: string[]
  location_notes: string | null
  salary_notes: string | null
  visa_notes: string | null
  recommended_next_action: string | null
  application_strategy: string | null
  summary: string | null
  raw_ai_output: JobFitResult | null
  created_at: string
}

export interface JobFitFeedback {
  id: string
  user_id: string
  job_fit_analysis_id: string
  user_feedback: UserFeedback | null
  application_outcome: ApplicationOutcome | null
  notes: string | null
  created_at: string
}

export interface JobFitAnalysisWithJob extends JobFitAnalysis {
  saved_job: SavedJob
}

export interface ReadinessScoreBreakdown {
  technicalSkills: number
  experienceMatch: number
  evidenceStrength: number
  industryMatch: number
  interviewReadiness: number
  profilePositioning: number
}

export type ReadinessLevel = 'Ready' | 'Partially Ready' | 'Not Yet Ready'

export interface ReadinessResult {
  overallScore: number
  readinessLevel: ReadinessLevel
  scoreBreakdown: ReadinessScoreBreakdown
  criticalGaps: string[]
  importantGaps: string[]
  niceToHaveGaps: string[]
  strengths: string[]
  recommendations: string[]
  evidenceSummary: string | null
  summary: string
}

export interface ReadinessAnalysis {
  id: string
  user_id: string
  target_job_title: string
  target_seniority: string | null
  target_geography: string | null
  linkedin_text: string | null
  portfolio_links: string[]
  overall_score: number
  readiness_level: ReadinessLevel
  score_breakdown: ReadinessScoreBreakdown
  critical_gaps: string[]
  important_gaps: string[]
  nice_to_have_gaps: string[]
  strengths: string[]
  recommendations: string[]
  evidence_summary: string | null
  summary: string | null
  raw_ai_output: ReadinessResult | null
  created_at: string
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
      saved_jobs: TableDef<SavedJob, Omit<SavedJob, 'id' | 'created_at' | 'updated_at'>, Partial<Omit<SavedJob, 'id'>>>
      job_fit_analyses: TableDef<JobFitAnalysis, Omit<JobFitAnalysis, 'id' | 'created_at'>, Partial<Omit<JobFitAnalysis, 'id'>>>
      job_fit_feedback: TableDef<JobFitFeedback, Omit<JobFitFeedback, 'id' | 'created_at'>, Partial<Omit<JobFitFeedback, 'id'>>>
      readiness_analyses: TableDef<ReadinessAnalysis, Omit<ReadinessAnalysis, 'id' | 'created_at'>, Partial<Omit<ReadinessAnalysis, 'id'>>>
      interview_kits: TableDef<InterviewKit, Omit<InterviewKit, 'id' | 'created_at'>, Partial<Omit<InterviewKit, 'id'>>>
      mock_interview_sessions: TableDef<MockInterviewSession, Omit<MockInterviewSession, 'id' | 'created_at' | 'completed_at'>, Partial<Omit<MockInterviewSession, 'id'>>>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
