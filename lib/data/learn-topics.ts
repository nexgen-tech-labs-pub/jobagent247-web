export interface LearnTopic {
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  category: string
  readingTime: number
  intro: string
  sections: {
    heading: string
    body: string
    bullets?: string[]
  }[]
  faqs: { question: string; answer: string }[]
  relatedTopics: string[]
  ctaHeading: string
  ctaBody: string
}

export const LEARN_TOPICS: LearnTopic[] = [
  {
    slug: 'what-is-an-ats-score',
    title: 'What Is an ATS Score? (And Why It Decides If You Get an Interview)',
    metaTitle: 'What Is an ATS Score? Complete Guide for UK Job Seekers 2026',
    metaDescription: 'Learn what an ATS score is, how applicant tracking systems rank CVs, and exactly what you need to score 90+ to get past the bots and reach a hiring manager.',
    category: 'ATS & CV',
    readingTime: 6,
    intro: 'Your CV is not being read by a human first. For the vast majority of UK employers with more than 10 staff, your application enters an Applicant Tracking System (ATS) — software that reads, parses, and scores your CV before any recruiter sees it. Your ATS score determines whether you reach the interview pile or the rejection folder.',
    sections: [
      {
        heading: 'How ATS systems score your CV',
        body: 'An ATS score is a percentage match between your CV and the job description. The software extracts keywords, skills, job titles, qualifications, and years of experience from both documents — then calculates how closely they align. Most enterprise ATS platforms (Workday, Taleo, Greenhouse, Lever) work this way. A score of 70%+ is typically required to progress; 90%+ places you in the top tier.',
        bullets: [
          'Keyword matching — exact and semantic (do your skills match what they asked for?)',
          'Job title alignment — how close is your most recent role to what they are hiring for?',
          'Qualification check — do you hold the required credentials?',
          'Years of experience — does your history match the seniority level?',
          'Section detection — can the ATS find your education, experience, and skills sections?',
        ],
      },
      {
        heading: 'Why CVs fail ATS even when candidates are qualified',
        body: 'The most common reason strong candidates get rejected is not a lack of qualifications — it is that their CV is formatted in a way the ATS cannot parse, or uses different wording for the same skills the employer is looking for.',
        bullets: [
          'Tables and columns confuse most ATS parsers — text gets scrambled or lost',
          'Headers and footers often go unread by ATS systems',
          'PDF formatting can cause parsing errors depending on how the file was created',
          'Using "JS" when the job spec says "JavaScript" can drop your match score significantly',
          'Photos, logos, and icons are invisible to ATS systems',
        ],
      },
      {
        heading: 'What score do you need to get an interview?',
        body: 'Based on how most enterprise ATS systems are configured, the practical thresholds work like this: below 60% your application is typically auto-rejected without human review; 60–75% might get a human skim if the recruiter has time; 75–89% will likely progress to human review; 90%+ puts you in the shortlist pile. This is why the advice to tailor your CV for every role exists — a generic CV scoring 55% on every application will yield no interviews, even from a highly qualified candidate.',
      },
      {
        heading: 'How to improve your ATS score',
        body: 'The single most effective thing you can do is mirror the language in the job description. If they say "stakeholder management", use exactly that phrase. If they list "Python, SQL, and Tableau", ensure all three appear in your skills section verbatim. Structural improvements matter too:',
        bullets: [
          'Use a single-column layout — two-column CVs often parse incorrectly',
          'Name your sections conventionally: "Experience", "Education", "Skills" — not creative alternatives',
          'Include a Skills section with exact keywords from the job spec',
          'Use a .docx or clean PDF (not a scanned image or designed template with graphics)',
          'Tailor your professional summary to the role with 2–3 keywords from the job description',
        ],
      },
    ],
    faqs: [
      { question: 'Do all UK employers use ATS?', answer: 'Most employers with 10+ staff use some form of ATS. Large corporates, NHS Trusts, banks, tech companies, and professional services firms almost universally use ATS at scale. Small businesses and startups with under 10 staff are more likely to review CVs manually.' },
      { question: 'Which ATS systems are most common in the UK?', answer: 'The most commonly used ATS platforms in the UK include Workday, Taleo (Oracle), Greenhouse, Lever, SAP SuccessFactors, and Applicant Pro. NHS roles typically use NHS Jobs or TRAC. Government roles use CS Jobs (Civil Service Jobs).' },
      { question: 'Can an ATS reject me automatically?', answer: 'Yes. Many ATS configurations include automatic knock-out criteria: if your CV scores below a threshold, or if you answer "No" to a required qualification question, your application can be auto-rejected before any human sees it. This is why ATS optimisation matters before you apply.' },
      { question: 'Is a 90+ ATS score guaranteed to get me an interview?', answer: 'No — a high ATS score gets you to a human reviewer. From there, the quality of your CV content, your experience, and how well you meet the requirements determine whether you are shortlisted. ATS optimisation removes the automated barrier; your credentials and CV quality take it from there.' },
    ],
    relatedTopics: ['ats-friendly-cv', 'cv-vs-resume-uk', 'tailored-cv-for-every-job', 'what-is-applicant-tracking-system'],
    ctaHeading: 'Score your CV against any job description — free',
    ctaBody: 'Upload your CV and paste any job description. JobAgent247 scores you against the ATS requirements in seconds and shows you exactly which keywords to add.',
  },
  {
    slug: 'ats-friendly-cv',
    title: 'How to Write an ATS-Friendly CV: The Complete UK Guide',
    metaTitle: 'ATS-Friendly CV UK: Complete Guide to Passing Applicant Tracking Systems (2026)',
    metaDescription: 'Step-by-step guide to writing an ATS-friendly CV for UK job seekers. Learn the formatting rules, keyword strategy, and structure that gets you past the bots.',
    category: 'ATS & CV',
    readingTime: 8,
    intro: 'An ATS-friendly CV is one that a computer can accurately read, parse, and score before a human ever sees it. Most UK job applications go through an Applicant Tracking System first — and a poorly formatted CV gets filtered out regardless of how qualified you are. This guide covers every formatting and content rule you need to pass ATS screening.',
    sections: [
      {
        heading: 'The formatting rules that ATS systems require',
        body: 'ATS parsers are not as smart as humans. They expect a specific structure and get confused by anything that deviates from it. Following these rules is non-negotiable if you want to be sure your CV parses correctly:',
        bullets: [
          'Single-column layout only — two-column, side-by-side formats scramble text parsing',
          'Standard fonts: Arial, Calibri, Helvetica, or Times New Roman in 10–12pt',
          'No tables, text boxes, or columns — these are parsed as one block or ignored entirely',
          'No photos, logos, or icons — ATS systems cannot interpret images',
          'No headers or footers — content in these areas is often lost',
          'File format: .docx is safest; clean PDF works in most modern ATS; never submit a scanned image',
          'Standard section headings: "Experience", "Education", "Skills" — not creative alternatives',
        ],
      },
      {
        heading: 'The keyword strategy that lifts your ATS score',
        body: 'Keywords are the core of ATS matching. The system compares terms in your CV against terms in the job description. Here is the strategy that works:',
        bullets: [
          'Copy the exact job title from the posting and use it in your professional summary if it honestly reflects your experience',
          'List every required skill mentioned in the job description — in the exact wording used',
          'Include a dedicated Skills section near the top of your CV so keywords are easy to detect',
          'Do not stuff keywords — the ratio of keywords to quality content matters; 15–25 targeted keywords is the right range',
          'Include both abbreviated and full forms of qualifications: "ACCA (Association of Chartered Certified Accountants)"',
          'Use UK English spelling — "organisation" not "organization", "programme" not "program"',
        ],
      },
      {
        heading: 'UK-specific CV rules that differ from US resumes',
        body: 'The UK CV has important differences from a US resume that affect both ATS parsing and human review:',
        bullets: [
          '2 pages is the norm for experienced candidates (1 page for graduates) — US resumes are often 1 page',
          'No photo — photos on UK CVs are unusual outside modelling/acting and can expose employers to discrimination risk',
          'Date of birth not required — and should not be included',
          'References available on request — do not include referee details unless asked',
          'Professional summary (2–3 lines) at the top is standard in the UK',
          'Reverse chronological order — most recent role first',
        ],
      },
      {
        heading: 'How to structure each section for maximum ATS score',
        body: 'The order and structure of your CV sections affects how ATS systems parse your profile. Use this structure:',
        bullets: [
          'Name and contact details at the very top (no header/footer)',
          'Professional Summary: 2–3 sentences with your job title, years of experience, and 2–3 keywords',
          'Core Skills / Key Skills: bullet list of 8–15 hard skills, matching the job spec',
          'Professional Experience: role title | company | dates (month/year) — then bullet point achievements',
          'Education: degree, institution, year — include grade if 2:1 or above',
          'Certifications / Professional Qualifications: CIPD, ACA, PMP, etc.',
        ],
      },
    ],
    faqs: [
      { question: 'Should I use a CV template from Canva or Word?', answer: 'Avoid Canva templates entirely — they use design elements (tables, graphics, text boxes) that ATS systems cannot parse. Word templates are safer, but choose single-column templates only and test with a plain text paste to check what an ATS would see.' },
      { question: 'How do I know if my CV is ATS-friendly?', answer: 'The quickest test: copy all text from your CV and paste into a plain text editor (Notepad). If the text appears in a logical reading order and all sections are intact, your CV will likely parse correctly. If it is scrambled or sections are missing, your formatting needs work.' },
      { question: 'Does using keywords repeatedly improve my score?', answer: 'Not meaningfully. Most ATS systems check for keyword presence, not frequency. Repeating a keyword 5 times does not score higher than 1 mention. Focus on including all required keywords once, clearly, rather than repeating the same ones.' },
      { question: 'Can I have a visually appealing CV that is also ATS-friendly?', answer: 'Yes — clean, well-spaced single-column CVs with good typography look professional without using tables or graphics. The key is distinguishing between visual design choices (fonts, spacing, bold text) that ATS handles fine, versus structural choices (columns, text boxes, tables) that cause parsing failures.' },
    ],
    relatedTopics: ['what-is-an-ats-score', 'cv-vs-resume-uk', 'tailored-cv-for-every-job', 'cover-letter-tips-uk'],
    ctaHeading: 'Check if your CV is ATS-friendly — free',
    ctaBody: 'Upload your CV and get an instant ATS score. JobAgent247 checks formatting, keywords, and structure — then rewrites your CV to score 90+.',
  },
  {
    slug: 'cv-vs-resume-uk',
    title: 'CV vs Resume: What\'s the Difference and Which Do You Need in the UK?',
    metaTitle: 'CV vs Resume UK: Key Differences Explained (2026)',
    metaDescription: 'CV or resume — which should you use for UK jobs? Learn the differences in length, format, content, and when each is expected in the UK job market.',
    category: 'CV Basics',
    readingTime: 4,
    intro: 'In the UK, the terms CV and resume are often used interchangeably — but they are not identical documents. Understanding the difference matters if you are applying for international roles, academic positions, or jobs at US-headquartered companies. This guide covers when to use each and what the UK standard requires.',
    sections: [
      {
        heading: 'The UK CV — the standard for most British employers',
        body: 'A CV (Curriculum Vitae) in the UK is a 2-page document (1 page for graduates) covering your work history, education, and skills in reverse chronological order. It includes a professional summary but no career objective. It does not include personal information like date of birth, nationality, or a photo.',
        bullets: [
          'Length: 1–2 pages (2 is the norm for candidates with 3+ years of experience)',
          'Personal summary: 2–3 lines at the top, no photo or personal details',
          'Reverse chronological: most recent role first',
          'Covers all relevant experience in detail — not abbreviated',
          'References available on request (do not include referee details)',
        ],
      },
      {
        heading: 'A US-style resume — shorter and more targeted',
        body: 'A resume is the US equivalent of a UK CV. It is typically 1 page for most candidates (2 pages for senior professionals with 15+ years of experience). It is more condensed and often tailored more aggressively to a single role. US companies operating in the UK may use the term resume, but they generally accept UK-format CVs.',
        bullets: [
          'Length: 1 page (US standard), though UK offices of US companies typically accept 2-page UK CVs',
          'No career objective section in modern resumes (replaced by a professional summary)',
          'Highly tailored to one specific role',
          'Often uses more aggressive metric-driven bullet points',
        ],
      },
      {
        heading: 'When does the format actually matter?',
        body: 'For 95% of UK job applications, a standard 2-page UK CV is correct and expected. The format starts to matter in specific situations:',
        bullets: [
          'Academic or research roles in the UK: an academic CV can run 4–6+ pages and includes publications, conferences, and grants',
          'US companies hiring in the UK: they often say "resume" but accept UK CVs; a 1-page US-format resume is not expected',
          'International roles in the US: a 1-page resume tailored to US conventions is expected',
          'Medical and clinical roles in the UK: typically require a longer clinical CV with portfolio evidence',
        ],
      },
    ],
    faqs: [
      { question: 'Should I use the word "CV" or "resume" when applying for UK jobs?', answer: 'Use "CV" in the UK — it is the standard term. Only switch to "resume" if the employer\'s job posting specifically uses that term, which usually means they are a US company or international organisation.' },
      { question: 'Is a 1-page CV acceptable in the UK?', answer: 'For recent graduates or candidates with under 3 years of experience, a 1-page CV is appropriate and often preferred. For experienced candidates, 2 pages is the UK norm. Do not pad to 2 pages if you do not have the experience to fill it.' },
      { question: 'Does the UK CV need a photo?', answer: 'No — and you should not include one. Unlike in some European countries (Germany, France), UK CVs do not include photos. Including one can expose employers to unconscious bias risk, and many UK recruiters will penalise CVs that include photos.' },
      { question: 'Should I include my date of birth on a UK CV?', answer: 'No. The Equality Act 2010 means UK employers should not be making decisions based on age, and most UK employers do not want this information included. Leave it off entirely.' },
    ],
    relatedTopics: ['ats-friendly-cv', 'what-is-an-ats-score', 'tailored-cv-for-every-job', 'cover-letter-tips-uk'],
    ctaHeading: 'Build a UK-standard ATS-ready CV',
    ctaBody: 'JobAgent247 creates perfectly formatted UK CVs tailored to specific roles. Upload your existing CV and we will optimise it for ATS and the UK market.',
  },
  {
    slug: 'tailored-cv-for-every-job',
    title: 'Should You Tailor Your CV for Every Job? (The Data Says Yes)',
    metaTitle: 'Should You Tailor Your CV for Every Job? Yes — Here\'s Why (2026)',
    metaDescription: 'The evidence on tailored CVs is clear. Learn why a tailored CV doubles your interview rate, what to change for each role, and how to do it quickly.',
    category: 'Job Search Strategy',
    readingTime: 5,
    intro: 'The most common job search advice you will hear is "tailor your CV for every role". Most people ignore it because it is time-consuming. Here is why the evidence strongly supports doing it — and how to make it fast.',
    sections: [
      {
        heading: 'Why tailoring your CV is not optional anymore',
        body: 'When your CV enters an ATS system, it is scored against the specific keywords and requirements in that job description. A generic CV — the same document sent to every role — typically scores 50–65% on ATS matching. That is below the threshold that most large employers use for progression. Tailoring your CV for each role brings your ATS score from 55% to 85–90%+ by aligning your language with what the employer is looking for.',
      },
      {
        heading: 'What tailoring actually means (and does not mean)',
        body: 'Tailoring does not mean rewriting your entire CV from scratch. It means making targeted changes to 20–30% of the document:',
        bullets: [
          'Professional summary: rewrite your 2–3 line summary to match the role title and key requirements',
          'Skills section: reorder and adjust to put the skills the employer prioritises first',
          'Keyword alignment: replace synonyms with the exact terms from the job description',
          'Bullet point emphasis: promote bullet points most relevant to this role to the top of each job entry',
          'Qualification emphasis: if a qualification is listed as "required", ensure it appears prominently',
        ],
      },
      {
        heading: 'How much of a difference does it actually make?',
        body: 'Studies from recruitment technology companies consistently show that tailored CVs have a 2–3× higher response rate than generic CVs sent to the same roles. The mechanism is straightforward: ATS systems score keyword alignment, and recruiters scan CVs in 7–10 seconds — they see relevance immediately when your language mirrors the job spec.',
      },
      {
        heading: 'How to tailor efficiently without spending hours per application',
        body: 'The reason most people do not tailor is the time cost. The efficient approach is to maintain a master CV with all your experience, then create a role-specific version that takes 15–20 minutes to adjust. The key changes per application:',
        bullets: [
          'Read the job spec and identify the 5 most important requirements',
          'Rewrite your professional summary to include the job title and 2–3 of those requirements',
          'Check your skills section against required skills and add any missing keywords',
          'Move your most relevant bullet points to the top of each job entry',
          'Run an ATS score check to see where you stand before submitting',
        ],
      },
    ],
    faqs: [
      { question: 'How long should tailoring take per application?', answer: 'With an efficient process and your master CV as a base, tailoring should take 15–25 minutes per application. If you are spending 2+ hours per application, you are likely making too many changes — focus only on the summary, skills section, and top bullet points in each role.' },
      { question: 'Should I change my job titles to match the role I\'m applying for?', answer: 'No — never falsify job titles. You can add context in your bullet points (e.g. "working in a software engineering capacity focused on...") but listing a different title than what you actually held is dishonest and will be caught during reference checks.' },
      { question: 'Is it better to send 5 tailored CVs or 50 generic ones?', answer: 'The data consistently shows that 5–10 high-quality tailored applications outperform 50 generic ones. A generic CV at 55% ATS score gets rejected 9 times out of 10 before a human sees it. A tailored CV at 90% ATS score gets reviewed by a human in the majority of cases.' },
    ],
    relatedTopics: ['what-is-an-ats-score', 'ats-friendly-cv', 'cover-letter-tips-uk', 'linkedin-easy-apply'],
    ctaHeading: 'Tailor your CV for any job in 60 seconds',
    ctaBody: 'Paste a job description and upload your CV. JobAgent247 scores your match, identifies keyword gaps, and rewrites your CV to score 90+ — in under a minute.',
  },
  {
    slug: 'cover-letter-tips-uk',
    title: 'How to Write a Cover Letter That Gets Read (UK Guide 2026)',
    metaTitle: 'How to Write a Cover Letter UK: Tips That Actually Work (2026)',
    metaDescription: 'A practical guide to writing UK cover letters that get read. Learn the right length, structure, opening lines, and what recruiters actually want to see.',
    category: 'Applications',
    readingTime: 6,
    intro: 'Cover letters are polarising in the UK job market. Some recruiters skip them entirely; others use them as the primary filter. The data suggests that a well-written, concise cover letter improves your chances — while a poor one actively hurts you. Here is what works in the UK in 2026.',
    sections: [
      {
        heading: 'The UK cover letter format',
        body: 'UK cover letters are formal business letters, not emails. They should be one page maximum, 3–4 paragraphs, using standard business letter formatting. Address the hiring manager by name where possible — "Dear Hiring Manager" is acceptable if unknown, but "To Whom It May Concern" is dated and should be avoided.',
        bullets: [
          'Length: maximum 1 page, typically 250–400 words',
          'Format: formal business letter with your contact details at the top',
          'Address: "Dear [Name]" or "Dear Hiring Manager" — never "To Whom It May Concern"',
          'Closing: "Yours sincerely" (if you used a name) or "Yours faithfully" (if "Dear Hiring Manager")',
          'File: submit as PDF, named "FirstName-LastName-Cover-Letter.pdf"',
        ],
      },
      {
        heading: 'The structure that works',
        body: 'A 4-paragraph structure covers everything a recruiter needs to make a decision:',
        bullets: [
          'Paragraph 1 (Opening): what role you are applying for, where you saw it, and one sentence on why you are the right person',
          'Paragraph 2 (Your experience): your most relevant experience matched to the top 2–3 requirements of the role',
          'Paragraph 3 (Why this company): one specific, researched reason you want to work for this employer — not generic praise',
          'Paragraph 4 (Closing): invite for interview, confirm availability, professional close',
        ],
      },
      {
        heading: 'The opening line mistakes that get cover letters discarded',
        body: 'Most cover letters are discarded in the first line. Recruiters have seen "I am writing to apply for the position of X as advertised on Y" thousands of times. Avoid these openers:',
        bullets: [
          '"I am writing to apply for..." — generic and immediately signals a template',
          '"I have always been passionate about..." — unsubstantiated and clichéd',
          '"Please find enclosed my CV..." — covers this is not 1995',
          'Starting with "I" at all — weak; lead with the value you bring',
          'Any opener longer than 20 words that does not make a clear point',
        ],
      },
      {
        heading: 'What strong opening lines look like',
        body: 'A strong opening makes a specific, substantiated claim about why you are a strong match. It references either the role, the company, or a specific achievement:',
        bullets: [
          '"Having spent 4 years building data pipelines at [Company], I have cut report generation time from hours to minutes at scale — exactly the kind of impact your Data Engineering role requires."',
          '"[Company]\'s shift to AI-assisted underwriting caught my attention because I have spent the last 3 years solving the same problem from the engineering side."',
          '"With 120% quota attainment in my last two roles and a focus on EMEA enterprise accounts, I am applying for the Senior Account Executive position with a track record that matches what you are looking for."',
        ],
      },
    ],
    faqs: [
      { question: 'Do UK employers actually read cover letters?', answer: 'It depends on the employer and role. Research consistently shows that ~50% of UK recruiters read cover letters when they are submitted. However, a poor cover letter can eliminate you even if your CV is strong, while a great one can get you an interview over a stronger CV. The asymmetry means it is worth doing well.' },
      { question: 'Should I address my cover letter to a specific person?', answer: 'Yes, whenever possible. Check LinkedIn for the hiring manager, recruiter, or HR contact for the team. If the job posting was placed by a specific recruiter, address them. A personalised opening ("Dear Sarah") is noticeably better than "Dear Hiring Manager".' },
      { question: 'How long should a UK cover letter be?', answer: 'One page maximum. In practice, 250–400 words is the sweet spot — long enough to make your case, short enough that a busy recruiter reads it entirely. Anything over 500 words in a cover letter signals poor communication skills.' },
      { question: 'Should I repeat what\'s in my CV?', answer: 'No — your cover letter should add context that the CV cannot. Use it to explain why you want this specific role at this specific company, highlight the 2–3 achievements most relevant to this role, and show personality that a CV list cannot convey.' },
    ],
    relatedTopics: ['tailored-cv-for-every-job', 'ats-friendly-cv', 'what-is-an-ats-score', 'linkedin-easy-apply'],
    ctaHeading: 'Generate a tailored cover letter in 30 seconds',
    ctaBody: 'Paste the job description and JobAgent247 writes a personalised cover letter matched to the role and your experience — ready to send.',
  },
  {
    slug: 'linkedin-easy-apply',
    title: 'Does LinkedIn Easy Apply Actually Work? What the Data Shows',
    metaTitle: 'LinkedIn Easy Apply: Does It Work? Honest UK Review 2026',
    metaDescription: 'LinkedIn Easy Apply is convenient — but does it get you interviews? We look at the response rate data, the ATS problem, and a smarter strategy for UK job seekers.',
    category: 'Job Search Strategy',
    readingTime: 5,
    intro: 'LinkedIn Easy Apply is the path of least resistance in job hunting. One click and your profile becomes your application. It feels productive. But the response rate data tells a different story — and understanding why helps you build a strategy that actually works.',
    sections: [
      {
        heading: 'The Easy Apply response rate problem',
        body: 'LinkedIn Easy Apply lowers the barrier to apply so significantly that most roles receive 200–500+ applications within 48 hours of posting. Recruiters cannot meaningfully review this volume. The result: most Easy Apply applications receive no response. Industry data consistently shows 2–5% response rates on LinkedIn Easy Apply roles, compared to 10–20% for direct applications through company career pages with tailored CVs.',
      },
      {
        heading: 'Why your LinkedIn profile is a weaker application than a CV',
        body: 'When you Easy Apply, your LinkedIn profile is converted to a PDF and submitted. This creates two problems:',
        bullets: [
          'LinkedIn profile exports are not ATS-optimised — they use LinkedIn\'s formatting, which many ATS systems parse poorly',
          'Your profile is the same for every role — you cannot tailor it quickly to match each job description\'s keywords',
          'LinkedIn profiles are structured for networking, not for ATS keyword matching',
          'Profile sections like "Recommendations" and "Interests" add noise that distracts from your core experience',
        ],
      },
      {
        heading: 'When Easy Apply is worth using',
        body: 'Easy Apply is not worthless — it is just misused. Here is when it actually makes sense:',
        bullets: [
          'Early-stage startups that post on LinkedIn and review every application personally',
          'Roles posted within the last 24 hours — the lower competition window is real',
          'Agency recruiter postings where they are genuinely just looking to build a pipeline',
          'Jobs where you have a referral or warm connection at the company (your profile gets surfaced differently)',
          'Passive applications for roles where you meet all requirements and just want broad coverage',
        ],
      },
      {
        heading: 'A smarter LinkedIn strategy for UK job seekers',
        body: 'The highest-return LinkedIn job search strategy is not "apply to everything via Easy Apply". It is:',
        bullets: [
          'Optimise your LinkedIn profile with an ATS-friendly headline and About section with target role keywords',
          'Use LinkedIn to identify the hiring manager or recruiter for roles you want',
          'Apply directly via the company career page with a tailored CV — not via Easy Apply',
          'Connect with the recruiter or a team member on LinkedIn and send a short, specific message after applying',
          'Turn on "Open to Work" (visible to recruiters) so inbound approaches come to you',
        ],
      },
    ],
    faqs: [
      { question: 'Is LinkedIn Easy Apply worse than applying directly?', answer: 'For most roles at established companies, yes. Direct applications through company career pages have 2–4× higher response rates because: (a) you submit a tailored CV rather than your profile, (b) the applicant volume is lower, and (c) your application enters the ATS properly. Use Easy Apply for high-volume passive coverage, direct application for roles you really want.' },
      { question: 'Should I apply to a job within the first 24 hours on LinkedIn?', answer: 'Yes — timing matters. LinkedIn shows you how many applicants have already applied, and jobs posted in the last 24–48 hours have significantly lower competition. Set up job alerts for target roles and apply to high-priority postings quickly.' },
      { question: 'Does LinkedIn Premium improve my chances on Easy Apply?', answer: 'LinkedIn Premium gives you InMail credits, shows you where you rank among applicants, and displays salary insights. For job searching, the most valuable Premium feature is seeing who viewed your profile so you can follow up. The InMail credit is useful for reaching hiring managers directly. However, Premium does not improve your ATS score or the quality of your application.' },
    ],
    relatedTopics: ['tailored-cv-for-every-job', 'ats-friendly-cv', 'what-is-an-ats-score', 'cover-letter-tips-uk'],
    ctaHeading: 'Apply smarter — tailored CV for every role',
    ctaBody: 'Instead of Easy Apply, use JobAgent247 to score your match, tailor your CV, and generate a cover letter — all from one job description paste.',
  },
  {
    slug: 'what-is-applicant-tracking-system',
    title: 'What Is an Applicant Tracking System (ATS)? How It Filters Your CV',
    metaTitle: 'What Is an Applicant Tracking System (ATS)? UK Guide 2026',
    metaDescription: 'Learn how Applicant Tracking Systems work, which UK employers use them, and what you can do to make sure your CV passes ATS screening and reaches a human recruiter.',
    category: 'ATS & CV',
    readingTime: 5,
    intro: 'An Applicant Tracking System (ATS) is the software most UK employers use to manage job applications. It collects CVs, parses them into searchable data, and scores or filters candidates before any human reviewer gets involved. Understanding how it works is essential for anyone applying for jobs in the UK today.',
    sections: [
      {
        heading: 'How ATS systems work in practice',
        body: 'When you apply for a job online, your CV is typically uploaded into an ATS. The software reads the document, extracts structured data (your name, contact details, job titles, dates, skills, qualifications), and indexes it into a searchable database. Recruiters then search this database using keywords, filter by qualifications, and rank candidates by ATS match score before reviewing CVs manually.',
        bullets: [
          'Parsing: the ATS reads your CV file and converts it into structured database fields',
          'Indexing: your extracted data is stored and made searchable by keyword',
          'Scoring: the ATS compares your profile against the job requirements and generates a match score',
          'Filtering: recruiters set thresholds — applications below a score may be auto-rejected',
          'Review: qualifying CVs are surfaced to human recruiters for manual review',
        ],
      },
      {
        heading: 'Which UK employers use ATS systems?',
        body: 'Most organisations with 10+ staff and any significant hiring volume use some form of ATS. The scale varies:',
        bullets: [
          'Large corporates (HSBC, BT, Amazon, NHS Trusts): enterprise ATS like Workday, Taleo, or SuccessFactors with automated scoring',
          'Mid-size companies (50–500 staff): Greenhouse, Lever, or Pinpoint — still scored, but often with more human review',
          'Startups and SMEs: Workable, Recruitee, or similar — lighter ATS, more human review',
          'Public sector: Civil Service Jobs, NHS Jobs, TRAC — government-specific systems with structured application forms',
          'Very small businesses (under 10 staff): often review CVs manually without ATS',
        ],
      },
      {
        heading: 'What ATS systems look for in your CV',
        body: 'Every ATS has a slightly different algorithm, but the core signals are consistent across platforms:',
        bullets: [
          'Keyword match: do the skills, job titles, and qualifications in your CV match what the employer listed?',
          'Job title proximity: how similar is your most recent role to the role being hired for?',
          'Tenure and experience: does your years of experience match the required level?',
          'Education match: do you hold the required qualifications (or equivalent)?',
          'Section structure: can the ATS correctly identify your experience, education, and skills sections?',
        ],
      },
    ],
    faqs: [
      { question: 'Can I beat an ATS system?', answer: 'You do not need to "beat" it — you need to communicate clearly with it. Use clean formatting the ATS can parse, include the keywords from the job description in the language the employer used, and structure your CV in standard sections. A well-optimised CV does not feel keyword-stuffed to a human but scores highly on ATS matching.' },
      { question: 'What happens to my CV after it passes the ATS?', answer: 'After ATS filtering, the remaining applications are reviewed by a human recruiter — typically in 7–10 seconds per CV at first pass. Strong ATS scores get your CV in front of a human; strong CV content gets you to interview.' },
      { question: 'Are there ATS systems that read PDFs?', answer: 'Most modern ATS systems (Greenhouse, Lever, Workday) can parse clean PDFs accurately. The problem is PDFs created from design tools (Canva, InDesign) that use graphics and layers — these often parse incorrectly. A PDF exported from Word or Google Docs in single-column format is generally safe.' },
    ],
    relatedTopics: ['what-is-an-ats-score', 'ats-friendly-cv', 'tailored-cv-for-every-job', 'cv-vs-resume-uk'],
    ctaHeading: 'See how your CV scores in any ATS',
    ctaBody: 'Paste a job description and upload your CV. JobAgent247 simulates ATS scoring and shows you exactly how to improve your match rate.',
  },
]

export function getTopicBySlug(slug: string): LearnTopic | undefined {
  return LEARN_TOPICS.find(t => t.slug === slug)
}

export function getTopicsByCategory(): Record<string, LearnTopic[]> {
  return LEARN_TOPICS.reduce<Record<string, LearnTopic[]>>((acc, topic) => {
    if (!acc[topic.category]) acc[topic.category] = []
    acc[topic.category].push(topic)
    return acc
  }, {})
}
