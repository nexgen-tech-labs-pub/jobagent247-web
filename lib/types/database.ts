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
  locale: 'uk' | 'in'
  usage_counts: Record<string, number>
  credits_balance: number
  founding_member: boolean
  trial_ends_at: string | null
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
export interface CreditTransaction {
  id: string
  user_id: string
  delta: number
  feature: string | null
  description: string
  created_at: string
}

export interface ProfileSkills {
  topSkills: string[]
  experienceLevel: 'junior' | 'mid' | 'senior' | 'staff' | 'principal'
  preferredDomains: string[]
  yearsExperience: number | null
  extractedAt: string
}

export interface GrowthMilestone {
  title: string
  description: string
  actions: string[]
  skills: string[]
  evidenceToCreate: string[]
}

export interface GrowthPlan {
  targetRole: string
  currentReadinessScore: number | null
  summary: string
  quickWins: string[]
  keyRisks: string[]
  day30: GrowthMilestone
  day60: GrowthMilestone
  day90: GrowthMilestone
}

export interface ApplicationInsights {
  totalApplications: number
  outcomeBreakdown: Record<ApplicationStatus, number>
  responseRate: number
  avgMatchScoreByOutcome: Partial<Record<ApplicationStatus, number>>
  topMissingSkills: string[]
  rejectionPatterns: string[]
  strongPerformingAreas: string[]
  recommendations: string[]
  summary: string
}

// ─── Evidence Builder ──────────────────────────────────────────────────────────

export type EvidenceAssetType =
  | 'portfolio_project'
  | 'star_story'
  | 'cv_bullets'
  | 'linkedin_bullets'
  | 'interview_pack'
  | 'full_bundle'

export interface EvidenceGap {
  skillOrTheme: string
  gapType: 'critical' | 'important' | 'nice_to_have'
  description: string
  currentEvidenceSummary: string
  recommendedEvidenceStrategy: string
}

export interface EvidencePortfolioProject {
  projectTitle: string
  targetSkillGapsAddressed: string[]
  targetRoleRelevance: string
  problemStatement: string
  businessScenario: string
  technicalScope: string
  tools: string[]
  architectureOverview: string
  implementationSteps: string[]
  deliverables: string[]
  estimatedEffort: string
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced'
  readmeOutline: string[]
  cvBullets: string[]
  interviewTalkingPoints: string[]
}

export interface EvidenceStarStory {
  title: string
  situation: string
  task: string
  action: string
  result: string
  metrics: string
  skillsDemonstrated: string[]
  applicableInterviewQuestions: string[]
  confidenceLevel: 'high' | 'medium' | 'low'
  missingDetails: string[]
}

export interface EvidenceInterviewPack {
  sixtySecondPitch: string
  threeMinuteExplanation: string
  technicalDeepDivePoints: string[]
  businessImpactPoints: string[]
  tradeOffDiscussionPoints: string[]
  commonFollowUpQuestions: string[]
}

export interface EvidenceBundle {
  evidenceGapSummary: string
  detectedEvidenceGaps: EvidenceGap[]
  portfolioProjects: EvidencePortfolioProject[]
  starStories: EvidenceStarStory[]
  cvBullets: string[]
  linkedinBullets: string[]
  interviewEvidencePack: EvidenceInterviewPack
  completionChecklist: string[]
}

export interface SavedEvidenceAsset {
  id: string
  user_id: string
  asset_type: EvidenceAssetType
  title: string
  target_role: string
  skill_or_gap: string | null
  content: EvidenceBundle
  created_at: string
}

// ─── Email Follow-Ups ──────────────────────────────────────────────────────────

export type EmailProvider = 'gmail' | 'microsoft'

export type EmailConnectionStatus =
  | 'pending'
  | 'active'
  | 'paused'
  | 'reconnect_required'
  | 'failed'
  | 'disconnected'

export type EmailClassification =
  | 'application_acknowledgement'
  | 'recruiter_outreach'
  | 'request_for_information'
  | 'interview_invitation'
  | 'interview_scheduling'
  | 'interview_confirmation'
  | 'interview_feedback'
  | 'rejection'
  | 'offer'
  | 'background_check'
  | 'follow_up_response'
  | 'job_alert'
  | 'unrelated'

export type FollowUpUrgency = 'urgent' | 'high' | 'normal' | 'low'
export type FollowUpStatus = 'pending' | 'draft_ready' | 'snoozed' | 'dismissed' | 'sent' | 'no_longer_needed'
export type FollowUpDraftSendStatus = 'not_sent' | 'copied' | 'sent'

