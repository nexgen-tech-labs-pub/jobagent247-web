export interface CvRole {
  slug: string
  title: string
  titleShort: string
  category: string
  atsKeywords: string[]
  commonMistakes: string[]
  exampleBullets: string[]
  avgSalaryUK: string
  avgSalaryIN: string
  topCompaniesUK: string[]
  demandTrend: 'rising' | 'stable' | 'competitive'
  relatedRoles: string[]
}

export const CV_ROLES: CvRole[] = [
  // ── Tech ──────────────────────────────────────────────────────────────────
  {
    slug: 'software-engineer',
    title: 'Software Engineer',
    titleShort: 'Software Engineer',
    category: 'Technology',
    atsKeywords: ['TypeScript', 'React', 'Node.js', 'CI/CD', 'REST APIs', 'AWS', 'Git', 'Agile', 'microservices', 'Docker'],
    commonMistakes: [
      'Listing technologies without showing impact (e.g. "used React" vs "built React dashboard serving 50k users")',
      'No metrics on delivery — employers want to see scale, speed, or cost impact',
      'Generic skills section with every language you once touched',
    ],
    exampleBullets: [
      'Reduced API response time by 40% by migrating to Redis caching, improving P95 latency from 800ms to 480ms',
      'Led migration of monolith to microservices on AWS ECS, cutting deployment cycle from 2 weeks to 1 day',
    ],
    avgSalaryUK: '£55,000–£95,000',
    avgSalaryIN: '₹12–35 LPA',
    topCompaniesUK: ['Google', 'Meta', 'Wise', 'Monzo', 'Revolut', 'Deliveroo', 'Amazon'],
    demandTrend: 'rising',
    relatedRoles: ['senior-software-engineer', 'frontend-developer', 'backend-developer', 'full-stack-developer'],
  },
  {
    slug: 'senior-software-engineer',
    title: 'Senior Software Engineer',
    titleShort: 'Senior SWE',
    category: 'Technology',
    atsKeywords: ['system design', 'architecture', 'TypeScript', 'Python', 'AWS', 'team lead', 'mentoring', 'scalability', 'distributed systems', 'Kubernetes'],
    commonMistakes: [
      'CV reads the same as a mid-level engineer — no leadership, ownership, or architectural decisions',
      'No evidence of mentoring junior engineers or driving technical strategy',
      'Missing cross-team impact — senior roles require influencing beyond your squad',
    ],
    exampleBullets: [
      'Designed and delivered zero-downtime migration to multi-region PostgreSQL cluster, serving 2M+ daily active users',
      'Mentored 4 mid-level engineers through bi-weekly code reviews, reducing production incidents by 30%',
    ],
    avgSalaryUK: '£80,000–£130,000',
    avgSalaryIN: '₹25–60 LPA',
    topCompaniesUK: ['Palantir', 'Stripe', 'Wayve', 'DeepMind', 'Checkout.com', 'Starling Bank'],
    demandTrend: 'rising',
    relatedRoles: ['software-engineer', 'engineering-manager', 'staff-engineer', 'principal-engineer'],
  },
  {
    slug: 'frontend-developer',
    title: 'Frontend Developer',
    titleShort: 'Frontend Dev',
    category: 'Technology',
    atsKeywords: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Web performance', 'Core Web Vitals', 'accessibility', 'Jest', 'Figma', 'GraphQL'],
    commonMistakes: [
      'No mention of performance metrics — "improved LCP by X ms" is far stronger than "optimised frontend"',
      'Portfolio link buried or missing — frontend roles expect to see your work',
      'Listing CSS frameworks without showing UI/UX sensibility',
    ],
    exampleBullets: [
      'Rebuilt checkout flow in Next.js, improving Core Web Vitals score from 54 to 92 and lifting conversion by 12%',
      'Implemented design system with 40+ accessible components used across 6 product teams',
    ],
    avgSalaryUK: '£45,000–£80,000',
    avgSalaryIN: '₹8–25 LPA',
    topCompaniesUK: ['Shopify', 'Figma', 'Canva', 'GoCardless', 'Skyscanner', 'ASOS'],
    demandTrend: 'stable',
    relatedRoles: ['software-engineer', 'full-stack-developer', 'ui-designer', 'react-developer'],
  },
  {
    slug: 'backend-developer',
    title: 'Backend Developer',
    titleShort: 'Backend Dev',
    category: 'Technology',
    atsKeywords: ['Python', 'Node.js', 'Java', 'PostgreSQL', 'REST API', 'gRPC', 'AWS', 'Redis', 'Docker', 'Kafka', 'microservices'],
    commonMistakes: [
      'No mention of throughput, latency, or scale handled',
      'API design experience not highlighted — backend roles care about contracts and versioning',
      'Missing database optimisation — indexing, query tuning, and schema design are expected',
    ],
    exampleBullets: [
      'Built event-driven payment processing pipeline on Kafka handling 50,000 transactions/minute with <10ms latency',
      'Optimised PostgreSQL query performance cutting report generation from 45s to 2s via composite indexes',
    ],
    avgSalaryUK: '£45,000–£85,000',
    avgSalaryIN: '₹8–28 LPA',
    topCompaniesUK: ['Monzo', 'OakNorth', 'Funding Circle', 'WorldFirst', 'Paysafe'],
    demandTrend: 'stable',
    relatedRoles: ['software-engineer', 'full-stack-developer', 'data-engineer', 'devops-engineer'],
  },
  {
    slug: 'full-stack-developer',
    title: 'Full Stack Developer',
    titleShort: 'Full Stack Dev',
    category: 'Technology',
    atsKeywords: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS', 'Next.js', 'REST API', 'Docker', 'CI/CD', 'Git'],
    commonMistakes: [
      'Trying to list every technology instead of showcasing depth in core stack',
      'No full-feature ownership story — show a product you built end-to-end',
      'Missing deployment and infrastructure experience for senior full-stack roles',
    ],
    exampleBullets: [
      'Built and shipped B2B SaaS product from scratch using Next.js + Postgres, scaling to 500 paying customers',
      'Owned frontend and API layers for real-time collaboration feature, reducing support tickets by 25%',
    ],
    avgSalaryUK: '£45,000–£85,000',
    avgSalaryIN: '₹8–26 LPA',
    topCompaniesUK: ['startups', 'agencies', 'Babylon Health', 'Causal', 'Linear'],
    demandTrend: 'stable',
    relatedRoles: ['frontend-developer', 'backend-developer', 'software-engineer'],
  },
  {
    slug: 'data-scientist',
    title: 'Data Scientist',
    titleShort: 'Data Scientist',
    category: 'Data & AI',
    atsKeywords: ['Python', 'machine learning', 'SQL', 'scikit-learn', 'PyTorch', 'TensorFlow', 'A/B testing', 'statistics', 'data analysis', 'Jupyter'],
    commonMistakes: [
      'Listing academic projects without business impact — employers want to see ML in production',
      'No mention of A/B testing methodology or experiment design',
      'Kaggle competition scores are weak signals — deploy a model that moved a real metric',
    ],
    exampleBullets: [
      'Built churn prediction model (XGBoost) deployed to production, reducing monthly churn by 1.8% — saving £400k/year',
      'Designed A/B testing framework used by 5 product teams, cutting experiment time from 6 weeks to 2',
    ],
    avgSalaryUK: '£55,000–£95,000',
    avgSalaryIN: '₹12–35 LPA',
    topCompaniesUK: ['DeepMind', 'Meta', 'Ocado Technology', 'Babylon Health', 'Onfido'],
    demandTrend: 'rising',
    relatedRoles: ['machine-learning-engineer', 'data-analyst', 'data-engineer', 'ai-engineer'],
  },
  {
    slug: 'data-analyst',
    title: 'Data Analyst',
    titleShort: 'Data Analyst',
    category: 'Data & AI',
    atsKeywords: ['SQL', 'Python', 'Tableau', 'Power BI', 'Excel', 'data visualisation', 'stakeholder management', 'dbt', 'Google Analytics', 'A/B testing'],
    commonMistakes: [
      'No mention of decision impact — "I built dashboards" vs "my dashboard reduced CAC by 18%"',
      'Missing SQL complexity — show JOINs, CTEs, window functions, not just SELECTs',
      'No stakeholder communication skills mentioned — analysts must translate data for non-technical audiences',
    ],
    exampleBullets: [
      'Built revenue attribution model in dbt + Tableau, enabling marketing team to reallocate £200k budget to highest-ROI channels',
      'Reduced data pipeline refresh time from 4 hours to 20 minutes by refactoring 40+ legacy SQL queries',
    ],
    avgSalaryUK: '£35,000–£60,000',
    avgSalaryIN: '₹6–18 LPA',
    topCompaniesUK: ['Amazon', 'KPMG', 'Deloitte', 'Sky', 'ITV', 'Trainline'],
    demandTrend: 'stable',
    relatedRoles: ['data-scientist', 'business-analyst', 'data-engineer'],
  },
  {
    slug: 'machine-learning-engineer',
    title: 'Machine Learning Engineer',
    titleShort: 'ML Engineer',
    category: 'Data & AI',
    atsKeywords: ['Python', 'PyTorch', 'TensorFlow', 'MLOps', 'Kubeflow', 'model serving', 'feature engineering', 'AWS SageMaker', 'CI/CD for ML', 'LLMs'],
    commonMistakes: [
      'No model serving or production deployment experience mentioned — MLE ≠ Data Scientist',
      'Missing MLOps tooling — monitoring, retraining, drift detection expected at senior level',
      'LLM experience now near-essential — GPT, fine-tuning, RAG patterns should appear',
    ],
    exampleBullets: [
      'Deployed recommendation model via SageMaker serving 1M+ daily predictions with <50ms p99 latency',
      'Built automated model retraining pipeline on Kubeflow triggered by data drift, maintaining 94%+ accuracy',
    ],
    avgSalaryUK: '£70,000–£120,000',
    avgSalaryIN: '₹18–55 LPA',
    topCompaniesUK: ['DeepMind', 'Waymo UK', 'Graphcore', 'Arrival', 'Arm', 'Babylon'],
    demandTrend: 'rising',
    relatedRoles: ['data-scientist', 'ai-engineer', 'software-engineer'],
  },
  {
    slug: 'devops-engineer',
    title: 'DevOps Engineer',
    titleShort: 'DevOps Engineer',
    category: 'Technology',
    atsKeywords: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'CI/CD', 'Jenkins', 'GitHub Actions', 'Ansible', 'monitoring', 'Prometheus', 'Grafana'],
    commonMistakes: [
      'Listing cloud services without showing architectural ownership',
      'No incident response or SLA track record mentioned',
      'Infrastructure cost optimisation is a key value prop — quantify it',
    ],
    exampleBullets: [
      'Migrated 30+ services to Kubernetes on EKS, reducing infrastructure costs by £180k/year with zero downtime',
      'Built GitOps CI/CD pipeline with ArgoCD cutting deployment frequency from weekly to 10+ deploys/day',
    ],
    avgSalaryUK: '£55,000–£95,000',
    avgSalaryIN: '₹10–32 LPA',
    topCompaniesUK: ['HSBC', 'Sky', 'BT Group', 'Lloyds', 'Cazoo', 'Moonpig'],
    demandTrend: 'stable',
    relatedRoles: ['platform-engineer', 'site-reliability-engineer', 'cloud-engineer', 'backend-developer'],
  },
  {
    slug: 'product-manager',
    title: 'Product Manager',
    titleShort: 'Product Manager',
    category: 'Product',
    atsKeywords: ['product strategy', 'roadmap', 'OKRs', 'user research', 'A/B testing', 'stakeholder management', 'agile', 'Jira', 'data analysis', 'go-to-market'],
    commonMistakes: [
      'Writing about features shipped, not problems solved or outcomes achieved',
      'No quantified business impact — revenue, retention, or engagement numbers expected',
      'Missing cross-functional influence — PMs must show they led without authority',
    ],
    exampleBullets: [
      'Led 0-to-1 launch of payments feature generating £2.4M ARR in first 6 months, based on 40+ user interviews',
      'Ran 12 A/B experiments per quarter, driving 22% improvement in onboarding completion rate',
    ],
    avgSalaryUK: '£60,000–£110,000',
    avgSalaryIN: '₹15–45 LPA',
    topCompaniesUK: ['Revolut', 'Wise', 'Deliveroo', 'Moonpig', 'Babylon', 'Checkout.com'],
    demandTrend: 'competitive',
    relatedRoles: ['senior-product-manager', 'technical-product-manager', 'product-designer'],
  },
  {
    slug: 'ux-designer',
    title: 'UX Designer',
    titleShort: 'UX Designer',
    category: 'Design',
    atsKeywords: ['Figma', 'user research', 'wireframing', 'usability testing', 'design systems', 'prototyping', 'accessibility', 'information architecture', 'UX writing', 'cross-functional'],
    commonMistakes: [
      'Portfolio not linked or password-protected — UX CVs without portfolio links are rejected immediately',
      'No mention of research methods used or how insights shaped design decisions',
      'Task-focused rather than outcome-focused — "designed checkout" vs "redesigned checkout, lifting conversion 18%"',
    ],
    exampleBullets: [
      'Redesigned onboarding flow based on 20 user interviews, reducing drop-off by 35% and time-to-value by 40%',
      'Built and maintained design system of 80+ components adopted across 4 product squads in Figma',
    ],
    avgSalaryUK: '£40,000–£75,000',
    avgSalaryIN: '₹8–22 LPA',
    topCompaniesUK: ['Figma', 'IDEO', 'Thoughtworks', 'IBM iX', 'Lloyds Digital', 'Babylon'],
    demandTrend: 'competitive',
    relatedRoles: ['product-designer', 'ui-designer', 'ux-researcher'],
  },
  {
    slug: 'project-manager',
    title: 'Project Manager',
    titleShort: 'Project Manager',
    category: 'Management',
    atsKeywords: ['PMP', 'PRINCE2', 'Agile', 'Scrum', 'stakeholder management', 'risk management', 'budget management', 'MS Project', 'Jira', 'change management'],
    commonMistakes: [
      'No budget ownership or scale mentioned — "managed project" vs "delivered £3M programme on time and budget"',
      'Missing risk and issue management evidence',
      'Methodology certifications not highlighted — PMP and PRINCE2 are ATS filters for many roles',
    ],
    exampleBullets: [
      'Delivered £4.2M digital transformation programme across 6 departments, on time and 8% under budget',
      'Managed portfolio of 12 concurrent projects using Jira, maintaining 94% on-time delivery over 18 months',
    ],
    avgSalaryUK: '£45,000–£80,000',
    avgSalaryIN: '₹8–25 LPA',
    topCompaniesUK: ['Accenture', 'Capgemini', 'PwC', 'HSBC', 'BT Group', 'NHS Digital'],
    demandTrend: 'stable',
    relatedRoles: ['programme-manager', 'scrum-master', 'delivery-manager', 'business-analyst'],
  },
  {
    slug: 'business-analyst',
    title: 'Business Analyst',
    titleShort: 'Business Analyst',
    category: 'Management',
    atsKeywords: ['requirements gathering', 'stakeholder management', 'process mapping', 'SQL', 'Visio', 'Jira', 'BPMN', 'user stories', 'gap analysis', 'Agile'],
    commonMistakes: [
      'CVs full of activities rather than outcomes — "gathered requirements" vs "defined requirements for £1M system saving 3,000 hours/year"',
      'No quantified process improvement results',
      'Missing both business and technical communication skills — BAs sit between both worlds',
    ],
    exampleBullets: [
      'Mapped and redesigned supplier onboarding process, reducing manual steps by 60% and cutting processing time from 14 to 4 days',
      'Elicited and documented 200+ functional requirements for ERP migration, achieving 98% UAT pass rate first time',
    ],
    avgSalaryUK: '£40,000–£70,000',
    avgSalaryIN: '₹7–22 LPA',
    topCompaniesUK: ['Capgemini', 'Lloyds Banking Group', 'Barclays', 'NHS', 'Deloitte', 'KPMG'],
    demandTrend: 'stable',
    relatedRoles: ['project-manager', 'data-analyst', 'product-manager', 'systems-analyst'],
  },
  {
    slug: 'marketing-manager',
    title: 'Marketing Manager',
    titleShort: 'Marketing Manager',
    category: 'Marketing',
    atsKeywords: ['digital marketing', 'SEO', 'paid media', 'Google Ads', 'HubSpot', 'Salesforce', 'campaign management', 'brand strategy', 'content marketing', 'analytics'],
    commonMistakes: [
      'No CAC, ROAS, or revenue impact numbers — marketing CVs without metrics are weak',
      'Listing channels managed without performance data',
      'Brand and digital experience not separated — hiring managers want to know your specialism',
    ],
    exampleBullets: [
      'Led multi-channel demand gen campaign generating £1.8M pipeline, achieving 4.2× ROAS against £430k budget',
      'Grew organic search traffic 210% in 9 months via content strategy and technical SEO programme',
    ],
    avgSalaryUK: '£40,000–£70,000',
    avgSalaryIN: '₹7–22 LPA',
    topCompaniesUK: ['Unilever', 'PepsiCo', 'Gymshark', 'ASOS', 'Moonpig', 'Cazoo'],
    demandTrend: 'competitive',
    relatedRoles: ['digital-marketing-manager', 'growth-manager', 'content-manager', 'seo-manager'],
  },
  {
    slug: 'accountant',
    title: 'Accountant',
    titleShort: 'Accountant',
    category: 'Finance',
    atsKeywords: ['ACA', 'ACCA', 'CIMA', 'financial reporting', 'management accounts', 'VAT', 'payroll', 'Xero', 'Sage', 'Excel', 'reconciliation', 'IFRS'],
    commonMistakes: [
      'Not stating qualification status clearly — ACA/ACCA/CIMA stages are often ATS filters',
      'Generic duties listed without error rate, scale, or time savings',
      'Systems experience buried — Xero, Sage, and SAP are frequently screened by ATS',
    ],
    exampleBullets: [
      'Managed month-end close process for £80M turnover business, consistently delivering P&L within 3 working days',
      'Identified £120k VAT reclaim opportunity through ledger review, recovered within one quarter',
    ],
    avgSalaryUK: '£30,000–£60,000',
    avgSalaryIN: '₹5–18 LPA',
    topCompaniesUK: ['KPMG', 'Deloitte', 'PwC', 'EY', 'BDO', 'Grant Thornton'],
    demandTrend: 'stable',
    relatedRoles: ['management-accountant', 'financial-analyst', 'finance-manager', 'auditor'],
  },
  {
    slug: 'nurse',
    title: 'Nurse',
    titleShort: 'Nurse',
    category: 'Healthcare',
    atsKeywords: ['NMC registration', 'patient care', 'clinical assessment', 'medication administration', 'care planning', 'CPAP', 'IV therapy', 'safeguarding', 'multi-disciplinary team', 'NHS'],
    commonMistakes: [
      'NMC PIN and registration status not prominently displayed — recruiters check this first',
      'Clinical skills listed without patient-facing context or ward specialism',
      'No CPD or revalidation evidence — essential for NHS and private sector roles',
    ],
    exampleBullets: [
      'Delivered acute care to 8–10 patients per shift on busy surgical ward, maintaining 100% medication administration accuracy',
      'Led ward induction for 6 newly qualified nurses, reducing onboarding time from 4 weeks to 2.5 weeks',
    ],
    avgSalaryUK: '£28,000–£45,000 (Band 5–7)',
    avgSalaryIN: '₹3–8 LPA',
    topCompaniesUK: ['NHS Trusts', 'Bupa', 'Nuffield Health', 'Spire Healthcare', 'HCA UK'],
    demandTrend: 'rising',
    relatedRoles: ['senior-nurse', 'clinical-nurse-specialist', 'healthcare-assistant'],
  },
  {
    slug: 'teacher',
    title: 'Teacher',
    titleShort: 'Teacher',
    category: 'Education',
    atsKeywords: ['QTS', 'lesson planning', 'curriculum development', 'behaviour management', 'safeguarding', 'SEND', 'Ofsted', 'assessment', 'pastoral care', 'GCSE'],
    commonMistakes: [
      'QTS/PGCE not stated prominently — schools need to verify teaching qualification immediately',
      'Results data missing — A*-C pass rates and value-added scores are powerful differentiators',
      'No mention of safeguarding training — this is a legal requirement and ATS filter',
    ],
    exampleBullets: [
      'Raised Year 10 Maths GCSE A*-C pass rate from 68% to 84% over two years through differentiated instruction',
      'Implemented restorative practice programme reducing exclusions by 40% in first term',
    ],
    avgSalaryUK: '£30,000–£55,000 (MPS–UPS)',
    avgSalaryIN: '₹3–10 LPA',
    topCompaniesUK: ['academy trusts', 'independent schools', 'MATs', 'international schools'],
    demandTrend: 'rising',
    relatedRoles: ['head-of-department', 'senco', 'teaching-assistant', 'tutor'],
  },
  {
    slug: 'financial-analyst',
    title: 'Financial Analyst',
    titleShort: 'Financial Analyst',
    category: 'Finance',
    atsKeywords: ['financial modelling', 'DCF', 'Excel', 'PowerPoint', 'variance analysis', 'budgeting', 'forecasting', 'SQL', 'CFA', 'Bloomberg'],
    commonMistakes: [
      'No model complexity or scale mentioned — "built financial models" is too vague',
      'Missing stakeholder communication — finance roles require presenting to non-finance leadership',
      'CFA progress not highlighted if in progress — even Level I signals commitment',
    ],
    exampleBullets: [
      'Built 5-year 3-statement financial model for £150M acquisition target, used in board presentation to secure approval',
      'Delivered monthly rolling forecast with <2% variance vs actuals across £60M operating cost base',
    ],
    avgSalaryUK: '£40,000–£75,000',
    avgSalaryIN: '₹7–24 LPA',
    topCompaniesUK: ['Goldman Sachs', 'JP Morgan', 'Barclays', 'HSBC', 'Lloyds', 'Virgin Money'],
    demandTrend: 'stable',
    relatedRoles: ['accountant', 'investment-analyst', 'fp-and-a-analyst', 'finance-manager'],
  },
  {
    slug: 'human-resources-manager',
    title: 'HR Manager',
    titleShort: 'HR Manager',
    category: 'HR',
    atsKeywords: ['CIPD', 'employment law', 'employee relations', 'talent acquisition', 'performance management', 'HRIS', 'Workday', 'succession planning', 'L&D', 'DEI'],
    commonMistakes: [
      'CIPD level and membership not stated — frequently an ATS hard filter',
      'No ER case volume or complexity described — shows capacity for the role',
      'Retention or engagement improvement numbers rarely included but very impactful',
    ],
    exampleBullets: [
      'Reduced employee turnover from 24% to 14% in 18 months through revised onboarding, stay interviews, and L&D programme',
      'Managed 60+ ER cases annually including disciplinaries and grievances, achieving 0 employment tribunal claims',
    ],
    avgSalaryUK: '£40,000–£70,000',
    avgSalaryIN: '₹8–22 LPA',
    topCompaniesUK: ['Amazon', 'NHS', 'Deloitte', 'Unilever', 'Vodafone', 'BT'],
    demandTrend: 'stable',
    relatedRoles: ['hr-business-partner', 'talent-acquisition-manager', 'people-operations-manager'],
  },
  {
    slug: 'sales-manager',
    title: 'Sales Manager',
    titleShort: 'Sales Manager',
    category: 'Sales',
    atsKeywords: ['B2B sales', 'SaaS', 'pipeline management', 'Salesforce', 'quota attainment', 'account management', 'SDR management', 'ARR', 'MEDDICC', 'customer success'],
    commonMistakes: [
      'Quota attainment percentage not listed — this is the #1 metric sales hiring managers check',
      'Team size and revenue managed not mentioned',
      'No sales methodology cited — MEDDICC, SPIN, Challenger all signal seniority',
    ],
    exampleBullets: [
      'Hit 127% of £2.4M annual quota in FY2024, ranking #1 of 18 AEs in EMEA region',
      'Built and managed team of 6 SDRs generating £3.8M qualified pipeline per quarter',
    ],
    avgSalaryUK: '£45,000–£90,000 OTE',
    avgSalaryIN: '₹8–30 LPA',
    topCompaniesUK: ['Salesforce', 'HubSpot', 'Gartner', 'Zendesk', 'Pendo', 'Paddle'],
    demandTrend: 'competitive',
    relatedRoles: ['account-executive', 'business-development-manager', 'customer-success-manager'],
  },
]

export function getRoleBySlug(slug: string): CvRole | undefined {
  return CV_ROLES.find(r => r.slug === slug)
}

export function getRolesByCategory(): Record<string, CvRole[]> {
  return CV_ROLES.reduce<Record<string, CvRole[]>>((acc, role) => {
    if (!acc[role.category]) acc[role.category] = []
    acc[role.category].push(role)
    return acc
  }, {})
}