export interface ConnectedEmailAccount {
  id: string
  user_id: string
  provider: EmailProvider
  email_address: string
  provider_account_id: string
  required_container_name: string
  connection_status: EmailConnectionStatus
  last_sync_attempt_at: string | null
  last_successful_sync_at: string | null
  next_scheduled_sync_at: string | null
  sync_cursor: string | null
  initial_sync_completed: boolean
  created_at: string
  updated_at: string
}

export interface SyncedEmailMessage {
  id: string
  user_id: string
  connected_email_account_id: string
  provider_message_id: string
  provider_thread_id: string
  sender: string
  subject: string
  received_at: string
  body_text: string
  snippet: string
  classification: EmailClassification | null
  classification_confidence: 'high' | 'medium' | 'low' | null
  action_required: boolean
  linked_application_id: string | null
  created_at: string
}

export interface FollowUpRecommendation {
  id: string
  user_id: string
  application_id: string | null
  connected_email_account_id: string
  provider_thread_id: string
  source_message_id: string
  recommendation_type: string
  reason: string
  urgency: FollowUpUrgency
  confidence: 'high' | 'medium' | 'low'
  recommended_send_at: string | null
  status: FollowUpStatus
  created_at: string
  updated_at: string
}

export interface FollowUpDraft {
  id: string
  user_id: string
  follow_up_recommendation_id: string
  subject: string
  body: string
  placeholders: string[]
  generation_context: string
  version: number
  edited_by_user: boolean
  send_status: FollowUpDraftSendStatus
  created_at: string
  updated_at: string
}

export interface EmailSyncRun {
  id: string
  user_id: string
  connected_email_account_id: string | null
  trigger_type: 'scheduled' | 'manual' | 'initial'
  status: 'queued' | 'running' | 'completed' | 'partial' | 'failed'
  started_at: string
  completed_at: string | null
  messages_scanned: number
  messages_created: number
  recommendations_created: number
  error_summary: string | null
  created_at: string
}

// AI output shapes
export interface EmailClassificationResult {
  classification: EmailClassification
  confidence: 'high' | 'medium' | 'low'
  isJobRelated: boolean
  actionRequired: boolean
  suggestedCompany: string | null
  suggestedJobTitle: string | null
  applicationMatchConfidence: 'high' | 'medium' | 'low' | null
  followUpRecommended: boolean
  followUpType: string | null
  followUpUrgency: FollowUpUrgency | null
  followUpReason: string | null
}

export interface FollowUpDraftResult {
  subject: string
  body: string
  draftType: string
  placeholders: string[]
  warnings: string[]
  confidence: 'high' | 'medium' | 'low'
  rationale: string
}

export interface Database {
  public: {
    Tables: {
      users: TableDef<User, Omit<User, 'created_at'>, Partial<Omit<User, 'id'>>>
      credit_transactions: TableDef<CreditTransaction, Omit<CreditTransaction, 'id' | 'created_at'>, never>
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
      evidence_assets: TableDef<
        SavedEvidenceAsset,
        Omit<SavedEvidenceAsset, 'id' | 'created_at'>,
        Partial<Omit<SavedEvidenceAsset, 'id'>>
      >
      connected_email_accounts: TableDef<
        ConnectedEmailAccount,
        Omit<ConnectedEmailAccount, 'id' | 'created_at' | 'updated_at'>,
        Partial<Omit<ConnectedEmailAccount, 'id'>>
      >
      synced_email_messages: TableDef<
        SyncedEmailMessage,
        Omit<SyncedEmailMessage, 'id' | 'created_at'>,
        Partial<Omit<SyncedEmailMessage, 'id'>>
      >
      follow_up_recommendations: TableDef<
        FollowUpRecommendation,
        Omit<FollowUpRecommendation, 'id' | 'created_at' | 'updated_at'>,
        Partial<Omit<FollowUpRecommendation, 'id'>>
      >
      follow_up_drafts: TableDef<
        FollowUpDraft,
        Omit<FollowUpDraft, 'id' | 'created_at' | 'updated_at'>,
        Partial<Omit<FollowUpDraft, 'id'>>
      >
      email_sync_runs: TableDef<
        EmailSyncRun,
        Omit<EmailSyncRun, 'id' | 'created_at'>,
        never
      >
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
